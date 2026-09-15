import { test, expect } from "@playwright/test";
import { PDFDocument, degrees } from "pdf-lib";
import { unzipSync } from "fflate";
import fs from "node:fs/promises";

let source;
const image = { name: "image.png", mimeType: "image/png", buffer: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a6XcAAAAASUVORK5CYII=", "base64") };
const upload = () => ({ name: "sample.pdf", mimeType: "application/pdf", buffer: Buffer.from(source) });

test.beforeAll(async () => {
  const pdf = await PDFDocument.create();
  [400, 450, 500].forEach((width, i) => { const page = pdf.addPage([width, 600]); page.drawText(["PAGE ONE", "PAGE TWO", "PAGE THREE"][i], { x: 40, y: 530, size: 24 }); });
  source = await pdf.save();
});
test.beforeEach(async ({ page }) => {
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("close", () => expect(errors).toEqual([]));
});
async function openTool(page, route) {
  await page.goto(`/#/${route}`);
  await page.locator("#pdfToolFile").setInputFiles(upload());
  await expect(page.locator(".file-summary")).toBeVisible();
  await expect(page.locator("#pdfToolFieldset")).toBeEnabled();
}
async function processAndDownload(page) {
  await page.locator('#pdfToolForm button[type="submit"]').click();
  await expect(page.locator("#pdfToolDownload")).toBeEnabled();
  const pending = page.waitForEvent("download");
  await page.locator("#pdfToolDownload").click();
  const download = await pending;
  return { name: download.suggestedFilename(), bytes: await fs.readFile(await download.path()) };
}
async function textInPdf(page, bytes) {
  return page.evaluate(async data => {
    const pdfjs = await import("/node_modules/pdfjs-dist/build/pdf.mjs");
    pdfjs.GlobalWorkerOptions.workerSrc = "/node_modules/pdfjs-dist/build/pdf.worker.mjs";
    const pdf = await pdfjs.getDocument({ data: new Uint8Array(data) }).promise;
    const texts = [];
    for (let i = 1; i <= pdf.numPages; i++) texts.push((await (await pdf.getPage(i)).getTextContent()).items.map(t => t.str).join(" "));
    await pdf.destroy(); return texts;
  }, Array.from(bytes));
}

test("PDF-only tool catalog, search, deep links, Arabic and mobile layout", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".tool-data-card")).toHaveCount(16);
  await expect(page.locator("body")).not.toContainText(/QR|Barcode|protectLimit/);
  await page.locator("#toolsSearchInput").fill("merge");
  await expect(page.locator('.tool-data-card[href="#/merge-pdf"]')).toBeVisible();
  await page.locator("#toolsSearchInput").fill("");
  await page.locator("#languageButton").click();
  await page.locator('[data-lang="ar"]').click();
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await page.screenshot({ path: "test-results/home-desktop-ar.png", fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: "test-results/home-mobile-ar.png", fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
  await page.goto("/merge-pdf");
  await expect(page.locator('[data-pdf-tool="merge-pdf"]')).toBeVisible();
  await page.goto("/#/qr");
  await expect(page.locator(".tool-data-card")).toHaveCount(16);
});

test("merge accepts additional files and exports in selected order", async ({ page }) => {
  await page.goto("/#/merge-pdf");
  await page.locator("#pdfToolFile").setInputFiles(upload());
  await expect(page.locator("[data-submission-index]")).toHaveCount(1);
  const extra = await PDFDocument.create(); extra.addPage([333, 444]);
  await page.locator("#pdfToolFile").setInputFiles({ name: "extra.pdf", mimeType: "application/pdf", buffer: Buffer.from(await extra.save()) });
  await expect(page.locator("[data-submission-index]")).toHaveCount(2);
  await page.locator('[data-move-file="1:up"]').click();
  const { bytes } = await processAndDownload(page);
  const doc = await PDFDocument.load(bytes);
  expect(doc.getPages().map(p => p.getWidth())).toEqual([333, 400, 450, 500]);
});

test("split downloads ZIP of separate ranges and separate pages", async ({ page }) => {
  await openTool(page, "split-pdf");
  await page.locator('[name="ranges"]').fill("1-2, 3");
  const { name, bytes } = await processAndDownload(page);
  expect(name).toMatch(/\.zip$/);
  const docs = await Promise.all(Object.values(unzipSync(bytes)).map(b => PDFDocument.load(b)));
  expect(docs.map(d => d.getPageCount())).toEqual([2, 1]);
  await page.locator('[name="splitMode"]').selectOption("each");
  const all = await processAndDownload(page);
  expect(Object.keys(unzipSync(all.bytes))).toHaveLength(3);
});

test("select and delete pages, invalidate old results, reject deleting every page", async ({ page }) => {
  await openTool(page, "remove-pages");
  await page.locator('[data-select-page="2"]').click();
  const result = await processAndDownload(page);
  const doc = await PDFDocument.load(result.bytes);
  expect(doc.getPages().map(p => p.getWidth())).toEqual([400, 500]);
  await page.locator('[data-selection="all"]').click();
  await expect(page.locator("#pdfToolDownload")).toBeDisabled();
  await page.locator('button[type="submit"]').click();
  await expect(page.locator("#toast")).toContainText("Keep at least one page");
  await expect(page.locator("#pdfToolDownload")).toBeDisabled();
});

test("extract preserves explicit order and rejects invalid ranges", async ({ page }) => {
  await openTool(page, "extract-pages");
  await page.locator('[name="pages"]').fill("3, 1");
  const result = await processAndDownload(page);
  expect((await PDFDocument.load(result.bytes)).getPages().map(p => p.getWidth())).toEqual([500, 400]);
  await page.locator('[name="pages"]').fill("1-99");
  await page.locator('button[type="submit"]').click();
  await expect(page.locator("#toast")).toContainText("Check the page numbers");
});

test("reorder preview stays synchronized after moving, removing and rotating", async ({ page }) => {
  await openTool(page, "reorder-pages");
  await page.locator('[data-page-move="2:up"]').click();
  await expect(page.locator(".page-thumb-tool strong")).toHaveText(["Page 1", "Page 3", "Page 2"]);
  await page.locator('[data-page-delete="0"]').click();
  await expect(page.locator(".page-thumb-tool strong")).toHaveText(["Page 3", "Page 2"]);
  await page.locator('[data-page-rotate="0"]').click();
  const result = await processAndDownload(page);
  const doc = await PDFDocument.load(result.bytes);
  expect(doc.getPages().map(p => p.getWidth())).toEqual([500, 450]);
  expect(doc.getPage(0).getRotation().angle).toBe(90);
});

test("images convert to PDF and PDF pages download together as image ZIP", async ({ page }) => {
  await page.goto("/#/images-to-pdf");
  await page.locator("#pdfToolFile").setInputFiles([image, { ...image, name: "second.png" }]);
  await expect(page.locator(".image-sort-card")).toHaveCount(2);
  const result = await processAndDownload(page);
  expect((await PDFDocument.load(result.bytes)).getPageCount()).toBe(2);
  await openTool(page, "pdf-to-images");
  await page.locator('[name="pages"]').fill("1, 3");
  const zipped = await processAndDownload(page);
  expect(Object.keys(unzipSync(zipped.bytes))).toEqual(["sample-page-1.png", "sample-page-3.png"]);
});

test("compression keeps physical page dimensions; redaction removes underlying text", async ({ page }) => {
  await openTool(page, "compress-pdf");
  const compressed = await processAndDownload(page);
  const doc = await PDFDocument.load(compressed.bytes);
  expect(doc.getPages().map(p => p.getSize())).toEqual([{ width: 400, height: 600 }, { width: 450, height: 600 }, { width: 500, height: 600 }]);
  await openTool(page, "redact-pdf");
  for (const [name, value] of Object.entries({ x: "30", y: "520", w: "220", h: "45" })) await page.locator(`[name="${name}"]`).fill(value);
  const redacted = await processAndDownload(page);
  expect(await textInPdf(page, redacted.bytes)).toEqual(["", "", ""]);
});

test("editor adds text and images; replacing original text removes its hidden copy", async ({ page }) => {
  await page.goto("/#/editor");
  await page.locator("#pdfInput").setInputFiles(upload());
  await expect(page.locator(".upper-canvas")).toBeVisible();
  await expect(page.locator("#editorLoading")).not.toHaveClass(/visible/);
  await page.locator('[data-tool="text"]').click();
  await page.locator(".upper-canvas").click({ position: { x: 110, y: 150 } });
  await page.keyboard.type("Added note"); await page.keyboard.press("Escape");
  await page.locator("#editorImageInput").setInputFiles(image);
  const pending = page.waitForEvent("download"); await page.locator("#downloadPdfButton").click();
  const annotated = await fs.readFile(await (await pending).path());
  expect(await textInPdf(page, annotated)).toEqual(["PAGE ONE", "PAGE TWO", "PAGE THREE"]);
  await page.reload();
  await page.locator("#pdfInput").setInputFiles(upload());
  await expect(page.locator(".upper-canvas")).toBeVisible();
  await page.locator('[data-tool="editExisting"]').click();
  // Coordinate scales with the displayed PDF image, independent of fit-to-width zoom.
  const bounds = await page.locator(".upper-canvas").boundingBox();
  await page.locator(".upper-canvas").click({ position: { x: bounds.width * .18, y: bounds.height * .098 } });
  await page.keyboard.press("ControlOrMeta+A"); await page.keyboard.type("REPLACED"); await page.keyboard.press("Escape");
  const download = page.waitForEvent("download"); await page.locator("#downloadPdfButton").click();
  const changed = await fs.readFile(await (await download).path());
  expect(await textInPdf(page, changed)).toEqual(["", "PAGE TWO", "PAGE THREE"]);
});

import test from "node:test";
import assert from "node:assert/strict";
import { PDFDocument, degrees } from "pdf-lib";
import { parsePageRange, mergeDocuments, selectPages, splitDocument } from "../src/pdfOperations.js";

async function fixture(widths = [400, 500, 600]) {
  const doc = await PDFDocument.create();
  widths.forEach((width, i) => { const page = doc.addPage([width, 700]); page.drawText(`PAGE ${i + 1}`); if (i === 1) page.setRotation(degrees(90)); });
  return doc.save();
}

test("page ranges support Arabic numbers, ordering and duplicate removal", () => {
  assert.deepEqual(parsePageRange("٣، ١-٢، ٢", 4), [2, 0, 1]);
  assert.deepEqual(parsePageRange("", 3), [0, 1, 2]);
  for (const value of ["0", "1-99", "3-1", "2junk", "1,,2", "-1", ""]) assert.throws(() => parsePageRange(value, 3, false));
});
test("merge preserves document and page order", async () => {
  const output = await PDFDocument.load(await mergeDocuments([await fixture([500]), await fixture([300, 400])]));
  assert.deepEqual(output.getPages().map(p => p.getWidth()), [500, 300, 400]);
  await assert.rejects(() => mergeDocuments([new Uint8Array()]), /chooseTwoFiles/);
});
test("selection removes pages, preserves ordering and composes rotations", async () => {
  const output = await PDFDocument.load(await selectPages(await fixture(), [2, 1], { 1: 90 }));
  assert.deepEqual(output.getPages().map(p => p.getWidth()), [600, 500]);
  assert.equal(output.getPage(1).getRotation().angle, 180);
  await assert.rejects(async () => selectPages(await fixture(), []), /keepOnePage/);
});
test("split creates independent documents containing only requested pages", async () => {
  const outputs = await splitDocument(await fixture(), [[0, 1], [2]]);
  const docs = await Promise.all(outputs.map(bytes => PDFDocument.load(bytes)));
  assert.deepEqual(docs.map(d => d.getPageCount()), [2, 1]);
  assert.equal(docs[1].getPage(0).getWidth(), 600);
});

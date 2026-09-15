

export function parsePageRange(value, total, allowEmpty = true) {
  const input = String(value || "").trim().replace(/[٠-٩]/g, (c) => String(c.charCodeAt(0) - 1632)).replace(/،/g, ",");
  if (!input && allowEmpty) return Array.from({ length: total }, (_, i) => i);
  if (!input || !Number.isInteger(total) || total < 1) throw new Error("invalidPages");
  const pages = [];
  for (const part of input.split(",")) {
    const match = part.trim().match(/^(\d+)(?:\s*-\s*(\d+))?$/);
    if (!match) throw new Error("invalidPages");
    const start = Number(match[1]);
    const end = Number(match[2] || match[1]);
    if (start < 1 || end > total || start > end) throw new Error("invalidPages");
    for (let page = start; page <= end; page++) if (!pages.includes(page - 1)) pages.push(page - 1);
  }
  return pages;
}

export async function mergeDocuments(inputs) {
  const { PDFDocument, degrees } = await import("pdf-lib");
  if (inputs.length < 2) throw new Error("chooseTwoFiles");
  const output = await PDFDocument.create();
  for (const bytes of inputs) {
    const source = await PDFDocument.load(bytes);
    (await output.copyPages(source, source.getPageIndices())).forEach((page) => output.addPage(page));
  }
  return new Uint8Array(await output.save());
}

export async function selectPages(bytes, indices, rotations = {}) {
  const { PDFDocument, degrees } = await import("pdf-lib");
  if (!indices.length) throw new Error("keepOnePage");
  const source = await PDFDocument.load(bytes);
  if (indices.some((i) => !Number.isInteger(i) || i < 0 || i >= source.getPageCount())) throw new Error("invalidPages");
  const output = await PDFDocument.create();
  const pages = await output.copyPages(source, indices);
  pages.forEach((page, index) => {
    const angle = page.getRotation().angle + (rotations[indices[index]] || 0);
    page.setRotation(degrees(((angle % 360) + 360) % 360));
    output.addPage(page);
  });
  return new Uint8Array(await output.save());
}

export async function splitDocument(bytes, groups) {
  if (!groups.length) throw new Error("invalidPages");
  const results = [];
  for (const pages of groups) results.push(await selectPages(bytes, pages));
  return results;
}

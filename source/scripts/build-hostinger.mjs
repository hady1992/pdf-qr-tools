import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const source = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repository = path.resolve(source, "..");
const dist = path.join(source, "dist");
const assets = await fs.readdir(path.join(dist, "assets"));
const id = createHash("sha256").update(await fs.readFile(path.join(dist, "index.html"))).digest("hex").slice(0, 12);
const precache = ["/", "/index.html", "/manifest.webmanifest", "/favicon.svg", ...assets.map(file => "/assets/" + file)];
const template = await fs.readFile(path.join(source, "public/service-worker.js"), "utf8");
await fs.writeFile(path.join(dist, "service-worker.js"), template.replace('"development"', JSON.stringify(id)).replace('/* PRECACHE */ []', JSON.stringify(precache)));
// Only replace generated assets; existing user storage is never touched.
const targetAssets = path.resolve(repository, "assets");
if (path.dirname(targetAssets) !== repository || path.basename(targetAssets) !== "assets") throw new Error("Invalid asset destination");
await fs.rm(targetAssets, { recursive: true, force: true });
for (const entry of await fs.readdir(dist, { withFileTypes: true })) {
  if (entry.name === "storage") continue;
  await fs.cp(path.join(dist, entry.name), path.join(repository, entry.name), { recursive: true, force: true });
}
console.log("Hostinger files updated in repository root (" + id + "). Existing user storage preserved.");

import translations from "./translations.json";
import { zipSync } from "fflate";
import { parsePageRange, mergeDocuments, selectPages, splitDocument } from "./pdfOperations.js";
import "./style.css";
import "./workspace.css";

import { pdfToolRoutes, toolCategories, toolsData } from "./toolsData.ts";

let pdfjsLib;
let PDFDocument;
let StandardFonts;
let Canvas;
let Circle;
let degrees;
let Group;
let IText;
let Line;
let PencilBrush;
let Rect;
let rgb;
let StaticCanvas;
let Triangle;

const ADSENSE_CONFIG = {
  enabled: false,
  client: "ca-pub-XXXXXXXXXXXXXXXX",
  slots: {
    homeTop: "0000000001",
    homeMiddle: "0000000002",
    qrTop: "0000000003",
    qrSide: "0000000004",
    contentTop: "0000000005",
    editorBottom: "0000000006",
  },
};

async function ensurePdfLibraries() {
  if (pdfjsLib && PDFDocument && Canvas) return;
  const [pdfModule, workerModule, pdfLibModule, fabricModule] = await Promise.all([
    import("pdfjs-dist"),
    import("pdfjs-dist/build/pdf.worker.min.mjs?url"),
    import("pdf-lib"),
    import("fabric"),
  ]);
  pdfjsLib = pdfModule;
  pdfjsLib.GlobalWorkerOptions.workerSrc = workerModule.default;
  ({ PDFDocument, StandardFonts, degrees, rgb } = pdfLibModule);
  ({ Canvas, Circle, Group, IText, Line, PencilBrush, Rect, StaticCanvas, Triangle } = fabricModule);
}

const iconPaths = {
  file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M8 13h8M8 17h5"/>',
  qr: '<rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/><path d="M14 14h3v3h-3zM18 18h3v3h-3zM14 20h2M20 14h1v2M18 14v2"/>',
  image: '<rect width="20" height="16" x="2" y="4" rx="2"/><circle cx="8" cy="9" r="2"/><path d="m22 15-5-5L5 20"/>',
  compress: '<path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5"/><path d="M9 9h6v6H9z"/>',
  wifi: '<path d="M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0M12 20h.01M2 9a15 15 0 0 1 20 0"/>',
  mapPin: '<path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0z"/><circle cx="12" cy="10" r="2.5"/>',
  menuBook: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V4H6.5A2.5 2.5 0 0 0 4 6.5z"/><path d="M4 6.5v13M8 8h8M8 12h6"/>',
  wallet: '<path d="M3 6h16a2 2 0 0 1 2 2v10H5a2 2 0 0 1-2-2z"/><path d="M16 10h5v5h-5a2.5 2.5 0 0 1 0-5zM5 6V4h12"/>',
  bank: '<path d="m3 10 9-6 9 6M5 10v8M9 10v8M15 10v8M19 10v8M3 20h18"/>',
  message: '<path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/><path d="M8 9h8M8 13h5"/>',
  calendar: '<rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4M8 2v4M3 10h18M8 14h.01M12 14h.01M16 14h.01"/>',
  share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 10.5 6.8-4M8.6 13.5l6.8 4"/>',
  barcode: '<path d="M3 5v14M7 5v14M10 5v14M14 5v14M17 5v14M21 5v14"/>',
  shield: '<path d="M20 13c0 5-3.5 7.5-8 9-4.5-1.5-8-4-8-9V5l8-3 8 3z"/><path d="m9 12 2 2 4-4"/>',
  globe: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 0 20M12 2a15.3 15.3 0 0 0 0 20"/>',
  user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  arrowRight: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  cursor: '<path d="m3 3 7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/><path d="m13 13 6 6"/>',
  upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5M12 3v12"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5M12 15V3"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  close: '<path d="m18 6-12 12M6 6l12 12"/>',
  chevronDown: '<path d="m6 9 6 6 6-6"/>',
  chevronLeft: '<path d="m15 18-6-6 6-6"/>',
  chevronRight: '<path d="m9 18 6-6-6-6"/>',
  select: '<path d="m3 3 7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/>',
  type: '<path d="M4 7V4h16v3M9 20h6M12 4v16"/>',
  edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4z"/>',
  pen: '<path d="m12 19 7-7 3 3-7 7-4 1 1-4zM18 13l-2-2"/><path d="M4 20c2-4 4-1 6-4"/>',
  highlight: '<path d="m9 11-6 6v3h9l3-3"/><path d="m22 12-4 4L9 7l4-4z"/>',
  eraser: '<path d="m3 15 9.5-9.5a2.1 2.1 0 0 1 3 0l3 3a2.1 2.1 0 0 1 0 3L9 21H5l-2-2a2.8 2.8 0 0 1 0-4z"/><path d="m9 9 6 6M9 21h12"/>',
  square: '<rect width="16" height="16" x="4" y="4" rx="2"/>',
  circle: '<circle cx="12" cy="12" r="9"/>',
  line: '<path d="M4 20 20 4"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  trash: '<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v5M14 11v5"/>',
  undo: '<path d="M9 14 4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 6 6v1"/>',
  redo: '<path d="m15 14 5-5-5-5"/><path d="M20 9H10a6 6 0 0 0-6 6v1"/>',
  zoomIn: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3M11 8v6M8 11h6"/>',
  zoomOut: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3M8 11h6"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
  phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.62 2.63a2 2 0 0 1-.45 2.11L8 9.73a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.85.29 1.73.5 2.63.62A2 2 0 0 1 22 16.92z"/>',
  whatsapp: '<path d="M21 11.5a8.4 8.4 0 0 1-8.7 8.5 9 9 0 0 1-3.8-.9L3 21l1.8-5.3A8.5 8.5 0 1 1 21 11.5z"/><path d="M8.4 7.8c.2-.4.4-.4.7-.4h.5c.2 0 .4.1.5.5l.8 2c.1.3.1.5-.1.7l-.6.8c-.2.2-.3.4-.1.7.5 1 1.3 1.8 2.3 2.3.3.2.5.1.7-.1l.8-1c.2-.2.4-.3.7-.2l2 .9c.3.1.5.3.5.5 0 .6-.3 1.5-.8 1.9-.6.5-1.4.8-2.4.6-1.2-.2-2.8-.8-4.6-2.4-1.5-1.3-2.5-3-2.8-4.2-.3-1.1.1-2 .4-2.6z"/>',
  mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-10 7L2 7"/>',
  merge: '<path d="M8 3v4a5 5 0 0 0 5 5h8"/><path d="m18 9 3 3-3 3"/><path d="M8 21v-4a5 5 0 0 1 5-5"/>',
  split: '<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="m8.6 7.5 12 6.8M8.6 16.5 20.6 9.7"/>',
  pagePlus: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M12 12v6M9 15h6"/>',
  pageDelete: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M9 15h6"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
  alignLeft: '<path d="M3 6h18M3 12h12M3 18h16"/>',
  alignCenter: '<path d="M3 6h18M6 12h12M4 18h16"/>',
  alignRight: '<path d="M3 6h18M9 12h12M5 18h16"/>',
  panels: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/>',
  settings: '<path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21a2 2 0 1 1-4 0v-.09A1.7 1.7 0 0 0 8.5 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.1-.4H3a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 4.6 8.5a1.7 1.7 0 0 0-.34-1.88l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1.1V3a2 2 0 1 1 4 0v.09A1.7 1.7 0 0 0 15.5 4.6a1.7 1.7 0 0 0 1.88-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.4 9c.14.36.35.7.6 1 .28.31.67.49 1.09.5H21a2 2 0 1 1 0 4h-.09A1.7 1.7 0 0 0 19.4 15z"/>',
  maximize: '<path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5"/>',
  check: '<path d="m20 6-11 11-5-5"/>',
  sparkle: '<path d="m12 3-1.9 4.6L5.5 9.5l4.6 1.9L12 16l1.9-4.6 4.6-1.9-4.6-1.9z"/><path d="M5 3v4M3 5h4M19 17v4M17 19h4"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
};

function icon(name, size = 20, stroke = 2) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${iconPaths[name] || iconPaths.info}</svg>`;
}

const appState = {
  lang: localStorage.getItem("pdfstudio-lang") || localStorage.getItem("pdfqr-lang") || (navigator.language.startsWith("ar") ? "ar" : navigator.language.startsWith("de") ? "de" : "en"),
  route: getRouteFromLocation(),
};
if (!["ar", "de", "en"].includes(appState.lang)) appState.lang = "en";

const editorState = {
  pdf: null,
  originalBytes: null,
  fileName: "",
  currentPage: 1,
  canvas: null,
  baseWidth: 0,
  baseHeight: 0,
  pageImageUrl: "",
  zoom: 1,
  textItems: [],
  dirty: false,
  status: "ready",
  fitOnNextRender: false,
  pageStates: new Map(),
  histories: new Map(),
  isRestoring: false,
  activeTool: "select",
  isErasing: false,
  eraseChanged: false,
  clipboardObject: null,
  text: {
    family: "Arial",
    size: 28,
    color: "#153232",
    align: "left",
  },
  pen: {
    color: "#0d7c73",
    width: 4,
    eraserWidth: 28,
    highlightColor: "#ffd45c",
  },
};

const pdfToolState = {
  file: null,
  files: [],
  bytes: null,
  resultBytes: null,
  resultName: "",
  images: [],
  pageThumbs: [],
  renderedImages: [],
  pageOrder: [],
  rotations: {},
  redactions: [],
  signatureDataUrl: "",
  activeDragIndex: null,
};

const t = (key) => translations[appState.lang]?.[key] ?? translations.en[key] ?? key;
const app = document.querySelector("#app");
if ("scrollRestoration" in history) history.scrollRestoration = "manual";

function getRouteFromLocation() {
  const route = (location.hash.replace(/^#\/?/, "") || location.pathname.replace(/^\/+|\/+$/g, "") || "home");
  const valid = ["home", "tools", "editor", "privacy", "contact", ...pdfToolRoutes];
  return valid.includes(route) ? route : "tools";
}

function routeLink(route, label, className = "") {
  return `<a href="#/${route}" class="${className}">${label}</a>`;
}

function adSlot(slotKey, label = "Google AdSense", shape = "wide") {
  if (!ADSENSE_CONFIG.enabled) return "";
  const slot = ADSENSE_CONFIG.slots[slotKey] || "";
  if (ADSENSE_CONFIG.enabled) {
    return `
      <ins class="adsbygoogle ad-slot ad-slot-${shape}"
        style="display:block"
        data-ad-client="${ADSENSE_CONFIG.client}"
        data-ad-slot="${slot}"
        data-ad-format="auto"
        data-full-width-responsive="true"></ins>
    `;
  }
  return `
    <div class="ad-slot ad-slot-${shape}" data-ad-slot="${slotKey}" aria-label="${label}">
      <span>${label}</span>
      <small>Google AdSense ready</small>
    </div>
  `;
}

function headerTemplate() {
  const active = (route) => (appState.route === route ? "active" : "");
  return `
    <header class="site-header">
      <div class="container header-inner">
        ${routeLink(
          "home",
          `<span class="brand-mark">${icon("file", 21)}</span><span class="brand-text">PDF Studio</span>`,
          "brand",
        )}
        <nav class="main-nav" id="mainNav">
          ${routeLink("home", t("home"), `nav-link ${active("home")}`)}
          ${routeLink("merge-pdf", t("mergeTitle"), `nav-link ${active("merge-pdf")}`)}
          ${routeLink("split-pdf", t("splitTitle"), `nav-link ${active("split-pdf")}`)}
          ${routeLink("editor", t("pdfEditor"), `nav-link ${active("editor")}`)}
          ${routeLink("tools", t("toolsHub"), `nav-link ${active("tools")}`)}

        </nav>
        <div class="header-actions">
          <div class="language-wrap">
            <button class="language-button" id="languageButton" aria-expanded="false">
              ${icon("globe", 18)}
              <span>${t("language")}</span>
              <span class="language-code">${t("langCode")}</span>
              ${icon("chevronDown", 15)}
            </button>
            <div class="language-menu" id="languageMenu">
              ${[
                ["ar", "العربية"],
                ["de", "Deutsch"],
                ["en", "English"],
              ]
                .map(
                  ([code, label]) =>
                    `<button class="language-option ${appState.lang === code ? "active" : ""}" data-lang="${code}">${label}</button>`,
                )
                .join("")}
            </div>
          </div>
          ${routeLink("editor", `${icon("sparkle", 17)}<span>${t("startNow")}</span>`, "button primary small")}
          <button class="icon-button menu-button" id="menuButton" aria-label="Menu">${icon("menu")}</button>
        </div>
      </div>
    </header>
  `;
}

function footerTemplate() {
  return `
    <footer class="site-footer">
      <div class="container">
        <div class="footer-grid">
          <div class="footer-brand">
            <div class="brand">
              <span class="brand-mark">${icon("file", 21)}</span>
              <span>PDF Studio</span>
            </div>
            <p>${t("footerCopy")}</p>
          </div>
          <div>
            <div class="footer-title">${t("footerTools")}</div>
            <div class="footer-links">
              ${routeLink("editor", t("pdfEditor"))}
              ${routeLink("tools", t("toolsHub"))}
            </div>
          </div>
          <div>
            <div class="footer-title">${t("footerInfo")}</div>
            <div class="footer-links">
              ${routeLink("privacy", t("privacy"))}
              ${routeLink("contact", t("contact"))}
            </div>
          </div>
        </div>
        <div class="footer-bottom">
          <span>© ${new Date().getFullYear()} PDF Studio. ${t("rights")}</span>
          <span>${icon("shield", 15)} ${t("madePrivate")}</span>
        </div>
      </div>
    </footer>
  `;
}

function homeTemplate() {
  return `<main class="pdf-home">
    <section class="workspace-hero container">
      <div class="workspace-kicker">${icon("file", 17)} ${t("workspaceTag")}</div>
      <h1>${t("heroTitle1")} <span>${t("heroTitleAccent")}</span></h1>
      <p>${t("heroCopy")}</p>
      <div class="workspace-trust"><span>${icon("shield", 17)} ${t("browserOnlySub")}</span><span>${icon("user", 17)} ${t("noAccount")}</span><span>${icon("globe", 17)} ${t("multilingual")}</span></div>
    </section>
    <section class="container workspace-tools">${toolsSearchTemplate()}</section>
    <section class="workspace-bottom container"><div>${icon("shield", 30)}<h2>${t("browserOnly")}</h2><p>${t("clientPrivacyNotice")}</p></div><div>${icon("file", 30)}<h2>${t("editorTitle")}</h2><p>${t("pdfCardCopy")}</p>${routeLink("editor", t("openEditor"), "text-link")}</div></section>
  </main>`;
}

function trustItem(iconName, title, copy) {
  return `<div class="trust-item"><div class="trust-icon">${icon(iconName, 21)}</div><div><strong>${title}</strong><small>${copy}</small></div></div>`;
}

function sectionHeading(kickerKey, titleKey, copyKey) {
  return `<div class="section-heading"><div class="section-kicker">${t(kickerKey)}</div><h2>${t(titleKey)}</h2>${copyKey ? `<p>${t(copyKey)}</p>` : ""}</div>`;
}

function stepCard(number, titleKey, copyKey) {
  return `<div class="step-card"><div class="step-number">0${number}</div><h3>${t(titleKey)}</h3><p>${t(copyKey)}</p></div>`;
}

function futurePill(key) {
  return `<a href="#/editor" class="future-pill available">${icon("check", 15)} ${t(key)} <span class="soon">${t("soon")}</span></a>`;
}

function localText(value) {
  return value?.[appState.lang] || value?.en || "";
}

function getToolByRoute(route = appState.route) {
  return toolsData.find((tool) => tool.route === route);
}

function searchableToolText(tool) {
  return [
    ...Object.values(tool.title || {}),
    ...Object.values(tool.description || {}),
    ...Object.values(tool.keywords || {}).flat(),
    tool.category,
    tool.id,
    tool.route,
  ]
    .join(" ")
    .toLowerCase();
}

function getFilteredTools(query = "", category = "all") {
  const normalized = query.trim().toLowerCase();
  return toolsData.filter((tool) => {
    const matchesCategory =
      category === "all" ||
      (category === "popular" ? tool.isPopular : tool.category === category);
    const matchesQuery = !normalized || searchableToolText(tool).includes(normalized);
    return matchesCategory && matchesQuery;
  });
}

function toolsSearchTemplate() {
  const categories = [{ id: "all", label: { ar: "كل الأدوات", de: "Alle Werkzeuge", en: "All tools" } }, ...toolCategories];
  return `<section class="tools-search-card">
    <div class="workspace-tools-heading"><h2>${t("chooseTool")}</h2><label class="search-box">${icon("search", 19)}<input id="toolsSearchInput" aria-label="${t("searchTools")}" type="search" placeholder="${escapeHtml(t("searchPlaceholder"))}" autocomplete="off"></label></div>
    <div class="tool-filter-row" id="toolFilterRow">${categories.map((category) => `<button class="tool-filter ${category.id === "all" ? "active" : ""}" aria-pressed="${category.id === "all"}" data-category="${category.id}">${localText(category.label)}</button>`).join("")}</div>
    <div class="tool-results-grid" id="toolResultsGrid">${renderToolCards(toolsData)}</div>
  </section>`;
}

function renderToolCards(tools) {
  if (!tools.length) {
    const suggestions = toolsData.filter((tool) => tool.isPopular).slice(0, 4);
    return `
      <div class="tool-empty-state">
        ${icon("info", 34)}
        <h3>${t("noToolFound")}</h3>
        <p>${t("closeMatches")}</p>
        <div class="mini-tool-links">${suggestions.map((tool) => routeLink(tool.route, localText(tool.title), "mini-tool-link")).join("")}</div>
      </div>
    `;
  }
  return tools.map(toolCardTemplate).join("");
}

function toolCardTemplate(tool) {
  return `<a class="tool-data-card" data-category="${tool.category}" href="#/${tool.route}"><div class="tool-data-icon">${icon(tool.icon || "file", 29, 1.8)}</div><h3>${localText(tool.title)}</h3><p>${localText(tool.description)}</p><span class="tool-card-arrow" aria-hidden="true">${icon("arrowRight", 18)}</span></a>`;
}

function toolsTemplate() {
  return `
    <main class="page-main tools-page-main">
      <div class="page-intro container">
        <div class="eyebrow"><span class="eyebrow-dot"></span>${t("toolsHub")}</div>
        <h1>${t("allToolsTitle")}</h1>
        <p>${t("allToolsCopy")}</p>
        <div class="privacy-note">${icon("shield", 18)}<span>${t("clientPrivacyNotice")}</span></div>
      </div>
      <div class="container">${adSlot("contentTop", "AdSense Placeholder", "wide")}</div>
      <div class="container">${toolsSearchTemplate()}</div>
    </main>
  `;
}

function pdfToolTemplate() {
  const tool = getToolByRoute();
  if (!tool) return toolsTemplate();
  return `
    <main class="page-main pdf-tool-main" data-pdf-tool="${tool.route}">
      <div class="page-intro container">
        <div class="eyebrow"><span class="eyebrow-dot"></span>${t("toolsHub")}</div>
        <h1>${localText(tool.title)}</h1>
        <p>${localText(tool.description)}</p>
        <div class="privacy-note">${icon("shield", 18)}<span>${t("clientPrivacyNotice")}</span></div>
      </div>
      <div class="container">${adSlot("contentTop", "AdSense Placeholder", "wide")}</div>
      <div class="container pdf-tool-layout">
        <section class="pdf-tool-card">
          ${pdfToolFormTemplate(tool.route)}
          <div class="tool-progress" id="pdfToolProgress" hidden><span></span><strong>${t("processing")}</strong></div>
          <div class="pdf-tool-result" id="pdfToolResult" hidden></div>
        </section>
        <aside class="pdf-tool-side">
          <div class="privacy-callout small">${icon("shield", 22)}<span>${t("clientPrivacyNotice")}</span></div>
          ${toolSeoTemplate(tool)}
          ${adSlot("editorBottom", "AdSense Placeholder", "box")}
        </aside>
      </div>
    </main>
  `;
}

function pdfToolFormTemplate(route) {
  const fileAccept = route === "images-to-pdf" ? "image/jpeg,image/png,image/webp" : route === "prepare-submission" ? "application/pdf,image/jpeg,image/png,image/webp" : "application/pdf";
  const multiple = ["merge-pdf", "images-to-pdf", "prepare-submission"].includes(route) ? "multiple" : "";
  return `
    <form id="pdfToolForm" class="pdf-tool-form"><fieldset id="pdfToolFieldset" class="tool-fieldset">
      <label class="drop-zone tool-drop-zone" id="pdfToolDropZone">
        ${icon(route === "images-to-pdf" ? "image" : "upload", 42)}
        <strong>${route === "images-to-pdf" ? t("chooseImages") : route === "prepare-submission" ? t("chooseFiles") : t("choosePdf")}</strong>
        <span>${t("clientPrivacyNotice")}</span>
        <input id="pdfToolFile" type="file" accept="${fileAccept}" ${multiple}>
      </label>
      ${pdfToolOptionsTemplate(route)}
      <div class="tool-preview-panel" id="pdfToolPreview"></div>
      <div class="tool-actions-row">
        <button class="button primary" type="submit">${icon("sparkle", 18)} ${route === "images-to-pdf" || route === "prepare-submission" ? t("createPdf") : t("processFile")}</button>
        <button class="button secondary" id="pdfToolDownload" type="button" disabled>${icon("download", 18)} ${t("downloadResult")}</button>
         <button class="text-link" id="resetPdfTool" type="button">${t("resetTool")}</button>
      </div>
    </fieldset></form>
  `;
}

function pdfToolOptionsTemplate(route) {
  if (route === "merge-pdf") return '<p class="field-help">' + t("mergeDescription") + ' ' + t("addMoreFiles") + '</p>';
  if (route === "split-pdf") return `<div class="tool-options-grid"><div class="field"><label for="splitMode">${t("splitMode")}</label><select id="splitMode" name="splitMode"><option value="ranges">${t("splitRanges")}</option><option value="each">${t("splitEveryPage")}</option></select></div><div class="field"><label for="splitRanges">${t("pagesRange")}</label><input id="splitRanges" name="ranges" type="text" dir="ltr" placeholder="1-3, 4-6, 7" required></div></div><p class="field-help">${t("rangesHint")}</p>`;
  if (["remove-pages", "extract-pages"].includes(route)) return `<p class="field-help">${t("selectHint")}</p>${route === "remove-pages" ? '<p class="warning-note">' + t("removeHint") + '</p>' : ''}<div class="field"><label for="selectedPages">${t("selectedPages")}</label><input id="selectedPages" name="pages" type="text" dir="ltr" placeholder="1-3, 5" required></div>`;

  const pageSelect = `
    <div class="field"><label>${t("pagesRange")}</label><input name="pages" type="text" placeholder="${t("pagesExample")}"></div>
  `;
  if (route === "compress-pdf") {
    return `
      <div class="tool-options-grid">
        <div class="field"><label>${t("compressionLevel")}</label><select name="level"><option value="light">${t("light")}</option><option value="medium" selected>${t("medium")}</option><option value="strong">${t("strong")}</option></select></div>
      </div>
      <p class="field-help">${icon("info", 15)} ${t("qualityMayChange")}</p>
    `;
  }
  if (route === "images-to-pdf") {
    return `
      <div class="tool-options-grid">
        <div class="field"><label>${t("pageSize")}</label><select name="pageSize"><option value="a4">A4</option><option value="letter">Letter</option><option value="image">${t("sameAsImage")}</option></select></div>
        <div class="field"><label>${t("orientation")}</label><select name="orientation"><option value="portrait">${t("portrait")}</option><option value="landscape">${t("landscape")}</option></select></div>
        <div class="field"><label>${t("margins")}</label><select name="margin"><option value="0">${t("noMargin")}</option><option value="24" selected>${t("smallMargin")}</option><option value="48">${t("mediumMargin")}</option></select></div>
        <label class="check-field"><input name="compressImages" type="checkbox" checked> ${t("optionalImageCompression")}</label>
      </div>
    `;
  }
  if (route === "pdf-to-images") {
    return `
      <div class="tool-options-grid">
        ${pageSelect}
        <div class="field"><label>${t("quality")}</label><select name="quality"><option value="0.9">${t("low")}</option><option value="1.35" selected>${t("medium")}</option><option value="2">${t("high")}</option></select></div>
        <div class="field"><label>${t("outputFormat")}</label><select name="format"><option value="png">PNG</option><option value="jpeg">JPG</option></select></div>
      </div>
    `;
  }
  if (route === "sign-pdf") {
    return `
      <div class="signature-grid">
        <div>
          <label>${t("drawSignature")}</label>
          <canvas id="signatureCanvas" class="signature-pad" width="560" height="180"></canvas>
          <div class="tool-actions-row small"><button type="button" class="button secondary" id="clearSignature">${t("clearSignature")}</button></div>
        </div>
        <div class="tool-options-grid stacked">
          <div class="field"><label>${t("uploadSignature")}</label><input name="signatureImage" type="file" accept="image/png,image/jpeg"></div>
          <div class="field"><label>${t("signaturePage")}</label><input name="page" type="number" min="1" value="1"></div>
          <div class="field"><label>${t("signatureSize")}</label><input name="size" type="range" min="80" max="320" value="180"></div>
          <div class="field"><label>X</label><input name="x" type="number" min="0" value="80"></div>
          <div class="field"><label>Y</label><input name="y" type="number" min="0" value="80"></div>
        </div>
      </div>
    `;
  }
  if (route === "rotate-pdf") {
    return `
      <div class="tool-options-grid">
        ${pageSelect}
        <div class="field"><label>${t("rotation")}</label><select name="angle"><option value="90">${t("rotateRight")}</option><option value="-90">${t("rotateLeft")}</option><option value="180">180°</option></select></div>
      </div>
    `;
  }
  if (route === "page-numbers") {
    return `
      <div class="tool-options-grid">
        <div class="field"><label>${t("pageNumberPosition")}</label><select name="position"><option value="bottom-right">أسفل يمين / Bottom right</option><option value="bottom-center">أسفل وسط / Bottom center</option><option value="bottom-left">أسفل يسار / Bottom left</option><option value="top-right">أعلى يمين / Top right</option><option value="top-center">أعلى وسط / Top center</option><option value="top-left">أعلى يسار / Top left</option></select></div>
        <div class="field"><label>${t("numberingStart")}</label><input name="start" type="number" min="0" value="1"></div>
        <div class="field"><label>${t("fontSize")}</label><input name="fontSize" type="number" min="8" max="72" value="12"></div>
        <div class="field"><label>${t("textColor")}</label><input name="color" type="color" value="#153232"></div>
        <div class="field"><label>${t("numberFormat")}</label><select name="format"><option value="number">1</option><option value="page">Page 1</option><option value="seite">Seite 1</option><option value="total">1 / 10</option></select></div>
      </div>
    `;
  }
  if (route === "watermark-pdf") {
    return `
      <div class="tool-options-grid">
        <div class="field"><label>${t("watermarkText")}</label><input name="text" type="text" value="COPY" list="watermarkExamples"><datalist id="watermarkExamples"><option value="COPY"><option value="ENTWURF"><option value="VERTRAULICH"><option value="KOPIE"></datalist></div>
        <div class="field"><label>${t("watermarkImage")}</label><input name="watermarkImage" type="file" accept="image/png,image/jpeg"></div>
        <div class="field"><label>${t("opacity")}</label><input name="opacity" type="range" min="0.08" max="0.7" step="0.02" value="0.18"></div>
        <div class="field"><label>${t("rotation")}</label><input name="rotation" type="number" value="-35"></div>
        <div class="field"><label>${t("position")}</label><select name="position"><option value="center">${t("center")}</option><option value="top">${t("top")}</option><option value="bottom">${t("bottom")}</option><option value="tiled">${t("tiled")}</option></select></div>
      </div>
    `;
  }
  if (route === "redact-pdf") {
    return `
      <p class="warning-note">${icon("info", 17)} ${t("redactWarning")}</p>
      <div class="tool-options-grid">
        <div class="field"><label>${t("page")}</label><input name="page" type="number" min="1" value="1"></div>
        <div class="field"><label>X</label><input name="x" type="number" min="0" value="70"></div>
        <div class="field"><label>Y</label><input name="y" type="number" min="0" value="120"></div>
        <div class="field"><label>W</label><input name="w" type="number" min="10" value="220"></div>
        <div class="field"><label>H</label><input name="h" type="number" min="10" value="42"></div>
      </div>
    `;
  }
  if (route === "crop-pdf") {
    return `
      <div class="tool-options-grid">
        <div class="field"><label>${t("page")}</label><input name="page" type="number" min="1" value="1"></div>
        <div class="field"><label>X</label><input name="x" type="number" min="0" value="30"></div>
        <div class="field"><label>Y</label><input name="y" type="number" min="0" value="30"></div>
        <div class="field"><label>W</label><input name="w" type="number" min="20" value="500"></div>
        <div class="field"><label>H</label><input name="h" type="number" min="20" value="720"></div>
        <label class="check-field"><input name="allPages" type="checkbox"> ${t("applyToAllPages")}</label>
      </div>
    `;
  }
  if (route === "reorder-pages") {
    return `<p class="field-help">${icon("info", 15)} ${t("reorderHint")}</p>`;
  }
  if (route === "prepare-submission") {
    return `
      <div class="tool-options-grid">
        <div class="field"><label>${t("submissionType")}</label><select name="submissionType">
          <option value="Jobcenter_Unterlagen.pdf">Jobcenter</option>
          <option value="Familienkasse_Nachweise.pdf">Familienkasse</option>
          <option value="Wohngeld_Nachweise.pdf">Wohngeld</option>
          <option value="Auslaenderbehoerde_Dokumente.pdf">Ausländerbehörde</option>
          <option value="Schule_Entschuldigung.pdf">Schule</option>
          <option value="Krankenkasse_Unterlagen.pdf">Krankenkasse</option>
          <option value="Vermieter_Dokumente.pdf">Vermieter</option>
          <option value="Unterlagen.pdf">Sonstiges</option>
        </select></div>
      </div>
      <p class="field-help">${t("suggestedFileName")}: <strong id="suggestedSubmissionName">Jobcenter_Unterlagen.pdf</strong></p>
    `;
  }
  return "";
}

function toolSeoTemplate(tool) {
  const related = toolsData.filter((item) => item.category === tool.category && item.id !== tool.id).slice(0, 4);
  return `
    <div class="tool-seo-card">
      <h2>${t("howToolWorks")}</h2>
      <ol>
        <li>${appState.lang === "de" ? "Datei auswählen oder per Drag & Drop ablegen." : appState.lang === "en" ? "Choose a file or drop it into the upload area." : "اختر ملفاً أو اسحبه إلى منطقة الرفع."}</li>
        <li>${appState.lang === "de" ? "Optionen prüfen und Verarbeitung starten." : appState.lang === "en" ? "Review options and start processing." : "راجع الخيارات ثم ابدأ المعالجة."}</li>
        <li>${appState.lang === "de" ? "Ergebnis herunterladen und prüfen." : appState.lang === "en" ? "Download and verify the result." : "حمّل النتيجة وافحصها."}</li>
      </ol>
    </div>
    <div class="tool-seo-card">
      <h2>${t("faq")}</h2>
      <details open><summary>${t("clientPrivacyNotice")}</summary><p>${t("clientPrivacyNotice")}</p></details>
      <details><summary>${t("qualityMayChange")}</summary><p>${t("qualityMayChange")}</p></details>
    </div>
    <div class="tool-seo-card">
      <h2>${t("similarTools")}</h2>
      <div class="mini-tool-links">${related.map((item) => routeLink(item.route, localText(item.title), "mini-tool-link")).join("")}</div>
    </div>
  `;
}

function bindToolsSearchEvents() {
  const input = document.querySelector("#toolsSearchInput");
  const results = document.querySelector("#toolResultsGrid");
  const filterRow = document.querySelector("#toolFilterRow");
  if (!input || !results) return;
  let activeCategory = "all";
  const renderResults = () => {
    const query = input.value || "";
    results.innerHTML = renderToolCards(getFilteredTools(query, activeCategory));
  };
  input.addEventListener("input", renderResults);
  filterRow?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-category]");
    if (!button) return;
    activeCategory = button.dataset.category || "all";
    filterRow.querySelectorAll(".tool-filter").forEach((item) => item.classList.toggle("active", item === button));
    renderResults();
  });
}

function bindPdfToolEvents() {
  const form = document.querySelector("#pdfToolForm");
  if (!form) return;
  const input = document.querySelector("#pdfToolFile");
  const zone = document.querySelector("#pdfToolDropZone");
  const load = async (files) => { try { await handlePdfToolFiles(files); } catch (error) { console.error(error); showToast(t("pdfError"), true); } };
  input.addEventListener("change", () => { load(Array.from(input.files || [])); input.value = ""; });
  zone.addEventListener("dragover", (event) => { event.preventDefault(); zone.classList.add("drag-over"); });
  zone.addEventListener("dragleave", () => zone.classList.remove("drag-over"));
  zone.addEventListener("drop", (event) => { event.preventDefault(); zone.classList.remove("drag-over"); load(Array.from(event.dataTransfer?.files || [])); });
  form.addEventListener("submit", (event) => { event.preventDefault(); processCurrentPdfTool(new FormData(form)); });
  form.addEventListener("input", () => resetPdfToolResult());
  form.querySelector('[name="splitMode"]')?.addEventListener("change", (event) => {
    const ranges = form.querySelector('[name="ranges"]');
    ranges.disabled = event.target.value === "each";
    ranges.required = !ranges.disabled;
  });
  form.querySelector('[name="pages"]')?.addEventListener("input", updatePageSelectionPreview);
  document.querySelector("#pdfToolDownload")?.addEventListener("click", downloadPdfToolResult);
  document.querySelector("#resetPdfTool")?.addEventListener("click", () => { clearPdfToolState(); form.reset(); renderPdfToolPreview(); resetPdfToolResult(); });
  form.querySelector('[name="submissionType"]')?.addEventListener("change", (event) => setText("#suggestedSubmissionName", event.target.value));
  for (const [name, key] of [["signatureImage", "signatureDataUrl"], ["watermarkImage", "watermarkImageDataUrl"]]) {
    form.querySelector(`[name="${name}"]`)?.addEventListener("change", async (event) => {
      const file = event.target.files?.[0];
      if (!file) return;
      try { pdfToolState[key] = await fileToDataUrl(file); resetPdfToolResult(); }
      catch { showToast(t("unsupportedFile"), true); }
    });
  }
  setupSignaturePad();
  if (pdfToolState.files.length) renderPdfToolPreview();
}

function resetPdfToolResult() {
  for (const item of pdfToolState.renderedImages || []) if (item.url) URL.revokeObjectURL(item.url);
  pdfToolState.resultBytes = null;
  pdfToolState.resultName = "";
  pdfToolState.resultMime = "application/pdf";
  pdfToolState.renderedImages = [];
  document.querySelector("#pdfToolDownload")?.setAttribute("disabled", "");
  const result = document.querySelector("#pdfToolResult");
  if (result) { result.hidden = true; result.innerHTML = ""; }
}

async function handlePdfToolFiles(files) {
  if (pdfToolState.busy || !files.length) return;
  const route = appState.route;
  const images = ["images-to-pdf", "prepare-submission"].includes(route);
  const valid = files.filter((file) => (route !== "images-to-pdf" && isPdfFile(file)) || (images && isImageFile(file)));
  if (valid.length !== files.length || !valid.length) { showToast(t("unsupportedFile"), true); return; }
  if (valid.some((file) => !file.size)) { showToast(t("emptyFile"), true); return; }
  const multiple = ["merge-pdf", "images-to-pdf", "prepare-submission"].includes(route);
  const chosen = multiple ? [...pdfToolState.files, ...valid] : [valid[0]];
  const bytes = isPdfFile(chosen[0]) ? new Uint8Array(await chosen[0].arrayBuffer()) : null;
  if (bytes) { await ensurePdfLibraries(); await PDFDocument.load(bytes.slice()); }
  resetPdfToolResult();
  pdfToolState.files = chosen;
  pdfToolState.file = chosen[0];
  pdfToolState.bytes = bytes;
  pdfToolState.images.forEach((item) => URL.revokeObjectURL(item.url));
  pdfToolState.images = chosen.filter(isImageFile).map((file, index) => ({ id: `${Date.now()}-${index}`, file, url: URL.createObjectURL(file) }));
  pdfToolState.pageThumbs = [];
  pdfToolState.pageOrder = [];
  pdfToolState.rotations = {};
  const pagesInput = document.querySelector('#pdfToolForm [name="pages"]');
  if (pagesInput) pagesInput.value = "";
  await renderPdfToolPreview();
}

async function renderPdfToolPreview() {
  const preview = document.querySelector("#pdfToolPreview");
  if (!preview) return;
  const route = appState.route;
  if (route === "images-to-pdf") { preview.innerHTML = renderImageList(); bindSortableImageList(); return; }
  if (["prepare-submission", "merge-pdf"].includes(route)) { preview.innerHTML = renderSubmissionFileList(); bindSubmissionFileList(); return; }
  if (!pdfToolState.file || !pdfToolState.bytes) { preview.innerHTML = ""; return; }
  preview.innerHTML = `<div class="file-summary">${icon("file", 22)}<div><strong>${escapeHtml(pdfToolState.file.name)}</strong><small>${formatBytes(pdfToolState.file.size)}</small></div></div>`;
  if (["rotate-pdf", "reorder-pages", "redact-pdf", "crop-pdf", "sign-pdf", "remove-pages", "extract-pages", "split-pdf"].includes(route)) await renderPdfThumbnailsForTool(route);
}

function renderImageList() {
  if (!pdfToolState.images.length) return "";
  return `
    <div class="image-sort-list">
      ${pdfToolState.images.map((item, index) => `
        <div class="image-sort-card" draggable="true" data-index="${index}">
          <img src="${item.url}" alt="">
          <div><strong>${index + 1}. ${escapeHtml(item.file.name)}</strong><small>${formatBytes(item.file.size)}</small></div>
          <div class="card-actions">
            <button type="button" data-move-image="${index}:up">${icon("chevronRight", 16)}</button>
            <button type="button" data-move-image="${index}:down">${icon("chevronLeft", 16)}</button>
            <button type="button" data-remove-image="${index}">${icon("trash", 16)}</button>
          </div>
        </div>
      `).join("")}
    </div>
  `;
}

function bindSortableImageList() {
  const preview = document.querySelector("#pdfToolPreview");
  preview?.querySelectorAll("[data-remove-image]").forEach((button) => button.addEventListener("click", () => {
    const index = Number(button.dataset.removeImage);
    const [removed] = pdfToolState.images.splice(index, 1);
    if (removed?.url) URL.revokeObjectURL(removed.url);
    pdfToolState.files = pdfToolState.images.map((item) => item.file);
    pdfToolState.file = pdfToolState.files[0] || null;
    resetPdfToolResult();
    renderPdfToolPreview();
  }));
  preview?.querySelectorAll("[data-move-image]").forEach((button) => button.addEventListener("click", () => {
    const [rawIndex, direction] = button.dataset.moveImage.split(":");
    moveArrayItem(pdfToolState.images, Number(rawIndex), direction === "up" ? Number(rawIndex) - 1 : Number(rawIndex) + 1);
    pdfToolState.files = pdfToolState.images.map((item) => item.file);
    pdfToolState.file = pdfToolState.files[0] || null;
    resetPdfToolResult();
    renderPdfToolPreview();
  }));
  preview?.querySelectorAll(".image-sort-card").forEach((card) => {
    card.addEventListener("dragstart", () => {
      pdfToolState.activeDragIndex = Number(card.dataset.index);
    });
    card.addEventListener("dragover", (event) => event.preventDefault());
    card.addEventListener("drop", () => {
      moveArrayItem(pdfToolState.images, pdfToolState.activeDragIndex, Number(card.dataset.index));
      pdfToolState.activeDragIndex = null;
      pdfToolState.files = pdfToolState.images.map((item) => item.file);
    pdfToolState.file = pdfToolState.files[0] || null;
    resetPdfToolResult();
    renderPdfToolPreview();
    });
  });
}

function renderSubmissionFileList() {
  if (!pdfToolState.files.length) return "";
  return `
    <div class="image-sort-list">
      ${pdfToolState.files.map((file, index) => `
        <div class="image-sort-card" draggable="true" data-submission-index="${index}">
          <div class="tool-data-icon">${icon(isPdfFile(file) ? "file" : "image", 22)}</div>
          <div><strong>${index + 1}. ${escapeHtml(file.name)}</strong><small>${formatBytes(file.size)}</small></div>
          <div class="card-actions">
            <button type="button" data-move-file="${index}:up">${icon("chevronRight", 16)}</button>
            <button type="button" data-move-file="${index}:down">${icon("chevronLeft", 16)}</button>
            <button type="button" data-remove-file="${index}">${icon("trash", 16)}</button>
          </div>
        </div>
      `).join("")}
    </div>
  `;
}

function bindSubmissionFileList() {
  const preview = document.querySelector("#pdfToolPreview");
  preview?.querySelectorAll("[data-remove-file]").forEach((button) => button.addEventListener("click", () => {
    pdfToolState.files.splice(Number(button.dataset.removeFile), 1);
    pdfToolState.file = pdfToolState.files[0] || null;
    resetPdfToolResult();
    renderPdfToolPreview();
  }));
  preview?.querySelectorAll("[data-move-file]").forEach((button) => button.addEventListener("click", () => {
    const [rawIndex, direction] = button.dataset.moveFile.split(":");
    moveArrayItem(pdfToolState.files, Number(rawIndex), direction === "up" ? Number(rawIndex) - 1 : Number(rawIndex) + 1);
    pdfToolState.file = pdfToolState.files[0] || null;
    resetPdfToolResult();
    renderPdfToolPreview();
  }));
  preview?.querySelectorAll("[data-submission-index]").forEach((card) => {
    card.addEventListener("dragstart", () => {
      pdfToolState.activeDragIndex = Number(card.dataset.submissionIndex);
    });
    card.addEventListener("dragover", (event) => event.preventDefault());
    card.addEventListener("drop", () => {
      moveArrayItem(pdfToolState.files, pdfToolState.activeDragIndex, Number(card.dataset.submissionIndex));
      pdfToolState.activeDragIndex = null;
      pdfToolState.file = pdfToolState.files[0] || null;
    resetPdfToolResult();
    renderPdfToolPreview();
    });
  });
}

async function renderPdfThumbnailsForTool(route) {
  const preview = document.querySelector("#pdfToolPreview");
  if (!preview || !pdfToolState.bytes) return;
  if (!pdfToolState.pageThumbs.length) {
    setToolProgress(true);
    let pdf;
    try {
      await ensurePdfLibraries();
      pdf = await pdfjsLib.getDocument({ data: pdfToolState.bytes.slice(), ...pdfRenderOptions() }).promise;
      pdfToolState.pageOrder = Array.from({ length: pdf.numPages }, (_, i) => i);
      const thumbs = [];
      for (let pageNo = 1; pageNo <= pdf.numPages; pageNo++) {
        const page = await pdf.getPage(pageNo);
        const viewport = page.getViewport({ scale: 0.24 });
        const canvas = document.createElement("canvas");
        canvas.width = Math.ceil(viewport.width); canvas.height = Math.ceil(viewport.height);
        await page.render({ canvasContext: canvas.getContext("2d"), viewport }).promise;
        thumbs.push({ page: pageNo, url: canvas.toDataURL("image/jpeg", 0.7) });
        canvas.width = canvas.height = 1;
      }
      pdfToolState.pageThumbs = thumbs;
    } finally { await pdf?.destroy(); setToolProgress(false); }
  }
  if (!preview.isConnected || appState.route !== route) return;
  const selectionTool = ["remove-pages", "extract-pages"].includes(route);
  if (selectionTool) preview.insertAdjacentHTML("beforeend", `<div class="selection-actions"><button type="button" class="button secondary small" data-selection="all">${t("selectAll")}</button><button type="button" class="button secondary small" data-selection="none">${t("clearSelection")}</button></div>`);
  const order = route === "reorder-pages" ? pdfToolState.pageOrder : pdfToolState.pageThumbs.map((_, i) => i);
  preview.insertAdjacentHTML("beforeend", `<div class="page-thumb-grid">${order.map((original, index) => {
    const thumb = pdfToolState.pageThumbs[original];
    const pageLabel = `${t("page")} ${original + 1}`;
    return `<div class="page-thumb-tool" draggable="${route === "reorder-pages"}" data-page-index="${index}">
      ${selectionTool ? `<button type="button" class="page-select" data-select-page="${original + 1}" aria-pressed="false" aria-label="${pageLabel}">` : "<div class=\"page-preview-image\">"}
      <img src="${thumb.url}" alt="${pageLabel}" style="transform:rotate(${pdfToolState.rotations[original] || 0}deg)"><strong>${pageLabel}</strong>${selectionTool ? "</button>" : "</div>"}
      ${route === "reorder-pages" ? `<div class="card-actions"><button type="button" data-page-move="${index}:up" aria-label="${t("moveUp")}" ${index === 0 ? "disabled" : ""}>${icon("chevronRight", 15)}</button><button type="button" data-page-move="${index}:down" aria-label="${t("moveDown")}" ${index === order.length - 1 ? "disabled" : ""}>${icon("chevronLeft", 15)}</button><button type="button" data-page-delete="${index}" aria-label="${t("deletePage")}">${icon("trash", 15)}</button><button type="button" data-page-rotate="${index}" aria-label="${t("rotation")}">${icon("redo", 15)}</button></div>` : ""}</div>`;
  }).join("")}</div>`);
  bindReorderPageControls();
  preview.querySelectorAll("[data-select-page]").forEach((button) => button.addEventListener("click", () => {
    const input = document.querySelector('#pdfToolForm [name="pages"]');
    let selected;
    try { selected = input.value.trim() ? parsePageRange(input.value, pdfToolState.pageThumbs.length).map((i) => i + 1) : []; } catch { selected = []; }
    const page = Number(button.dataset.selectPage);
    selected = selected.includes(page) ? selected.filter((n) => n !== page) : [...selected, page];
    input.value = selected.sort((a, b) => a - b).join(", ");
    resetPdfToolResult(); updatePageSelectionPreview();
  }));
  preview.querySelectorAll("[data-selection]").forEach((button) => button.addEventListener("click", () => {
    document.querySelector('#pdfToolForm [name="pages"]').value = button.dataset.selection === "all" ? `1-${pdfToolState.pageThumbs.length}` : "";
    resetPdfToolResult(); updatePageSelectionPreview();
  }));
  updatePageSelectionPreview();
}

function bindReorderPageControls() {
  if (appState.route !== "reorder-pages") return;
  const preview = document.querySelector("#pdfToolPreview");
  const refresh = () => { resetPdfToolResult(); renderPdfToolPreview(); };
  preview.querySelectorAll("[data-page-delete]").forEach((button) => button.addEventListener("click", () => {
    if (pdfToolState.pageOrder.length < 2) { showToast(t("keepOnePage"), true); return; }
    pdfToolState.pageOrder.splice(Number(button.dataset.pageDelete), 1); refresh();
  }));
  preview.querySelectorAll("[data-page-rotate]").forEach((button) => button.addEventListener("click", () => {
    const original = pdfToolState.pageOrder[Number(button.dataset.pageRotate)];
    pdfToolState.rotations[original] = ((pdfToolState.rotations[original] || 0) + 90) % 360; refresh();
  }));
  preview.querySelectorAll("[data-page-move]").forEach((button) => button.addEventListener("click", () => {
    const [index, direction] = button.dataset.pageMove.split(":");
    moveArrayItem(pdfToolState.pageOrder, Number(index), Number(index) + (direction === "up" ? -1 : 1)); refresh();
  }));
  preview.querySelectorAll("[data-page-index]").forEach((card) => {
    card.addEventListener("dragstart", (event) => { pdfToolState.activeDragIndex = Number(card.dataset.pageIndex); event.dataTransfer.setData("text/plain", card.dataset.pageIndex); });
    card.addEventListener("dragover", (event) => event.preventDefault());
    card.addEventListener("drop", (event) => { event.preventDefault(); if (pdfToolState.activeDragIndex === null) return; moveArrayItem(pdfToolState.pageOrder, pdfToolState.activeDragIndex, Number(card.dataset.pageIndex)); pdfToolState.activeDragIndex = null; refresh(); });
  });
}

async function processCurrentPdfTool(formData) {
  if (pdfToolState.busy) return;
  resetPdfToolResult();
  const route = appState.route;
  if (!pdfToolState.files.length && !pdfToolState.file) {
    showToast(t("noPdf"), true);
    return;
  }
  setToolProgress(true);
  try {
    await ensurePdfLibraries();
    const handlers = {
      "merge-pdf": processMergePdf,
      "split-pdf": processSplitPdf,
      "remove-pages": processPageSelection,
      "extract-pages": processPageSelection,
      "compress-pdf": processCompressPdf,
      "images-to-pdf": processImagesToPdf,
      "pdf-to-images": processPdfToImages,
      "sign-pdf": processSignPdf,
      "rotate-pdf": processRotatePdf,
      "page-numbers": processPageNumbers,
      "watermark-pdf": processWatermarkPdf,
      "redact-pdf": processRedactPdf,
      "crop-pdf": processCropPdf,
      "reorder-pages": processReorderPages,
      "prepare-submission": processPrepareSubmission,
    };
    if (!handlers[route]) throw new Error("unsupportedFile");
    await handlers[route](formData);
    showPdfToolResult();
    showToast(t("done"));
  } catch (error) {
    console.error(error);
    const expected = ["invalidPages", "keepOnePage", "chooseTwoFiles", "chooseImagesFirst"];
    showToast(t(expected.includes(error.message) ? error.message : "pdfError"), true);
  } finally {
    setToolProgress(false);
  }
}

async function processCompressPdf(formData) {
  const level = formData.get("level") || "medium";
  if (level === "light") {
    const pdfDoc = await PDFDocument.load(pdfToolState.bytes.slice());
    pdfToolState.resultBytes = new Uint8Array(await pdfDoc.save({ useObjectStreams: true }));
  } else {
    pdfToolState.resultBytes = await rasterizePdfToPdf(pdfToolState.bytes, level === "strong" ? 0.58 : 0.76, level === "strong" ? 0.95 : 1.15);
  }
  pdfToolState.resultName = withSuffix(pdfToolState.file.name, "compressed");
}

async function processImagesToPdf(formData) {
  if (!pdfToolState.images.length) throw new Error("chooseImagesFirst");
  await ensurePdfLibraries();
  const pdf = await PDFDocument.create();
  const pageSize = formData.get("pageSize");
  const orientation = formData.get("orientation");
  const margin = Number(formData.get("margin") || 0);
  const compress = formData.get("compressImages") === "on";
  for (const item of pdfToolState.images) {
    const imageData = await normalizeImageForPdf(item.file, compress ? 0.78 : 0.94);
    const embedded = imageData.kind === "jpg" ? await pdf.embedJpg(imageData.bytes) : await pdf.embedPng(imageData.bytes);
    const dims = embedded.scale(1);
    let width = dims.width;
    let height = dims.height;
    if (pageSize !== "image") {
      [width, height] = pageSize === "letter" ? [612, 792] : [595.28, 841.89];
      if (orientation === "landscape") [width, height] = [height, width];
    }
    const page = pdf.addPage([width, height]);
    const availableW = Math.max(20, width - margin * 2);
    const availableH = Math.max(20, height - margin * 2);
    const scale = Math.min(availableW / dims.width, availableH / dims.height);
    const drawW = dims.width * scale;
    const drawH = dims.height * scale;
    page.drawImage(embedded, { x: (width - drawW) / 2, y: (height - drawH) / 2, width: drawW, height: drawH });
  }
  pdfToolState.resultBytes = new Uint8Array(await pdf.save());
  pdfToolState.resultName = "images-to-pdf.pdf";
}

async function processPdfToImages(formData) {
  await ensurePdfLibraries();
  const format = formData.get("format") || "png";
  const scale = Number(formData.get("quality") || 1.35);
  const task = pdfjsLib.getDocument({ data: pdfToolState.bytes.slice(), isOffscreenCanvasSupported: false, isImageDecoderSupported: false });
  const pdf = await task.promise;
  const pages = parsePageSelection(String(formData.get("pages") || ""), pdf.numPages);
  pdfToolState.renderedImages = [];
  for (const pageNo of pages) {
    const page = await pdf.getPage(pageNo);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    await page.render({ canvasContext: canvas.getContext("2d"), viewport }).promise;
    const blob = await toolCanvasToBlob(canvas, format === "jpeg" ? "image/jpeg" : "image/png", 0.92);
    pdfToolState.renderedImages.push({ blob, name: `${baseFileName(pdfToolState.file.name)}-page-${pageNo}.${format === "jpeg" ? "jpg" : "png"}`, url: URL.createObjectURL(blob) });
  }
  pdfToolState.resultName = "pdf-images";
}

async function processSignPdf(formData) {
  await ensurePdfLibraries();
  const pdf = await PDFDocument.load(pdfToolState.bytes.slice());
  const pageIndex = clamp(Number(formData.get("page") || 1) - 1, 0, pdf.getPageCount() - 1);
  const page = pdf.getPage(pageIndex);
  const signature = pdfToolState.signatureDataUrl || document.querySelector("#signatureCanvas")?.toDataURL("image/png");
  if (!signature) throw new Error("No signature");
  const image = await pdf.embedPng(signature);
  const size = Number(formData.get("size") || 180);
  const dims = image.scale(size / image.width);
  page.drawImage(image, { x: Number(formData.get("x") || 80), y: Number(formData.get("y") || 80), width: dims.width, height: dims.height });
  pdfToolState.resultBytes = new Uint8Array(await pdf.save());
  pdfToolState.resultName = withSuffix(pdfToolState.file.name, "signed");
}

async function processRotatePdf(formData) {
  await ensurePdfLibraries();
  const pdf = await PDFDocument.load(pdfToolState.bytes.slice());
  const angle = Number(formData.get("angle") || 90);
  const selected = parsePageSelection(String(formData.get("pages") || ""), pdf.getPageCount());
  selected.forEach((pageNo) => {
    const page = pdf.getPage(pageNo - 1);
    page.setRotation(degrees(normalizeAngle((page.getRotation().angle || 0) + angle)));
  });
  pdfToolState.resultBytes = new Uint8Array(await pdf.save());
  pdfToolState.resultName = withSuffix(pdfToolState.file.name, "rotated");
}

async function processPageNumbers(formData) {
  await ensurePdfLibraries();
  const pdf = await PDFDocument.load(pdfToolState.bytes.slice());
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const start = Number(formData.get("start") || 1);
  const size = Number(formData.get("fontSize") || 12);
  const color = hexToPdfRgb(String(formData.get("color") || "#153232"));
  const format = formData.get("format") || "number";
  const position = formData.get("position") || "bottom-right";
  const total = pdf.getPageCount();
  pdf.getPages().forEach((page, index) => {
    const n = start + index;
    const text = format === "page" ? `Page ${n}` : format === "seite" ? `Seite ${n}` : format === "total" ? `${n} / ${total}` : `${n}`;
    const { width, height } = page.getSize();
    const textWidth = font.widthOfTextAtSize(text, size);
    const x = position.endsWith("center") ? (width - textWidth) / 2 : position.endsWith("left") ? 34 : width - textWidth - 34;
    const y = position.startsWith("top") ? height - 34 : 24;
    page.drawText(text, { x, y, size, font, color });
  });
  pdfToolState.resultBytes = new Uint8Array(await pdf.save());
  pdfToolState.resultName = withSuffix(pdfToolState.file.name, "numbered");
}

async function processWatermarkPdf(formData) {
  await ensurePdfLibraries();
  const pdf = await PDFDocument.load(pdfToolState.bytes.slice());
  const opacity = Number(formData.get("opacity") || 0.18);
  const rotation = Number(formData.get("rotation") || -35);
  const position = formData.get("position") || "center";
  const text = String(formData.get("text") || "COPY");
  const font = await pdf.embedFont(StandardFonts.HelveticaBold);
  let image = null;
  if (pdfToolState.watermarkImageDataUrl) {
    image = pdfToolState.watermarkImageDataUrl.startsWith("data:image/png") ? await pdf.embedPng(pdfToolState.watermarkImageDataUrl) : await pdf.embedJpg(pdfToolState.watermarkImageDataUrl);
  }
  pdf.getPages().forEach((page) => {
    const { width, height } = page.getSize();
    const spots = position === "tiled"
      ? [[width * .2, height * .25], [width * .58, height * .5], [width * .25, height * .75]]
      : position === "top" ? [[width * .5, height * .78]] : position === "bottom" ? [[width * .5, height * .22]] : [[width * .5, height * .5]];
    spots.forEach(([x, y]) => {
      if (image) {
        const dims = image.scale(Math.min(width, height) * 0.35 / image.width);
        page.drawImage(image, { x: x - dims.width / 2, y: y - dims.height / 2, width: dims.width, height: dims.height, opacity, rotate: degrees(rotation) });
      } else {
        const size = Math.max(38, Math.min(width, height) / 7);
        page.drawText(text, { x: x - font.widthOfTextAtSize(text, size) / 2, y, size, font, color: rgb(0.08, 0.2, 0.2), opacity, rotate: degrees(rotation) });
      }
    });
  });
  pdfToolState.resultBytes = new Uint8Array(await pdf.save());
  pdfToolState.resultName = withSuffix(pdfToolState.file.name, "watermark");
}

async function processRedactPdf(formData) {
  await ensurePdfLibraries();
  const pdf = await PDFDocument.load(pdfToolState.bytes.slice());
  const pageIndex = clamp(Number(formData.get("page") || 1) - 1, 0, pdf.getPageCount() - 1);
  const page = pdf.getPage(pageIndex);
  page.drawRectangle({ x: Number(formData.get("x") || 70), y: Number(formData.get("y") || 120), width: Number(formData.get("w") || 220), height: Number(formData.get("h") || 42), color: rgb(0, 0, 0) });
  pdfToolState.resultBytes = new Uint8Array(await pdf.save());
  pdfToolState.resultBytes = await rasterizePdfToPdf(pdfToolState.resultBytes, 0.98, 2);
  pdfToolState.resultName = withSuffix(pdfToolState.file.name, "redacted");
}

async function processCropPdf(formData) {
  await ensurePdfLibraries();
  const pdf = await PDFDocument.load(pdfToolState.bytes.slice());
  const targets = formData.get("allPages") === "on" ? pdf.getPages().map((_, index) => index) : [clamp(Number(formData.get("page") || 1) - 1, 0, pdf.getPageCount() - 1)];
  targets.forEach((pageIndex) => {
    const page = pdf.getPage(pageIndex);
    const { width, height } = page.getSize();
    const x = clamp(Number(formData.get("x") || 0), 0, width - 20);
    const y = clamp(Number(formData.get("y") || 0), 0, height - 20);
    const w = clamp(Number(formData.get("w") || width - x), 20, width - x);
    const h = clamp(Number(formData.get("h") || height - y), 20, height - y);
    page.setCropBox(x, y, w, h);
  });
  pdfToolState.resultBytes = new Uint8Array(await pdf.save());
  pdfToolState.resultName = withSuffix(pdfToolState.file.name, "cropped");
}

async function processReorderPages() {
  pdfToolState.resultBytes = await selectPages(pdfToolState.bytes.slice(), pdfToolState.pageOrder, pdfToolState.rotations);
  pdfToolState.resultName = withSuffix(pdfToolState.file.name, "organized");
}

async function processPrepareSubmission(formData) {
  await ensurePdfLibraries();
  const output = await PDFDocument.create();
  for (const file of pdfToolState.files) {
    if (isPdfFile(file)) {
      const source = await PDFDocument.load(new Uint8Array(await file.arrayBuffer()));
      const copied = await output.copyPages(source, source.getPageIndices());
      copied.forEach((page) => output.addPage(page));
    } else if (isImageFile(file)) {
      const imageData = await normalizeImageForPdf(file, 0.76);
      const embedded = imageData.kind === "jpg" ? await output.embedJpg(imageData.bytes) : await output.embedPng(imageData.bytes);
      const page = output.addPage([595.28, 841.89]);
      const dims = embedded.scale(Math.min(535 / embedded.width, 780 / embedded.height));
      page.drawImage(embedded, { x: (595.28 - dims.width) / 2, y: (841.89 - dims.height) / 2, width: dims.width, height: dims.height });
    }
  }
  pdfToolState.resultBytes = new Uint8Array(await output.save({ useObjectStreams: true }));
  pdfToolState.resultName = String(formData.get("submissionType") || "Unterlagen.pdf");
}

async function rasterizePdfToPdf(bytes, quality = 0.9, scale = 1.5) {
  await ensurePdfLibraries();
  const source = await pdfjsLib.getDocument({ data: bytes.slice(), ...pdfRenderOptions() }).promise;
  try {
    const output = await PDFDocument.create();
    for (let pageNo = 1; pageNo <= source.numPages; pageNo++) {
      const page = await source.getPage(pageNo);
      const viewport = page.getViewport({ scale });
      const physical = page.getViewport({ scale: 1 });
      const canvas = document.createElement("canvas");
      canvas.width = Math.ceil(viewport.width); canvas.height = Math.ceil(viewport.height);
      await page.render({ canvasContext: canvas.getContext("2d"), viewport }).promise;
      const image = await output.embedJpg(await canvasToBytes(canvas, "image/jpeg", quality));
      output.addPage([physical.width, physical.height]).drawImage(image, { x: 0, y: 0, width: physical.width, height: physical.height });
      canvas.width = canvas.height = 1;
    }
    return new Uint8Array(await output.save({ useObjectStreams: true }));
  } finally { await source.destroy(); }
}

function showPdfToolResult() {
  const result = document.querySelector("#pdfToolResult");
  const downloadButton = document.querySelector("#pdfToolDownload");
  if (!result) return;
  if (pdfToolState.renderedImages.length) {
    result.hidden = false;
    result.innerHTML = `
      <div class="result-summary">${icon("check", 20)} <strong>${t("done")}</strong></div>
      <p>${t("downloadAll")}</p><div class="image-result-grid">${pdfToolState.renderedImages.map((item) => `<a class="image-result" href="${item.url}" download="${escapeHtml(item.name)}"><img src="${item.url}" alt=""><span>${escapeHtml(item.name)}</span></a>`).join("")}</div>
    `;
    downloadButton?.removeAttribute("disabled");
    return;
  }
  if (!pdfToolState.resultBytes) return;
  const before = pdfToolState.file?.size ? `<span>${t("fileBefore")}: ${formatBytes(pdfToolState.file.size)}</span>` : "";
  const after = `<span>${t("fileAfter")}: ${formatBytes(pdfToolState.resultBytes.byteLength)}</span>`;
  result.hidden = false;
  result.innerHTML = `<div class="result-summary">${icon("check", 20)} <strong>${t("done")}</strong>${before}${after}</div>`;
  downloadButton?.removeAttribute("disabled");
}

async function downloadPdfToolResult() {
  if (pdfToolState.renderedImages.length) {
    const entries = {};
    for (const item of pdfToolState.renderedImages) entries[item.name] = new Uint8Array(await item.blob.arrayBuffer());
    downloadBlob(new Blob([zipSync(entries)], { type: "application/zip" }), `${baseFileName(pdfToolState.file.name)}-images.zip`);
    return;
  }
  if (pdfToolState.resultBytes) downloadBlob(new Blob([pdfToolState.resultBytes], { type: pdfToolState.resultMime || "application/pdf" }), pdfToolState.resultName);
}

function setToolProgress(show) {
  pdfToolState.busy = show;
  const progress = document.querySelector("#pdfToolProgress");
  if (progress) progress.hidden = !show;
  document.querySelector("#pdfToolForm")?.setAttribute("aria-busy", String(show));
  const fieldset = document.querySelector("#pdfToolFieldset");
  if (fieldset) fieldset.disabled = show;
}

function setupSignaturePad() {
  const canvas = document.querySelector("#signatureCanvas");
  if (!canvas) return;
  const context = canvas.getContext("2d");
  context.lineWidth = 3;
  context.lineCap = "round";
  context.strokeStyle = "#153232";
  let drawing = false;
  const pos = (event) => {
    const rect = canvas.getBoundingClientRect();
    const pointer = event.touches?.[0] || event;
    return { x: (pointer.clientX - rect.left) * (canvas.width / rect.width), y: (pointer.clientY - rect.top) * (canvas.height / rect.height) };
  };
  const start = (event) => {
    event.preventDefault();
    drawing = true;
    const p = pos(event);
    context.beginPath();
    context.moveTo(p.x, p.y);
  };
  const move = (event) => {
    if (!drawing) return;
    event.preventDefault();
    const p = pos(event);
    context.lineTo(p.x, p.y);
    context.stroke();
  };
  const end = () => {
    drawing = false;
    pdfToolState.signatureDataUrl = canvas.toDataURL("image/png");
  };
  canvas.addEventListener("mousedown", start);
  canvas.addEventListener("mousemove", move);
  window.addEventListener("mouseup", end);
  canvas.addEventListener("touchstart", start, { passive: false });
  canvas.addEventListener("touchmove", move, { passive: false });
  canvas.addEventListener("touchend", end);
  document.querySelector("#clearSignature")?.addEventListener("click", () => {
    context.clearRect(0, 0, canvas.width, canvas.height);
    pdfToolState.signatureDataUrl = "";
  });
}

function parsePageSelection(value, total) {
  return parsePageRange(value, total).map((i) => i + 1);
}

async function normalizeImageForPdf(file, quality = 0.9) {
  if (file.type === "image/png") return { kind: "png", bytes: new Uint8Array(await file.arrayBuffer()) };
  return { kind: "jpg", bytes: await imageFileToJpegBytes(file, quality) };
}

async function imageFileToJpegBytes(file, quality = 0.9) {
  const dataUrl = await fileToDataUrl(file);
  const image = await loadImage(dataUrl);
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth || image.width;
  canvas.height = image.naturalHeight || image.height;
  const context = canvas.getContext("2d");
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0);
  return canvasToBytes(canvas, "image/jpeg", quality);
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

function toolCanvasToBlob(canvas, type, quality) {
  return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob), type, quality));
}

async function canvasToBytes(canvas, type, quality) {
  const blob = await toolCanvasToBlob(canvas, type, quality);
  return new Uint8Array(await blob.arrayBuffer());
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function isPdfFile(file) {
  return file?.type === "application/pdf" || /\.pdf$/i.test(file?.name || "");
}

function isImageFile(file) {
  return /^image\/(jpeg|png|webp)$/i.test(file?.type || "") || /\.(jpe?g|png|webp)$/i.test(file?.name || "");
}

function formatBytes(bytes = 0) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** index).toFixed(index ? 2 : 0)} ${units[index]}`;
}

function baseFileName(name = "document.pdf") {
  return name.replace(/\.[^.]+$/, "") || "document";
}

function withSuffix(name, suffix) {
  return `${baseFileName(name)}-${suffix}.pdf`;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, Number.isFinite(value) ? value : min));
}

function normalizeAngle(value) {
  return ((value % 360) + 360) % 360;
}

function moveArrayItem(array, from, to) {
  if (!array.length || from === to || from < 0 || from >= array.length || to < 0 || to >= array.length) return;
  const [item] = array.splice(from, 1);
  array.splice(to, 0, item);
}

function hexToPdfRgb(hex) {
  const normalized = String(hex).replace("#", "");
  const value = Number.parseInt(normalized, 16);
  return rgb(((value >> 16) & 255) / 255, ((value >> 8) & 255) / 255, (value & 255) / 255);
}

function editorTemplate() {
  const hasPdf = Boolean(editorState.pdf);
  return `
    <main class="page-main ${hasPdf ? "editor-app-main" : ""}">
      ${
        hasPdf
          ? `<div class="editor-app-heading">
              <div>
                <div class="editor-app-kicker">${icon("file", 15)} ${t("editorBadge")}</div>
                <h1>${t("editorTitle")}</h1>
              </div>
              <div class="editor-heading-trust">${icon("shield", 16)} ${t("localStatus")}</div>
            </div>`
          : `<div class="page-intro compact container">
              <div class="eyebrow"><span class="eyebrow-dot"></span>${t("editorBadge")}</div>
              <h1>${t("editorTitle")}</h1>
              <p>${t("editorCopy")}</p>
            </div>`
      }
      <p class="editor-export-note container">${t("editorNote")}</p>
      <div class="editor-page ${hasPdf ? "editor-page-loaded" : ""}">
        ${hasPdf ? "" : `<div class="privacy-banner">${icon("shield", 17)} ${t("privacyBanner")}</div>`}
        <section class="editor-shell">
          <div class="editor-topbar">
            <div class="editor-top-group">
              <button class="button soft small" id="uploadButton">${icon("upload", 17)} ${hasPdf ? t("newFile") : t("uploadPdf")}</button>
              <input type="file" id="pdfInput" accept="application/pdf,.pdf" hidden>
              <input type="file" id="mergePdfInput" accept="application/pdf,.pdf" multiple hidden>
              <div class="file-badge" ${hasPdf ? "" : 'style="display:none"'}>
                ${icon("file", 17)}<span id="fileName">${escapeHtml(editorState.fileName)}</span>
              </div>
            </div>
            ${
              hasPdf
                ? `<div class="document-status ${editorState.dirty ? "changed" : ""}" id="documentStatus">
                    <span class="status-dot"></span>
                    <span id="documentStatusText">${t(editorState.status === "downloaded" ? "downloadedStatus" : editorState.dirty ? "changedStatus" : "readyStatus")}</span>
                  </div>`
                : ""
            }
            <div class="editor-top-group">
              ${
                hasPdf
                  ? `<div class="mobile-editor-tabs">
                      <button class="icon-button" id="mobilePages" title="${t("openPages")}" aria-label="${t("openPages")}">${icon("panels")}</button>
                      <button class="icon-button" id="mobileProperties" title="${t("openProperties")}" aria-label="${t("openProperties")}">${icon("settings")}</button>
                    </div>`
                  : ""
              }
              ${
                hasPdf
                  ? `<div class="page-actions-wrap">
                      <button class="button secondary small" id="pageMenuButton" aria-expanded="false">${icon("panels", 17)} ${t("pageTools")} ${icon("chevronDown", 14)}</button>
                      <div class="page-actions-menu" id="pageActionsMenu">
                        <button id="addBlankPageButton">${icon("pagePlus", 18)}<span>${t("addBlankPage")}</span></button>
                        <button id="deletePageButton">${icon("pageDelete", 18)}<span>${t("deletePage")}</span></button>
                        <button id="mergeFilesButton">${icon("merge", 18)}<span>${t("mergeFiles")}</span></button>
                        <button id="splitRangeButton">${icon("split", 18)}<span>${t("splitRange")}</span></button>
                      </div>
                    </div>`
                  : ""
              }
              ${hasPdf ? `<label class="button secondary small editor-image-button">${icon("image", 17)} ${t("insertImage")}<input id="editorImageInput" type="file" accept="image/png,image/jpeg,image/webp" hidden></label>` : ""}
              ${hasPdf ? `<button class="icon-button" id="focusModeButton" title="${t("focusMode")}" aria-label="${t("focusMode")}">${icon("maximize", 18)}</button>` : ""}
              <button class="button primary small" id="downloadPdfButton" ${hasPdf ? "" : "disabled"}>${icon("download", 17)} ${t("downloadPdf")}</button>
            </div>
          </div>
          ${
            hasPdf
              ? `<div class="editor-grid" id="editorGrid">${pagesPanelTemplate()}${editorCenterTemplate()}${propertiesPanelTemplate()}</div>`
              : emptyEditorTemplate()
          }
          <div class="editor-loading" id="editorLoading"><div class="loading-card"><div class="spinner"></div><strong id="loadingText">${t("loadingPdf")}</strong></div></div>
          ${hasPdf ? `${splitModalTemplate()}${deletePageModalTemplate()}` : ""}
        </section>
      </div>
    </main>
  `;
}

function emptyEditorTemplate() {
  return `
      <div class="empty-editor">
      <div class="drop-zone" id="dropZone">
        <div class="drop-icon">${icon("upload", 28)}</div>
        <h2>${t("dropTitle")}</h2>
        <p>${t("dropCopy")}</p>
        <div class="hero-actions">
          <button class="button primary" id="dropChooseButton">${icon("file", 18)} ${t("chooseFile")}</button>
          <button class="button secondary" id="samplePdfButton">${icon("sparkle", 18)} ${t("trySample")}</button>
        </div>
        <div class="drop-meta">${t("dropMeta")}</div>
      </div>
      ${adSlot("contentTop", "مساحة إعلانية", "wide")}
    </div>
  `;
}

function pagesPanelTemplate() {
  return `
    <aside class="pages-panel" id="pagesPanel">
      <div class="panel-label">${t("pages")}</div>
      <div class="page-thumbnails" id="pageThumbnails"></div>
    </aside>
  `;
}

function toolButton(tool, iconName, labelKey) {
  return `<button class="tool-button ${editorState.activeTool === tool ? "active" : ""}" data-tool="${tool}" title="${t(labelKey)}" aria-label="${t(labelKey)}">${icon(iconName, 18)}<span>${t(labelKey)}</span></button>`;
}

function splitModalTemplate() {
  const total = editorState.pdf?.numPages || 1;
  return `
    <div class="modal-backdrop" id="splitModal" hidden>
      <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="splitModalTitle">
        <button class="modal-close" id="closeSplitModal" aria-label="${t("cancel")}">${icon("close", 18)}</button>
        <h2 id="splitModalTitle">${t("splitTitle")}</h2>
        <p>${t("splitCopy")}</p>
        <div class="split-fields">
          <div class="field"><label for="splitFrom">${t("fromPage")}</label><input id="splitFrom" type="number" min="1" max="${total}" value="1"></div>
          <div class="field"><label for="splitTo">${t("toPage")}</label><input id="splitTo" type="number" min="1" max="${total}" value="${total}"></div>
        </div>
        <div class="modal-actions">
          <button class="button secondary" id="cancelSplit">${t("cancel")}</button>
          <button class="button primary" id="downloadSplit">${icon("download", 17)} ${t("downloadRange")}</button>
        </div>
      </div>
    </div>
  `;
}

function deletePageModalTemplate() {
  return `
    <div class="modal-backdrop" id="deletePageModal" hidden>
      <div class="modal-card compact-modal" role="dialog" aria-modal="true" aria-labelledby="deletePageModalTitle">
        <button class="modal-close" id="closeDeletePageModal" aria-label="${t("cancel")}">${icon("close", 18)}</button>
        <div class="modal-warning-icon">${icon("pageDelete", 24)}</div>
        <h2 id="deletePageModalTitle">${t("deletePage")}</h2>
        <p>${t("confirmDeletePage")}</p>
        <div class="modal-actions">
          <button class="button secondary" id="cancelDeletePage">${t("cancel")}</button>
          <button class="button danger" id="confirmDeletePage">${icon("trash", 17)} ${t("deletePage")}</button>
        </div>
      </div>
    </div>
  `;
}

function editorCenterTemplate() {
  return `
    <section class="editor-center">
      <div class="tools-ribbon">
        ${toolButton("select", "select", "select")}
        ${toolButton("text", "type", "text")}
        ${toolButton("editExisting", "edit", "editExisting")}
        ${toolButton("draw", "pen", "draw")}
        ${toolButton("highlight", "highlight", "highlight")}
        ${toolButton("eraser", "eraser", "eraser")}
        <span class="ribbon-divider"></span>
        ${toolButton("rectangle", "square", "rectangle")}
        ${toolButton("circle", "circle", "circle")}
        ${toolButton("line", "line", "line")}
        ${toolButton("arrow", "arrow", "arrow")}
        <span class="ribbon-divider"></span>
        <button class="tool-button" id="deleteButton">${icon("trash", 18)}<span>${t("delete")}</span></button>
        <button class="tool-button" id="undoButton">${icon("undo", 18)}<span>${t("undo")}</span></button>
        <button class="tool-button" id="redoButton">${icon("redo", 18)}<span>${t("redo")}</span></button>
      </div>
      <div class="tool-context">
        <div><strong id="activeToolLabel">${t("select")}</strong><span id="activeToolHint">${t("selectHint")}</span></div>
        <kbd>${t("keyboardHint")}</kbd>
      </div>
      <div class="pdf-workspace" id="pdfWorkspace">
        <div class="canvas-stage" id="canvasStage">
          <div class="canvas-scale-shell" id="canvasScaleShell">
            <img id="pdfPageImage" class="pdf-page-image" alt="" draggable="false">
            <div id="fabricMount" class="fabric-layer"><canvas id="annotationCanvas"></canvas></div>
          </div>
        </div>
      </div>
      <div class="editor-statusbar">
        <div class="page-controls">
          <button class="icon-button" id="previousPage" aria-label="Previous">${icon("chevronLeft", 18)}</button>
          <span class="page-count"><span id="currentPage">${editorState.currentPage}</span> ${t("of")} <span id="totalPages">${editorState.pdf?.numPages || 0}</span></span>
          <button class="icon-button" id="nextPage" aria-label="Next">${icon("chevronRight", 18)}</button>
        </div>
        <div class="zoom-controls">
          <button class="icon-button" id="zoomOut" aria-label="Zoom out">${icon("zoomOut", 18)}</button>
          <span class="zoom-value" id="zoomValue">${Math.round(editorState.zoom * 100)}%</span>
          <button class="icon-button" id="zoomIn" aria-label="Zoom in">${icon("zoomIn", 18)}</button>
          <button class="button secondary small" id="fitButton">${t("fit")}</button>
        </div>
      </div>
    </section>
  `;
}

function propertiesPanelTemplate() {
  return `
    <aside class="properties-panel" id="propertiesPanel">
      <div class="panel-label">${t("properties")}</div>
      <div class="property-section">
        <div class="property-title">${t("textSettings")}</div>
        <div class="field"><label for="fontFamily">${t("fontFamily")}</label>
          <select id="fontFamily">
            ${["Arial", "Tahoma", "Georgia", "Courier New", "Times New Roman"]
              .map((font) => `<option ${editorState.text.family === font ? "selected" : ""}>${font}</option>`)
              .join("")}
          </select>
        </div>
        <div class="field"><label for="fontSize">${t("fontSize")}</label><input id="fontSize" type="number" min="8" max="160" value="${editorState.text.size}"></div>
        <div class="field"><label>${t("textColor")}</label><div class="color-control"><input id="textColor" type="color" value="${editorState.text.color}"><span id="textColorValue">${editorState.text.color}</span></div></div>
        <div class="field"><label>${t("alignment")}</label>
          <div class="alignment-group">
            <button class="align-button ${editorState.text.align === "left" ? "active" : ""}" data-align="left">${icon("alignLeft", 18)}</button>
            <button class="align-button ${editorState.text.align === "center" ? "active" : ""}" data-align="center">${icon("alignCenter", 18)}</button>
            <button class="align-button ${editorState.text.align === "right" ? "active" : ""}" data-align="right">${icon("alignRight", 18)}</button>
          </div>
        </div>
      </div>
      <div class="property-section">
        <div class="property-title">${t("penSettings")}</div>
        <div class="field"><label>${t("penColor")}</label><div class="color-control"><input id="penColor" type="color" value="${editorState.pen.color}"><span id="penColorValue">${editorState.pen.color}</span></div></div>
        <div class="field"><label for="penWidth">${t("penWidth")} · <span id="penWidthValue">${editorState.pen.width}px</span></label><input id="penWidth" type="range" min="1" max="28" value="${editorState.pen.width}"></div>
        <div class="field"><label>${t("highlightColor")}</label><div class="color-control"><input id="highlightColor" type="color" value="${editorState.pen.highlightColor}"><span id="highlightColorValue">${editorState.pen.highlightColor}</span></div></div>
        <div class="field"><label for="eraserWidth">${t("eraserSize")} آ· <span id="eraserWidthValue">${editorState.pen.eraserWidth}px</span></label><input id="eraserWidth" type="range" min="8" max="90" value="${editorState.pen.eraserWidth}"></div>
      </div>
      <div class="property-section">
        <div class="property-title">${t("objectSettings")}</div>
        <div class="field"><label>${t("objectColor")}</label><div class="color-control"><input id="objectColor" type="color" value="#0d7c73"><span id="objectColorValue">#0d7c73</span></div></div>
        <div class="field"><label for="objectOpacity">${t("opacity")} · <span id="objectOpacityValue">100%</span></label><input id="objectOpacity" type="range" min="10" max="100" value="100"></div>
        <div class="selection-hint">${t("selectionHint")}</div>
      </div>
    </aside>
  `;
}

function privacyTemplate() {
  return `
    <main class="page-main">
      <div class="content-wrap">
        ${adSlot("contentTop", "مساحة إعلانية", "wide")}
        <article class="content-card">
          <div class="eyebrow"><span class="eyebrow-dot"></span>${t("privacy")}</div>
          <h1>${t("privacyTitle")}</h1>
          <p class="lead">${t("privacyLead")}</p>
          <div class="privacy-callout">${icon("shield", 27)}<span>${t("privacyCallout")}</span></div>
          ${policySection("policy1Title", "policy1Copy")}
          ${policySection("policy2Title", "policy2Copy")}
          ${policySection("policy3Title", "policy3Copy")}
          <section class="policy-section">
            <h2>${t("policy4Title")}</h2>
            <ul>${t("policy4Items").map((item) => `<li>${item}</li>`).join("")}</ul>
          </section>
          <small>${t("updated")}</small>
        </article>
      </div>
    </main>
  `;
}

function policySection(title, copy) {
  return `<section class="policy-section"><h2>${t(title)}</h2><p>${t(copy)}</p></section>`;
}

function contactTemplate() {
  return `
    <main class="page-main">
      <div class="page-intro container">
        <div class="eyebrow"><span class="eyebrow-dot"></span>${t("contactBadge")}</div>
        <h1>${t("contactTitle")}</h1>
        <p>${t("contactCopy")}</p>
      </div>
      <div class="container">${adSlot("contentTop", "مساحة إعلانية", "wide")}</div>
      <div class="container contact-layout">
        <aside class="contact-side">
          <h2>${t("contactSideTitle")}</h2>
          <p>${t("contactSideCopy")}</p>
          <div class="contact-method">${icon("mail", 20)}<span>${t("emailUs")}</span></div>
          <div class="contact-method">${icon("shield", 20)}<span>${t("worksLocally")}</span></div>
        </aside>
        <section class="contact-card">
          <form id="contactForm">
            <div class="contact-grid">
              <div class="field"><label for="contactName">${t("name")}</label><input id="contactName" type="text" placeholder="${t("namePlaceholder")}" required></div>
              <div class="field"><label for="contactEmail">${t("email")}</label><input id="contactEmail" type="email" placeholder="${t("emailPlaceholder")}" required></div>
              <div class="field full"><label for="contactSubject">${t("subject")}</label><input id="contactSubject" type="text" placeholder="${t("subjectPlaceholder")}" required></div>
              <div class="field full"><label for="contactMessage">${t("message")}</label><textarea id="contactMessage" placeholder="${t("messagePlaceholder")}" required></textarea></div>
              <div class="full"><button class="button primary" type="submit">${icon("mail", 18)} ${t("sendMessage")}</button><div class="form-status" id="contactStatus">${t("contactStatus")}</div></div>
            </div>
          </form>
        </section>
      </div>
    </main>
  `;
}

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[char]);
}

async function renderApp() {
  document.body.classList.remove("editor-focus-mode");
  document.body.classList.toggle("editor-loaded-mode", appState.route === "editor" && Boolean(editorState.pdf));
  document.documentElement.lang = appState.lang;
  document.documentElement.dir = appState.lang === "ar" ? "rtl" : "ltr";
  updatePageMeta();

  const routes = {
    home: homeTemplate,
    editor: editorTemplate,
    tools: toolsTemplate,
    privacy: privacyTemplate,
    contact: contactTemplate,
  };
  const page = routes[appState.route] || (pdfToolRoutes.includes(appState.route) ? pdfToolTemplate : routes.home);
  app.innerHTML = `<div class="app-shell">${headerTemplate()}${page()}${footerTemplate()}<div class="toast" id="toast"></div></div>`;
  bindGlobalEvents();
  initAdsenseSlots();

  if (appState.route === "editor") {
    bindEditorEvents();
    if (editorState.pdf) {
      await renderEditorDocument();
    }
  }
  if (appState.route === "home" || appState.route === "tools") bindToolsSearchEvents();
  if (pdfToolRoutes.includes(appState.route)) bindPdfToolEvents();
  if (appState.route === "contact") bindContactEvents();
  scrollToTopImmediate();
  setTimeout(scrollToTopImmediate, 0);
}

function updatePageMeta() {
  const tool = getToolByRoute();
  const title = `${tool ? localText(tool.title) : t(appState.route === "editor" ? "pdfEditor" : appState.route === "privacy" ? "privacy" : appState.route === "contact" ? "contact" : "allToolsTitle")} — PDF Studio`;
  const description = tool ? localText(tool.description) : t("heroCopy");
  document.title = title;
  for (const selector of ['meta[name="description"]', 'meta[property="og:description"]', 'meta[name="twitter:description"]']) document.querySelector(selector)?.setAttribute("content", description);
  for (const selector of ['meta[property="og:title"]', 'meta[name="twitter:title"]']) document.querySelector(selector)?.setAttribute("content", title);
  document.querySelector('meta[property="og:locale"]')?.setAttribute("content", appState.lang);
  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) { canonical = document.createElement("link"); canonical.rel = "canonical"; document.head.append(canonical); }
  canonical.href = `${location.origin}/${appState.route === "home" ? "" : appState.route}`;
}

function initAdsenseSlots() {
  if (!ADSENSE_CONFIG.enabled) return;
  const source = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(ADSENSE_CONFIG.client)}`;
  if (!document.querySelector(`script[src="${source}"]`)) {
    const script = document.createElement("script");
    script.async = true;
    script.crossOrigin = "anonymous";
    script.src = source;
    document.head.appendChild(script);
  }
  document.querySelectorAll(".adsbygoogle").forEach((slot) => {
    if (slot.dataset.loaded) return;
    slot.dataset.loaded = "true";
    try {
      window.adsbygoogle = window.adsbygoogle || [];
      window.adsbygoogle.push({});
    } catch (error) {
      console.warn("AdSense slot could not be initialized.", error);
    }
  });
}

function scrollToTopImmediate() {
  const previous = document.documentElement.style.scrollBehavior;
  document.documentElement.style.scrollBehavior = "auto";
  window.scrollTo(0, 0);
  document.documentElement.style.scrollBehavior = previous;
}

function bindGlobalEvents() {
  document.querySelector("#languageButton")?.addEventListener("click", () => {
    const menu = document.querySelector("#languageMenu");
    menu?.classList.toggle("open");
    document.querySelector("#languageButton")?.setAttribute("aria-expanded", String(menu?.classList.contains("open")));
  });

  document.querySelectorAll("[data-lang]").forEach((button) => {
    button.addEventListener("click", async () => {
      saveCurrentPageState();
      appState.lang = button.dataset.lang;
      localStorage.setItem("pdfstudio-lang", appState.lang);
      disposeFabricCanvas();
      await renderApp();
    });
  });

  document.querySelector("#menuButton")?.addEventListener("click", () => {
    document.querySelector("#mainNav")?.classList.toggle("open");
  });

  document.addEventListener(
    "click",
    (event) => {
      if (!event.target.closest(".language-wrap")) document.querySelector("#languageMenu")?.classList.remove("open");
    },
    { once: true },
  );
}

function bindEditorEvents() {
  document.querySelector("#editorImageInput")?.addEventListener("change", (event) => insertEditorImage(event.target.files?.[0]));
  const input = document.querySelector("#pdfInput");
  const mergeInput = document.querySelector("#mergePdfInput");
  document.querySelector("#uploadButton")?.addEventListener("click", () => input?.click());
  document.querySelector("#dropChooseButton")?.addEventListener("click", () => input?.click());
  document.querySelector("#samplePdfButton")?.addEventListener("click", loadSamplePdf);
  input?.addEventListener("change", () => input.files?.[0] && loadPdfFile(input.files[0]));
  mergeInput?.addEventListener("change", () => {
    const files = [...(mergeInput.files || [])];
    if (files.length) mergePdfFiles(files);
    mergeInput.value = "";
  });

  const dropZone = document.querySelector("#dropZone");
  if (dropZone) {
    ["dragenter", "dragover"].forEach((name) =>
      dropZone.addEventListener(name, (event) => {
        event.preventDefault();
        dropZone.classList.add("dragover");
      }),
    );
    ["dragleave", "drop"].forEach((name) =>
      dropZone.addEventListener(name, (event) => {
        event.preventDefault();
        dropZone.classList.remove("dragover");
      }),
    );
    dropZone.addEventListener("drop", (event) => {
      const file = event.dataTransfer?.files?.[0];
      if (file) loadPdfFile(file);
    });
  }

  document.querySelector("#downloadPdfButton")?.addEventListener("click", downloadEditedPdf);
  document.querySelector("#focusModeButton")?.addEventListener("click", () => {
    const active = document.body.classList.toggle("editor-focus-mode");
    const button = document.querySelector("#focusModeButton");
    const label = t(active ? "exitFocus" : "focusMode");
    button?.setAttribute("title", label);
    button?.setAttribute("aria-label", label);
    setTimeout(fitCanvas, 60);
  });
  const pageMenuButton = document.querySelector("#pageMenuButton");
  const pageActionsMenu = document.querySelector("#pageActionsMenu");
  pageMenuButton?.addEventListener("click", () => {
    const open = pageActionsMenu?.classList.toggle("open");
    pageMenuButton.setAttribute("aria-expanded", String(Boolean(open)));
  });
  document.addEventListener("click", (event) => {
    if (!event.target.closest(".page-actions-wrap")) {
      pageActionsMenu?.classList.remove("open");
      pageMenuButton?.setAttribute("aria-expanded", "false");
    }
  });
  document.querySelector("#mobilePages")?.addEventListener("click", () => {
    document.querySelector("#pagesPanel")?.classList.toggle("mobile-open");
    document.querySelector("#propertiesPanel")?.classList.remove("mobile-open");
  });
  document.querySelector("#mobileProperties")?.addEventListener("click", () => {
    document.querySelector("#propertiesPanel")?.classList.toggle("mobile-open");
    document.querySelector("#pagesPanel")?.classList.remove("mobile-open");
  });

  if (!editorState.pdf) return;

  document.querySelectorAll("[data-tool]").forEach((button) =>
    button.addEventListener("click", () => {
      if (button.dataset.tool === "text") {
        setActiveTool("text", false);
        showToast(t("textHint"));
        return;
      }
      setActiveTool(button.dataset.tool);
      if (button.dataset.tool === "editExisting") showToast(t("editExistingHint"));
    }),
  );
  document.querySelector("#deleteButton")?.addEventListener("click", deleteSelectedObject);
  document.querySelector("#undoButton")?.addEventListener("click", undo);
  document.querySelector("#redoButton")?.addEventListener("click", redo);
  document.querySelector("#previousPage")?.addEventListener("click", () => goToPage(editorState.currentPage - 1));
  document.querySelector("#nextPage")?.addEventListener("click", () => goToPage(editorState.currentPage + 1));
  document.querySelector("#zoomIn")?.addEventListener("click", () => changeZoom(0.15));
  document.querySelector("#zoomOut")?.addEventListener("click", () => changeZoom(-0.15));
  document.querySelector("#fitButton")?.addEventListener("click", fitCanvas);
  document.querySelector("#addBlankPageButton")?.addEventListener("click", addBlankPage);
  document.querySelector("#deletePageButton")?.addEventListener("click", deleteCurrentPage);
  document.querySelector("#mergeFilesButton")?.addEventListener("click", () => mergeInput?.click());
  document.querySelector("#splitRangeButton")?.addEventListener("click", openSplitModal);
  document.querySelector("#closeSplitModal")?.addEventListener("click", closeSplitModal);
  document.querySelector("#cancelSplit")?.addEventListener("click", closeSplitModal);
  document.querySelector("#splitModal")?.addEventListener("click", (event) => {
    if (event.target.id === "splitModal") closeSplitModal();
  });
  document.querySelector("#downloadSplit")?.addEventListener("click", downloadSplitRange);
  document.querySelector("#closeDeletePageModal")?.addEventListener("click", closeDeletePageModal);
  document.querySelector("#cancelDeletePage")?.addEventListener("click", closeDeletePageModal);
  document.querySelector("#deletePageModal")?.addEventListener("click", (event) => {
    if (event.target.id === "deletePageModal") closeDeletePageModal();
  });
  document.querySelector("#confirmDeletePage")?.addEventListener("click", performDeleteCurrentPage);
  bindPropertyEvents();
}

function bindPropertyEvents() {
  const fontFamily = document.querySelector("#fontFamily");
  const fontSize = document.querySelector("#fontSize");
  const textColor = document.querySelector("#textColor");
  const penColor = document.querySelector("#penColor");
  const penWidth = document.querySelector("#penWidth");
  const eraserWidth = document.querySelector("#eraserWidth");
  const highlightColor = document.querySelector("#highlightColor");
  const objectColor = document.querySelector("#objectColor");
  const objectOpacity = document.querySelector("#objectOpacity");

  fontFamily?.addEventListener("change", () => {
    editorState.text.family = fontFamily.value;
    updateSelectedText({ fontFamily: fontFamily.value });
  });
  fontSize?.addEventListener("change", () => {
    editorState.text.size = Math.max(8, Math.min(160, Number(fontSize.value) || 28));
    updateSelectedText({ fontSize: editorState.text.size });
  });
  textColor?.addEventListener("input", () => {
    editorState.text.color = textColor.value;
    setText("#textColorValue", textColor.value);
    updateSelectedText({ fill: textColor.value });
  });
  document.querySelectorAll("[data-align]").forEach((button) =>
    button.addEventListener("click", () => {
      editorState.text.align = button.dataset.align;
      document.querySelectorAll("[data-align]").forEach((item) => item.classList.toggle("active", item === button));
      updateSelectedText({ textAlign: editorState.text.align });
    }),
  );
  penColor?.addEventListener("input", () => {
    editorState.pen.color = penColor.value;
    setText("#penColorValue", penColor.value);
    configureDrawingBrush();
  });
  penWidth?.addEventListener("input", () => {
    editorState.pen.width = Number(penWidth.value);
    setText("#penWidthValue", `${editorState.pen.width}px`);
    configureDrawingBrush();
  });
  eraserWidth?.addEventListener("input", () => {
    editorState.pen.eraserWidth = Number(eraserWidth.value);
    setText("#eraserWidthValue", `${editorState.pen.eraserWidth}px`);
  });
  highlightColor?.addEventListener("input", () => {
    editorState.pen.highlightColor = highlightColor.value;
    setText("#highlightColorValue", highlightColor.value);
    configureDrawingBrush();
  });
  objectColor?.addEventListener("input", () => {
    setText("#objectColorValue", objectColor.value);
    updateSelectedObjectColor(objectColor.value);
  });
  objectOpacity?.addEventListener("input", () => {
    setText("#objectOpacityValue", `${objectOpacity.value}%`);
    const object = editorState.canvas?.getActiveObject();
    if (object) {
      object.set("opacity", Number(objectOpacity.value) / 100);
      editorState.canvas.requestRenderAll();
    }
  });
  objectOpacity?.addEventListener("change", recordHistory);
}

async function loadPdfFile(file) {
  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    showToast(t("pdfError"), true);
    return;
  }
  showEditorLoading(true, t("loadingPdf"));
  try {
    await ensurePdfLibraries();
    const bytes = new Uint8Array(await file.arrayBuffer());
    await loadPdfBytes(bytes, file.name);
  } catch (error) {
    console.error(error);
    showEditorLoading(false);
    showToast(t("pdfError"), true);
  }
}

async function loadSamplePdf() {
  showEditorLoading(true, t("loadingPdf"));
  try {
    await ensurePdfLibraries();
    const sampleUrl = new URL("pdf-qr-tools-sample.pdf", new URL("./", document.baseURI));
    const response = await fetch(sampleUrl);
    if (!response.ok) throw new Error("Sample PDF could not be loaded.");
    const bytes = new Uint8Array(await response.arrayBuffer());
    await loadPdfBytes(bytes, "PDF-Studio-Sample.pdf");
  } catch (error) {
    console.error(error);
    showEditorLoading(false);
    showToast(t("pdfError"), true);
  }
}

async function loadPdfBytes(bytes, fileName, preferredPage = 1) {
  await ensurePdfLibraries();
  const assetBase = new URL("./", document.baseURI);
  const loadingTask = pdfjsLib.getDocument({
    data: bytes.slice(),
    standardFontDataUrl: new URL("standard_fonts/", assetBase).href,
    cMapUrl: new URL("cmaps/", assetBase).href,
    cMapPacked: true,
    disableFontFace: false,
    useSystemFonts: true,
    isOffscreenCanvasSupported: false,
    isImageDecoderSupported: false,
    enableHWA: false,
  });
  const pdf = await loadingTask.promise;
  disposeFabricCanvas();
  editorState.pdf = pdf;
  editorState.originalBytes = bytes;
  editorState.fileName = fileName;
  editorState.currentPage = Math.max(1, Math.min(preferredPage, pdf.numPages));
  editorState.zoom = 1;
  editorState.fitOnNextRender = true;
  editorState.pageStates.clear();
  editorState.histories.clear();
  editorState.activeTool = "select";
  editorState.dirty = false;
  editorState.status = "ready";
  await renderApp();
  showToast(t("pdfLoaded"));
}

async function renderEditorDocument() {
  await renderCurrentPage();
  renderThumbnails();
  updatePageControls();
}

async function renderCurrentPage() {
  if (!editorState.pdf) return;
  showEditorLoading(true, t("loadingPdf"));
  try {
    disposeFabricCanvas();
    const page = await editorState.pdf.getPage(editorState.currentPage);
    const viewport = page.getViewport({ scale: 1.35 });
    editorState.baseWidth = viewport.width;
    editorState.baseHeight = viewport.height;

    const renderRatio = Math.min(Math.max(window.devicePixelRatio || 1, 1.5), 2);
    const renderCanvas = document.createElement("canvas");
    renderCanvas.width = Math.ceil(viewport.width * renderRatio);
    renderCanvas.height = Math.ceil(viewport.height * renderRatio);
    const context = renderCanvas.getContext("2d", { alpha: false, willReadFrequently: false });
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, renderCanvas.width, renderCanvas.height);
    await page.render({
      canvasContext: context,
      viewport,
      transform: [renderRatio, 0, 0, renderRatio, 0, 0],
      background: "#ffffff",
      intent: "display",
    }).promise;

    const pageBlob = await canvasToBlob(renderCanvas, "image/png");
    editorState.pageImageUrl = URL.createObjectURL(pageBlob);
    const pageImage = document.querySelector("#pdfPageImage");
    pageImage.style.width = `${viewport.width}px`;
    pageImage.style.height = `${viewport.height}px`;
    pageImage.src = editorState.pageImageUrl;
    await waitForImage(pageImage);
    renderCanvas.width = 1;
    renderCanvas.height = 1;
    const textContent = await page.getTextContent();
    editorState.textItems = textContent.items
      .filter((item) => item.str?.trim())
      .map((item) => {
        const transform = pdfjsLib.Util.transform(viewport.transform, item.transform);
        const fontSize = Math.max(8, Math.hypot(transform[2], transform[3]));
        return {
          text: item.str,
          x: transform[4],
          y: transform[5] - fontSize,
          width: Math.max(item.width * viewport.scale, fontSize),
          height: Math.max(item.height * viewport.scale, fontSize),
          fontSize,
        };
      });

    editorState.canvas = new Canvas("annotationCanvas", {
      width: viewport.width,
      height: viewport.height,
      selection: true,
      preserveObjectStacking: true,
      enableRetinaScaling: false,
    });
    editorState.canvas.setDimensions({ width: viewport.width, height: viewport.height });
    bindFabricEvents();
    bindWorkspaceScrollPassthrough();

    const saved = editorState.pageStates.get(editorState.currentPage);
    if (saved?.json) {
      editorState.isRestoring = true;
      await editorState.canvas.loadFromJSON(saved.json);
      editorState.canvas.requestRenderAll();
      editorState.isRestoring = false;
    }
    if (!editorState.histories.has(editorState.currentPage)) {
      const initial = serializeCanvas();
      editorState.histories.set(editorState.currentPage, { undo: [initial], redo: [] });
    }
    if (editorState.fitOnNextRender) {
      fitCanvas();
      editorState.fitOnNextRender = false;
    } else {
      applyZoom();
    }
    setActiveTool(editorState.activeTool, false);
    showEditorLoading(false);
  } catch (error) {
    console.error(error);
    showEditorLoading(false);
    showToast(t("pdfError"), true);
  }
}

function bindFabricEvents() {
  const canvas = editorState.canvas;
  if (!canvas) return;
  canvas.on("object:modified", recordHistory);
  canvas.on("path:created", recordHistory);
  canvas.on("text:changed", recordHistory);
  canvas.on("selection:created", syncSelectionControls);
  canvas.on("selection:updated", syncSelectionControls);
  canvas.on("selection:cleared", resetSelectionControls);
  canvas.on("mouse:down", (event) => {
    if (editorState.activeTool === "eraser") {
      editorState.isErasing = true;
      editorState.eraseChanged = false;
      const pointer = canvas.getScenePoint(event.e);
      eraseObjectsAt(pointer.x, pointer.y);
      return;
    }
    if (editorState.activeTool === "text" && !event.target) {
      const pointer = canvas.getScenePoint(event.e);
      addText(pointer.x, pointer.y);
    }
    if (editorState.activeTool === "editExisting" && !event.target) {
      const pointer = canvas.getScenePoint(event.e);
      editExistingTextAt(pointer.x, pointer.y);
    }
  });
  canvas.on("mouse:move", (event) => {
    if (editorState.activeTool !== "eraser" || !editorState.isErasing) return;
    const pointer = canvas.getScenePoint(event.e);
    eraseObjectsAt(pointer.x, pointer.y);
  });
  canvas.on("mouse:up", () => {
    if (editorState.activeTool !== "eraser") return;
    editorState.isErasing = false;
    if (editorState.eraseChanged) {
      editorState.eraseChanged = false;
      recordHistory();
    }
  });
}

function bindWorkspaceScrollPassthrough() {
  const workspace = document.querySelector("#pdfWorkspace");
  const canvas = editorState.canvas;
  if (!workspace || !canvas) return;
  const scrollTargets = [canvas.upperCanvasEl, canvas.lowerCanvasEl, canvas.wrapperEl].filter(Boolean);
  scrollTargets.forEach((target) => {
    target.addEventListener(
      "wheel",
      (event) => {
        if (event.ctrlKey) return;
        const canScrollY = workspace.scrollHeight > workspace.clientHeight + 2;
        const canScrollX = workspace.scrollWidth > workspace.clientWidth + 2;
        if (!canScrollY && !canScrollX) return;
        workspace.scrollTop += event.deltaY;
        workspace.scrollLeft += event.deltaX;
        event.preventDefault();
      },
      { passive: false },
    );
  });
}

function disposeFabricCanvas() {
  if (editorState.canvas) {
    editorState.canvas.dispose();
    editorState.canvas = null;
  }
  if (editorState.pageImageUrl) {
    URL.revokeObjectURL(editorState.pageImageUrl);
    editorState.pageImageUrl = "";
  }
}

function canvasToBlob(canvas, type = "image/png", quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Could not create the PDF page image."))), type, quality);
  });
}

function waitForImage(image) {
  if (image.complete && image.naturalWidth > 0) return Promise.resolve();
  return new Promise((resolve, reject) => {
    image.addEventListener("load", resolve, { once: true });
    image.addEventListener("error", () => reject(new Error("Could not display the PDF page image.")), { once: true });
  });
}

function setActiveTool(tool, addShape = true) {
  editorState.activeTool = tool;
  const canvas = editorState.canvas;
  document.querySelectorAll("[data-tool]").forEach((button) => button.classList.toggle("active", button.dataset.tool === tool));
  updateToolContext(tool);
  if (!canvas) return;

  canvas.isDrawingMode = tool === "draw" || tool === "highlight";
  canvas.selection = tool === "select";
  canvas.defaultCursor = tool === "eraser" ? "crosshair" : tool === "text" || tool === "editExisting" ? "text" : tool === "select" ? "default" : "crosshair";
  canvas.forEachObject((object) => {
    object.selectable = tool !== "eraser" && !canvas.isDrawingMode;
    object.evented = tool !== "eraser" && !canvas.isDrawingMode;
  });
  configureDrawingBrush();
  canvas.discardActiveObject();
  canvas.requestRenderAll();

  if (addShape && ["rectangle", "circle", "line", "arrow"].includes(tool)) {
    addShapeObject(tool);
    setActiveTool("select", false);
  }
}

function updateToolContext(tool) {
  const hints = {
    select: ["select", "selectHint"],
    text: ["text", "textHint"],
    editExisting: ["editExisting", "editExistingHint"],
    draw: ["draw", "drawHint"],
    highlight: ["highlight", "highlightHint"],
    eraser: ["eraser", "eraserHint"],
    rectangle: ["rectangle", "shapeHint"],
    circle: ["circle", "shapeHint"],
    line: ["line", "shapeHint"],
    arrow: ["arrow", "shapeHint"],
  };
  const [labelKey, hintKey] = hints[tool] || hints.select;
  setText("#activeToolLabel", t(labelKey));
  setText("#activeToolHint", t(hintKey));
}

function editExistingTextAt(x, y) {
  const group = getEditableTextGroupAt(x, y);
  if (!group) {
    showToast(t("editExistingHint"), true);
    return;
  }
  const canvas = editorState.canvas;
  if (!canvas) return;

  const maskId = `mask-${Date.now()}-${Math.round(Math.random() * 100000)}`;
  const mask = new Rect({
    left: Math.max(0, group.x - 3),
    top: Math.max(0, group.y - 3),
    width: group.width + 8,
    height: group.height + 8,
    fill: "#ffffff",
    stroke: "rgba(13, 124, 115, 0.12)",
    strokeWidth: 1,
    selectable: false,
    evented: false,
    hoverCursor: "default",
  });
  mask.replacementMaskId = maskId;

  const object = new IText(group.text, {
    left: group.x,
    top: group.y,
    fontFamily: editorState.text.family,
    fontSize: group.fontSize,
    fill: editorState.text.color,
    backgroundColor: "#ffffff",
    width: Math.max(group.width, 120),
    padding: 3,
    cornerColor: "#0d7c73",
    borderColor: "#0d7c73",
    cornerStyle: "circle",
    transparentCorners: false,
  });
  object.replacementMaskId = maskId;
  canvas.add(mask);
  canvas.add(object);
  canvas.setActiveObject(object);
  object.enterEditing();
  const selection = expandSelectionToWord(group.text, group.selectionStart, group.selectionEnd);
  object.selectionStart = selection.start;
  object.selectionEnd = selection.end;
  canvas.requestRenderAll();
  editorState.activeTool = "select";
  document.querySelectorAll("[data-tool]").forEach((button) => button.classList.toggle("active", button.dataset.tool === "select"));
  recordHistory();
}

function getEditableTextGroupAt(x, y) {
  const hit = findPdfTextItemAt(x, y);
  if (!hit) return null;
  const lineTolerance = Math.max(6, hit.fontSize * 0.65);
  const hitCenterY = hit.y + hit.height / 2;
  const lineItems = editorState.textItems
    .filter((item) => Math.abs(item.y + item.height / 2 - hitCenterY) <= lineTolerance)
    .sort((a, b) => a.x - b.x);
  const hitIndex = lineItems.indexOf(hit);
  if (hitIndex < 0) return itemToEditableGroup(hit);

  const gapLimit = Math.max(42, hit.fontSize * 2.8);
  let startIndex = hitIndex;
  let endIndex = hitIndex;
  for (let index = hitIndex - 1; index >= 0; index -= 1) {
    const previous = lineItems[index];
    const current = lineItems[index + 1];
    const gap = current.x - (previous.x + previous.width);
    if (gap > gapLimit) break;
    startIndex = index;
  }
  for (let index = hitIndex + 1; index < lineItems.length; index += 1) {
    const previous = lineItems[index - 1];
    const current = lineItems[index];
    const gap = current.x - (previous.x + previous.width);
    if (gap > gapLimit) break;
    endIndex = index;
  }

  const groupItems = lineItems.slice(startIndex, endIndex + 1);
  return textItemsToEditableGroup(groupItems, hit);
}

function findPdfTextItemAt(x, y) {
  const direct = editorState.textItems.find(
    (candidate) =>
      x >= candidate.x - 6 &&
      x <= candidate.x + candidate.width + 6 &&
      y >= candidate.y - 6 &&
      y <= candidate.y + candidate.height + 6,
  );
  if (direct) return direct;

  let closest = null;
  let closestDistance = Infinity;
  editorState.textItems.forEach((candidate) => {
    const centerX = candidate.x + candidate.width / 2;
    const centerY = candidate.y + candidate.height / 2;
    const distance = Math.hypot(centerX - x, centerY - y);
    const verticalLimit = Math.max(14, candidate.height * 1.2);
    const horizontalLimit = Math.max(22, candidate.width + 10);
    if (Math.abs(centerY - y) <= verticalLimit && Math.abs(centerX - x) <= horizontalLimit && distance < closestDistance) {
      closest = candidate;
      closestDistance = distance;
    }
  });
  return closest;
}

function itemToEditableGroup(item) {
  return {
    text: item.text,
    x: item.x,
    y: item.y,
    width: item.width,
    height: item.height,
    fontSize: item.fontSize,
    selectionStart: 0,
    selectionEnd: item.text.length,
  };
}

function textItemsToEditableGroup(items, hit) {
  if (!items.length) return null;
  let text = "";
  let selectionStart = 0;
  let selectionEnd = 0;
  const minX = Math.min(...items.map((item) => item.x));
  const minY = Math.min(...items.map((item) => item.y));
  const maxX = Math.max(...items.map((item) => item.x + item.width));
  const maxY = Math.max(...items.map((item) => item.y + item.height));
  const fontSize = Math.max(8, Math.round(items.reduce((sum, item) => sum + item.fontSize, 0) / items.length));

  items.forEach((item, index) => {
    if (index > 0) {
      const previous = items[index - 1];
      const gap = item.x - (previous.x + previous.width);
      if (shouldInsertSpace(previous, item, gap)) text += " ";
    }
    const start = text.length;
    text += item.text;
    const end = text.length;
    if (item === hit) {
      selectionStart = start;
      selectionEnd = end;
    }
  });

  return {
    text,
    x: minX,
    y: minY,
    width: Math.max(maxX - minX, 80),
    height: Math.max(maxY - minY, fontSize),
    fontSize,
    selectionStart,
    selectionEnd,
  };
}

function shouldInsertSpace(previous, item, gap) {
  if (!previous || !item) return false;
  if (/\s$/.test(previous.text) || /^\s/.test(item.text)) return false;
  if (!previous.text.trim() || !item.text.trim()) return false;
  const threshold = Math.max(3.5, Math.min(previous.fontSize, item.fontSize) * 0.18);
  return gap > threshold;
}

function expandSelectionToWord(text, start, end) {
  let selectionStart = Math.max(0, Math.min(start, text.length));
  let selectionEnd = Math.max(selectionStart, Math.min(end, text.length));
  while (selectionStart > 0 && !/\s/.test(text[selectionStart - 1])) selectionStart -= 1;
  while (selectionEnd < text.length && !/\s/.test(text[selectionEnd])) selectionEnd += 1;
  if (selectionStart === selectionEnd) selectionEnd = Math.min(text.length, selectionStart + 1);
  return { start: selectionStart, end: selectionEnd };
}

function eraseObjectsAt(x, y) {
  const canvas = editorState.canvas;
  if (!canvas) return;
  const radius = Math.max(4, editorState.pen.eraserWidth / 2);
  const objects = canvas.getObjects().slice().reverse();
  const hit = objects.filter((object) => objectIntersectsEraser(object, x, y, radius));
  if (!hit.length) return;
  hit.forEach((object) => removeObjectWithLinkedItems(object));
  canvas.discardActiveObject();
  canvas.requestRenderAll();
  editorState.eraseChanged = true;
  editorState.dirty = true;
  editorState.status = "changed";
  updateDocumentStatus();
}

function objectIntersectsEraser(object, x, y, radius) {
  if (!object || object.excludeFromExport) return false;
  const bounds = object.getBoundingRect();
  const nearestX = Math.max(bounds.left - radius, Math.min(x, bounds.left + bounds.width + radius));
  const nearestY = Math.max(bounds.top - radius, Math.min(y, bounds.top + bounds.height + radius));
  const insideExpandedBounds = x >= bounds.left - radius && x <= bounds.left + bounds.width + radius && y >= bounds.top - radius && y <= bounds.top + bounds.height + radius;
  return insideExpandedBounds || Math.hypot(nearestX - x, nearestY - y) <= radius;
}

function removeObjectWithLinkedItems(object) {
  const canvas = editorState.canvas;
  if (!canvas || !object) return;
  const maskId = object.replacementMaskId;
  if (maskId) {
    canvas.getObjects().slice().forEach((candidate) => {
      if (candidate !== object && candidate.replacementMaskId === maskId) canvas.remove(candidate);
    });
  }
  canvas.remove(object);
}

function configureDrawingBrush() {
  const canvas = editorState.canvas;
  if (!canvas || !canvas.isDrawingMode) return;
  const brush = new PencilBrush(canvas);
  if (editorState.activeTool === "highlight") {
    brush.color = hexToRgba(editorState.pen.highlightColor, 0.38);
    brush.width = 20;
  } else {
    brush.color = editorState.pen.color;
    brush.width = editorState.pen.width;
  }
  canvas.freeDrawingBrush = brush;
}

function addText(x = editorState.baseWidth / 2 - 90, y = editorState.baseHeight / 2) {
  const canvas = editorState.canvas;
  if (!canvas) return;
  const safeX = Math.max(8, Math.min(x, editorState.baseWidth - 40));
  const safeY = Math.max(8, Math.min(y, editorState.baseHeight - 20));
  const object = new IText("", {
    left: safeX,
    top: safeY,
    fontFamily: editorState.text.family,
    fontSize: editorState.text.size,
    fill: editorState.text.color,
    textAlign: editorState.text.align,
    opacity: 1,
    paintFirst: "fill",
    strokeWidth: 0,
    padding: 6,
    cornerColor: "#0d7c73",
    borderColor: "#0d7c73",
    cornerStyle: "circle",
    transparentCorners: false,
    objectCaching: false,
    editable: true,
    selectable: true,
    evented: true,
  });
  canvas.add(object);
  canvas.setActiveObject(object);
  object.enterEditing();
  canvas.requestRenderAll();
  recordHistory();
}

function addShapeObject(type) {
  const canvas = editorState.canvas;
  if (!canvas) return;
  const common = {
    left: editorState.baseWidth / 2 - 70,
    top: editorState.baseHeight / 2 - 40,
    stroke: editorState.pen.color,
    strokeWidth: Math.max(2, editorState.pen.width),
    fill: "transparent",
    cornerColor: "#0d7c73",
    borderColor: "#0d7c73",
    cornerStyle: "circle",
    transparentCorners: false,
  };
  let object;
  if (type === "rectangle") object = new Rect({ ...common, width: 150, height: 90, rx: 4, ry: 4 });
  if (type === "circle") object = new Circle({ ...common, radius: 55 });
  if (type === "line") object = new Line([0, 0, 150, 0], { ...common, fill: editorState.pen.color });
  if (type === "arrow") {
    const line = new Line([0, 0, 145, 0], { stroke: editorState.pen.color, strokeWidth: Math.max(2, editorState.pen.width) });
    const head = new Triangle({
      left: 145,
      top: 0,
      width: 18,
      height: 22,
      fill: editorState.pen.color,
      angle: 90,
      originX: "center",
      originY: "center",
    });
    object = new Group([line, head], { ...common, fill: editorState.pen.color, width: 155, height: 24 });
  }
  if (!object) return;
  canvas.add(object);
  canvas.setActiveObject(object);
  canvas.requestRenderAll();
  recordHistory();
}

function updateSelectedText(properties) {
  const object = editorState.canvas?.getActiveObject();
  if (!object || object.type !== "i-text") return;
  object.set(properties);
  object.setCoords();
  editorState.canvas.requestRenderAll();
  recordHistory();
}

function updateSelectedObjectColor(color) {
  const object = editorState.canvas?.getActiveObject();
  if (!object) return;
  if (object.type === "i-text") object.set("fill", color);
  else if (object.type === "group") {
    object.getObjects().forEach((child) => {
      child.set("stroke", color);
      if (child.type === "triangle") child.set("fill", color);
    });
  } else {
    object.set("stroke", color);
    if (object.type === "path") object.set("stroke", color);
  }
  object.setCoords();
  editorState.canvas.requestRenderAll();
  recordHistory();
}

function syncSelectionControls() {
  const object = editorState.canvas?.getActiveObject();
  if (!object) return;
  const opacity = Math.round((object.opacity ?? 1) * 100);
  setValue("#objectOpacity", opacity);
  setText("#objectOpacityValue", `${opacity}%`);
  const color = normalizeColor(object.type === "i-text" ? object.fill : object.stroke);
  if (color) {
    setValue("#objectColor", color);
    setText("#objectColorValue", color);
  }
  if (object.type === "i-text") {
    setValue("#fontFamily", object.fontFamily || editorState.text.family);
    setValue("#fontSize", Math.round(object.fontSize || editorState.text.size));
    if (normalizeColor(object.fill)) {
      setValue("#textColor", normalizeColor(object.fill));
      setText("#textColorValue", normalizeColor(object.fill));
    }
  }
}

function resetSelectionControls() {
  setValue("#objectOpacity", 100);
  setText("#objectOpacityValue", "100%");
}

function deleteSelectedObject() {
  const canvas = editorState.canvas;
  if (!canvas) return;
  const active = canvas.getActiveObjects();
  if (!active.length) return;
  active.forEach((object) => removeObjectWithLinkedItems(object));
  canvas.discardActiveObject();
  canvas.requestRenderAll();
  recordHistory();
}

function serializeCanvas() {
  return editorState.canvas ? JSON.stringify(editorState.canvas.toObject(["replacementMaskId"])) : JSON.stringify({ version: "6", objects: [] });
}

function isTextObjectEditing(object = editorState.canvas?.getActiveObject()) {
  return object?.type === "i-text" && object.isEditing;
}

async function copySelectedObject() {
  const object = editorState.canvas?.getActiveObject();
  if (!object || isTextObjectEditing(object)) return false;
  editorState.clipboardObject = await object.clone(["replacementMaskId"]);
  showToast(t("copiedObject"));
  return true;
}

async function pasteCopiedObject() {
  const canvas = editorState.canvas;
  if (!canvas || !editorState.clipboardObject || isTextObjectEditing()) return false;
  const clone = await editorState.clipboardObject.clone(["replacementMaskId"]);
  const offset = 18;
  clone.set({
    left: Math.min((clone.left || 0) + offset, Math.max(8, editorState.baseWidth - 40)),
    top: Math.min((clone.top || 0) + offset, Math.max(8, editorState.baseHeight - 20)),
    evented: true,
    selectable: true,
  });
  clone.setCoords();
  canvas.discardActiveObject();
  canvas.add(clone);
  canvas.setActiveObject(clone);
  canvas.requestRenderAll();
  editorState.clipboardObject = await clone.clone(["replacementMaskId"]);
  recordHistory();
  return true;
}

async function duplicateSelectedObject() {
  if (!(await copySelectedObject())) return;
  await pasteCopiedObject();
}

function recordHistory() {
  if (editorState.isRestoring || !editorState.canvas) return;
  const history = editorState.histories.get(editorState.currentPage) || { undo: [], redo: [] };
  const serialized = serializeCanvas();
  if (history.undo.at(-1) !== serialized) history.undo.push(serialized);
  if (history.undo.length > 60) history.undo.shift();
  history.redo = [];
  editorState.histories.set(editorState.currentPage, history);
  editorState.dirty = true;
  editorState.status = "changed";
  saveCurrentPageState();
  updateHistoryButtons();
  updateDocumentStatus();
}

function updateDocumentStatus() {
  const status = document.querySelector("#documentStatus");
  if (!status) return;
  status.classList.toggle("changed", editorState.dirty);
  status.classList.toggle("downloaded", editorState.status === "downloaded");
  setText(
    "#documentStatusText",
    t(editorState.status === "downloaded" ? "downloadedStatus" : editorState.dirty ? "changedStatus" : "readyStatus"),
  );
}

async function undo() {
  const history = editorState.histories.get(editorState.currentPage);
  if (!history || history.undo.length < 2) return;
  history.redo.push(history.undo.pop());
  await restoreCanvasState(history.undo.at(-1));
  saveCurrentPageState();
  updateHistoryButtons();
}

async function redo() {
  const history = editorState.histories.get(editorState.currentPage);
  if (!history || !history.redo.length) return;
  const next = history.redo.pop();
  history.undo.push(next);
  await restoreCanvasState(next);
  saveCurrentPageState();
  updateHistoryButtons();
}

async function restoreCanvasState(json) {
  if (!editorState.canvas) return;
  editorState.isRestoring = true;
  await editorState.canvas.loadFromJSON(json);
  editorState.canvas.requestRenderAll();
  editorState.isRestoring = false;
  setActiveTool("select", false);
}

function saveCurrentPageState() {
  if (!editorState.canvas || !editorState.pdf) return;
  editorState.pageStates.set(editorState.currentPage, {
    json: serializeCanvas(),
    width: editorState.baseWidth,
    height: editorState.baseHeight,
  });
}

async function goToPage(pageNumber) {
  if (!editorState.pdf || pageNumber < 1 || pageNumber > editorState.pdf.numPages || pageNumber === editorState.currentPage) return;
  saveCurrentPageState();
  editorState.currentPage = pageNumber;
  await renderCurrentPage();
  updatePageControls();
  document.querySelectorAll(".page-thumb").forEach((thumb) => thumb.classList.toggle("active", Number(thumb.dataset.page) === pageNumber));
}

function updatePageControls() {
  setText("#currentPage", editorState.currentPage);
  setText("#totalPages", editorState.pdf?.numPages || 0);
  const previous = document.querySelector("#previousPage");
  const next = document.querySelector("#nextPage");
  if (previous) previous.disabled = editorState.currentPage <= 1;
  if (next) next.disabled = editorState.currentPage >= (editorState.pdf?.numPages || 0);
  updateHistoryButtons();
}

function updateHistoryButtons() {
  const history = editorState.histories.get(editorState.currentPage);
  const undoButton = document.querySelector("#undoButton");
  const redoButton = document.querySelector("#redoButton");
  if (undoButton) undoButton.disabled = !history || history.undo.length < 2;
  if (redoButton) redoButton.disabled = !history || !history.redo.length;
}

async function renderThumbnails() {
  const container = document.querySelector("#pageThumbnails");
  if (!container || !editorState.pdf) return;
  container.innerHTML = "";
  for (let index = 1; index <= editorState.pdf.numPages; index += 1) {
    const thumb = document.createElement("button");
    thumb.className = `page-thumb ${index === editorState.currentPage ? "active" : ""}`;
    thumb.dataset.page = index;
    thumb.innerHTML = `<canvas></canvas><span class="page-thumb-number">${index}</span>`;
    thumb.addEventListener("click", () => goToPage(index));
    container.append(thumb);
    try {
      const page = await editorState.pdf.getPage(index);
      const viewport = page.getViewport({ scale: 0.18 });
      const canvas = thumb.querySelector("canvas");
      const context = canvas.getContext("2d");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      await page.render({ canvasContext: context, viewport }).promise;
    } catch (error) {
      console.warn("Thumbnail render failed", error);
    }
  }
}

function changeZoom(delta) {
  editorState.zoom = Math.max(0.45, Math.min(2.5, Number((editorState.zoom + delta).toFixed(2))));
  applyZoom();
}

function fitCanvas() {
  const workspace = document.querySelector("#pdfWorkspace");
  if (!workspace || !editorState.baseWidth) return;
  const available = Math.max(250, workspace.clientWidth - 56);
  editorState.zoom = Math.max(0.45, Math.min(1.75, Number((available / editorState.baseWidth).toFixed(2))));
  applyZoom();
}

function applyZoom() {
  const shell = document.querySelector("#canvasScaleShell");
  const stage = document.querySelector("#canvasStage");
  if (!shell || !stage) return;
  shell.style.width = `${editorState.baseWidth}px`;
  shell.style.height = `${editorState.baseHeight}px`;
  shell.style.transform = `scale(${editorState.zoom})`;
  stage.style.width = `${editorState.baseWidth * editorState.zoom}px`;
  stage.style.height = `${editorState.baseHeight * editorState.zoom}px`;
  setText("#zoomValue", `${Math.round(editorState.zoom * 100)}%`);
}

async function exportEditedPdfBytes() {
  saveCurrentPageState();
  await ensurePdfLibraries();
  const source = await PDFDocument.load(editorState.originalBytes.slice());
  const output = await PDFDocument.create();
  for (let index = 0; index < source.getPageCount(); index++) {
    const state = editorState.pageStates.get(index + 1);
    const parsed = state ? JSON.parse(state.json) : null;
    const replaced = parsed?.objects?.some((item) => item.replacementMaskId);
    let page;
    let base;
    let viewport;
    if (replaced) {
      const original = await editorState.pdf.getPage(index + 1);
      viewport = original.getViewport({ scale: 2 });
      base = document.createElement("canvas");
      base.width = Math.ceil(viewport.width); base.height = Math.ceil(viewport.height);
      await original.render({ canvasContext: base.getContext("2d"), viewport }).promise;
      const physical = original.getViewport({ scale: 1 });
      page = output.addPage([physical.width, physical.height]);
    } else {
      [page] = await output.copyPages(source, [index]); output.addPage(page);
    }
    if (parsed?.objects?.length) {
      const temp = new StaticCanvas(null, { width: state.width, height: state.height, backgroundColor: "rgba(0,0,0,0)" });
      try {
        await temp.loadFromJSON(state.json);
        const overlay = temp.toCanvasElement(2);
        if (replaced) {
          base.getContext("2d").drawImage(overlay, 0, 0, base.width, base.height);
          const embedded = await output.embedPng(await canvasToBytes(base, "image/png"));
          page.drawImage(embedded, { x: 0, y: 0, width: page.getWidth(), height: page.getHeight() });
        } else {
          const image = await output.embedPng(await canvasToBytes(overlay, "image/png"));
          const crop = page.getCropBox();
          const rotation = ((page.getRotation().angle % 360) + 360) % 360;
          const x = rotation === 90 || rotation === 180 ? crop.x + crop.width : crop.x;
          const y = rotation === 180 || rotation === 270 ? crop.y + crop.height : crop.y;
          page.drawImage(image, { x, y, width: rotation % 180 ? crop.height : crop.width, height: rotation % 180 ? crop.width : crop.height, rotate: degrees(rotation) });
        }
      } finally { temp.dispose(); }
    }
    if (base) base.width = base.height = 1;
  }
  return new Uint8Array(await output.save());
}

async function downloadEditedPdf() {
  if (!editorState.originalBytes || !editorState.pdf) {
    showToast(t("noPdf"), true);
    return;
  }
  showEditorLoading(true, t("savingPdf"));
  try {
    const output = await exportEditedPdfBytes();
    const baseName = editorState.fileName.replace(/\.pdf$/i, "") || "document";
    downloadBlob(new Blob([output], { type: "application/pdf" }), `${baseName}-edited.pdf`);
    editorState.dirty = false;
    editorState.status = "downloaded";
    updateDocumentStatus();
    showEditorLoading(false);
    showToast(t("pdfSaved"));
  } catch (error) {
    console.error(error);
    showEditorLoading(false);
    showToast(t("pdfError"), true);
  }
}

async function addBlankPage() {
  if (!editorState.pdf) return;
  showEditorLoading(true, t("workingPages"));
  try {
    const committed = await exportEditedPdfBytes();
    const pdfDoc = await PDFDocument.load(committed);
    const current = pdfDoc.getPage(editorState.currentPage - 1);
    const { width, height } = current.getSize();
    pdfDoc.insertPage(editorState.currentPage, [width, height]);
    const output = new Uint8Array(await pdfDoc.save());
    await loadPdfBytes(output, editorState.fileName, editorState.currentPage + 1);
    editorState.dirty = true;
    editorState.status = "changed";
    updateDocumentStatus();
    showToast(t("pageAdded"));
  } catch (error) {
    console.error(error);
    showEditorLoading(false);
    showToast(t("pdfError"), true);
  }
}

function deleteCurrentPage() {
  if (!editorState.pdf) return;
  if (editorState.pdf.numPages <= 1) {
    showToast(t("cannotDeleteLastPage"), true);
    return;
  }
  const modal = document.querySelector("#deletePageModal");
  if (modal) modal.hidden = false;
}

function closeDeletePageModal() {
  const modal = document.querySelector("#deletePageModal");
  if (modal) modal.hidden = true;
}

async function performDeleteCurrentPage() {
  if (!editorState.pdf || editorState.pdf.numPages <= 1) return;
  closeDeletePageModal();
  showEditorLoading(true, t("workingPages"));
  try {
    const pageToDelete = editorState.currentPage;
    const committed = await exportEditedPdfBytes();
    const pdfDoc = await PDFDocument.load(committed);
    pdfDoc.removePage(pageToDelete - 1);
    const output = new Uint8Array(await pdfDoc.save());
    await loadPdfBytes(output, editorState.fileName, Math.min(pageToDelete, pdfDoc.getPageCount()));
    editorState.dirty = true;
    editorState.status = "changed";
    updateDocumentStatus();
    showToast(t("pageDeleted"));
  } catch (error) {
    console.error(error);
    showEditorLoading(false);
    showToast(t("pdfError"), true);
  }
}

async function mergePdfFiles(files) {
  if (!editorState.pdf || !files.length) return;
  showEditorLoading(true, t("workingPages"));
  try {
    const committed = await exportEditedPdfBytes();
    const merged = await PDFDocument.load(committed);
    for (const file of files) {
      if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) continue;
      const source = await PDFDocument.load(new Uint8Array(await file.arrayBuffer()));
      const copied = await merged.copyPages(source, source.getPageIndices());
      copied.forEach((page) => merged.addPage(page));
    }
    const output = new Uint8Array(await merged.save());
    await loadPdfBytes(output, editorState.fileName, editorState.currentPage);
    editorState.dirty = true;
    editorState.status = "changed";
    updateDocumentStatus();
    showToast(t("filesMerged"));
  } catch (error) {
    console.error(error);
    showEditorLoading(false);
    showToast(t("pdfError"), true);
  }
}

function openSplitModal() {
  const modal = document.querySelector("#splitModal");
  if (modal) modal.hidden = false;
}

function closeSplitModal() {
  const modal = document.querySelector("#splitModal");
  if (modal) modal.hidden = true;
}

async function downloadSplitRange() {
  if (!editorState.pdf) return;
  const from = Number(document.querySelector("#splitFrom")?.value);
  const to = Number(document.querySelector("#splitTo")?.value);
  if (!Number.isInteger(from) || !Number.isInteger(to) || from < 1 || to < from || to > editorState.pdf.numPages) {
    showToast(t("invalidRange"), true);
    return;
  }
  closeSplitModal();
  showEditorLoading(true, t("workingPages"));
  try {
    const committed = await exportEditedPdfBytes();
    const source = await PDFDocument.load(committed);
    const outputDoc = await PDFDocument.create();
    const indices = Array.from({ length: to - from + 1 }, (_, index) => from - 1 + index);
    const copied = await outputDoc.copyPages(source, indices);
    copied.forEach((page) => outputDoc.addPage(page));
    const output = new Uint8Array(await outputDoc.save());
    const baseName = editorState.fileName.replace(/\.pdf$/i, "") || "document";
    downloadBlob(new Blob([output], { type: "application/pdf" }), `${baseName}-pages-${from}-${to}.pdf`);
    showEditorLoading(false);
    showToast(t("splitSaved"));
  } catch (error) {
    console.error(error);
    showEditorLoading(false);
    showToast(t("pdfError"), true);
  }
}

function showEditorLoading(show, message = t("loadingPdf")) {
  const overlay = document.querySelector("#editorLoading");
  overlay?.classList.toggle("visible", show);
  setText("#loadingText", message);
}

function bindContactEvents() {
  document.querySelector("#contactForm")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = document.querySelector("#contactName").value;
    const email = document.querySelector("#contactEmail").value;
    const subject = document.querySelector("#contactSubject").value;
    const message = document.querySelector("#contactMessage").value;
    document.querySelector("#contactStatus")?.classList.add("visible");
    const body = `${message}\n\n${name}\n${email}`;
    setTimeout(() => {
      window.location.href = `mailto:hello@pdfqr.tools?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }, 300);
  });
}

function setText(selector, value) {
  const element = document.querySelector(selector);
  if (element) element.textContent = value;
}

function setValue(selector, value) {
  const element = document.querySelector(selector);
  if (element) element.value = value;
}

function normalizeColor(value) {
  if (typeof value !== "string") return null;
  if (/^#[0-9a-f]{6}$/i.test(value)) return value;
  const match = value.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/i);
  if (!match) return null;
  return `#${match
    .slice(1)
    .map((part) => Number(part).toString(16).padStart(2, "0"))
    .join("")}`;
}

function hexToRgba(hex, alpha) {
  const normalized = hex.replace("#", "");
  const number = Number.parseInt(normalized, 16);
  return `rgba(${(number >> 16) & 255}, ${(number >> 8) & 255}, ${number & 255}, ${alpha})`;
}

function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

let toastTimer;
function showToast(message, isError = false) {
  const toast = document.querySelector("#toast");
  if (!toast) return;
  toast.innerHTML = `${icon(isError ? "info" : "check", 18)}<span>${escapeHtml(message)}</span>`;
  toast.classList.toggle("error", isError);
  toast.classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("visible"), 3200);
}

window.addEventListener("hashchange", async () => {
  if (pdfToolState.busy) { history.replaceState(null, "", `#/${appState.route}`); return; }
  saveCurrentPageState();
  disposeFabricCanvas();
  clearPdfToolState();
  appState.route = getRouteFromLocation();
  await renderApp();
});

window.addEventListener("keydown", (event) => {
  if (appState.route !== "editor" || !editorState.canvas) return;
  const target = event.target;
  if (target?.matches("input, textarea, [contenteditable='true']")) return;
  if (isTextObjectEditing()) return;
  const key = event.key.toLowerCase();
  const isModifier = event.ctrlKey || event.metaKey;
  if (isModifier && key === "c" && editorState.canvas.getActiveObject()) {
    event.preventDefault();
    copySelectedObject();
    return;
  }
  if (isModifier && key === "v" && editorState.clipboardObject) {
    event.preventDefault();
    pasteCopiedObject();
    return;
  }
  if (isModifier && key === "d" && editorState.canvas.getActiveObject()) {
    event.preventDefault();
    duplicateSelectedObject();
    return;
  }
  if (event.key === "Delete" || event.key === "Backspace") {
    event.preventDefault();
    deleteSelectedObject();
  }
  if (isModifier && key === "z") {
    event.preventDefault();
    event.shiftKey ? redo() : undo();
  }
  if (isModifier && key === "y") {
    event.preventDefault();
    redo();
  }
});

function registerServiceWorker() {
  if (import.meta.env.DEV || !("serviceWorker" in navigator) || !location.protocol.startsWith("http")) return;
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/service-worker.js").catch(() => {
      // PWA enhancement only; the app must keep working even if registration is blocked.
    });
  });
}

registerServiceWorker();
renderApp();

function clearPdfToolState() {
  resetPdfToolResult();
  for (const item of pdfToolState.images) if (item.url) URL.revokeObjectURL(item.url);
  Object.assign(pdfToolState, { file: null, files: [], bytes: null, images: [], pageThumbs: [], pageOrder: [], rotations: {}, signatureDataUrl: "", watermarkImageDataUrl: "", activeDragIndex: null });
}

function updatePageSelectionPreview() {
  const input = document.querySelector('#pdfToolForm [name="pages"]');
  if (!input) return;
  let selected = [];
  try { if (input.value.trim()) selected = parsePageRange(input.value, pdfToolState.pageThumbs.length).map((i) => i + 1); } catch { /* Validation is reported when processing. */ }
  document.querySelectorAll("[data-select-page]").forEach((button) => button.setAttribute("aria-pressed", String(selected.includes(Number(button.dataset.selectPage)))));
}

async function processMergePdf() {
  const inputs = await Promise.all(pdfToolState.files.map(async (file) => new Uint8Array(await file.arrayBuffer())));
  pdfToolState.resultBytes = await mergeDocuments(inputs);
  pdfToolState.resultName = "merged.pdf";
}

async function processPageSelection(formData) {
  const source = await PDFDocument.load(pdfToolState.bytes.slice());
  const selected = parsePageRange(formData.get("pages"), source.getPageCount(), false);
  const indices = appState.route === "remove-pages" ? source.getPageIndices().filter((i) => !selected.includes(i)) : selected;
  pdfToolState.resultBytes = await selectPages(pdfToolState.bytes.slice(), indices);
  pdfToolState.resultName = withSuffix(pdfToolState.file.name, appState.route === "remove-pages" ? "pages-removed" : "extracted");
}

async function processSplitPdf(formData) {
  const source = await PDFDocument.load(pdfToolState.bytes.slice());
  const count = source.getPageCount();
  const groups = formData.get("splitMode") === "each" ? source.getPageIndices().map((i) => [i]) : String(formData.get("ranges") || "").replace(/،/g, ",").split(",").map((range) => parsePageRange(range, count, false));
  const parts = await splitDocument(pdfToolState.bytes.slice(), groups);
  if (parts.length === 1) { pdfToolState.resultBytes = parts[0]; pdfToolState.resultName = withSuffix(pdfToolState.file.name, "split"); return; }
  const entries = Object.fromEntries(parts.map((bytes, i) => [`${baseFileName(pdfToolState.file.name)}-${i + 1}.pdf`, bytes]));
  pdfToolState.resultBytes = zipSync(entries);
  pdfToolState.resultMime = "application/zip";
  pdfToolState.resultName = `${baseFileName(pdfToolState.file.name)}-split.zip`;
}

function pdfRenderOptions() {
  return { cMapUrl: "/cmaps/", cMapPacked: true, standardFontDataUrl: "/standard_fonts/", isOffscreenCanvasSupported: false, isImageDecoderSupported: false };
}

async function insertEditorImage(file) {
  if (!file || !isImageFile(file) || !editorState.canvas) return;
  try {
    const { FabricImage } = await import("fabric");
    const image = await FabricImage.fromURL(await fileToDataUrl(file));
    image.scaleToWidth(Math.min(editorState.baseWidth * 0.45, image.width));
    image.set({ left: 40, top: 40 });
    editorState.canvas.add(image);
    editorState.canvas.setActiveObject(image);
    editorState.canvas.requestRenderAll();
    recordHistory();
  } catch { showToast(t("unsupportedFile"), true); }
}

import "./style.css";
import QRCode from "qrcode";
import JsBarcode from "jsbarcode";

let pdfjsLib;
let PDFDocument;
let Canvas;
let Circle;
let Group;
let IText;
let Line;
let PencilBrush;
let Rect;
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
  ({ PDFDocument } = pdfLibModule);
  ({ Canvas, Circle, Group, IText, Line, PencilBrush, Rect, StaticCanvas, Triangle } = fabricModule);
}

const translations = {
  ar: {
    locale: "ar",
    language: "العربية",
    langCode: "AR",
    home: "الرئيسية",
    pdfEditor: "تعديل PDF",
    qrCreator: "إنشاء QR",
    privacy: "الخصوصية",
    contact: "تواصل",
    startNow: "ابدأ الآن",
    safeBadge: "أدوات ذكية. خصوصية أولًا.",
    heroTitle1: "كل ما تحتاجه لـ",
    heroTitleAccent: "PDF و QR",
    heroTitle2: "في مكان واحد.",
    heroCopy:
      "عدّل ملفات PDF، أضف نصوصًا ورسومات وأشكالًا، وأنشئ أكواد QR مخصّصة خلال ثوانٍ — مباشرة داخل متصفحك.",
    editPdfNow: "تعديل ملف PDF",
    createQrNow: "إنشاء QR Code",
    privacyShort: "لا يتم رفع ملفاتك أو حفظها بعد انتهاء التعديل.",
    mockNote: "مراجعة نهائية ✓",
    qrReady: "QR جاهز",
    instantDownload: "تحميل فوري",
    browserOnly: "يعمل داخل المتصفح",
    browserOnlySub: "ملفاتك تبقى على جهازك",
    multilingual: "3 لغات",
    multilingualSub: "العربية، الألمانية، الإنجليزية",
    noAccount: "دون تسجيل",
    noAccountSub: "افتح الأداة وابدأ مباشرة",
    toolsKicker: "أدواتك اليومية",
    toolsTitle: "بساطة في الواجهة، قوة في الداخل",
    toolsCopy: "أدوات واضحة صُممت للجميع، من دون برامج معقّدة أو خطوات مربكة.",
    pdfCardTitle: "محرر PDF متكامل",
    pdfCardCopy:
      "اكتب وارسم وميّز وأضف الأشكال، ثم حمّل نسختك النهائية بجودة عالية.",
    openEditor: "فتح محرر PDF",
    qrCardTitle: "مولّد QR مرن",
    qrCardCopy:
      "حوّل رابطًا أو رقم هاتف أو بريدًا أو نصًا إلى كود QR بألوانك الخاصة.",
    openQr: "إنشاء QR الآن",
    howKicker: "ثلاث خطوات فقط",
    howTitle: "من الملف إلى النتيجة في دقائق",
    step1Title: "اختر أداتك",
    step1Copy: "ارفع ملف PDF أو افتح مولّد QR من الصفحة الرئيسية.",
    step2Title: "خصّص النتيجة",
    step2Copy: "استخدم الأدوات البسيطة لإضافة المحتوى وتغيير الألوان.",
    step3Title: "حمّل مباشرة",
    step3Copy: "احفظ النتيجة على جهازك من دون حساب أو انتظار.",
    futureKicker: "إدارة PDF كاملة",
    futureTitle: "تحكّم بصفحات الملف من نفس المحرر",
    mergePdf: "دمج PDF",
    splitPdf: "تقسيم PDF",
    compressPdf: "ضغط PDF",
    imagesToPdf: "الصور إلى PDF",
    soon: "متاح الآن",
    ctaTitle: "جاهز لإنهاء مهمتك؟",
    ctaCopy: "ابدأ مجانًا، ولا حاجة لإنشاء حساب.",
    footerCopy:
      "أدوات PDF وQR سريعة وبسيطة تحترم خصوصيتك وتعمل مباشرة من متصفحك.",
    footerTools: "الأدوات",
    footerInfo: "معلومات",
    rights: "جميع الحقوق محفوظة.",
    madePrivate: "صُمم بخصوصية المستخدم أولًا.",
    editorBadge: "محرر PDF داخل المتصفح",
    editorTitle: "عدّل ملف PDF بطريقتك",
    editorCopy: "أضف النصوص والتعليقات والرسومات والأشكال ثم نزّل الملف النهائي.",
    privacyBanner: "لا يتم حفظ ملفاتك بعد انتهاء التعديل — المعالجة تتم داخل متصفحك.",
    uploadPdf: "رفع PDF",
    newFile: "ملف جديد",
    downloadPdf: "تحميل PDF",
    pages: "الصفحات",
    properties: "الخصائص",
    select: "تحديد",
    text: "نص",
    editExisting: "تعديل نص موجود",
    editExistingHint: "اضغط على أي نص ظاهر داخل الصفحة لاستبداله بصريًا.",
    draw: "قلم",
    highlight: "تمييز",
    rectangle: "مربع",
    circle: "دائرة",
    line: "خط",
    arrow: "سهم",
    delete: "حذف",
    undo: "تراجع",
    redo: "إعادة",
    addBlankPage: "صفحة فارغة",
    deletePage: "حذف الصفحة",
    mergeFiles: "دمج ملفات",
    splitRange: "تقسيم الملف",
    confirmDeletePage: "هل تريد حذف الصفحة الحالية؟",
    cannotDeleteLastPage: "لا يمكن حذف الصفحة الوحيدة في الملف.",
    pageDeleted: "تم حذف الصفحة.",
    pageAdded: "تمت إضافة صفحة فارغة.",
    filesMerged: "تم دمج الملفات بنجاح.",
    workingPages: "جارٍ تجهيز الصفحات…",
    splitTitle: "تقسيم أو استخراج صفحات",
    splitCopy: "اختر أول وآخر صفحة لإنشاء ملف PDF جديد.",
    fromPage: "من الصفحة",
    toPage: "إلى الصفحة",
    downloadRange: "تحميل الجزء",
    cancel: "إلغاء",
    invalidRange: "أدخل نطاق صفحات صحيحًا.",
    splitSaved: "تم تنزيل الجزء المحدد.",
    pageTools: "إدارة الصفحات",
    localStatus: "يعمل محليًا على جهازك",
    readyStatus: "جاهز للتعديل",
    changedStatus: "تعديلات غير منزّلة",
    downloadedStatus: "تم تنزيل آخر نسخة",
    selectHint: "حدّد أي عنصر لتحريكه أو تغيير حجمه وخصائصه.",
    textHint: "أضف مربع نص جديد ثم اكتب مباشرة.",
    drawHint: "اسحب فوق الصفحة للرسم بالقلم.",
    highlightHint: "اسحب فوق المنطقة التي تريد تمييزها.",
    shapeHint: "تمت إضافة الشكل إلى منتصف الصفحة ويمكنك تحريكه.",
    keyboardHint: "Delete للحذف · Ctrl+Z للتراجع",
    focusMode: "وضع التركيز",
    exitFocus: "الخروج من التركيز",
    dropTitle: "اسحب ملف PDF إلى هنا",
    dropCopy: "أو اختر ملفًا من جهازك لبدء التعديل",
    chooseFile: "اختيار ملف PDF",
    trySample: "تجربة ملف نموذجي",
    dropMeta: "ملف PDF واحد • تتم المعالجة على جهازك",
    page: "صفحة",
    of: "من",
    textSettings: "إعدادات النص",
    fontFamily: "نوع الخط",
    fontSize: "حجم الخط",
    textColor: "لون النص",
    alignment: "المحاذاة",
    penSettings: "إعدادات القلم",
    penColor: "لون القلم",
    penWidth: "سماكة القلم",
    highlightColor: "لون التمييز",
    objectSettings: "العنصر المحدد",
    objectColor: "لون العنصر",
    opacity: "الشفافية",
    selectionHint: "حدّد عنصرًا على الصفحة لتحريكه أو تكبيره أو تغيير خصائصه.",
    loadingPdf: "جارٍ فتح ملف PDF…",
    savingPdf: "جارٍ تجهيز الملف النهائي…",
    pdfLoaded: "تم فتح الملف بنجاح.",
    pdfError: "تعذّر فتح هذا الملف. تأكد من أنه PDF صالح وغير محمي بكلمة مرور.",
    pdfSaved: "تم تنزيل ملف PDF المعدّل.",
    noPdf: "ارفع ملف PDF أولًا.",
    qrBadge: "مولّد QR سريع",
    qrTitle: "حوّل أي معلومة إلى QR",
    qrCopy: "اختر النوع، أدخل البيانات، خصّص الألوان ثم حمّل الكود فورًا.",
    url: "رابط",
    phone: "هاتف",
    plainText: "نص",
    email: "بريد",
    whatsapp: "واتساب",
    enterUrl: "أدخل رابط الموقع",
    enterPhone: "أدخل رقم الهاتف",
    enterText: "اكتب النص الذي تريد تحويله",
    enterEmail: "أدخل البريد الإلكتروني",
    enterWhatsapp: "رقم واتساب مع رمز الدولة",
    whatsappMessage: "رسالة جاهزة (اختياري)",
    whatsappMessagePlaceholder: "مرحبًا، أريد الاستفسار عن…",
    smartUrlHint: "يمكنك كتابة example.com وسنضيف https:// تلقائيًا.",
    urlPlaceholder: "https://example.com",
    phonePlaceholder: "+49 123 456789",
    textPlaceholder: "اكتب رسالتك هنا…",
    emailPlaceholder: "hello@example.com",
    foreground: "لون QR",
    background: "لون الخلفية",
    generateQr: "إنشاء QR",
    reset: "إعادة تعيين",
    livePreview: "معاينة الكود",
    previewEmpty: "سيظهر QR هنا",
    downloadPng: "تحميل PNG",
    downloadSvg: "تحميل SVG",
    qrTip: "لأفضل قراءة، استخدم لونًا داكنًا للكود وخلفية فاتحة.",
    invalidQr: "أدخل بيانات صحيحة لإنشاء الكود.",
    qrGenerated: "تم إنشاء QR Code.",
    qrDownloaded: "تم تنزيل الكود.",
    scanReady: "جاهز للمسح",
    encodedContent: "المحتوى المشفّر",
    privacyTitle: "خصوصيتك جزء من التصميم",
    privacyLead:
      "صُممت PDF & QR Tools لتنجز عملك مع إبقاء ملفاتك ومحتواك تحت سيطرتك.",
    privacyCallout: "لا يتم حفظ ملفاتك بعد انتهاء التعديل.",
    policy1Title: "معالجة الملفات",
    policy1Copy:
      "تتم قراءة ملفات PDF وتطبيق التعديلات عليها داخل متصفحك قدر الإمكان. لا نرسل محتوى ملفاتك إلى خادم لتخزينه.",
    policy2Title: "التخزين",
    policy2Copy:
      "لا يحتفظ الموقع بنسخ من ملفات PDF أو أكواد QR التي تنشئها. عند إغلاق الصفحة أو بدء ملف جديد، تبقى النسخ التي حمّلتها على جهازك فقط.",
    policy3Title: "البيانات التي تدخلها",
    policy3Copy:
      "النصوص والروابط وأرقام الهاتف وعناوين البريد المستخدمة لإنشاء QR تتم معالجتها محليًا ولا تُخزّن في حساب مستخدم.",
    policy4Title: "نصائح الاستخدام الآمن",
    policy4Items: [
      "تجنب وضع معلومات شديدة الحساسية داخل QR عام.",
      "احتفظ بنسخة أصلية من ملف PDF قبل تعديله.",
      "تحقق من الملف النهائي قبل مشاركته.",
    ],
    updated: "آخر تحديث: 24 يونيو 2026",
    contactBadge: "نحن هنا للمساعدة",
    contactTitle: "أخبرنا كيف يمكننا مساعدتك",
    contactCopy: "اقتراح أداة جديدة، سؤال، أو ملاحظة — يسعدنا سماعك.",
    contactSideTitle: "لنجعل الأدوات أفضل",
    contactSideCopy:
      "نقرأ كل الملاحظات. رسالتك تساعدنا في ترتيب الأدوات القادمة وتحسين التجربة.",
    name: "الاسم",
    subject: "الموضوع",
    message: "الرسالة",
    sendMessage: "إرسال الرسالة",
    namePlaceholder: "اسمك",
    subjectPlaceholder: "كيف يمكننا مساعدتك؟",
    messagePlaceholder: "اكتب رسالتك…",
    contactStatus: "سيتم فتح تطبيق البريد على جهازك لإرسال الرسالة.",
    emailUs: "hello@pdfqr.tools",
    worksLocally: "المعالجة محلية وآمنة",
    openPages: "عرض الصفحات",
    openProperties: "عرض الخصائص",
    fit: "ملاءمة",
  },
  de: {
    locale: "de",
    language: "Deutsch",
    langCode: "DE",
    home: "Start",
    pdfEditor: "PDF bearbeiten",
    qrCreator: "QR erstellen",
    privacy: "Datenschutz",
    contact: "Kontakt",
    startNow: "Jetzt starten",
    safeBadge: "Smarte Tools. Datenschutz zuerst.",
    heroTitle1: "Alles für",
    heroTitleAccent: "PDF & QR",
    heroTitle2: "an einem Ort.",
    heroCopy:
      "PDFs bearbeiten, Text, Zeichnungen und Formen ergänzen und individuelle QR-Codes in Sekunden erstellen — direkt im Browser.",
    editPdfNow: "PDF bearbeiten",
    createQrNow: "QR-Code erstellen",
    privacyShort: "Deine Dateien werden nicht hochgeladen oder nach der Bearbeitung gespeichert.",
    mockNote: "Final geprüft ✓",
    qrReady: "QR ist fertig",
    instantDownload: "Sofort herunterladen",
    browserOnly: "Läuft im Browser",
    browserOnlySub: "Dateien bleiben auf deinem Gerät",
    multilingual: "3 Sprachen",
    multilingualSub: "Deutsch, Englisch, Arabisch",
    noAccount: "Ohne Konto",
    noAccountSub: "Öffnen und direkt loslegen",
    toolsKicker: "Deine täglichen Tools",
    toolsTitle: "Einfach außen, leistungsstark innen",
    toolsCopy: "Klare Werkzeuge für alle — ohne komplizierte Software oder verwirrende Schritte.",
    pdfCardTitle: "Kompletter PDF-Editor",
    pdfCardCopy: "Schreiben, zeichnen, markieren, Formen ergänzen und hochwertig herunterladen.",
    openEditor: "PDF-Editor öffnen",
    qrCardTitle: "Flexibler QR-Generator",
    qrCardCopy: "Links, Telefonnummern, E-Mails oder Text in einen QR-Code mit eigenen Farben verwandeln.",
    openQr: "QR jetzt erstellen",
    howKicker: "Nur drei Schritte",
    howTitle: "In wenigen Minuten zum Ergebnis",
    step1Title: "Tool wählen",
    step1Copy: "PDF hochladen oder den QR-Generator auf der Startseite öffnen.",
    step2Title: "Ergebnis anpassen",
    step2Copy: "Mit einfachen Werkzeugen Inhalte ergänzen und Farben ändern.",
    step3Title: "Direkt herunterladen",
    step3Copy: "Das Ergebnis ohne Konto und Wartezeit auf deinem Gerät speichern.",
    futureKicker: "Komplette PDF-Verwaltung",
    futureTitle: "Seiten direkt im Editor verwalten",
    mergePdf: "PDF zusammenfügen",
    splitPdf: "PDF teilen",
    compressPdf: "PDF komprimieren",
    imagesToPdf: "Bilder zu PDF",
    soon: "Jetzt verfügbar",
    ctaTitle: "Bereit, deine Aufgabe zu erledigen?",
    ctaCopy: "Kostenlos starten, kein Konto erforderlich.",
    footerCopy: "Schnelle, einfache PDF- und QR-Werkzeuge, die deine Privatsphäre respektieren.",
    footerTools: "Werkzeuge",
    footerInfo: "Informationen",
    rights: "Alle Rechte vorbehalten.",
    madePrivate: "Mit Datenschutz als Priorität entwickelt.",
    editorBadge: "PDF-Editor im Browser",
    editorTitle: "Bearbeite dein PDF, wie du willst",
    editorCopy: "Text, Kommentare, Zeichnungen und Formen ergänzen und final herunterladen.",
    privacyBanner: "Dateien werden nach der Bearbeitung nicht gespeichert — alles läuft im Browser.",
    uploadPdf: "PDF hochladen",
    newFile: "Neue Datei",
    downloadPdf: "PDF herunterladen",
    pages: "Seiten",
    properties: "Eigenschaften",
    select: "Auswahl",
    text: "Text",
    editExisting: "Vorhandenen Text ändern",
    editExistingHint: "Klicke auf sichtbaren Text, um ihn optisch zu ersetzen.",
    draw: "Stift",
    highlight: "Markieren",
    rectangle: "Rechteck",
    circle: "Kreis",
    line: "Linie",
    arrow: "Pfeil",
    delete: "Löschen",
    undo: "Rückgängig",
    redo: "Wiederholen",
    addBlankPage: "Leere Seite",
    deletePage: "Seite löschen",
    mergeFiles: "Dateien verbinden",
    splitRange: "PDF teilen",
    confirmDeletePage: "Aktuelle Seite wirklich löschen?",
    cannotDeleteLastPage: "Die einzige Seite kann nicht gelöscht werden.",
    pageDeleted: "Seite wurde gelöscht.",
    pageAdded: "Leere Seite wurde hinzugefügt.",
    filesMerged: "Dateien wurden erfolgreich verbunden.",
    workingPages: "Seiten werden vorbereitet…",
    splitTitle: "Seiten teilen oder extrahieren",
    splitCopy: "Wähle die erste und letzte Seite für eine neue PDF.",
    fromPage: "Von Seite",
    toPage: "Bis Seite",
    downloadRange: "Teil herunterladen",
    cancel: "Abbrechen",
    invalidRange: "Bitte einen gültigen Seitenbereich eingeben.",
    splitSaved: "Der ausgewählte Teil wurde heruntergeladen.",
    pageTools: "Seiten verwalten",
    localStatus: "Lokal auf deinem Gerät",
    readyStatus: "Bereit zum Bearbeiten",
    changedStatus: "Änderungen noch nicht geladen",
    downloadedStatus: "Letzte Version geladen",
    selectHint: "Objekt wählen, verschieben, skalieren oder anpassen.",
    textHint: "Ein neues Textfeld hinzufügen und direkt schreiben.",
    drawHint: "Zum Zeichnen über die Seite ziehen.",
    highlightHint: "Über den gewünschten Bereich ziehen.",
    shapeHint: "Die Form wurde mittig eingefügt und kann verschoben werden.",
    keyboardHint: "Entf zum Löschen · Strg+Z rückgängig",
    focusMode: "Fokusmodus",
    exitFocus: "Fokus beenden",
    dropTitle: "PDF hierher ziehen",
    dropCopy: "Oder wähle eine Datei von deinem Gerät",
    chooseFile: "PDF auswählen",
    trySample: "Beispiel ausprobieren",
    dropMeta: "Eine PDF-Datei • Verarbeitung auf deinem Gerät",
    page: "Seite",
    of: "von",
    textSettings: "Texteinstellungen",
    fontFamily: "Schriftart",
    fontSize: "Schriftgröße",
    textColor: "Textfarbe",
    alignment: "Ausrichtung",
    penSettings: "Stifteinstellungen",
    penColor: "Stiftfarbe",
    penWidth: "Stiftbreite",
    highlightColor: "Markerfarbe",
    objectSettings: "Ausgewähltes Objekt",
    objectColor: "Objektfarbe",
    opacity: "Deckkraft",
    selectionHint: "Wähle ein Objekt aus, um es zu verschieben, zu skalieren oder anzupassen.",
    loadingPdf: "PDF wird geöffnet…",
    savingPdf: "Finale PDF wird erstellt…",
    pdfLoaded: "PDF erfolgreich geöffnet.",
    pdfError: "Diese Datei konnte nicht geöffnet werden. Prüfe, ob sie gültig und nicht geschützt ist.",
    pdfSaved: "Die bearbeitete PDF wurde heruntergeladen.",
    noPdf: "Bitte zuerst eine PDF hochladen.",
    qrBadge: "Schneller QR-Generator",
    qrTitle: "Jede Information als QR-Code",
    qrCopy: "Typ wählen, Daten eingeben, Farben anpassen und sofort herunterladen.",
    url: "Link",
    phone: "Telefon",
    plainText: "Text",
    email: "E-Mail",
    whatsapp: "WhatsApp",
    enterUrl: "Website-Link eingeben",
    enterPhone: "Telefonnummer eingeben",
    enterText: "Text für den QR-Code eingeben",
    enterEmail: "E-Mail-Adresse eingeben",
    enterWhatsapp: "WhatsApp-Nummer mit Ländervorwahl",
    whatsappMessage: "Vorbereitete Nachricht (optional)",
    whatsappMessagePlaceholder: "Hallo, ich habe eine Frage zu…",
    smartUrlHint: "Du kannst example.com eingeben — https:// wird automatisch ergänzt.",
    urlPlaceholder: "https://example.com",
    phonePlaceholder: "+49 123 456789",
    textPlaceholder: "Nachricht hier eingeben…",
    emailPlaceholder: "hallo@example.com",
    foreground: "QR-Farbe",
    background: "Hintergrund",
    generateQr: "QR erstellen",
    reset: "Zurücksetzen",
    livePreview: "Live-Vorschau",
    previewEmpty: "QR erscheint hier",
    downloadPng: "PNG laden",
    downloadSvg: "SVG laden",
    qrTip: "Für beste Lesbarkeit: dunkler QR-Code auf hellem Hintergrund.",
    invalidQr: "Bitte gültige Daten eingeben.",
    qrGenerated: "QR-Code wurde erstellt.",
    qrDownloaded: "QR-Code wurde heruntergeladen.",
    scanReady: "Scanbereit",
    encodedContent: "Codierter Inhalt",
    privacyTitle: "Datenschutz ist Teil des Designs",
    privacyLead: "PDF & QR Tools hält deine Dateien und Inhalte unter deiner Kontrolle.",
    privacyCallout: "Deine Dateien werden nach der Bearbeitung nicht gespeichert.",
    policy1Title: "Dateiverarbeitung",
    policy1Copy: "PDFs werden so weit wie möglich direkt im Browser gelesen und bearbeitet. Inhalte werden nicht zur Speicherung hochgeladen.",
    policy2Title: "Speicherung",
    policy2Copy: "Wir behalten keine Kopien von PDFs oder QR-Codes. Heruntergeladene Dateien bleiben ausschließlich auf deinem Gerät.",
    policy3Title: "Eingegebene Daten",
    policy3Copy: "Texte, Links, Nummern und E-Mail-Adressen für QR-Codes werden lokal verarbeitet und keinem Nutzerkonto zugeordnet.",
    policy4Title: "Tipps für sichere Nutzung",
    policy4Items: [
      "Keine hochsensiblen Informationen in öffentliche QR-Codes einfügen.",
      "Vor der Bearbeitung eine Originalkopie der PDF behalten.",
      "Die fertige Datei vor dem Teilen prüfen.",
    ],
    updated: "Letzte Aktualisierung: 24. Juni 2026",
    contactBadge: "Wir helfen gern",
    contactTitle: "Wie können wir helfen?",
    contactCopy: "Neue Tool-Idee, Frage oder Feedback — wir freuen uns auf deine Nachricht.",
    contactSideTitle: "Gemeinsam besser",
    contactSideCopy: "Wir lesen jedes Feedback. Deine Nachricht hilft uns, kommende Tools zu priorisieren.",
    name: "Name",
    subject: "Betreff",
    message: "Nachricht",
    sendMessage: "Nachricht senden",
    namePlaceholder: "Dein Name",
    subjectPlaceholder: "Wie können wir helfen?",
    messagePlaceholder: "Nachricht schreiben…",
    contactStatus: "Deine E-Mail-App wird zum Senden der Nachricht geöffnet.",
    emailUs: "hello@pdfqr.tools",
    worksLocally: "Lokal und sicher verarbeitet",
    openPages: "Seiten anzeigen",
    openProperties: "Eigenschaften anzeigen",
    fit: "Einpassen",
  },
  en: {
    locale: "en",
    language: "English",
    langCode: "EN",
    home: "Home",
    pdfEditor: "Edit PDF",
    qrCreator: "Create QR",
    privacy: "Privacy",
    contact: "Contact",
    startNow: "Start now",
    safeBadge: "Smart tools. Privacy first.",
    heroTitle1: "Everything for",
    heroTitleAccent: "PDF & QR",
    heroTitle2: "in one place.",
    heroCopy:
      "Edit PDFs, add text, drawings and shapes, and create custom QR codes in seconds — directly in your browser.",
    editPdfNow: "Edit a PDF",
    createQrNow: "Create QR Code",
    privacyShort: "Your files are never uploaded or stored after editing.",
    mockNote: "Final review ✓",
    qrReady: "QR is ready",
    instantDownload: "Instant download",
    browserOnly: "Works in your browser",
    browserOnlySub: "Files stay on your device",
    multilingual: "3 languages",
    multilingualSub: "English, German, Arabic",
    noAccount: "No account",
    noAccountSub: "Open the tool and start",
    toolsKicker: "Your daily tools",
    toolsTitle: "Simple on the outside, powerful inside",
    toolsCopy: "Clear tools made for everyone, without complicated software or confusing steps.",
    pdfCardTitle: "Complete PDF editor",
    pdfCardCopy: "Write, draw, highlight, add shapes, then download a high-quality final file.",
    openEditor: "Open PDF editor",
    qrCardTitle: "Flexible QR generator",
    qrCardCopy: "Turn a link, phone, email or text into a QR code using your own colors.",
    openQr: "Create QR now",
    howKicker: "Only three steps",
    howTitle: "From input to result in minutes",
    step1Title: "Choose your tool",
    step1Copy: "Upload a PDF or open the QR generator from the home page.",
    step2Title: "Customize it",
    step2Copy: "Use simple controls to add content and change colors.",
    step3Title: "Download directly",
    step3Copy: "Save the result to your device without an account or waiting.",
    futureKicker: "Complete PDF workflow",
    futureTitle: "Manage document pages in the same editor",
    mergePdf: "Merge PDF",
    splitPdf: "Split PDF",
    compressPdf: "Compress PDF",
    imagesToPdf: "Images to PDF",
    soon: "Available now",
    ctaTitle: "Ready to finish the job?",
    ctaCopy: "Start for free. No account needed.",
    footerCopy: "Fast, simple PDF and QR tools that respect your privacy and run in your browser.",
    footerTools: "Tools",
    footerInfo: "Information",
    rights: "All rights reserved.",
    madePrivate: "Designed with privacy first.",
    editorBadge: "In-browser PDF editor",
    editorTitle: "Edit your PDF your way",
    editorCopy: "Add text, notes, drawings and shapes, then download the finished document.",
    privacyBanner: "Your files are not saved after editing — processing happens in your browser.",
    uploadPdf: "Upload PDF",
    newFile: "New file",
    downloadPdf: "Download PDF",
    pages: "Pages",
    properties: "Properties",
    select: "Select",
    text: "Text",
    editExisting: "Edit existing text",
    editExistingHint: "Click visible text on the page to replace it visually.",
    draw: "Pen",
    highlight: "Highlight",
    rectangle: "Rectangle",
    circle: "Circle",
    line: "Line",
    arrow: "Arrow",
    delete: "Delete",
    undo: "Undo",
    redo: "Redo",
    addBlankPage: "Blank page",
    deletePage: "Delete page",
    mergeFiles: "Merge files",
    splitRange: "Split PDF",
    confirmDeletePage: "Delete the current page?",
    cannotDeleteLastPage: "The only page cannot be deleted.",
    pageDeleted: "Page deleted.",
    pageAdded: "Blank page added.",
    filesMerged: "Files merged successfully.",
    workingPages: "Preparing pages…",
    splitTitle: "Split or extract pages",
    splitCopy: "Choose the first and last page for a new PDF.",
    fromPage: "From page",
    toPage: "To page",
    downloadRange: "Download range",
    cancel: "Cancel",
    invalidRange: "Enter a valid page range.",
    splitSaved: "The selected range was downloaded.",
    pageTools: "Manage pages",
    localStatus: "Runs locally on your device",
    readyStatus: "Ready to edit",
    changedStatus: "Changes not downloaded",
    downloadedStatus: "Latest version downloaded",
    selectHint: "Select any object to move, resize or customize it.",
    textHint: "Add a new text box and start typing immediately.",
    drawHint: "Drag across the page to draw.",
    highlightHint: "Drag across the area you want to highlight.",
    shapeHint: "The shape was added to the center and can be moved.",
    keyboardHint: "Delete to remove · Ctrl+Z to undo",
    focusMode: "Focus mode",
    exitFocus: "Exit focus",
    dropTitle: "Drop your PDF here",
    dropCopy: "Or choose a file from your device to start editing",
    chooseFile: "Choose PDF file",
    trySample: "Try a sample PDF",
    dropMeta: "One PDF file • Processed on your device",
    page: "Page",
    of: "of",
    textSettings: "Text settings",
    fontFamily: "Font family",
    fontSize: "Font size",
    textColor: "Text color",
    alignment: "Alignment",
    penSettings: "Pen settings",
    penColor: "Pen color",
    penWidth: "Pen width",
    highlightColor: "Highlight color",
    objectSettings: "Selected object",
    objectColor: "Object color",
    opacity: "Opacity",
    selectionHint: "Select an object on the page to move, resize or change its properties.",
    loadingPdf: "Opening your PDF…",
    savingPdf: "Preparing the final PDF…",
    pdfLoaded: "PDF opened successfully.",
    pdfError: "This file could not be opened. Make sure it is a valid, unprotected PDF.",
    pdfSaved: "Your edited PDF was downloaded.",
    noPdf: "Upload a PDF first.",
    qrBadge: "Fast QR generator",
    qrTitle: "Turn anything into a QR code",
    qrCopy: "Choose a type, enter your data, customize colors and download instantly.",
    url: "Link",
    phone: "Phone",
    plainText: "Text",
    email: "Email",
    whatsapp: "WhatsApp",
    enterUrl: "Enter a website URL",
    enterPhone: "Enter a phone number",
    enterText: "Enter the text to encode",
    enterEmail: "Enter an email address",
    enterWhatsapp: "WhatsApp number with country code",
    whatsappMessage: "Prefilled message (optional)",
    whatsappMessagePlaceholder: "Hello, I would like to ask about…",
    smartUrlHint: "You can enter example.com — https:// is added automatically.",
    urlPlaceholder: "https://example.com",
    phonePlaceholder: "+1 555 123 4567",
    textPlaceholder: "Type your message here…",
    emailPlaceholder: "hello@example.com",
    foreground: "QR color",
    background: "Background color",
    generateQr: "Create QR",
    reset: "Reset",
    livePreview: "Live preview",
    previewEmpty: "Your QR appears here",
    downloadPng: "Download PNG",
    downloadSvg: "Download SVG",
    qrTip: "For the best scan rate, use a dark QR color on a light background.",
    invalidQr: "Enter valid data to create your code.",
    qrGenerated: "QR code created.",
    qrDownloaded: "QR code downloaded.",
    scanReady: "Ready to scan",
    encodedContent: "Encoded content",
    privacyTitle: "Privacy is part of the design",
    privacyLead: "PDF & QR Tools keeps your files and content under your control.",
    privacyCallout: "Your files are not saved after editing.",
    policy1Title: "File processing",
    policy1Copy: "PDF files are read and edited inside your browser whenever possible. We do not send their content to a server for storage.",
    policy2Title: "Storage",
    policy2Copy: "The site keeps no copies of your PDFs or generated QR codes. Downloads remain only on your device.",
    policy3Title: "Data you enter",
    policy3Copy: "Text, links, phone numbers and emails used for QR codes are processed locally and are not stored in a user account.",
    policy4Title: "Safe-use tips",
    policy4Items: [
      "Avoid putting highly sensitive information in a public QR code.",
      "Keep an original copy of a PDF before editing it.",
      "Check the final file before sharing it.",
    ],
    updated: "Last updated: June 24, 2026",
    contactBadge: "We are here to help",
    contactTitle: "Tell us how we can help",
    contactCopy: "A new tool idea, a question, or feedback — we would love to hear it.",
    contactSideTitle: "Help us make it better",
    contactSideCopy: "We read every note. Your feedback helps us prioritize future tools.",
    name: "Name",
    subject: "Subject",
    message: "Message",
    sendMessage: "Send message",
    namePlaceholder: "Your name",
    subjectPlaceholder: "How can we help?",
    messagePlaceholder: "Write your message…",
    contactStatus: "Your email app will open so you can send the message.",
    emailUs: "hello@pdfqr.tools",
    worksLocally: "Processed locally and securely",
    openPages: "Show pages",
    openProperties: "Show properties",
    fit: "Fit",
  },
};

const iconPaths = {
  file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M8 13h8M8 17h5"/>',
  qr: '<rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/><path d="M14 14h3v3h-3zM18 18h3v3h-3zM14 20h2M20 14h1v2M18 14v2"/>',
  image: '<rect width="20" height="16" x="2" y="4" rx="2"/><circle cx="8" cy="9" r="2"/><path d="m22 15-5-5L5 20"/>',
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
};

function icon(name, size = 20, stroke = 2) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${iconPaths[name] || iconPaths.info}</svg>`;
}

const appState = {
  lang: localStorage.getItem("pdfqr-lang") || (navigator.language.startsWith("ar") ? "ar" : navigator.language.startsWith("de") ? "de" : "en"),
  route: getRouteFromLocation(),
  qrType: "url",
  qrSvg: "",
  qrLogoDataUrl: "",
  qrLogoSize: 18,
  qrPrintPreset: "5cm",
  barcodeSvg: "",
  generatedKind: "qr",
  imageQrSvg: "",
  imageQrUrl: "",
  imageQrFile: null,
  viewImageId: getViewImageId(),
};

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

const runtimeTranslations = {
  ar: {
    eraser: "ممحاة",
    eraserHint: "اسحب فوق النص أو الرسم أو التمييز الذي أضفته لمسحه.",
  },
  de: {
    eraser: "Radierer",
    eraserHint: "Ziehe über hinzugefügten Text, Zeichnungen oder Markierungen, um sie zu entfernen.",
  },
  en: {
    eraser: "Eraser",
    eraserHint: "Drag over added text, drawings or highlights to remove them.",
  },
};

Object.assign(runtimeTranslations.ar, {
  eraser: "\u0645\u0645\u062d\u0627\u0629",
  eraserHint: "\u0627\u0633\u062d\u0628 \u0641\u0648\u0642 \u0627\u0644\u0646\u0635 \u0623\u0648 \u0627\u0644\u0631\u0633\u0645 \u0623\u0648 \u0627\u0644\u062a\u0645\u064a\u064a\u0632 \u0627\u0644\u0630\u064a \u0623\u0636\u0641\u062a\u0647 \u0644\u0645\u0633\u062d\u0647.",
  eraserSize: "\u062d\u062c\u0645 \u0627\u0644\u0645\u0645\u062d\u0627\u0629",
  imageQr: "\u0643\u064a\u0648 \u0622\u0631 \u0644\u0644\u0635\u0648\u0631\u0629",
  imageQrTitle: "\u062d\u0648\u0651\u0644 \u0635\u0648\u0631\u062a\u0643 \u0625\u0644\u0649 QR Code \u0622\u0645\u0646",
  imageQrLead: "\u0627\u0631\u0641\u0639 \u0635\u0648\u0631\u0629\u060c \u0648\u0633\u0646\u0646\u0634\u0626 \u0644\u0647\u0627 \u0631\u0627\u0628\u0637\u064b\u0627 \u0641\u0631\u064a\u062f\u064b\u0627 \u0648QR Code \u064a\u0641\u062a\u062d \u0635\u0641\u062d\u0629 \u0627\u0644\u0635\u0648\u0631\u0629.",
  imageQrExplanation: "QR Code \u0644\u0627 \u064a\u062d\u062a\u0648\u064a \u0627\u0644\u0635\u0648\u0631\u0629 \u0646\u0641\u0633\u0647\u0627\u060c \u0628\u0644 \u064a\u062d\u062a\u0648\u064a \u0631\u0627\u0628\u0637\u064b\u0627 \u064a\u0641\u062a\u062d \u0635\u0641\u062d\u0629 \u0627\u0644\u0635\u0648\u0631\u0629.",
  dropImage: "\u0627\u0633\u062d\u0628 \u0627\u0644\u0635\u0648\u0631\u0629 \u0647\u0646\u0627",
  chooseImage: "\u0623\u0648 \u0627\u062e\u062a\u0631 \u0635\u0648\u0631\u0629 \u0645\u0646 \u062c\u0647\u0627\u0632\u0643",
  imageRules: "JPG \u0623\u0648 PNG \u0623\u0648 WebP \u2014 \u0628\u062d\u062f \u0623\u0642\u0635\u0649 5MB",
  optionalTitle: "\u0639\u0646\u0648\u0627\u0646 \u0627\u0644\u0635\u0648\u0631\u0629 (\u0627\u062e\u062a\u064a\u0627\u0631\u064a)",
  optionalDescription: "\u0648\u0635\u0641 (\u0627\u062e\u062a\u064a\u0627\u0631\u064a)",
  expiry: "\u062d\u0630\u0641 \u0627\u0644\u0635\u0648\u0631\u0629 \u0628\u0639\u062f",
  oneDay: "\u064a\u0648\u0645 \u0648\u0627\u062d\u062f",
  sevenDays: "7 \u0623\u064a\u0627\u0645",
  fifteenDays: "15 \u064a\u0648\u0645\u064b\u0627",
  retentionLimitNotice: "\u064a\u062a\u0645 \u062d\u0630\u0641 \u0627\u0644\u0635\u0648\u0631 \u062a\u0644\u0642\u0627\u0626\u064a\u064b\u0627 \u0628\u0639\u062f \u0627\u0646\u062a\u0647\u0627\u0621 \u0645\u062f\u0629 \u0627\u0644\u0627\u062d\u062a\u0641\u0627\u0638\u060c \u0648\u0627\u0644\u062d\u062f \u0627\u0644\u0623\u0642\u0635\u0649 \u0647\u0648 15 \u064a\u0648\u0645\u064b\u0627.",
  protectPassword: "\u062d\u0645\u0627\u064a\u0629 \u0628\u0643\u0644\u0645\u0629 \u0645\u0631\u0648\u0631 (\u0627\u062e\u062a\u064a\u0627\u0631\u064a)",
  createImageQr: "\u0631\u0641\u0639 \u0627\u0644\u0635\u0648\u0631\u0629 \u0648\u0625\u0646\u0634\u0627\u0621 QR",
  uploadingImage: "\u062c\u0627\u0631\u064a \u0631\u0641\u0639 \u0627\u0644\u0635\u0648\u0631\u0629 \u0628\u0623\u0645\u0627\u0646\u2026",
  imageQrReady: "\u0627\u0644\u0631\u0627\u0628\u0637 \u0648QR Code \u062c\u0627\u0647\u0632\u0627\u0646",
  copyLink: "\u0646\u0633\u062e \u0627\u0644\u0631\u0627\u0628\u0637",
  downloadPdf: "\u062a\u062d\u0645\u064a\u0644 PDF",
  privacyImageNotice: "\u062a\u064f\u062e\u0632\u0651\u0646 \u0627\u0644\u0635\u0648\u0631\u0629 \u0641\u0642\u0637 \u0644\u062a\u0634\u063a\u064a\u0644 \u0627\u0644\u0631\u0627\u0628\u0637\u060c \u0648\u062a\u064f\u062d\u0630\u0641 \u062a\u0644\u0642\u0627\u0626\u064a\u064b\u0627 \u0639\u0646\u062f \u0627\u0646\u062a\u0647\u0627\u0621 \u0627\u0644\u0645\u062f\u0629. \u0644\u0627 \u062a\u0631\u0641\u0639 \u0635\u0648\u0631\u064b\u0627 \u0634\u062f\u064a\u062f\u0629 \u0627\u0644\u062d\u0633\u0627\u0633\u064a\u0629.",
  imageInvalid: "\u0627\u062e\u062a\u0631 \u0635\u0648\u0631\u0629 JPG \u0623\u0648 PNG \u0623\u0648 WebP \u0623\u0642\u0644 \u0645\u0646 5MB.",
  uploadFailed: "\u062a\u0639\u0630\u0651\u0631 \u0631\u0641\u0639 \u0627\u0644\u0635\u0648\u0631\u0629. \u062a\u0623\u0643\u062f \u0645\u0646 \u0623\u0646 PHP \u0648SQLite \u0645\u0641\u0639\u0651\u0644\u0627\u0646 \u0639\u0644\u0649 \u0627\u0644\u0627\u0633\u062a\u0636\u0627\u0641\u0629.",
  faqTitle: "\u0623\u0633\u0626\u0644\u0629 \u0634\u0627\u0626\u0639\u0629",
  faq1q: "\u0647\u0644 \u0627\u0644\u0635\u0648\u0631\u0629 \u0645\u0648\u062c\u0648\u062f\u0629 \u062f\u0627\u062e\u0644 QR Code\u061f",
  faq1a: "\u0644\u0627. \u0627\u0644\u0643\u0648\u062f \u064a\u062d\u0645\u0644 \u0631\u0627\u0628\u0637\u064b\u0627 \u0641\u0642\u0637\u060c \u0648\u0647\u0630\u0627 \u064a\u062d\u0627\u0641\u0638 \u0639\u0644\u0649 \u062c\u0648\u062f\u0629 \u0627\u0644\u0645\u0633\u062d \u0648\u064a\u0633\u0645\u062d \u0628\u062d\u0645\u0627\u064a\u0629 \u0627\u0644\u0635\u0648\u0631\u0629.",
  faq2q: "\u0645\u0627 \u0645\u062f\u0629 \u0627\u0644\u0627\u062d\u062a\u0641\u0627\u0638 \u0628\u0627\u0644\u0635\u0648\u0631\u0629\u061f",
  faq2a: "\u064a\u0645\u0643\u0646 \u0627\u062e\u062a\u064a\u0627\u0631 \u064a\u0648\u0645 \u0648\u0627\u062d\u062f \u0623\u0648 7 \u0623\u064a\u0627\u0645 \u0623\u0648 15 \u064a\u0648\u0645\u064b\u0627\u060c \u0648\u0628\u0639\u062f\u0647\u0627 \u064a\u062a\u0645 \u062d\u0630\u0641 \u0627\u0644\u0635\u0648\u0631\u0629 \u062a\u0644\u0642\u0627\u0626\u064a\u064b\u0627.",
  faq4q: "\u0647\u0644 \u064a\u0645\u0643\u0646 \u0627\u0644\u0627\u062d\u062a\u0641\u0627\u0638 \u0628\u0627\u0644\u0635\u0648\u0631\u0629 \u0644\u0644\u0623\u0628\u062f\u061f",
  faq4a: "\u0644\u0627\u060c \u0644\u062d\u0645\u0627\u064a\u0629 \u0627\u0644\u062e\u0635\u0648\u0635\u064a\u0629 \u0648\u062a\u0648\u0641\u064a\u0631 \u0645\u0633\u0627\u062d\u0629 \u0627\u0644\u062a\u062e\u0632\u064a\u0646\u060c \u0627\u0644\u062d\u062f \u0627\u0644\u0623\u0642\u0635\u0649 \u0647\u0648 15 \u064a\u0648\u0645\u064b\u0627.",
  faq3q: "\u0643\u064a\u0641 \u062a\u0639\u0645\u0644 \u0627\u0644\u062d\u0645\u0627\u064a\u0629 \u0628\u0643\u0644\u0645\u0629 \u0645\u0631\u0648\u0631\u061f",
  faq3a: "\u064a\u0637\u0644\u0628 \u0631\u0627\u0628\u0637 \u0627\u0644\u0635\u0648\u0631\u0629 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0642\u0628\u0644 \u0625\u0638\u0647\u0627\u0631\u0647\u0627\u060c \u0648\u0646\u062d\u0641\u0638 \u0646\u0633\u062e\u0629 \u0645\u0634\u0641\u0631\u0629 \u0645\u0646\u0647\u0627 \u0641\u0642\u0637.",
  imageProtected: "\u0647\u0630\u0647 \u0627\u0644\u0635\u0648\u0631\u0629 \u0645\u062d\u0645\u064a\u0629",
  enterImagePassword: "\u0623\u062f\u062e\u0644 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0644\u0639\u0631\u0636 \u0627\u0644\u0635\u0648\u0631\u0629",
  openImage: "\u0639\u0631\u0636 \u0627\u0644\u0635\u0648\u0631\u0629",
  imageUnavailable: "\u0627\u0644\u0635\u0648\u0631\u0629 \u063a\u064a\u0631 \u0645\u062a\u0627\u062d\u0629 \u0623\u0648 \u0627\u0646\u062a\u0647\u062a \u0645\u062f\u062a\u0647\u0627.",
  expiresLabel: "\u062a\u0646\u062a\u0647\u064a \u0641\u064a",
  smartQrTools: "\u0623\u062f\u0648\u0627\u062a QR \u0627\u0644\u0630\u0643\u064a\u0629",
  wifiQr: "Wi-Fi",
  vcardQr: "vCard",
  mapsQr: "Google Maps",
  menuQr: "\u0645\u0646\u064a\u0648 \u0645\u0637\u0639\u0645",
  paypalQr: "PayPal",
  ibanQr: "\u062f\u0641\u0639 IBAN",
  smsQr: "SMS",
  eventQr: "\u062d\u062f\u062b / \u062a\u0642\u0648\u064a\u0645",
  socialQr: "\u062a\u0648\u0627\u0635\u0644 \u0627\u062c\u062a\u0645\u0627\u0639\u064a",
  barcodeGenerator: "\u0645\u0648\u0644\u0651\u062f Barcode",
  networkName: "\u0627\u0633\u0645 \u0634\u0628\u0643\u0629 Wi-Fi",
  wifiPassword: "\u0643\u0644\u0645\u0629 \u0645\u0631\u0648\u0631 \u0627\u0644\u0634\u0628\u0643\u0629",
  encryption: "\u0646\u0648\u0639 \u0627\u0644\u062d\u0645\u0627\u064a\u0629",
  hiddenNetwork: "\u0634\u0628\u0643\u0629 \u0645\u062e\u0641\u064a\u0629",
  fullName: "\u0627\u0644\u0627\u0633\u0645 \u0627\u0644\u0643\u0627\u0645\u0644",
  organization: "\u0627\u0644\u0634\u0631\u0643\u0629",
  address: "\u0627\u0644\u0639\u0646\u0648\u0627\u0646",
  mapsPlace: "\u0627\u0644\u0639\u0646\u0648\u0627\u0646 \u0623\u0648 \u0627\u0644\u0645\u0643\u0627\u0646",
  menuUrl: "\u0631\u0627\u0628\u0637 \u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0637\u0639\u0627\u0645",
  paypalAccount: "\u0628\u0631\u064a\u062f PayPal",
  amount: "\u0627\u0644\u0645\u0628\u0644\u063a",
  currency: "\u0627\u0644\u0639\u0645\u0644\u0629",
  recipient: "\u0627\u0633\u0645 \u0627\u0644\u0645\u0633\u062a\u0644\u0645",
  countryCode: "\u0627\u0644\u062f\u0648\u0644\u0629 / \u0631\u0645\u0632 \u0627\u0644\u062f\u0648\u0644\u0629",
  iban: "IBAN",
  bic: "BIC / SWIFT",
  paymentReason: "\u0633\u0628\u0628 \u0627\u0644\u062f\u0641\u0639",
  smsMessage: "\u0631\u0633\u0627\u0644\u0629 SMS",
  eventTitle: "\u0639\u0646\u0648\u0627\u0646 \u0627\u0644\u062d\u062f\u062b",
  eventStart: "\u0627\u0644\u0628\u062f\u0627\u064a\u0629",
  eventEnd: "\u0627\u0644\u0646\u0647\u0627\u064a\u0629",
  location: "\u0627\u0644\u0645\u0643\u0627\u0646",
  socialPlatform: "\u0627\u0644\u0645\u0646\u0635\u0629",
  profileUrl: "\u0631\u0627\u0628\u0637 \u0627\u0644\u062d\u0633\u0627\u0628",
  barcodeValue: "\u0642\u064a\u0645\u0629 Barcode",
  barcodeFormat: "\u0646\u0648\u0639 Barcode",
  phoneFormatHint: "\u0627\u062e\u062a\u0631 \u0627\u0644\u062f\u0648\u0644\u0629 \u062b\u0645 \u0627\u0643\u062a\u0628 \u0627\u0644\u0631\u0642\u0645 \u0645\u062d\u0644\u064a\u064b\u0627 \u0645\u062b\u0644 0172 5766513 \u0623\u0648 \u062f\u0648\u0644\u064a\u064b\u0627 \u0645\u062b\u0644 +49 \u0623\u0648 0049. \u0633\u0646\u0646\u0638\u0641 \u0627\u0644\u0645\u0633\u0627\u0641\u0627\u062a \u0648\u0627\u0644\u0623\u0642\u0648\u0627\u0633 \u0648\u0627\u0644\u0634\u0631\u0637\u0627\u062a \u062a\u0644\u0642\u0627\u0626\u064a\u064b\u0627.",
  qrWithLogo: "QR \u0645\u0639 Logo",
  uploadLogo: "\u0631\u0641\u0639 Logo",
  logoSize: "\u062d\u062c\u0645 \u0627\u0644\u0644\u0648\u063a\u0648",
  logoWarning: "\u0627\u0644\u0644\u0648\u063a\u0648 \u0627\u0644\u0643\u0628\u064a\u0631 \u0642\u062f \u064a\u062c\u0639\u0644 QR \u063a\u064a\u0631 \u0642\u0627\u0628\u0644 \u0644\u0644\u0645\u0633\u062d. \u064a\u064f\u0646\u0635\u062d \u0628\u062d\u062c\u0645 15\u201320%.",
  printSize: "\u0645\u0642\u0627\u0633 \u0627\u0644\u0637\u0628\u0627\u0639\u0629",
  size3cm: "3\u00d73 cm",
  size5cm: "5\u00d75 cm",
  size10cm: "10\u00d710 cm",
  a4Multiple: "A4 \u2014 \u0639\u062f\u0629 \u0623\u0643\u0648\u0627\u062f",
  businessCard: "\u0628\u0637\u0627\u0642\u0629 \u0639\u0645\u0644",
  tableCard: "\u0628\u0637\u0627\u0642\u0629 \u0637\u0627\u0648\u0644\u0629 \u0645\u0637\u0639\u0645",
  downloadPrintPdf: "\u062a\u062d\u0645\u064a\u0644 PDF",
  howToUse: "\u0643\u064a\u0641 \u062a\u0633\u062a\u062e\u062f\u0645 \u0627\u0644\u0623\u062f\u0627\u0629\u061f",
  howToUseCopy: "\u0627\u0645\u0644\u0623 \u0627\u0644\u0628\u064a\u0627\u0646\u0627\u062a \u0627\u0644\u0645\u0637\u0644\u0648\u0628\u0629\u060c \u062e\u0635\u0651\u0635 \u0627\u0644\u0623\u0644\u0648\u0627\u0646 \u0623\u0648 \u0627\u0644\u0644\u0648\u063a\u0648\u060c \u062b\u0645 \u0627\u0636\u063a\u0637 \u0625\u0646\u0634\u0627\u0621 QR \u0648\u0627\u062e\u062a\u0628\u0631\u0647 \u0642\u0628\u0644 \u0627\u0644\u0646\u0634\u0631.",
  printingTips: "\u0646\u0635\u0627\u0626\u062d \u0644\u0644\u0637\u0628\u0627\u0639\u0629",
  printingTipsCopy: "\u0627\u0633\u062a\u062e\u062f\u0645 \u062a\u0628\u0627\u064a\u0646\u064b\u0627 \u0642\u0648\u064a\u064b\u0627\u060c \u0627\u062a\u0631\u0643 \u0645\u0633\u0627\u062d\u0629 \u0628\u064a\u0636\u0627\u0621 \u062d\u0648\u0644 \u0627\u0644\u0643\u0648\u062f\u060c \u0648\u0644\u0627 \u062a\u0637\u0628\u0639 QR \u0628\u062d\u062c\u0645 \u0623\u0642\u0644 \u0645\u0646 3 cm.",
  businessExamples: "\u0623\u0645\u062b\u0644\u0629 \u0644\u0623\u0635\u062d\u0627\u0628 \u0627\u0644\u0645\u0634\u0627\u0631\u064a\u0639",
  businessExamplesCopy: "\u0642\u0648\u0627\u0626\u0645 \u0627\u0644\u0645\u0637\u0627\u0639\u0645\u060c \u0628\u0637\u0627\u0642\u0627\u062a \u0627\u0644\u0639\u0645\u0644\u060c Wi-Fi \u0644\u0644\u0636\u064a\u0648\u0641\u060c \u0631\u0648\u0627\u0628\u0637 \u0627\u0644\u062f\u0641\u0639\u060c \u0627\u0644\u0645\u0648\u0627\u0642\u0639\u060c \u0648\u0627\u0644\u0639\u0631\u0648\u0636.",
  qrFaqQuestion: "\u0644\u0645\u0627\u0630\u0627 \u0644\u0627 \u064a\u0639\u0645\u0644 QR \u0628\u0639\u062f \u0627\u0644\u0637\u0628\u0627\u0639\u0629\u061f",
  qrFaqAnswer: "\u063a\u0627\u0644\u0628\u064b\u0627 \u0628\u0633\u0628\u0628 \u0636\u0639\u0641 \u0627\u0644\u062a\u0628\u0627\u064a\u0646\u060c \u0635\u063a\u0631 \u0627\u0644\u062d\u062c\u0645\u060c \u0642\u0635 \u0627\u0644\u0647\u0627\u0645\u0634 \u0627\u0644\u0623\u0628\u064a\u0636\u060c \u0623\u0648 \u0643\u0628\u0631 \u0627\u0644\u0644\u0648\u063a\u0648.",
  downloadImage: "\u062a\u062d\u0645\u064a\u0644 \u0627\u0644\u0635\u0648\u0631\u0629",
  description: "\u0627\u0644\u0648\u0635\u0641",
});
Object.assign(runtimeTranslations.de, {
  eraserSize: "Radierergr\u00f6\u00dfe", imageQr: "Bild-QR", imageQrTitle: "Bild in einen sicheren QR-Code verwandeln",
  imageQrLead: "Bild hochladen, einen eindeutigen Link erstellen und als QR-Code teilen.",
  imageQrExplanation: "Der QR-Code enth\u00e4lt nicht das Bild selbst, sondern einen Link zur Bildseite.",
  dropImage: "Bild hier ablegen", chooseImage: "oder vom Ger\u00e4t ausw\u00e4hlen", imageRules: "JPG, PNG oder WebP \u2014 maximal 5 MB",
  optionalTitle: "Bildtitel (optional)", optionalDescription: "Beschreibung (optional)", expiry: "Bild l\u00f6schen nach",
  oneDay: "1 Tag", sevenDays: "7 Tagen", fifteenDays: "15 Tagen",
  retentionLimitNotice: "Bilder werden nach Ablauf der gew\u00e4hlten Aufbewahrungsdauer automatisch gel\u00f6scht. Das Maximum betr\u00e4gt 15 Tage.",
  protectPassword: "Passwortschutz (optional)",
  createImageQr: "Bild hochladen & QR erstellen", uploadingImage: "Bild wird sicher hochgeladen\u2026", imageQrReady: "Link und QR-Code sind fertig",
  copyLink: "Link kopieren", downloadPdf: "PDF herunterladen", privacyImageNotice: "Das Bild wird nur f\u00fcr den Link gespeichert und nach Ablauf automatisch gel\u00f6scht. Keine hochsensiblen Bilder hochladen.",
  imageInvalid: "Bitte JPG, PNG oder WebP unter 5 MB ausw\u00e4hlen.", uploadFailed: "Upload fehlgeschlagen. Bitte PHP und SQLite auf dem Hosting pr\u00fcfen.",
  faqTitle: "H\u00e4ufige Fragen", faq1q: "Ist das Bild im QR-Code gespeichert?", faq1a: "Nein. Der QR-Code enth\u00e4lt nur den Link zur gesch\u00fctzten Bildseite.",
  faq2q: "Wie lange wird das Bild gespeichert?", faq2a: "Du kannst 1 Tag, 7 Tage oder 15 Tage w\u00e4hlen. Danach wird das Bild automatisch gel\u00f6scht.",
  faq4q: "Kann das Bild dauerhaft gespeichert werden?", faq4a: "Nein. Zum Schutz der Privatsph\u00e4re und des Speicherplatzes betr\u00e4gt das Maximum 15 Tage.",
  faq3q: "Wie funktioniert der Passwortschutz?", faq3a: "Vor der Anzeige wird das Passwort verlangt. Gespeichert wird nur ein sicherer Passwort-Hash.",
  imageProtected: "Dieses Bild ist gesch\u00fctzt", enterImagePassword: "Passwort eingeben, um das Bild zu sehen", openImage: "Bild anzeigen",
  imageUnavailable: "Das Bild ist nicht verf\u00fcgbar oder abgelaufen.", expiresLabel: "L\u00e4uft ab am",
  smartQrTools: "Smart QR Tools", wifiQr: "WLAN", vcardQr: "vCard", mapsQr: "Google Maps", menuQr: "Speisekarte",
  paypalQr: "PayPal", ibanQr: "IBAN-Zahlung", smsQr: "SMS", eventQr: "Termin/Kalender", socialQr: "Social Media", barcodeGenerator: "Barcode Generator",
  networkName: "WLAN-Name", wifiPassword: "WLAN-Passwort", encryption: "Verschl\u00fcsselung", hiddenNetwork: "Verstecktes Netzwerk",
  fullName: "Vollst\u00e4ndiger Name", organization: "Unternehmen", address: "Adresse", mapsPlace: "Adresse oder Ort",
  menuUrl: "Link zur Speisekarte", paypalAccount: "PayPal-E-Mail", amount: "Betrag", currency: "W\u00e4hrung",
  recipient: "Empf\u00e4nger", iban: "IBAN", bic: "BIC / SWIFT", paymentReason: "Verwendungszweck", smsMessage: "SMS-Nachricht",
  countryCode: "Land / Vorwahl",
  eventTitle: "Termintitel", eventStart: "Beginn", eventEnd: "Ende", location: "Ort", socialPlatform: "Plattform",
  profileUrl: "Profil-Link", barcodeValue: "Barcode-Wert", barcodeFormat: "Barcode-Format", qrWithLogo: "QR mit Logo",
  phoneFormatHint: "Land ausw\u00e4hlen und die Nummer lokal wie 0172 5766513 oder international mit +49/0049 eingeben. Leerzeichen, Klammern und Bindestriche werden automatisch bereinigt.",
  uploadLogo: "Logo hochladen", logoSize: "Logogr\u00f6\u00dfe", logoWarning: "Ein zu gro\u00dfes Logo kann den QR-Code unlesbar machen. Empfohlen sind 15\u201320 %.",
  printSize: "Druckformat", size3cm: "3\u00d73 cm", size5cm: "5\u00d75 cm", size10cm: "10\u00d710 cm",
  a4Multiple: "A4 \u2014 mehrere QR-Codes", businessCard: "Visitenkarte", tableCard: "Restaurant-Tischkarte", downloadPrintPdf: "PDF herunterladen",
  howToUse: "Wie wird das Tool verwendet?", howToUseCopy: "Daten eingeben, Farben oder Logo anpassen, QR-Code erstellen und vor der Ver\u00f6ffentlichung testen.",
  printingTips: "Drucktipps", printingTipsCopy: "Hohen Kontrast, einen freien Rand und mindestens 3 cm Druckgr\u00f6\u00dfe verwenden.",
  businessExamples: "Beispiele f\u00fcr Unternehmen", businessExamplesCopy: "Speisekarten, Visitenkarten, G\u00e4ste-WLAN, Zahlungen, Standorte und Aktionen.",
  qrFaqQuestion: "Warum funktioniert ein gedruckter QR-Code nicht?", qrFaqAnswer: "H\u00e4ufig wegen schwachem Kontrast, zu kleiner Gr\u00f6\u00dfe, fehlendem Rand oder zu gro\u00dfem Logo.",
  downloadImage: "Bild herunterladen",
  description: "Beschreibung",
});
Object.assign(runtimeTranslations.en, {
  eraserSize: "Eraser size", imageQr: "Image QR", imageQrTitle: "Turn an image into a secure QR code",
  imageQrLead: "Upload an image, create a unique viewing link, and share it as a QR code.",
  imageQrExplanation: "The QR code does not contain the image itself. It contains a link that opens the image page.",
  dropImage: "Drop your image here", chooseImage: "or choose one from your device", imageRules: "JPG, PNG or WebP \u2014 maximum 5 MB",
  optionalTitle: "Image title (optional)", optionalDescription: "Description (optional)", expiry: "Delete image after",
  oneDay: "1 day", sevenDays: "7 days", fifteenDays: "15 days",
  retentionLimitNotice: "Images are deleted automatically after the selected retention period. The maximum is 15 days.",
  protectPassword: "Password protection (optional)",
  createImageQr: "Upload image & create QR", uploadingImage: "Uploading image securely\u2026", imageQrReady: "Your link and QR code are ready",
  copyLink: "Copy link", downloadPdf: "Download PDF", privacyImageNotice: "The image is stored only to power its link and is deleted automatically after expiry. Do not upload highly sensitive images.",
  imageInvalid: "Choose a JPG, PNG or WebP image under 5 MB.", uploadFailed: "Upload failed. Make sure PHP and SQLite are enabled on your hosting.",
  faqTitle: "Frequently asked questions", faq1q: "Is the image stored inside the QR code?", faq1a: "No. The QR code contains only a link to the image page.",
  faq2q: "How long is the image kept?", faq2a: "You can choose 1 day, 7 days, or 15 days. After that, the image is deleted automatically.",
  faq4q: "Can the image be kept forever?", faq4a: "No. To protect privacy and save storage space, the maximum retention period is 15 days.",
  faq3q: "How does password protection work?", faq3a: "The viewer must enter the password before the image is shown. Only a secure password hash is stored.",
  imageProtected: "This image is protected", enterImagePassword: "Enter the password to view the image", openImage: "View image",
  imageUnavailable: "The image is unavailable or has expired.", expiresLabel: "Expires on",
  smartQrTools: "Smart QR Tools", wifiQr: "Wi-Fi", vcardQr: "vCard", mapsQr: "Google Maps", menuQr: "Restaurant Menu",
  paypalQr: "PayPal", ibanQr: "IBAN Payment", smsQr: "SMS", eventQr: "Event/Calendar", socialQr: "Social Media", barcodeGenerator: "Barcode Generator",
  networkName: "Wi-Fi network name", wifiPassword: "Wi-Fi password", encryption: "Security", hiddenNetwork: "Hidden network",
  fullName: "Full name", organization: "Organization", address: "Address", mapsPlace: "Address or place",
  menuUrl: "Menu URL", paypalAccount: "PayPal email", amount: "Amount", currency: "Currency", recipient: "Recipient",
  iban: "IBAN", bic: "BIC / SWIFT", paymentReason: "Payment reason", smsMessage: "SMS message", countryCode: "Country / code", eventTitle: "Event title",
  eventStart: "Start", eventEnd: "End", location: "Location", socialPlatform: "Platform", profileUrl: "Profile URL",
  barcodeValue: "Barcode value", barcodeFormat: "Barcode format", qrWithLogo: "QR with Logo", uploadLogo: "Upload logo",
  phoneFormatHint: "Choose the country, then enter a local number like 0172 5766513 or an international number with +49/0049. Spaces, brackets and dashes are cleaned automatically.",
  logoSize: "Logo size", logoWarning: "A large logo can make the QR code impossible to scan. Keep it around 15\u201320%.",
  printSize: "Print size", size3cm: "3\u00d73 cm", size5cm: "5\u00d75 cm", size10cm: "10\u00d710 cm",
  a4Multiple: "A4 sheet \u2014 multiple QR codes", businessCard: "Business card", tableCard: "Restaurant table card", downloadPrintPdf: "Download PDF",
  howToUse: "How do I use this tool?", howToUseCopy: "Enter the details, customize colors or logo, generate the code, and test it before publishing.",
  printingTips: "Printing tips", printingTipsCopy: "Use strong contrast, keep a white quiet zone, and print QR codes at least 3 cm wide.",
  businessExamples: "Business examples", businessExamplesCopy: "Menus, business cards, guest Wi-Fi, payments, locations, events and promotions.",
  qrFaqQuestion: "Why does a printed QR code fail?", qrFaqAnswer: "Usually because of low contrast, small size, a cropped quiet zone, or an oversized logo.",
  downloadImage: "Download image",
  description: "Description",
});

const t = (key) => runtimeTranslations[appState.lang]?.[key] ?? translations[appState.lang][key] ?? key;
const app = document.querySelector("#app");
if ("scrollRestoration" in history) history.scrollRestoration = "manual";

function getRouteFromLocation() {
  const hashRoute = location.hash.replace(/^#\/?/, "");
  if (hashRoute) return hashRoute.startsWith("view/image/") ? "view-image" : hashRoute;
  const path = location.pathname.replace(/^\/+|\/+$/g, "");
  if (path === "image-qr-code") return "image-qr-code";
  if (path.startsWith("view/image/")) return "view-image";
  return "home";
}

function getViewImageId() {
  const source = location.hash.replace(/^#\/?/, "") || location.pathname.replace(/^\/+/, "");
  const match = source.match(/^view\/image\/([a-f0-9]{32})\/?$/i);
  return match?.[1] || "";
}

function routeLink(route, label, className = "") {
  return `<a href="#/${route}" class="${className}">${label}</a>`;
}

function adSlot(slotKey, label = "Google AdSense", shape = "wide") {
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
          `<span class="brand-mark">${icon("file", 21)}</span><span class="brand-text">PDF & QR Tools</span>`,
          "brand",
        )}
        <nav class="main-nav" id="mainNav">
          ${routeLink("home", t("home"), `nav-link ${active("home")}`)}
          ${routeLink("editor", t("pdfEditor"), `nav-link ${active("editor")}`)}
          ${routeLink("qr", t("qrCreator"), `nav-link ${active("qr")}`)}
          ${routeLink("image-qr-code", t("imageQr"), `nav-link ${active("image-qr-code")}`)}
          ${routeLink("privacy", t("privacy"), `nav-link ${active("privacy")}`)}
          ${routeLink("contact", t("contact"), `nav-link ${active("contact")}`)}
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
              <span>PDF & QR Tools</span>
            </div>
            <p>${t("footerCopy")}</p>
          </div>
          <div>
            <div class="footer-title">${t("footerTools")}</div>
            <div class="footer-links">
              ${routeLink("editor", t("pdfEditor"))}
              ${routeLink("qr", t("qrCreator"))}
              ${routeLink("image-qr-code", t("imageQr"))}
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
          <span>© ${new Date().getFullYear()} PDF & QR Tools. ${t("rights")}</span>
          <span>${icon("shield", 15)} ${t("madePrivate")}</span>
        </div>
      </div>
    </footer>
  `;
}

function homeTemplate() {
  const miniCells = Array.from({ length: 25 }, () => "<span></span>").join("");
  return `
    <main>
      <section class="hero">
        <div class="container hero-grid">
          <div class="hero-copy-area">
            <div class="eyebrow"><span class="eyebrow-dot"></span>${t("safeBadge")}</div>
            <h1>${t("heroTitle1")} <span class="hero-title-accent">${t("heroTitleAccent")}</span> ${t("heroTitle2")}</h1>
            <p class="hero-copy">${t("heroCopy")}</p>
            <div class="hero-actions">
              ${routeLink("editor", `${icon("file", 19)} ${t("editPdfNow")}`, "button primary")}
              ${routeLink("qr", `${icon("qr", 19)} ${t("createQrNow")}`, "button secondary")}
            </div>
            <div class="privacy-note">${icon("shield", 18)}<span>${t("privacyShort")}</span></div>
          </div>
          <div class="hero-visual" aria-hidden="true">
            <div class="visual-orbit"></div>
            <div class="editor-mock">
              <div class="mock-topbar">
                <div class="mock-dots"><span></span><span></span><span></span></div>
                <div class="mock-pill"></div>
              </div>
              <div class="mock-body">
                <div class="mock-tools">
                  <span class="mock-tool active"></span><span class="mock-tool"></span>
                  <span class="mock-tool"></span><span class="mock-tool"></span>
                </div>
                <div class="mock-paper-wrap">
                  <div class="mock-paper">
                    <div class="mock-highlight"></div>
                    <div class="mock-note">${t("mockNote")}</div>
                    <div class="mock-cursor">${icon("cursor", 29, 1.6)}</div>
                  </div>
                </div>
              </div>
            </div>
            <div class="qr-float-card">
              <div class="mini-qr">${miniCells}</div>
              <div><strong>${t("qrReady")}</strong><small>${t("instantDownload")}</small></div>
            </div>
          </div>
        </div>
      </section>
      <section class="trust-strip">
        <div class="container trust-grid">
          ${trustItem("shield", t("browserOnly"), t("browserOnlySub"))}
          ${trustItem("globe", t("multilingual"), t("multilingualSub"))}
          ${trustItem("user", t("noAccount"), t("noAccountSub"))}
        </div>
      </section>
      <div class="container">${adSlot("homeTop", "مساحة إعلانية", "wide")}</div>
      <section class="section alt">
        <div class="container">
          ${sectionHeading("toolsKicker", "toolsTitle", "toolsCopy")}
          <div class="tool-cards">
            <a class="tool-card green" href="#/editor">
              <div class="card-art">${icon("file", 52, 1.5)}</div>
              <h3>${t("pdfCardTitle")}</h3>
              <p>${t("pdfCardCopy")}</p>
              <span class="card-link">${t("openEditor")} ${icon("arrowRight", 17)}</span>
            </a>
            <a class="tool-card" href="#/qr">
              <div class="card-art">${icon("qr", 54, 1.5)}</div>
              <h3>${t("qrCardTitle")}</h3>
              <p>${t("qrCardCopy")}</p>
              <span class="card-link">${t("openQr")} ${icon("arrowRight", 17)}</span>
            </a>
          </div>
        </div>
      </section>
      <section class="section">
        <div class="container">
          ${sectionHeading("howKicker", "howTitle")}
          <div class="steps">
            ${stepCard(1, "step1Title", "step1Copy")}
            ${stepCard(2, "step2Title", "step2Copy")}
            ${stepCard(3, "step3Title", "step3Copy")}
          </div>
        </div>
      </section>
      <div class="container">${adSlot("homeMiddle", "مساحة إعلانية", "wide")}</div>
      <section class="section alt">
        <div class="container">
          ${sectionHeading("futureKicker", "futureTitle")}
          <div class="future-tools">
            ${futurePill("mergePdf")}${futurePill("splitPdf")}${futurePill("addBlankPage")}${futurePill("deletePage")}
          </div>
        </div>
      </section>
      <section class="section">
        <div class="container">
          <div class="cta-banner">
            <div><h2>${t("ctaTitle")}</h2><p>${t("ctaCopy")}</p></div>
            <div class="hero-actions">
              ${routeLink("editor", `${icon("file", 18)} ${t("editPdfNow")}`, "button primary")}
              ${routeLink("qr", `${icon("qr", 18)} ${t("createQrNow")}`, "button secondary")}
            </div>
          </div>
        </div>
      </section>
    </main>
  `;
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

function qrTemplate() {
  const tool = smartQrTools().find((item) => item.type === appState.qrType) || smartQrTools()[0];
  const isBarcode = appState.qrType === "barcode";
  return `
    <main class="page-main smart-qr-page">
      <div class="page-intro container">
        <div class="eyebrow"><span class="eyebrow-dot"></span>${t("smartQrTools")}</div>
        <h1>${t("qrTitle")}</h1>
        <p>${t("qrCopy")}</p>
      </div>
      <div class="container">${adSlot("qrTop", "Google AdSense", "wide")}</div>
      <div class="container qr-layout">
        <section class="qr-form-card">
          <div class="smart-tools-grid">
            ${smartQrTools().map((item) => qrTab(item.type, item.icon, item.label)).join("")}
          </div>
          <form id="qrForm">
            <div class="smart-tool-heading">${icon(tool.icon, 22)}<h2>${t(tool.label)}</h2></div>
            <div class="smart-form-grid">${qrFieldsTemplate()}</div>
            <div class="color-grid" ${isBarcode ? "hidden" : ""}>
              <div class="color-card"><input type="color" id="qrForeground" value="#153232"><div><span>${t("foreground")}</span><strong id="qrForegroundValue">#153232</strong></div></div>
              <div class="color-card"><input type="color" id="qrBackground" value="#ffffff"><div><span>${t("background")}</span><strong id="qrBackgroundValue">#ffffff</strong></div></div>
            </div>
            <section class="logo-controls" ${isBarcode ? "hidden" : ""}>
              <div class="logo-control-head"><strong>${t("qrWithLogo")}</strong><small>PNG / JPG / SVG</small></div>
              <div class="logo-control-row">
                <label class="button soft small" for="qrLogoInput">${icon("image", 16)} ${t("uploadLogo")}</label>
                <input id="qrLogoInput" type="file" accept="image/png,image/jpeg,image/svg+xml" hidden>
                <span id="qrLogoName"></span>
              </div>
              <label class="range-label" for="qrLogoSize">${t("logoSize")} <span id="qrLogoSizeValue">${appState.qrLogoSize}%</span></label>
              <input id="qrLogoSize" type="range" min="10" max="28" value="${appState.qrLogoSize}">
              <p class="logo-warning">${icon("info", 15)} ${t("logoWarning")}</p>
            </section>
            <div class="qr-form-actions">
              <button class="button primary" type="submit">${icon(isBarcode ? "barcode" : "qr", 18)} ${isBarcode ? t("barcodeGenerator") : t("generateQr")}</button>
              <button class="button secondary" type="button" id="resetQr">${t("reset")}</button>
            </div>
          </form>
        </section>
        <aside class="qr-preview-card">
          <h2 class="qr-preview-title">${t("livePreview")}</h2>
          <div class="qr-canvas-wrap" id="qrCanvasWrap">
            <div class="qr-placeholder" id="qrPlaceholder">${icon(isBarcode ? "barcode" : "qr", 43, 1.4)}<small>${t("previewEmpty")}</small></div>
            <canvas id="qrCanvas" hidden></canvas>
            <svg id="barcodeSvg" class="barcode-preview" hidden></svg>
          </div>
          <div class="qr-result-meta" id="qrResultMeta" hidden>
            <span>${icon("check", 15)} ${t("scanReady")}</span>
            <small>${t("encodedContent")}</small>
            <code id="qrResultValue"></code>
          </div>
          <div class="print-preset">
            <label for="qrPrintPreset">${t("printSize")}</label>
            <select id="qrPrintPreset">
              <option value="3cm" ${appState.qrPrintPreset === "3cm" ? "selected" : ""}>${t("size3cm")}</option>
              <option value="5cm" ${appState.qrPrintPreset === "5cm" ? "selected" : ""}>${t("size5cm")}</option>
              <option value="10cm" ${appState.qrPrintPreset === "10cm" ? "selected" : ""}>${t("size10cm")}</option>
              <option value="a4" ${appState.qrPrintPreset === "a4" ? "selected" : ""}>${t("a4Multiple")}</option>
              <option value="business" ${appState.qrPrintPreset === "business" ? "selected" : ""}>${t("businessCard")}</option>
              <option value="table" ${appState.qrPrintPreset === "table" ? "selected" : ""}>${t("tableCard")}</option>
            </select>
          </div>
          <div class="download-row three">
            <button class="button secondary small" id="downloadPng" disabled>${icon("download", 16)} PNG</button>
            <button class="button secondary small" id="downloadSvg" disabled>${icon("download", 16)} SVG</button>
            <button class="button secondary small" id="downloadQrPdf" disabled>${icon("download", 16)} PDF</button>
          </div>
          <div class="qr-tip">${icon("info", 16)}<span>${t("qrTip")}</span></div>
          ${adSlot("qrSide", "Google AdSense", "box")}
        </aside>
      </div>
      ${qrHelpTemplate()}
    </main>
  `;
}

function qrTab(type, iconName, labelKey) {
  return `<button type="button" class="qr-tab ${appState.qrType === type ? "active" : ""}" data-qr-type="${type}">${icon(iconName, 17)} ${t(labelKey)}</button>`;
}

function smartQrTools() {
  return [
    ["url", "link", "url"], ["wifi", "wifi", "wifiQr"], ["vcard", "user", "vcardQr"], ["maps", "mapPin", "mapsQr"],
    ["menu", "menuBook", "menuQr"], ["paypal", "wallet", "paypalQr"], ["iban", "bank", "ibanQr"], ["sms", "message", "smsQr"],
    ["event", "calendar", "eventQr"], ["social", "share", "socialQr"], ["whatsapp", "whatsapp", "whatsapp"],
    ["phone", "phone", "phone"], ["email", "mail", "email"], ["text", "type", "plainText"], ["barcode", "barcode", "barcodeGenerator"],
  ].map(([type, icon, label]) => ({ type, icon, label }));
}

function qrField(name, label, type = "text", options = {}) {
  return `<div class="field ${options.full ? "full" : ""}"><label for="qr-${name}">${label}</label><input class="qr-main-input" id="qr-${name}" name="${name}" type="${type}" ${options.required === false ? "" : "required"} ${options.placeholder ? `placeholder="${escapeHtml(options.placeholder)}"` : ""} ${options.extra || ""}></div>`;
}

function qrTextarea(name, label, required = true) {
  return `<div class="field full"><label for="qr-${name}">${label}</label><textarea class="qr-main-input" id="qr-${name}" name="${name}" ${required ? "required" : ""}></textarea></div>`;
}

function qrSelect(name, label, options) {
  return `<div class="field"><label for="qr-${name}">${label}</label><select class="qr-main-input" id="qr-${name}" name="${name}">${options.map(([value, text]) => `<option value="${value}">${text}</option>`).join("")}</select></div>`;
}

function countryCodeOptions() {
  return [
    ["49", "🇩🇪 Deutschland +49"],
    ["963", "🇸🇾 سوريا +963"],
    ["90", "🇹🇷 Türkiye +90"],
    ["43", "🇦🇹 Österreich +43"],
    ["41", "🇨🇭 Schweiz +41"],
    ["31", "🇳🇱 Nederland +31"],
    ["32", "🇧🇪 België +32"],
    ["33", "🇫🇷 France +33"],
    ["39", "🇮🇹 Italia +39"],
    ["34", "🇪🇸 España +34"],
    ["44", "🇬🇧 United Kingdom +44"],
    ["1", "🇺🇸 USA / Canada +1"],
    ["971", "🇦🇪 الإمارات +971"],
    ["966", "🇸🇦 السعودية +966"],
    ["964", "🇮🇶 العراق +964"],
    ["961", "🇱🇧 لبنان +961"],
    ["962", "🇯🇴 الأردن +962"],
    ["20", "🇪🇬 مصر +20"],
  ];
}

function phoneInputGroup(label, options = {}) {
  return `${qrSelect("countryCode", t("countryCode"), countryCodeOptions())}${qrField("phone", label, "tel", options)}`;
}

function qrFieldsTemplate() {
  switch (appState.qrType) {
    case "wifi": return `${qrField("ssid", t("networkName"))}${qrField("password", t("wifiPassword"), "text", { required: false })}${qrSelect("encryption", t("encryption"), [["WPA", "WPA/WPA2"], ["WEP", "WEP"], ["nopass", "Open"]])}<label class="check-field"><input name="hidden" type="checkbox"> ${t("hiddenNetwork")}</label>`;
    case "vcard": return `${qrField("name", t("fullName"))}${qrField("organization", t("organization"), "text", { required: false })}${phoneInputGroup(t("phone"))}${qrField("email", t("email"), "email", { required: false })}${qrField("url", t("url"), "url", { required: false })}${qrField("address", t("address"), "text", { required: false, full: true })}<div class="field-help full">${icon("info", 14)} ${t("phoneFormatHint")}</div>`;
    case "maps": return qrField("place", t("mapsPlace"), "text", { full: true });
    case "menu": return qrField("url", t("menuUrl"), "url", { full: true });
    case "paypal": return `${qrField("email", t("paypalAccount"), "email")}${qrField("amount", t("amount"), "number", { required: false, extra: 'min="0" step="0.01"' })}${qrSelect("currency", t("currency"), [["EUR", "EUR"], ["USD", "USD"], ["GBP", "GBP"]])}`;
    case "iban": return `${qrField("recipient", t("recipient"))}${qrField("iban", t("iban"))}${qrField("bic", t("bic"), "text", { required: false })}${qrField("amount", t("amount"), "number", { extra: 'min="0.01" step="0.01"' })}${qrField("reason", t("paymentReason"), "text", { required: false, full: true })}`;
    case "sms": return `${phoneInputGroup(t("enterPhone"))}${qrTextarea("message", t("smsMessage"))}<div class="field-help full">${icon("info", 14)} ${t("phoneFormatHint")}</div>`;
    case "event": return `${qrField("title", t("eventTitle"))}${qrField("start", t("eventStart"), "datetime-local")}${qrField("end", t("eventEnd"), "datetime-local")}${qrField("location", t("location"), "text", { required: false })}${qrTextarea("description", t("description"), false)}`;
    case "social": return `${qrSelect("platform", t("socialPlatform"), [["instagram", "Instagram"], ["facebook", "Facebook"], ["tiktok", "TikTok"], ["linkedin", "LinkedIn"], ["youtube", "YouTube"], ["x", "X / Twitter"]])}${qrField("url", t("profileUrl"), "url")}`;
    case "whatsapp": return `${phoneInputGroup(t("enterWhatsapp"))}${qrTextarea("message", t("whatsappMessage"), false)}<div class="field-help full">${icon("info", 14)} ${t("phoneFormatHint")}</div>`;
    case "phone": return `${phoneInputGroup(t("enterPhone"))}<div class="field-help full">${icon("info", 14)} ${t("phoneFormatHint")}</div>`;
    case "email": return qrField("email", t("enterEmail"), "email", { full: true });
    case "text": return qrTextarea("text", t("enterText"));
    case "barcode": return `${qrSelect("format", t("barcodeFormat"), [["CODE128", "Code128"], ["EAN13", "EAN-13"], ["EAN8", "EAN-8"], ["UPC", "UPC-A"]])}${qrField("value", t("barcodeValue"))}`;
    default: return `${qrField("url", t("enterUrl"), "text", { full: true, placeholder: t("urlPlaceholder") })}<div class="field-help full">${icon("sparkle", 14)} ${t("smartUrlHint")}</div>`;
  }
}

function qrHelpTemplate() {
  return `<section class="container qr-help-grid">
    <article>${icon("sparkle", 22)}<h3>${t("howToUse")}</h3><p>${t("howToUseCopy")}</p></article>
    <article>${icon("file", 22)}<h3>${t("printingTips")}</h3><p>${t("printingTipsCopy")}</p></article>
    <article>${icon("user", 22)}<h3>${t("businessExamples")}</h3><p>${t("businessExamplesCopy")}</p></article>
    <details><summary>${t("qrFaqQuestion")}</summary><p>${t("qrFaqAnswer")}</p></details>
  </section>`;
}

function imageQrTemplate() {
  return `
    <main class="page-main image-qr-page">
      <div class="page-intro container">
        <div class="eyebrow"><span class="eyebrow-dot"></span>${t("imageQr")}</div>
        <h1>${t("imageQrTitle")}</h1>
        <p>${t("imageQrLead")}</p>
      </div>
      <div class="container image-qr-layout">
        <section class="qr-form-card">
          <div class="image-qr-explanation">${icon("info", 20)}<span>${t("imageQrExplanation")}</span></div>
          <form id="imageQrForm">
            <input id="imageQrInput" type="file" accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp" hidden>
            <button class="image-drop-zone" id="imageDropZone" type="button">
              <span class="image-drop-icon">${icon("image", 34)}</span>
              <strong>${t("dropImage")}</strong>
              <span>${t("chooseImage")}</span>
              <small>${t("imageRules")}</small>
              <img id="imageUploadPreview" alt="" hidden>
            </button>
            <div class="selected-image-row" id="selectedImageRow" hidden>
              <span id="selectedImageName"></span><small id="selectedImageSize"></small>
            </div>
            <div class="image-meta-grid">
              <div class="field"><label for="imageTitle">${t("optionalTitle")}</label><input id="imageTitle" maxlength="120" type="text"></div>
              <div class="field"><label for="imageDescription">${t("optionalDescription")}</label><textarea id="imageDescription" maxlength="1000"></textarea></div>
              <div class="field"><label for="imageExpiry">${t("expiry")}</label>
                <select id="imageExpiry"><option value="1">${t("oneDay")}</option><option value="7" selected>${t("sevenDays")}</option><option value="15">${t("fifteenDays")}</option></select>
              </div>
              <div class="field"><label for="imagePassword">${t("protectPassword")}</label><input id="imagePassword" type="password" minlength="6" autocomplete="new-password"></div>
            </div>
            <div class="privacy-image-notice retention-notice">${icon("clock", 19)}<span>${t("retentionLimitNotice")}</span></div>
            <div class="privacy-image-notice">${icon("shield", 19)}<span>${t("privacyImageNotice")}</span></div>
            <button class="button primary image-submit" id="createImageQrButton" type="submit">${icon("upload", 18)} ${t("createImageQr")}</button>
          </form>
        </section>
        <aside class="qr-preview-card image-qr-result">
          <h2 class="qr-preview-title">${t("livePreview")}</h2>
          <div class="qr-canvas-wrap">
            <div class="qr-placeholder" id="imageQrPlaceholder">${icon("image", 43, 1.4)}<small>${t("previewEmpty")}</small></div>
            <canvas id="imageQrCanvas" hidden></canvas>
          </div>
          <div class="qr-result-meta" id="imageQrResultMeta" hidden>
            <span>${icon("check", 15)} ${t("imageQrReady")}</span>
            <code id="imageQrResultUrl"></code>
          </div>
          <div class="image-link-actions">
            <button class="button soft small" id="copyImageQrLink" disabled>${icon("link", 16)} ${t("copyLink")}</button>
          </div>
          <div class="download-row image-download-row">
            <button class="button secondary small" id="downloadImageQrPng" disabled>${icon("download", 16)} PNG</button>
            <button class="button secondary small" id="downloadImageQrSvg" disabled>${icon("download", 16)} SVG</button>
            <button class="button secondary small" id="downloadImageQrPdf" disabled>${icon("download", 16)} PDF</button>
          </div>
        </aside>
      </div>
      <section class="container image-faq">
        <h2>${t("faqTitle")}</h2>
        ${[
          ["faq1q", "faq1a"],
          ["faq2q", "faq2a"],
          ["faq3q", "faq3a"],
          ["faq4q", "faq4a"],
        ].map(([question, answer], index) => `<details ${index === 0 ? "open" : ""}><summary>${t(question)}</summary><p>${t(answer)}</p></details>`).join("")}
      </section>
    </main>
  `;
}

function viewImageTemplate() {
  return `
    <main class="page-main view-image-page">
      <div class="view-image-shell container" id="viewImageShell">
        <div class="view-image-loading"><span class="spinner"></span><p>${t("loadingPdf")}</p></div>
      </div>
    </main>
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
  return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[char]);
}

async function renderApp() {
  document.body.classList.remove("editor-focus-mode");
  document.body.classList.toggle("editor-loaded-mode", appState.route === "editor" && Boolean(editorState.pdf));
  document.documentElement.lang = appState.lang;
  document.documentElement.dir = appState.lang === "ar" ? "rtl" : "ltr";
  document.title = `PDF & QR Tools — ${t(
    appState.route === "editor"
      ? "pdfEditor"
      : appState.route === "qr"
        ? "qrCreator"
        : appState.route === "image-qr-code" || appState.route === "view-image"
          ? "imageQr"
          : "home",
  )}`;
  updatePageMeta();

  const routes = {
    home: homeTemplate,
    editor: editorTemplate,
    qr: qrTemplate,
    "image-qr-code": imageQrTemplate,
    "view-image": viewImageTemplate,
    privacy: privacyTemplate,
    contact: contactTemplate,
  };
  const page = routes[appState.route] || routes.home;
  app.innerHTML = `<div class="app-shell">${headerTemplate()}${page()}${footerTemplate()}<div class="toast" id="toast"></div></div>`;
  bindGlobalEvents();
  initAdsenseSlots();

  if (appState.route === "editor") {
    bindEditorEvents();
    if (editorState.pdf) {
      await renderEditorDocument();
    }
  }
  if (appState.route === "qr") bindSmartQrEvents();
  if (appState.route === "image-qr-code") bindImageQrEvents();
  if (appState.route === "view-image") loadViewImage();
  if (appState.route === "contact") bindContactEvents();
  scrollToTopImmediate();
  setTimeout(scrollToTopImmediate, 0);
}

function updatePageMeta() {
  const content = {
    ar: {
      home: ["PDF & QR Tools — أدوات PDF وQR مجانية", "تعديل PDF وإنشاء QR وBarcode باحتراف، مع دعم العربية والخصوصية."],
      editor: ["محرر PDF احترافي أونلاين", "أضف نصوصًا ورسومات ونظّم صفحات PDF مباشرة داخل متصفحك."],
      qr: ["Smart QR Tools — إنشاء QR وBarcode", "أنشئ Wi-Fi وvCard وMaps والدفع والمناسبات وBarcode مع Logo ومقاسات طباعة."],
      "image-qr-code": ["Image QR Code Generator", "ارفع صورة وأنشئ رابطًا آمنًا وQR Code مع حماية وتنزيل."],
      privacy: ["سياسة الخصوصية — PDF & QR Tools", "تعرف على طريقة معالجة ملفاتك وحماية بياناتك."],
      contact: ["تواصل معنا — PDF & QR Tools", "أرسل اقتراحاتك وأسئلتك حول أدوات PDF وQR."],
    },
    de: {
      home: ["PDF & QR Tools — Kostenlose PDF- und QR-Werkzeuge", "PDF bearbeiten sowie QR-Codes und Barcodes direkt im Browser erstellen."],
      editor: ["Professioneller PDF-Editor online", "Text, Zeichnungen und Seiten direkt im Browser bearbeiten."],
      qr: ["Smart QR Tools — QR-Code und Barcode erstellen", "WLAN, vCard, Maps, Zahlungen, Termine und Barcodes mit Logo und Druckformaten."],
      "image-qr-code": ["Bild-QR-Code Generator", "Bild hochladen, sicheren Link und QR-Code mit Schutz und Download erstellen."],
      privacy: ["Datenschutz — PDF & QR Tools", "Informationen zur lokalen Verarbeitung und zum Schutz Ihrer Daten."],
      contact: ["Kontakt — PDF & QR Tools", "Fragen und Vorschläge zu unseren PDF- und QR-Werkzeugen."],
    },
    en: {
      home: ["PDF & QR Tools — Free PDF and QR tools", "Edit PDF files and create QR codes and barcodes securely in your browser."],
      editor: ["Professional online PDF editor", "Add text, drawings and organize PDF pages directly in your browser."],
      qr: ["Smart QR Tools — QR and Barcode Generator", "Create Wi-Fi, vCard, Maps, payment, event and barcode codes with logos and print sizes."],
      "image-qr-code": ["Image QR Code Generator", "Upload an image and create a secure viewing link and downloadable QR code."],
      privacy: ["Privacy Policy — PDF & QR Tools", "Learn how files and data are processed and protected."],
      contact: ["Contact — PDF & QR Tools", "Send questions and suggestions about our PDF and QR tools."],
    },
  };
  const [title, description] = content[appState.lang]?.[appState.route] || content[appState.lang]?.home || content.en.home;
  document.title = title;
  const descriptionMeta = document.querySelector('meta[name="description"]');
  const ogTitle = document.querySelector('meta[property="og:title"]');
  const ogDescription = document.querySelector('meta[property="og:description"]');
  const twitterTitle = document.querySelector('meta[name="twitter:title"]');
  const twitterDescription = document.querySelector('meta[name="twitter:description"]');
  let canonical = document.querySelector('link[rel="canonical"]');
  const routePath = appState.route === "home" ? "/" : appState.route === "view-image" && appState.viewImageId ? `/view/image/${appState.viewImageId}` : `/${appState.route}`;
  const canonicalUrl = `${location.origin}${routePath}`;
  descriptionMeta?.setAttribute("content", description);
  ogTitle?.setAttribute("content", title);
  ogDescription?.setAttribute("content", description);
  twitterTitle?.setAttribute("content", title);
  twitterDescription?.setAttribute("content", description);
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.rel = "canonical";
    document.head.appendChild(canonical);
  }
  canonical?.setAttribute("href", canonicalUrl);
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
      localStorage.setItem("pdfqr-lang", appState.lang);
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
        setActiveTool("select", false);
        addText();
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
    await loadPdfBytes(bytes, "PDF-QR-Tools-Sample.pdf");
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
  const object = new IText(t("text"), {
    left: Math.max(10, x),
    top: Math.max(10, y),
    fontFamily: editorState.text.family,
    fontSize: editorState.text.size,
    fill: editorState.text.color,
    textAlign: editorState.text.align,
    padding: 6,
    cornerColor: "#0d7c73",
    borderColor: "#0d7c73",
    cornerStyle: "circle",
    transparentCorners: false,
  });
  canvas.add(object);
  canvas.setActiveObject(object);
  object.enterEditing();
  object.selectAll();
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
  return editorState.canvas ? JSON.stringify(editorState.canvas.toJSON(["replacementMaskId"])) : JSON.stringify({ version: "6", objects: [] });
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
  const pdfDoc = await PDFDocument.load(editorState.originalBytes.slice());
  for (const [pageNumber, state] of editorState.pageStates.entries()) {
    const parsed = JSON.parse(state.json);
    if (!parsed.objects?.length) continue;
    const temp = new StaticCanvas(null, {
      width: state.width,
      height: state.height,
      backgroundColor: "rgba(0,0,0,0)",
    });
    await temp.loadFromJSON(state.json);
    temp.requestRenderAll();
    const dataUrl = temp.toDataURL({ format: "png", multiplier: 2 });
    temp.dispose();
    const image = await pdfDoc.embedPng(dataUrl);
    const page = pdfDoc.getPage(pageNumber - 1);
    const { width, height } = page.getSize();
    page.drawImage(image, { x: 0, y: 0, width, height });
  }
  return new Uint8Array(await pdfDoc.save());
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

function bindQrEvents() {
  document.querySelectorAll("[data-qr-type]").forEach((button) =>
    button.addEventListener("click", () => {
      appState.qrType = button.dataset.qrType;
      appState.qrSvg = "";
      renderApp();
    }),
  );
  document.querySelector("#qrForm")?.addEventListener("submit", (event) => {
    event.preventDefault();
    generateQr();
  });
  document.querySelector("#resetQr")?.addEventListener("click", () => {
    const input = document.querySelector("#qrInput");
    if (input) input.value = "";
    const whatsappPhone = document.querySelector("#qrWhatsappPhone");
    const whatsappMessage = document.querySelector("#qrWhatsappMessage");
    if (whatsappPhone) whatsappPhone.value = "";
    if (whatsappMessage) whatsappMessage.value = "";
    setValue("#qrForeground", "#153232");
    setValue("#qrBackground", "#ffffff");
    setText("#qrForegroundValue", "#153232");
    setText("#qrBackgroundValue", "#ffffff");
    document.querySelector("#qrCanvas")?.setAttribute("hidden", "");
    document.querySelector("#qrPlaceholder")?.removeAttribute("hidden");
    document.querySelector("#downloadPng").disabled = true;
    document.querySelector("#downloadSvg").disabled = true;
    document.querySelector("#qrResultMeta")?.setAttribute("hidden", "");
    appState.qrSvg = "";
  });
  ["qrForeground", "qrBackground"].forEach((id) => {
    document.querySelector(`#${id}`)?.addEventListener("input", (event) => setText(`#${id}Value`, event.target.value));
  });
  document.querySelector("#downloadPng")?.addEventListener("click", downloadQrPng);
  document.querySelector("#downloadSvg")?.addEventListener("click", downloadQrSvg);
}

async function generateQr() {
  const input = document.querySelector("#qrInput");
  const whatsappPhone = document.querySelector("#qrWhatsappPhone");
  const whatsappMessage = document.querySelector("#qrWhatsappMessage");
  const value = appState.qrType === "whatsapp" ? whatsappPhone?.value.trim() : input?.value.trim();
  if (!value || !isValidQrInput(value)) {
    showToast(t("invalidQr"), true);
    (appState.qrType === "whatsapp" ? whatsappPhone : input)?.focus();
    return;
  }
  const content = buildQrContent(value, whatsappMessage?.value.trim() || "");
  const color = document.querySelector("#qrForeground")?.value || "#153232";
  const background = document.querySelector("#qrBackground")?.value || "#ffffff";
  const canvas = document.querySelector("#qrCanvas");
  try {
    await QRCode.toCanvas(canvas, content, {
      width: 760,
      margin: 3,
      errorCorrectionLevel: "H",
      color: { dark: color, light: background },
    });
    appState.qrSvg = await QRCode.toString(content, {
      type: "svg",
      margin: 3,
      errorCorrectionLevel: "H",
      color: { dark: color, light: background },
    });
    canvas.hidden = false;
    document.querySelector("#qrPlaceholder").hidden = true;
    document.querySelector("#downloadPng").disabled = false;
    document.querySelector("#downloadSvg").disabled = false;
    document.querySelector("#qrResultMeta")?.removeAttribute("hidden");
    setText("#qrResultValue", content.length > 90 ? `${content.slice(0, 87)}…` : content);
    showToast(t("qrGenerated"));
  } catch (error) {
    console.error(error);
    showToast(t("invalidQr"), true);
  }
}

function buildQrContent(value, whatsappMessage = "") {
  if (appState.qrType === "url") return normalizeSmartUrl(value);
  if (appState.qrType === "phone") return `tel:${normalizePhoneForTel(value)}`;
  if (appState.qrType === "email") return `mailto:${value}`;
  if (appState.qrType === "whatsapp") {
    const digits = normalizePhoneForWhatsapp(value);
    return `https://wa.me/${digits}${whatsappMessage ? `?text=${encodeURIComponent(whatsappMessage)}` : ""}`;
  }
  return value;
}

function normalizePhoneDigits(value = "") {
  return String(value).replace(/\D/g, "");
}

function normalizePhoneForWhatsapp(value = "", countryCode = "49") {
  const digits = normalizePhoneDigits(value);
  const selectedCode = normalizePhoneDigits(countryCode) || "49";
  if (digits.startsWith("00")) return digits.slice(2);
  if (String(value).trim().startsWith("+")) return digits;
  if (digits.startsWith(selectedCode)) return digits;
  return `${selectedCode}${digits.replace(/^0+/, "")}`;
}

function normalizePhoneForTel(value = "", countryCode = "49") {
  const trimmed = String(value).trim();
  const normalized = normalizePhoneForWhatsapp(trimmed, countryCode);
  if (!normalized) return "";
  return `+${normalized}`;
}

function normalizeSmartUrl(value) {
  const trimmed = value.trim();
  const candidate = /^[a-z][a-z\d+.-]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  return new URL(candidate).href;
}

function isValidQrInput(value) {
  if (appState.qrType === "url") {
    try {
      const parsed = new URL(normalizeSmartUrl(value));
      return ["http:", "https:"].includes(parsed.protocol);
    } catch {
      return false;
    }
  }
  if (appState.qrType === "email") return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  if (appState.qrType === "phone") return /^[+\d][\d\s().-]{5,}$/.test(value);
  if (appState.qrType === "whatsapp") return normalizePhoneForWhatsapp(value).length >= 7;
  return value.length > 0;
}

function downloadQrPng() {
  const canvas = document.querySelector("#qrCanvas");
  if (!canvas || canvas.hidden) return;
  canvas.toBlob((blob) => {
    if (!blob) return;
    downloadBlob(blob, "qr-code.png");
    showToast(t("qrDownloaded"));
  }, "image/png");
}

function downloadQrSvg() {
  if (!appState.qrSvg) return;
  downloadBlob(new Blob([appState.qrSvg], { type: "image/svg+xml;charset=utf-8" }), "qr-code.svg");
  showToast(t("qrDownloaded"));
}

function bindSmartQrEvents() {
  document.querySelectorAll("[data-qr-type]").forEach((button) => button.addEventListener("click", () => {
    appState.qrType = button.dataset.qrType;
    appState.qrSvg = "";
    appState.barcodeSvg = "";
    renderApp();
  }));
  document.querySelector("#qrForm")?.addEventListener("submit", generateSmartQr);
  document.querySelector("#resetQr")?.addEventListener("click", () => {
    document.querySelector("#qrForm")?.reset();
    document.querySelector("#qrCanvas")?.setAttribute("hidden", "");
    document.querySelector("#barcodeSvg")?.setAttribute("hidden", "");
    document.querySelector("#qrPlaceholder")?.removeAttribute("hidden");
    document.querySelector("#qrResultMeta")?.setAttribute("hidden", "");
    setQrDownloadState(false);
    appState.qrSvg = "";
    appState.barcodeSvg = "";
    appState.qrLogoDataUrl = "";
    setText("#qrLogoName", "");
  });
  ["qrForeground", "qrBackground"].forEach((id) => document.querySelector(`#${id}`)?.addEventListener("input", (event) => setText(`#${id}Value`, event.target.value)));
  document.querySelector("#qrLogoInput")?.addEventListener("change", handleQrLogo);
  document.querySelector("#qrLogoSize")?.addEventListener("input", (event) => {
    appState.qrLogoSize = Number(event.target.value);
    setText("#qrLogoSizeValue", `${appState.qrLogoSize}%`);
    regenerateSmartQrIfReady();
  });
  document.querySelector("#qrPrintPreset")?.addEventListener("change", (event) => {
    appState.qrPrintPreset = event.target.value;
  });
  document.querySelector("#downloadPng")?.addEventListener("click", downloadSmartPng);
  document.querySelector("#downloadSvg")?.addEventListener("click", downloadSmartSvg);
  document.querySelector("#downloadQrPdf")?.addEventListener("click", downloadSmartPdf);
}

async function generateSmartQr(event) {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.reportValidity()) return;
  const values = Object.fromEntries(new FormData(form).entries());
  values.hidden = Boolean(form.querySelector('[name="hidden"]')?.checked);
  if (!validateSmartQr(values)) {
    showToast(t("invalidQr"), true);
    return;
  }
  if (appState.qrType === "barcode") {
    generateBarcode(values);
    return;
  }
  const content = buildSmartQrContent(values);
  const canvas = document.querySelector("#qrCanvas");
  const options = {
    width: 760,
    margin: 3,
    errorCorrectionLevel: "H",
    color: {
      dark: document.querySelector("#qrForeground")?.value || "#153232",
      light: document.querySelector("#qrBackground")?.value || "#ffffff",
    },
  };
  try {
    await QRCode.toCanvas(canvas, content, options);
    let svg = await QRCode.toString(content, { ...options, type: "svg" });
    if (appState.qrLogoDataUrl) {
      await drawLogoOnCanvas(canvas);
      svg = addLogoToQrSvg(svg, appState.qrLogoDataUrl, appState.qrLogoSize);
    }
    appState.qrSvg = svg;
    appState.generatedKind = "qr";
    canvas.hidden = false;
    document.querySelector("#barcodeSvg")?.setAttribute("hidden", "");
    document.querySelector("#qrPlaceholder").hidden = true;
    document.querySelector("#qrResultMeta")?.removeAttribute("hidden");
    setText("#qrResultValue", content.length > 90 ? `${content.slice(0, 87)}…` : content);
    setQrDownloadState(true);
    showToast(t("qrGenerated"));
  } catch (error) {
    console.error(error);
    showToast(t("invalidQr"), true);
  }
}

function buildSmartQrContent(values) {
  const wifiEscape = (value = "") => String(value).replace(/([\\;,":])/g, "\\$1");
  switch (appState.qrType) {
    case "url": return normalizeSmartUrl(values.url);
    case "phone": return `tel:${normalizePhoneForTel(values.phone, values.countryCode)}`;
    case "email": return `mailto:${values.email}`;
    case "text": return values.text;
    case "whatsapp": return `https://wa.me/${normalizePhoneForWhatsapp(values.phone, values.countryCode)}${values.message ? `?text=${encodeURIComponent(values.message)}` : ""}`;
    case "wifi": return `WIFI:T:${values.encryption};S:${wifiEscape(values.ssid)};P:${wifiEscape(values.password)};H:${values.hidden ? "true" : "false"};;`;
    case "vcard": return `BEGIN:VCARD\nVERSION:3.0\nFN:${values.name}\nORG:${values.organization || ""}\nTEL:${normalizePhoneForTel(values.phone, values.countryCode)}\nEMAIL:${values.email || ""}\nURL:${values.url || ""}\nADR:;;${values.address || ""};;;;\nEND:VCARD`;
    case "maps": return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(values.place)}`;
    case "menu": return normalizeSmartUrl(values.url);
    case "paypal": return `https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=${encodeURIComponent(values.email)}&currency_code=${values.currency}${values.amount ? `&amount=${encodeURIComponent(values.amount)}` : ""}`;
    case "iban": return `BCD\n002\n1\nSCT\n${values.bic || ""}\n${values.recipient}\n${values.iban.replace(/\s/g, "").toUpperCase()}\nEUR${Number(values.amount).toFixed(2)}\n\n\n${values.reason || ""}`;
    case "sms": return `SMSTO:${normalizePhoneForTel(values.phone, values.countryCode)}:${values.message}`;
    case "event": return `BEGIN:VEVENT\nSUMMARY:${values.title}\nDTSTART:${toCalendarDate(values.start)}\nDTEND:${toCalendarDate(values.end)}\nLOCATION:${values.location || ""}\nDESCRIPTION:${values.description || ""}\nEND:VEVENT`;
    case "social": return normalizeSmartUrl(values.url);
    default: return values.url || values.text || "";
  }
}

function validateSmartQr(values) {
  if (["url", "menu", "social"].includes(appState.qrType)) {
    try { return ["http:", "https:"].includes(new URL(normalizeSmartUrl(values.url)).protocol); } catch { return false; }
  }
  if (["email", "paypal"].includes(appState.qrType)) return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email);
  if (["phone", "whatsapp", "sms"].includes(appState.qrType)) return normalizePhoneDigits(values.phone).length >= 7;
  if (appState.qrType === "iban") return /^[A-Z]{2}\d{2}[A-Z0-9]{10,30}$/.test(String(values.iban || "").replace(/\s/g, "").toUpperCase()) && Number(values.amount) > 0;
  if (appState.qrType === "event") return Boolean(values.title && values.start && values.end && new Date(values.end) > new Date(values.start));
  if (appState.qrType === "barcode") return validateBarcode(values.format, values.value);
  return Object.values(values).some((value) => String(value).trim());
}

function setQrDownloadState(enabled) {
  ["downloadPng", "downloadSvg", "downloadQrPdf"].forEach((id) => {
    const button = document.querySelector(`#${id}`);
    if (button) button.disabled = !enabled;
  });
}

function toCalendarDate(value) {
  return new Date(value).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function validateBarcode(format, value) {
  if (format === "EAN13") return /^\d{12,13}$/.test(value);
  if (format === "EAN8") return /^\d{7,8}$/.test(value);
  if (format === "UPC") return /^\d{11,12}$/.test(value);
  return Boolean(value && value.length <= 80);
}

function generateBarcode(values) {
  const svg = document.querySelector("#barcodeSvg");
  const canvas = document.querySelector("#qrCanvas");
  try {
    const options = { format: values.format, displayValue: true, margin: 18, height: 120, background: "#ffffff", lineColor: "#153232" };
    JsBarcode(svg, values.value, options);
    JsBarcode(canvas, values.value, options);
    appState.barcodeSvg = new XMLSerializer().serializeToString(svg);
    appState.generatedKind = "barcode";
    svg.hidden = false;
    canvas.hidden = true;
    document.querySelector("#qrPlaceholder").hidden = true;
    document.querySelector("#qrResultMeta")?.removeAttribute("hidden");
    setText("#qrResultValue", `${values.format}: ${values.value}`);
    setQrDownloadState(true);
    showToast(t("qrGenerated"));
  } catch {
    showToast(t("invalidQr"), true);
  }
}

function handleQrLogo(event) {
  const file = event.target.files?.[0];
  if (!file || !["image/png", "image/jpeg", "image/svg+xml"].includes(file.type) || file.size > 2 * 1024 * 1024) {
    if (file) showToast(t("invalidQr"), true);
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    appState.qrLogoDataUrl = String(reader.result);
    setText("#qrLogoName", file.name);
    regenerateSmartQrIfReady();
  };
  reader.readAsDataURL(file);
}

function regenerateSmartQrIfReady() {
  const form = document.querySelector("#qrForm");
  const previewReady = Boolean(appState.qrSvg && appState.generatedKind === "qr" && form);
  if (!previewReady) return;
  form.requestSubmit();
}

async function drawLogoOnCanvas(canvas) {
  const image = new Image();
  image.crossOrigin = "anonymous";
  image.src = appState.qrLogoDataUrl;
  await image.decode();
  const context = canvas.getContext("2d");
  const size = canvas.width * (appState.qrLogoSize / 100);
  const padding = size * 0.16;
  const x = (canvas.width - size) / 2;
  const y = (canvas.height - size) / 2;
  context.fillStyle = "#ffffff";
  context.fillRect(x - padding, y - padding, size + padding * 2, size + padding * 2);
  context.drawImage(image, x, y, size, size);
}

function addLogoToQrSvg(svg, logo, percent) {
  const match = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
  if (!match) return svg;
  const width = Number(match[1]);
  const size = width * (percent / 100);
  const padding = size * 0.16;
  const position = (width - size) / 2;
  const overlay = `<rect x="${position - padding}" y="${position - padding}" width="${size + padding * 2}" height="${size + padding * 2}" rx="${padding}" fill="#fff"/><image href="${logo}" x="${position}" y="${position}" width="${size}" height="${size}" preserveAspectRatio="xMidYMid meet"/>`;
  return svg.replace("</svg>", `${overlay}</svg>`);
}

function downloadSmartPng() {
  const canvas = document.querySelector("#qrCanvas");
  if (!canvas) return;
  canvas.toBlob((blob) => blob && downloadBlob(blob, `${appState.generatedKind}-code.png`), "image/png");
}

function downloadSmartSvg() {
  const svg = appState.generatedKind === "barcode" ? appState.barcodeSvg : appState.qrSvg;
  if (svg) downloadBlob(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }), `${appState.generatedKind}-code.svg`);
}

async function downloadSmartPdf() {
  const canvas = document.querySelector("#qrCanvas");
  if (!canvas || (!appState.qrSvg && !appState.barcodeSvg)) return;
  try {
    await ensurePdfLibraries();
    const pdf = await PDFDocument.create();
    const png = await pdf.embedPng(canvas.toDataURL("image/png"));
    addPrintPages(pdf, png, appState.qrPrintPreset, appState.generatedKind === "barcode");
    downloadBlob(new Blob([await pdf.save()], { type: "application/pdf" }), `${appState.generatedKind}-${appState.qrPrintPreset}.pdf`);
  } catch (error) {
    console.error(error);
  }
}

function addPrintPages(pdf, image, preset, isBarcode) {
  const mm = 72 / 25.4;
  if (preset === "a4") {
    const page = pdf.addPage([210 * mm, 297 * mm]);
    const size = isBarcode ? [55 * mm, 25 * mm] : [35 * mm, 35 * mm];
    for (let y = 18 * mm; y + size[1] < 285 * mm; y += size[1] + 10 * mm) {
      for (let x = 15 * mm; x + size[0] < 200 * mm; x += size[0] + 10 * mm) page.drawImage(image, { x, y, width: size[0], height: size[1] });
    }
    return;
  }
  const formats = { "3cm": [30, 30], "5cm": [50, 50], "10cm": [100, 100], business: [85, 55], table: [105, 148] };
  const [widthMm, heightMm] = formats[preset] || formats["5cm"];
  const page = pdf.addPage([widthMm * mm, heightMm * mm]);
  const padding = Math.min(widthMm, heightMm) * 0.1 * mm;
  const maxWidth = widthMm * mm - padding * 2;
  const maxHeight = heightMm * mm - padding * 2;
  const ratio = image.width / image.height;
  const drawWidth = isBarcode ? maxWidth : Math.min(maxWidth, maxHeight);
  const drawHeight = isBarcode ? Math.min(maxHeight, drawWidth / ratio) : drawWidth;
  page.drawImage(image, { x: (widthMm * mm - drawWidth) / 2, y: (heightMm * mm - drawHeight) / 2, width: drawWidth, height: drawHeight });
}

function bindImageQrEvents() {
  const input = document.querySelector("#imageQrInput");
  const dropZone = document.querySelector("#imageDropZone");
  dropZone?.addEventListener("click", () => input?.click());
  input?.addEventListener("change", () => selectImageQrFile(input.files?.[0]));
  ["dragenter", "dragover"].forEach((name) => dropZone?.addEventListener(name, (event) => {
    event.preventDefault();
    dropZone.classList.add("dragover");
  }));
  ["dragleave", "drop"].forEach((name) => dropZone?.addEventListener(name, (event) => {
    event.preventDefault();
    dropZone.classList.remove("dragover");
  }));
  dropZone?.addEventListener("drop", (event) => selectImageQrFile(event.dataTransfer?.files?.[0]));
  document.querySelector("#imageQrForm")?.addEventListener("submit", uploadImageQr);
  document.querySelector("#copyImageQrLink")?.addEventListener("click", async () => {
    if (!appState.imageQrUrl) return;
    await navigator.clipboard.writeText(appState.imageQrUrl);
    showToast(t("copyLink"));
  });
  document.querySelector("#downloadImageQrPng")?.addEventListener("click", downloadImageQrPng);
  document.querySelector("#downloadImageQrSvg")?.addEventListener("click", downloadImageQrSvg);
  document.querySelector("#downloadImageQrPdf")?.addEventListener("click", downloadImageQrPdf);
}

function selectImageQrFile(file) {
  const allowed = ["image/jpeg", "image/png", "image/webp"];
  if (!file || !allowed.includes(file.type) || file.size > 5 * 1024 * 1024 || file.size < 1) {
    appState.imageQrFile = null;
    showToast(t("imageInvalid"), true);
    return;
  }
  appState.imageQrFile = file;
  setText("#selectedImageName", file.name);
  setText("#selectedImageSize", `${(file.size / 1024 / 1024).toFixed(2)} MB`);
  document.querySelector("#selectedImageRow")?.removeAttribute("hidden");
  const preview = document.querySelector("#imageUploadPreview");
  if (preview) {
    preview.src = URL.createObjectURL(file);
    preview.hidden = false;
    preview.onload = () => URL.revokeObjectURL(preview.src);
  }
}

async function uploadImageQr(event) {
  event.preventDefault();
  const file = appState.imageQrFile;
  if (!file) {
    showToast(t("imageInvalid"), true);
    document.querySelector("#imageDropZone")?.focus();
    return;
  }
  const button = document.querySelector("#createImageQrButton");
  button.disabled = true;
  button.innerHTML = `<span class="button-spinner"></span>${t("uploadingImage")}`;
  const form = new FormData();
  form.append("action", "create");
  form.append("image", file);
  form.append("title", document.querySelector("#imageTitle")?.value.trim() || "");
  form.append("description", document.querySelector("#imageDescription")?.value.trim() || "");
  form.append("expiryDays", document.querySelector("#imageExpiry")?.value || "7");
  form.append("password", document.querySelector("#imagePassword")?.value || "");
  try {
    const response = await fetch("/api/image-qr.php?action=create", { method: "POST", body: form });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.viewUrl) throw new Error(result.error || "Upload failed");
    appState.imageQrUrl = result.viewUrl;
    const canvas = document.querySelector("#imageQrCanvas");
    await QRCode.toCanvas(canvas, result.viewUrl, {
      width: 760,
      margin: 3,
      errorCorrectionLevel: "H",
      color: { dark: "#153232", light: "#ffffff" },
    });
    appState.imageQrSvg = await QRCode.toString(result.viewUrl, {
      type: "svg",
      margin: 3,
      errorCorrectionLevel: "H",
      color: { dark: "#153232", light: "#ffffff" },
    });
    canvas.hidden = false;
    document.querySelector("#imageQrPlaceholder").hidden = true;
    document.querySelector("#imageQrResultMeta")?.removeAttribute("hidden");
    setText("#imageQrResultUrl", result.viewUrl);
    ["copyImageQrLink", "downloadImageQrPng", "downloadImageQrSvg", "downloadImageQrPdf"].forEach((id) => {
      document.querySelector(`#${id}`).disabled = false;
    });
    showToast(t("imageQrReady"));
  } catch (error) {
    console.error(error);
    showToast(t("uploadFailed"), true);
  } finally {
    button.disabled = false;
    button.innerHTML = `${icon("upload", 18)} ${t("createImageQr")}`;
  }
}

function downloadImageQrPng() {
  const canvas = document.querySelector("#imageQrCanvas");
  if (!canvas || canvas.hidden) return;
  canvas.toBlob((blob) => blob && downloadBlob(blob, "image-qr-code.png"), "image/png");
}

function downloadImageQrSvg() {
  if (!appState.imageQrSvg) return;
  downloadBlob(new Blob([appState.imageQrSvg], { type: "image/svg+xml;charset=utf-8" }), "image-qr-code.svg");
}

async function downloadImageQrPdf() {
  const canvas = document.querySelector("#imageQrCanvas");
  if (!canvas || canvas.hidden) return;
  try {
    await ensurePdfLibraries();
    const pdf = await PDFDocument.create();
    const page = pdf.addPage([420, 500]);
    const png = await pdf.embedPng(canvas.toDataURL("image/png"));
    page.drawImage(png, { x: 50, y: 90, width: 320, height: 320 });
    const bytes = await pdf.save();
    downloadBlob(new Blob([bytes], { type: "application/pdf" }), "image-qr-code.pdf");
  } catch (error) {
    console.error(error);
    showToast(t("uploadFailed"), true);
  }
}

async function loadViewImage() {
  const shell = document.querySelector("#viewImageShell");
  if (!shell || !appState.viewImageId) {
    renderViewImageError();
    return;
  }
  try {
    const response = await fetch(`/api/image-qr.php?action=get&id=${encodeURIComponent(appState.viewImageId)}`);
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.id) throw new Error(data.error || "Not found");
    shell.innerHTML = `
      <article class="view-image-card">
        <div class="view-image-brand">${icon("image", 22)}<strong>PDF & QR Tools</strong></div>
        ${data.protected ? `
          <div class="protected-image-box" id="protectedImageBox">
            <span class="image-lock">${icon("shield", 32)}</span>
            <h1>${t("imageProtected")}</h1>
            <p>${t("enterImagePassword")}</p>
            <form id="unlockImageForm">
              <input id="viewImagePassword" type="password" minlength="6" autocomplete="current-password" required>
              <button class="button primary" type="submit">${icon("image", 18)} ${t("openImage")}</button>
            </form>
          </div>
        ` : renderPublicImage(data)}
        <div id="unlockedImage"></div>
      </article>
    `;
    if (data.protected) {
      document.querySelector("#unlockImageForm")?.addEventListener("submit", (event) => unlockViewImage(event, data));
    }
  } catch (error) {
    renderViewImageError();
  }
}

function renderPublicImage(data, imageUrl = data.imageUrl, downloadUrl = data.downloadUrl) {
  const expires = data.expiresAt ? new Intl.DateTimeFormat(appState.lang, { dateStyle: "medium", timeStyle: "short" }).format(new Date(data.expiresAt)) : "";
  return `
    <div class="view-image-content">
      ${data.title ? `<h1>${escapeHtml(data.title)}</h1>` : ""}
      ${data.description ? `<p>${escapeHtml(data.description)}</p>` : ""}
      <img src="${escapeHtml(imageUrl || "")}" alt="${escapeHtml(data.title || "Shared image")}">
      ${downloadUrl ? `<a class="button primary view-image-download" href="${escapeHtml(downloadUrl)}" download>${icon("download", 18)} ${t("downloadImage")}</a>` : ""}
      ${expires ? `<small>${t("expiresLabel")}: ${escapeHtml(expires)}</small>` : ""}
    </div>
  `;
}

async function unlockViewImage(event, data) {
  event.preventDefault();
  const form = new FormData();
  form.append("action", "unlock");
  form.append("id", appState.viewImageId);
  form.append("password", document.querySelector("#viewImagePassword")?.value || "");
  try {
    const response = await fetch("/api/image-qr.php?action=unlock", { method: "POST", body: form });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.imageUrl) throw new Error(result.error || "Unauthorized");
    document.querySelector("#protectedImageBox")?.remove();
    document.querySelector("#unlockedImage").innerHTML = renderPublicImage(data, result.imageUrl, result.downloadUrl);
  } catch {
    showToast(t("imageUnavailable"), true);
  }
}

function renderViewImageError() {
  const shell = document.querySelector("#viewImageShell");
  if (shell) shell.innerHTML = `<div class="view-image-error">${icon("info", 34)}<h1>${t("imageUnavailable")}</h1>${routeLink("image-qr-code", t("imageQr"), "button primary")}</div>`;
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
  toast.innerHTML = `${icon(isError ? "info" : "check", 18)}<span>${message}</span>`;
  toast.classList.toggle("error", isError);
  toast.classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("visible"), 3200);
}

window.addEventListener("hashchange", async () => {
  saveCurrentPageState();
  disposeFabricCanvas();
  appState.route = getRouteFromLocation();
  appState.viewImageId = getViewImageId();
  await renderApp();
});

window.addEventListener("keydown", (event) => {
  if (appState.route !== "editor" || !editorState.canvas) return;
  const target = event.target;
  if (target?.matches("input, textarea, [contenteditable='true']")) return;
  if (event.key === "Delete" || event.key === "Backspace") {
    event.preventDefault();
    deleteSelectedObject();
  }
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") {
    event.preventDefault();
    event.shiftKey ? redo() : undo();
  }
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "y") {
    event.preventDefault();
    redo();
  }
});

function registerServiceWorker() {
  if (!("serviceWorker" in navigator) || !location.protocol.startsWith("http")) return;
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/service-worker.js").catch(() => {
      // PWA enhancement only; the app must keep working even if registration is blocked.
    });
  });
}

registerServiceWorker();
renderApp();

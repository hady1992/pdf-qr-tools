export const toolCategories = [
  {
    "id": "edit",
    "label": {
      "ar": "تعديل PDF",
      "de": "PDF bearbeiten",
      "en": "Edit PDF"
    }
  },
  {
    "id": "convert",
    "label": {
      "ar": "تحويل PDF",
      "de": "PDF konvertieren",
      "en": "Convert PDF"
    }
  },
  {
    "id": "organize",
    "label": {
      "ar": "تنظيم الصفحات",
      "de": "Seiten organisieren",
      "en": "Organize pages"
    }
  },
  {
    "id": "privacy",
    "label": {
      "ar": "حماية وخصوصية",
      "de": "Schutz & Datenschutz",
      "en": "Protection & privacy"
    }
  },
  {
    "id": "submission",
    "label": {
      "ar": "أدوات للمعاملات",
      "de": "Antragsunterlagen",
      "en": "Submission tools"
    }
  }
];

export const toolsData = [
  {
    "id": "merge-pdf",
    "route": "merge-pdf",
    "icon": "merge",
    "category": "organize",
    "isPopular": true,
    "isNew": false,
    "title": {
      "ar": "دمج PDF",
      "de": "PDF zusammenfügen",
      "en": "Merge PDF"
    },
    "description": {
      "ar": "اجمع ملفات PDF في ملف واحد، بالترتيب الذي تختاره.",
      "de": "Mehrere PDFs in der gewünschten Reihenfolge zu einer Datei zusammenfügen.",
      "en": "Combine PDF files into one document in the order you choose."
    }
  },
  {
    "id": "split-pdf",
    "route": "split-pdf",
    "icon": "split",
    "category": "organize",
    "isPopular": true,
    "isNew": false,
    "title": {
      "ar": "تقسيم PDF",
      "de": "PDF teilen",
      "en": "Split PDF"
    },
    "description": {
      "ar": "قسّم الملف حسب النطاقات، أو احفظ كل صفحة في ملف مستقل.",
      "de": "Nach Seitenbereichen teilen oder jede Seite als eigene PDF speichern.",
      "en": "Split by page ranges or save each page as a separate PDF."
    }
  },
  {
    "id": "pdf-editor",
    "route": "editor",
    "icon": "edit",
    "category": "edit",
    "isPopular": true,
    "isNew": false,
    "title": {
      "ar": "محرر PDF",
      "de": "PDF-Editor",
      "en": "PDF Editor"
    },
    "description": {
      "ar": "أضف نصوصاً وتمييزاً ورسماً وأشكالاً وامسح العناصر ونظّم الصفحات.",
      "de": "Text, Markierungen, Zeichnungen, Formen und Seiten direkt bearbeiten.",
      "en": "Add text, highlights, drawings, shapes, erase elements, and organize pages."
    },
    "keywords": {
      "ar": [
        "تعديل",
        "كتابة",
        "تمييز",
        "قلم",
        "ممحاة",
        "حذف صفحة",
        "دمج",
        "تقسيم"
      ],
      "de": [
        "bearbeiten",
        "text",
        "markieren",
        "radierer",
        "zusammenfügen",
        "teilen"
      ],
      "en": [
        "edit",
        "text",
        "highlight",
        "pen",
        "eraser",
        "merge",
        "split"
      ]
    }
  },
  {
    "id": "images-to-pdf",
    "route": "images-to-pdf",
    "icon": "image",
    "category": "convert",
    "isPopular": true,
    "isNew": false,
    "title": {
      "ar": "تحويل الصور إلى PDF",
      "de": "Bilder zu PDF",
      "en": "Images to PDF"
    },
    "description": {
      "ar": "حوّل عدة صور JPG وPNG وWebP إلى ملف PDF واحد مع ترتيب وهوامش.",
      "de": "Mehrere JPG-, PNG- und WebP-Bilder zu einer PDF-Datei mit Reihenfolge und Rändern umwandeln.",
      "en": "Convert JPG, PNG, and WebP images into one PDF with ordering and margins."
    },
    "keywords": {
      "ar": [
        "صور",
        "تحويل",
        "jpg",
        "png",
        "webp",
        "صورة إلى pdf"
      ],
      "de": [
        "bilder",
        "umwandeln",
        "jpg",
        "png",
        "webp"
      ],
      "en": [
        "images",
        "convert",
        "jpg",
        "png",
        "webp"
      ]
    }
  },
  {
    "id": "pdf-to-images",
    "route": "pdf-to-images",
    "icon": "image",
    "category": "convert",
    "isPopular": false,
    "isNew": false,
    "title": {
      "ar": "تحويل PDF إلى صور",
      "de": "PDF zu Bildern",
      "en": "PDF to Images"
    },
    "description": {
      "ar": "صدّر صفحات PDF كصور PNG أو JPG بجودة قابلة للاختيار.",
      "de": "PDF-Seiten als PNG- oder JPG-Bilder in wählbarer Qualität exportieren.",
      "en": "Export PDF pages as PNG or JPG images with selectable quality."
    },
    "keywords": {
      "ar": [
        "pdf إلى صور",
        "تحويل",
        "صفحات",
        "png",
        "jpg"
      ],
      "de": [
        "pdf zu bildern",
        "umwandeln",
        "seiten",
        "png",
        "jpg"
      ],
      "en": [
        "pdf to images",
        "convert",
        "pages",
        "png",
        "jpg"
      ]
    }
  },
  {
    "id": "remove-pages",
    "route": "remove-pages",
    "icon": "pageDelete",
    "category": "organize",
    "isPopular": true,
    "isNew": false,
    "title": {
      "ar": "حذف صفحات",
      "de": "Seiten löschen",
      "en": "Remove pages"
    },
    "description": {
      "ar": "حدد الصفحات غير المطلوبة واحذفها من الملف.",
      "de": "Nicht benötigte Seiten auswählen und aus dem Dokument entfernen.",
      "en": "Select unwanted pages and remove them from your document."
    }
  },
  {
    "id": "extract-pages",
    "route": "extract-pages",
    "icon": "file",
    "category": "organize",
    "isPopular": true,
    "isNew": false,
    "title": {
      "ar": "استخراج صفحات",
      "de": "Seiten extrahieren",
      "en": "Extract pages"
    },
    "description": {
      "ar": "اختر الصفحات التي تحتاجها واحفظها في ملف PDF جديد.",
      "de": "Gewünschte Seiten auswählen und als neue PDF speichern.",
      "en": "Select the pages you need and save them as a new PDF."
    }
  },
  {
    "id": "compress-pdf",
    "route": "compress-pdf",
    "icon": "compress",
    "category": "convert",
    "isPopular": true,
    "isNew": false,
    "title": {
      "ar": "ضغط PDF",
      "de": "PDF komprimieren",
      "en": "Compress PDF"
    },
    "description": {
      "ar": "قلّل حجم ملف PDF داخل المتصفح مع خيارات ضغط خفيف أو متوسط أو قوي.",
      "de": "PDF-Dateien im Browser mit leichter, mittlerer oder starker Komprimierung verkleinern.",
      "en": "Reduce PDF size in the browser with light, medium, or strong compression."
    },
    "keywords": {
      "ar": [
        "ضغط",
        "تصغير",
        "حجم",
        "تقليل",
        "ملف صغير"
      ],
      "de": [
        "komprimieren",
        "verkleinern",
        "größe",
        "kleiner machen"
      ],
      "en": [
        "compress",
        "reduce",
        "smaller",
        "size"
      ]
    }
  },
  {
    "id": "sign-pdf",
    "route": "sign-pdf",
    "icon": "pen",
    "category": "edit",
    "isPopular": true,
    "isNew": false,
    "title": {
      "ar": "توقيع PDF",
      "de": "PDF unterschreiben",
      "en": "Sign PDF"
    },
    "description": {
      "ar": "ارسم توقيعك أو ارفع صورة توقيع وضعها على أي صفحة.",
      "de": "Unterschrift zeichnen oder als PNG hochladen und auf einer Seite platzieren.",
      "en": "Draw a signature or upload a PNG signature and place it on any page."
    },
    "keywords": {
      "ar": [
        "توقيع",
        "امضاء",
        "رسم",
        "توقيع PDF"
      ],
      "de": [
        "unterschreiben",
        "signatur",
        "zeichnen"
      ],
      "en": [
        "sign",
        "signature",
        "draw"
      ]
    }
  },
  {
    "id": "rotate-pdf",
    "route": "rotate-pdf",
    "icon": "redo",
    "category": "organize",
    "isPopular": true,
    "isNew": false,
    "title": {
      "ar": "تدوير الصفحات",
      "de": "PDF drehen",
      "en": "Rotate PDF"
    },
    "description": {
      "ar": "دوّر صفحة واحدة أو كل الصفحات ثم حمّل الملف النهائي.",
      "de": "Eine Seite oder alle Seiten drehen und die fertige PDF herunterladen.",
      "en": "Rotate one page or all pages and download the final PDF."
    },
    "keywords": {
      "ar": [
        "تدوير",
        "قلب",
        "صفحات"
      ],
      "de": [
        "drehen",
        "seiten drehen"
      ],
      "en": [
        "rotate",
        "pages"
      ]
    }
  },
  {
    "id": "page-numbers",
    "route": "page-numbers",
    "icon": "type",
    "category": "edit",
    "isPopular": false,
    "isNew": false,
    "title": {
      "ar": "أرقام الصفحات",
      "de": "Seitenzahlen",
      "en": "Page Numbers"
    },
    "description": {
      "ar": "أضف أرقام صفحات بمكان وشكل ولون تختاره.",
      "de": "Seitenzahlen mit Position, Format und Farbe hinzufügen.",
      "en": "Add page numbers with custom position, format, and color."
    },
    "keywords": {
      "ar": [
        "أرقام",
        "ترقيم",
        "صفحات"
      ],
      "de": [
        "seitenzahlen",
        "nummerieren"
      ],
      "en": [
        "page numbers",
        "numbering"
      ]
    }
  },
  {
    "id": "watermark-pdf",
    "route": "watermark-pdf",
    "icon": "highlight",
    "category": "edit",
    "isPopular": false,
    "isNew": false,
    "title": {
      "ar": "علامة مائية",
      "de": "Wasserzeichen",
      "en": "PDF Watermark"
    },
    "description": {
      "ar": "أضف نصاً أو صورة كعلامة مائية مع شفافية ودوران.",
      "de": "Text oder Bild als Wasserzeichen mit Transparenz und Drehung hinzufügen.",
      "en": "Add text or image watermarks with opacity and rotation."
    },
    "keywords": {
      "ar": [
        "علامة مائية",
        "watermark",
        "نسخة",
        "سري"
      ],
      "de": [
        "wasserzeichen",
        "entwurf",
        "kopie",
        "vertraulich"
      ],
      "en": [
        "watermark",
        "copy",
        "draft",
        "confidential"
      ]
    }
  },
  {
    "id": "redact-pdf",
    "route": "redact-pdf",
    "icon": "square",
    "category": "privacy",
    "isPopular": true,
    "isNew": false,
    "title": {
      "ar": "إخفاء معلومات",
      "de": "PDF schwärzen",
      "en": "Redact PDF"
    },
    "description": {
      "ar": "ارسم مستطيلات سوداء فوق المعلومات الحساسة وصدّر نسخة مدمجة.",
      "de": "Schwarze Rechtecke über sensible Informationen zeichnen und eingebettet exportieren.",
      "en": "Draw black rectangles over sensitive data and export a flattened copy."
    },
    "keywords": {
      "ar": [
        "إخفاء",
        "حجب",
        "معلومات",
        "خصوصية"
      ],
      "de": [
        "schwärzen",
        "datenschutz",
        "sensible daten"
      ],
      "en": [
        "redact",
        "privacy",
        "hide",
        "sensitive"
      ]
    }
  },
  {
    "id": "crop-pdf",
    "route": "crop-pdf",
    "icon": "select",
    "category": "organize",
    "isPopular": false,
    "isNew": false,
    "title": {
      "ar": "قص PDF",
      "de": "PDF zuschneiden",
      "en": "Crop PDF"
    },
    "description": {
      "ar": "حدد منطقة القص وطبّقها على صفحة واحدة أو كل الصفحات.",
      "de": "Zuschneidebereich festlegen und auf eine oder alle Seiten anwenden.",
      "en": "Choose a crop area and apply it to one page or all pages."
    },
    "keywords": {
      "ar": [
        "قص",
        "حواف",
        "crop"
      ],
      "de": [
        "zuschneiden",
        "ränder"
      ],
      "en": [
        "crop",
        "trim",
        "margins"
      ]
    }
  },
  {
    "id": "reorder-pages",
    "route": "reorder-pages",
    "icon": "panels",
    "category": "organize",
    "isPopular": true,
    "isNew": false,
    "title": {
      "ar": "ترتيب الصفحات",
      "de": "Seiten sortieren",
      "en": "Reorder Pages"
    },
    "description": {
      "ar": "رتّب صفحات PDF بالسحب، احذف أو دوّر الصفحات ثم احفظ الملف.",
      "de": "PDF-Seiten per Drag & Drop sortieren, löschen oder drehen.",
      "en": "Drag to reorder PDF pages, delete or rotate pages, then save."
    },
    "keywords": {
      "ar": [
        "ترتيب",
        "سحب",
        "حذف صفحات",
        "تنظيم"
      ],
      "de": [
        "sortieren",
        "seiten",
        "löschen",
        "drehen"
      ],
      "en": [
        "reorder",
        "sort",
        "delete pages",
        "organize"
      ]
    }
  },
  {
    "id": "prepare-submission",
    "route": "prepare-submission",
    "icon": "merge",
    "category": "submission",
    "isPopular": true,
    "isNew": false,
    "title": {
      "ar": "تجهيز PDF للإرسال",
      "de": "PDF für Antrag vorbereiten",
      "en": "Prepare PDF for Submission"
    },
    "description": {
      "ar": "اجمع ملفات PDF وصوراً في ملف واحد باسم ألماني مناسب للمعاملة.",
      "de": "PDFs und Bilder zu einer Antragsdatei mit passendem deutschen Dateinamen bündeln.",
      "en": "Combine PDFs and images into one submission file with a suitable German filename."
    },
    "keywords": {
      "ar": [
        "معاملة",
        "جوب سنتر",
        "فاميليان كاسة",
        "تجهيز",
        "إرسال",
        "ألمانيا"
      ],
      "de": [
        "jobcenter",
        "familienkasse",
        "wohngeld",
        "ausländerbehörde",
        "antrag"
      ],
      "en": [
        "submission",
        "jobcenter",
        "application",
        "documents"
      ]
    }
  }
];

export const pdfToolRoutes = toolsData.filter(tool => tool.route !== "editor").map(tool => tool.route);

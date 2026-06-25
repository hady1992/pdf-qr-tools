# ربط GitHub مع Hostinger مباشرة

المستودع مجهّز بحيث يحتوي فرع `main` على الموقع المبني والجاهز للنشر في الجذر. لا يحتاج Hostinger إلى تشغيل `npm` أو `pnpm`.

## إعداد الربط

1. افتح لوحة Hostinger ثم اختر موقعك.
2. انتقل إلى **Advanced > Git**.
3. اختر **Create a new repository**.
4. استخدم رابط المستودع:

```text
https://github.com/hady1992/pdf-qr-tools.git
```

5. اختر الفرع:

```text
main
```

6. اجعل مسار النشر:

```text
public_html
```

7. نفّذ **Deploy** أو **Pull**.

## تحديث الموقع لاحقًا

بعد رفع أي تحديث جديد إلى فرع `main`:

- افتح قسم Git في Hostinger.
- اضغط **Pull** أو **Deploy**.
- لا تحذف مجلد `pdfqr-storage` الموجود خارج `public_html`.

## Image QR Code

الصور وقاعدة SQLite تُحفظ تلقائيًا في:

```text
/home/USER/pdfqr-storage
```

عندما تسمح صلاحيات الاستضافة بذلك. لذلك لا تختفي الصور عند سحب نسخة جديدة من GitHub.

تأكد من:

- PHP 8.1 أو أحدث.
- تفعيل `PDO_SQLite`.
- تفعيل `fileinfo`.
- وجود شهادة SSL.

## بنية المستودع

- جذر المستودع: نسخة Hostinger الجاهزة.
- `source/`: الكود المصدري القابل للتطوير.
- `api/`: خدمة Image QR المبنية بـ PHP.
- `storage/`: مجلد احتياطي محمي، ولا تُرفع منه صور المستخدمين أو قاعدة البيانات إلى GitHub.

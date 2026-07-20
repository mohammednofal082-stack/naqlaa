import { NextRequest, NextResponse } from "next/server";
import { requireAiSession } from "@/lib/ai/api";

export async function POST(req: NextRequest) {
  const { error } = await requireAiSession();
  if (error) return error;

  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "لم يتم اختيار ملف" }, { status: 400 });
    }

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json({ error: "يرجى رفع ملف PDF فقط" }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "الحد الأقصى لحجم الملف ٥ ميجابايت" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require("pdf-parse") as (data: Buffer) => Promise<{ text: string }>;
    const parsed = await pdfParse(buffer);
    const text = parsed.text?.trim();

    if (!text || text.length < 20) {
      return NextResponse.json(
        { error: "تعذّر استخراج نص من الملف. تأكد أن الملف PDF يحتوي نصاً قابلاً للقراءة." },
        { status: 422 }
      );
    }

    return NextResponse.json({ text, fileName: file.name });
  } catch (err) {
    console.error("PDF parse error:", err);
    return NextResponse.json({ error: "فشل قراءة ملف PDF" }, { status: 500 });
  }
}

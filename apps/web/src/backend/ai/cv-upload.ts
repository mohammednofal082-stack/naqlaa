export async function uploadCvPdf(file: File): Promise<{ text: string; fileName: string }> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/ai/cv-upload", {
    method: "POST",
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "فشل رفع الملف");
  }
  return data;
}

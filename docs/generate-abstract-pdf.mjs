/**
 * Generates Naqlah graduation-project Abstract PDF (ServLink-style layout).
 * Run: node docs/generate-abstract-pdf.mjs
 */
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, "Naqlah-Abstract.pdf");

const MARGIN = 54;
const INNER = 62;
const PAGE_W = 595.28;
const PAGE_H = 841.89;

function drawFrame(doc) {
  doc.lineWidth(2.5).rect(MARGIN, MARGIN, PAGE_W - MARGIN * 2, PAGE_H - MARGIN * 2).stroke();
  doc.lineWidth(0.75).rect(INNER, INNER, PAGE_W - INNER * 2, PAGE_H - INNER * 2).stroke();
}

function pageNumber(doc, num) {
  const boxW = 28;
  const boxH = 18;
  const x = PAGE_W - INNER - boxW - 4;
  const y = PAGE_H - INNER - boxH - 6;
  doc.lineWidth(0.75).rect(x, y, boxW, boxH).stroke();
  doc.font("Times-Bold").fontSize(11).text(num, x, y + 4, { width: boxW, align: "center" });
}

/** Paragraph with inline bold segments: [{ text, bold? }] */
function bodyParagraph(doc, segments, y) {
  const x = INNER + 14;
  const w = PAGE_W - (INNER + 14) * 2;
  doc.x = x;
  doc.y = y;

  for (const seg of segments) {
    doc.font(seg.bold ? "Times-Bold" : "Times-Roman").fontSize(12).fillColor("black");
    doc.text(seg.text, { width: w, align: "justify", lineGap: 3, continued: true });
  }
  doc.text("", { continued: false });
  return doc.y;
}

const doc = new PDFDocument({ size: "A4", margins: { top: 0, bottom: 0, left: 0, right: 0 } });
const stream = fs.createWriteStream(OUT);
doc.pipe(stream);

// ─── Page ii ───
drawFrame(doc);
doc.font("Times-Bold").fontSize(14).text("Abstract:", 0, INNER + 28, { width: PAGE_W, align: "center" });

let y = INNER + 58;

y =
  bodyParagraph(doc, [
    {
      text: "In today's fast-paced digital world, university students and graduates seek quick and reliable access to career opportunities directly from their mobile devices. Whether it involves technology, healthcare, education, finance, or entrepreneurship, they prefer solutions that save time and effort while guiding them from campus to employment. At the same time, universities, companies, and professionals are looking for effective ways to monitor student skills, reach qualified talent, and manage recruitment and training operations efficiently.",
    },
  ], y) + 14;

y =
  bodyParagraph(doc, [
    { text: "The " },
    { text: "Naqlah", bold: true },
    {
      text: " application was developed to connect students and graduates with ",
    },
    { text: "career opportunities", bold: true },
    {
      text: ", internships, training programs, and mentorship across various sectors through a unified and user-friendly digital platform.",
    },
  ], y) + 14;

y =
  bodyParagraph(doc, [
    {
      text: "The project includes a mobile application developed using React Native and Expo, and a responsive web interface built using Next.js, React, and TypeScript. Both clients connect to a centralized backend powered by ",
    },
    { text: "Supabase", bold: true },
    {
      text: ", which provides PostgreSQL database storage, authentication, row-level security, real-time subscriptions, and file storage for CVs and media. A shared monorepo package ensures consistent data models, role-based permissions, and business logic across web and mobile. The system serves eight main user types: student, graduate, company, HR, university, trainer, mentor, and administrator.",
    },
  ], y) + 14;

y = bodyParagraph(doc, [
  {
    text: "Students and graduates can build and update professional profiles stored in the database, analyze skill gaps, receive smart job recommendations, analyze their CV with ATS scoring, generate career roadmaps, and practice interviews through AI-powered simulation. They can browse jobs and internships with live match percentages calculated from their stored skills and experience, track applications in real time, enroll in courses, and book mentorship sessions. The platform also provides a ",
  },
  { text: "job market analysis", bold: true },
  {
    text: " module that aggregates live posting data to reveal the most in-demand skills, salary ranges by experience level, work-type and geographic distributions, rising skills, and top hiring companies, helping students align their learning with real market needs. Companies and HR teams can publish opportunities, manage applicant pipelines, schedule interviews, and build ",
  },
  { text: "talent pools", bold: true },
  {
    text: "—curated groups of promising candidates that can be created, organized, and invited to future openings directly from the dashboard. While universities can approve internships, track weekly reports, manage career events, and view graduate employment statistics.",
  },
], y);

pageNumber(doc, "ii");

// ─── Page iii ───
doc.addPage();
drawFrame(doc);
y = INNER + 36;

y =
  bodyParagraph(doc, [
    {
      text: "Trainers can create structured courses with lessons, quizzes, and certificates, while mentors manage availability, session requests, and feedback. The administrator has full control over the system, including user verification, content moderation, platform analytics, skills taxonomy, security settings, and audit logs through dedicated dashboards. All operational data—including user profiles, job listings, applications, messages, and analytics—is persisted and synchronized through Supabase, ensuring data integrity and instant updates across devices. Smart matching algorithms query user skills and opportunity requirements from the database to rank jobs, internships, courses, and mentors. Also, there is real-time messaging powered by Supabase Realtime, allowing direct communication between users to discuss applications and mentorship details.",
    },
  ], y) + 14;

y = bodyParagraph(doc, [
  { text: "There are many existing platforms that focus on social networking or single-sector hiring, but " },
  { text: "Naqlah", bold: true },
  {
    text: " is designed to support a wider range of stakeholders across the Palestinian career ecosystem. Students can easily discover suitable opportunities and improve their readiness, while employers and universities can manage talent more efficiently. By connecting all sides through intelligent guidance, ",
  },
  { text: "Naqlah", bold: true },
  {
    text: " simplifies the career journey, saves time, and creates a seamless, organized, and reliable experience for everyone.",
  },
], y);

pageNumber(doc, "iii");

doc.end();

stream.on("finish", () => {
  console.log("Created:", OUT);
});

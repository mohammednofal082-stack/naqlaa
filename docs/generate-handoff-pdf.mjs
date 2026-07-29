/**
 * English PDF: two student branches → merge to main.
 * Run: node docs/generate-handoff-pdf.mjs
 */
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, "Naqlah-Handoff-Guide.pdf");

const doc = new PDFDocument({ size: "A4", margins: { top: 54, bottom: 54, left: 54, right: 54 } });
const stream = fs.createWriteStream(OUT);
doc.pipe(stream);
const W = 595.28 - 108;

function ensure(min = 100) {
  if (doc.y > 842 - min) doc.addPage();
}
function rule() {
  const y = doc.y;
  doc.moveTo(54, y).lineTo(541, y).strokeColor("#cbd5e1").lineWidth(0.8).stroke();
  doc.moveDown(0.45);
}
function h1(t) {
  ensure(90);
  doc.moveDown(0.35);
  doc.font("Helvetica-Bold").fontSize(14).fillColor("#0f172a").text(t);
  doc.moveDown(0.25);
}
function p(t) {
  doc.font("Helvetica").fontSize(10.5).fillColor("#111827").text(t, { width: W, lineGap: 2 });
  doc.moveDown(0.25);
}
function bullet(t) {
  doc.font("Helvetica").fontSize(10.5).fillColor("#111827").text(`•  ${t}`, { width: W, lineGap: 1.5 });
}
function code(t) {
  doc.font("Courier").fontSize(9).fillColor("#0f172a").text(t, { width: W });
}

doc.font("Helvetica-Bold").fontSize(22).fillColor("#0f172a").text("Naqla", { align: "center" });
doc.moveDown(0.2);
doc.font("Helvetica-Bold").fontSize(13).text("Branch Workflow → Merge to main", { align: "center" });
doc.moveDown(0.3);
doc.font("Helvetica").fontSize(11).fillColor("#334155").text("An-Najah National University — Graduation Project", { align: "center" });
doc.moveDown(0.15);
doc.font("Helvetica").fontSize(10).text("Team: Mohammed Nofal · Ameer Abu Shams", { align: "center" });
doc.moveDown(0.5);
rule();

h1("1. Branch model");
p("Each student has one personal branch. Work happens on that branch, then merges into main with a Pull Request.");
code("main");
code("├── mohammed   (Mohammed Nofal)");
code("└── ameer      (Ameer Abu Shams)");
bullet("Do not commit directly to main.");
bullet("Always pull main before continuing your branch.");

h1("2. Upload order");
bullet("01 Mohammed / mohammed / 01-monorepo-scaffold → PR → main");
bullet("02 Mohammed / mohammed / 02-web-student-core → PR → main");
bullet("03 Ameer / ameer / 03-role-dashboards → PR → main");
bullet("04 Mohammed / mohammed / 04-career-tools → PR → main");
bullet("05 Ameer / ameer / 05-talent-market → PR → main");
bullet("06 Mohammed / mohammed / 06-mobile-workflows → PR → main");
bullet("07 Ameer / ameer / 07-data-docs → PR → main");

h1("3. Run before every push");
code("npm install");
code("cd apps/web");
code("cp .env.example .env.local");
code("npm run dev");
p("Open http://localhost:3000 — demo: student@naqlah.ps / Naqlah@2025");
p("Every stage folder is a full runnable project.");

h1("4. Steps for one stage");
bullet("1. Update main:");
code("git checkout main");
code("git pull origin main");
bullet("2. Use your branch:");
code("git checkout -b mohammed");
code("# later: git checkout mohammed && git merge main");
bullet("3. Copy the stage folder contents into the repo root.");
bullet("4. Verify the app runs (section 3).");
bullet("5. Commit and push:");
code("git add .");
code('git commit -m "<commit message>"');
code("git push -u origin mohammed");
bullet("6. GitHub: Pull Request mohammed → main → Merge.");
bullet("7. Teammate pulls main before his next stage.");

h1("5. Commit messages");
[
  "chore: scaffold Naqla monorepo and landing",
  "feat(web): student core flows — auth, feed, jobs",
  "feat(web): multi-role dashboards and modules",
  "feat: career tools and matching algorithms",
  "feat: talent pools and job market analysis",
  "feat(mobile): Expo app and platform workflows",
  "chore: supabase schema, seed, and documentation",
].forEach((m, i) => {
  ensure(22);
  code(`${i + 1}) ${m}`);
});

h1("6. Do not upload");
bullet(".env.local / secrets");
bullet("node_modules/");
bullet(".next/");

h1("7. Package");
code("release/naqla/           # runnable working copy");
code("release/stages/01..07/  # runnable stage snapshots");
code("release/ORDER.txt");
code("release/Naqlah-Handoff-Guide.pdf");

doc.moveDown(0.6);
rule();
doc.font("Helvetica").fontSize(9).fillColor("#64748b").text("Naqla — Personal branches → merge to main", { align: "center" });

doc.end();
stream.on("finish", () => console.log("Wrote", OUT));

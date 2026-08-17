process.env.EXPO_NO_METRO_WORKSPACE_ROOT = "1";
process.env.EXPO_NO_DOCTOR ??= "1";

const { spawn } = require("node:child_process");
const args = process.argv.slice(2);
const child = spawn("npx", ["expo", "start", ...args], {
  stdio: "inherit",
  shell: true,
  env: process.env,
  cwd: __dirname,
});

child.on("exit", (code) => process.exit(code ?? 0));

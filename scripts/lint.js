import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

function collectJavaScriptFiles(root) {
  const files = [];
  for (const entry of readdirSync(root)) {
    const nextPath = join(root, entry);
    const stats = statSync(nextPath);

    if (stats.isDirectory()) {
      files.push(...collectJavaScriptFiles(nextPath));
      continue;
    }

    if (nextPath.endsWith(".js")) {
      files.push(nextPath);
    }
  }
  return files;
}

const roots = ["src", "scripts", "test"];
const files = roots.flatMap((root) => collectJavaScriptFiles(root));
let hasFailures = false;

for (const filePath of files) {
  const result = spawnSync(process.execPath, ["--check", filePath], {
    stdio: "inherit"
  });

  if (result.status !== 0) {
    hasFailures = true;
  }
}

if (hasFailures) {
  process.exit(1);
}

console.log(`Syntax check passed for ${files.length} JavaScript files.`);

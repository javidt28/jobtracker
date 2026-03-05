#!/usr/bin/env node
/**
 * Static export build: temporarily hide app/api so Next.js does not try to
 * export dynamic API routes (only GET is supported with output: 'export').
 */
import { renameSync, existsSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const root = join(fileURLToPath(import.meta.url), "..", "..");
const apiDir = join(root, "src", "app", "api");
const apiBackup = join(root, "src", "app", "_api_static_skip");

if (!existsSync(apiDir)) {
  console.error("src/app/api not found");
  process.exit(1);
}

function run() {
  try {
    renameSync(apiDir, apiBackup);
    execSync("next build", {
      cwd: root,
      stdio: "inherit",
      env: { ...process.env, OUTPUT_STATIC: "1", NEXT_PUBLIC_STATIC_EXPORT: "1" },
    });
  } finally {
    if (existsSync(apiBackup)) renameSync(apiBackup, apiDir);
  }
}

run();

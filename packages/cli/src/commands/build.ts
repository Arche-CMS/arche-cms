/* eslint-disable no-console */

import { execSync } from "node:child_process";

export interface BuildOptions {
  clean?: boolean;
}

export function printBuildHelp(): void {
  console.log(`
Usage: cms build [options]

Build the CMS for production.

Options:
  --clean        Clean build artifacts before building
  --help         Show this help
`);
  process.exit(0);
}

export async function build(options: BuildOptions): Promise<void> {
  console.log("[cms] Building CMS for production...");

  if (options.clean) {
    console.log("[cms] Cleaning build artifacts...");
    execSync("yarn clean", { stdio: "inherit" });
  }

  console.log("[cms] Running TypeScript build...");
  execSync("yarn build", { stdio: "inherit" });

  console.log("[cms] Build complete");
}

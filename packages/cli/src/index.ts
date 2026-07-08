#!/usr/bin/env node

/* eslint-disable no-console */

import { collectionCreate, printCollectionCreateHelp } from "./commands/collection.js";
import { pluginCreate, printPluginCreateHelp } from "./commands/plugin.js";

function printMainHelp(): void {
  console.log(`
Usage: cms <command> [options]

Commands:
  collection create <slug>   Create a new collection
  plugin create <slug>       Create a new plugin

Options:
  --help                     Show help for any command

Run "cms <command> --help" for command-specific help.
`);
}

function parseArgs(): void {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === "--help") {
    printMainHelp();
    process.exit(0);
  }

  const cmd = args[0];
  const sub = args[1];

  if (cmd === "collection" && sub === "create") {
    if (args.includes("--help")) {
      printCollectionCreateHelp();
      return;
    }
    const dirIdx = args.indexOf("--dir");
    const dir = dirIdx !== -1 ? args[dirIdx + 1] : undefined;

    collectionCreate({ slug: args[2] ?? "", dir }).catch((err: Error) => {
      console.error("Error:", err.message);
      process.exit(1);
    });
  } else if (cmd === "plugin" && sub === "create") {
    if (args.includes("--help")) {
      printPluginCreateHelp();
      return;
    }
    const dirIdx = args.indexOf("--dir");
    const dir = dirIdx !== -1 ? args[dirIdx + 1] : undefined;

    pluginCreate({ slug: args[2] ?? "", dir }).catch((err: Error) => {
      console.error("Error:", err.message);
      process.exit(1);
    });
  } else {
    console.error(`Unknown command: ${cmd} ${sub ?? ""}`);
    printMainHelp();
    process.exit(1);
  }
}

parseArgs();

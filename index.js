#!/usr/bin/env node

import fs from "fs";
import path from "path";
import inquirer from "inquirer";
import { execa } from "execa";
import chalk from "chalk";
import { loadPlugins } from "./plugin.js";
import { createTimer } from "./lib/timer.js";
import { createDryRunner } from "./lib/dry-run.js";

const COMMON_COMMANDS = ["install", "update", "audit", "start"];
const plugins = loadPlugins();

const args = process.argv.slice(2);
const isDryRun = args.includes("--dry");
const withTimer = args.includes("--timer");

// Remove our custom flags from the args that will be passed to npm
const filteredArgs = args.filter(arg => !['--dry', '--timer'].includes(arg));

// Initialize features
const timer = createTimer(withTimer);
const dryRunner = createDryRunner(isDryRun);

const getPackageScripts = () => {
  const pkgPath = path.join(process.cwd(), "package.json");

  if (!fs.existsSync(pkgPath)) {
    console.log(chalk.red("No package.json found in this directory."));
    return [];
  }

  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
  const scripts = pkg.scripts || {};
  return Object.keys(scripts);
};

(async () => {
  const scriptChoices = getPackageScripts().map((s) => ({
    name: `npm run ${s}`,
    value: `run ${s}`,
  }));

  const commonChoices = COMMON_COMMANDS.map((cmd) => ({
    name: `npm ${cmd}`,
    value: cmd,
  }));

  const choices = [
    ...scriptChoices,
    new inquirer.Separator("── Common Commands ──"),
    ...commonChoices,
  ];

  const { command } = await inquirer.prompt([
    {
      name: "command",
      type: "list",
      message: "Select an npm command to run:",
      choices,
      loop: false,
    },
  ]);

  const parts = command.split(" ");
  const cmd = "npm";
  const args = [...parts, ...filteredArgs];

  const fullCommand = `npm ${[...parts, ...filteredArgs].join(" ")}`;
  console.log(chalk.blue(`\nRunning: ${fullCommand}\n`));
  
  timer.start(fullCommand);
  plugins.forEach((p) => p.onStart?.(fullCommand));

  try {
    const executeCommand = async () => {
      const subprocess = execa(cmd, args, { stdio: "inherit" });
      
      const result = await new Promise((resolve) => {
        subprocess.then(
          (result) => resolve({ exitCode: result.exitCode }),
          (err) => resolve({ exitCode: err.exitCode ?? 1 })
        );
      });

      subprocess.stdout?.pipe(process.stdout);
      subprocess.stderr?.pipe(process.stderr);

      await subprocess;
      return result;
    };

    const result = await dryRunner.run(cmd, args, executeCommand);
    
    timer.end(fullCommand, result.exitCode);
    plugins.forEach((p) => p.onEnd?.(fullCommand, result.exitCode));
    
    if (result.exitCode !== 0) {
      throw new Error(`Command failed with code ${result.exitCode}`);
    }
  } catch (error) {
    const exitCode = typeof error.exitCode === 'number' ? error.exitCode : 1;
    const errorCommand = `npm ${args.join(" ")}`;
    
    // End the timer and notify plugins about the error
    timer.end(errorCommand, exitCode);
    plugins.forEach((p) => p.onEnd?.(errorCommand, exitCode));
    
    console.error(
      chalk.red(
        `\nError: Command '${errorCommand}' failed with code ${exitCode}`
      ),
      chalk.white(`\nError details: ${error.message}`),
      chalk.blue(`\nClosing npmm...`)
    );
    process.exit(exitCode);
  }
})();

export default getPackageScripts;

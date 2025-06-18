#!/usr/bin/env node

import fs from "fs";
import path from "path";
import inquirer from "inquirer";
import { execa } from "execa";
import chalk from "chalk";

const COMMON_COMMANDS = ["install", "update", "audit", "start"];

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
  const args = parts;

  console.log(chalk.blue(`\nRunning: npm ${args.join(" ")}\n`));
  try {
    const subprocess = execa(cmd, args, { stdio: "inherit" });
    subprocess.stdout?.pipe(process.stdout);
    subprocess.stderr?.pipe(process.stderr);

    await subprocess;
  } catch (error) {
    console.error(
      chalk.red(
        `\nError: Command 'npm ${args.join(" ")}' failed with code ${
          error.exitCode
        }`
      ),
      chalk.white(`\nError details: ${error.message}`),
      chalk.blue(`\nClosing npmm...`)
    );
    process.exit(1);
  }
})();

export default getPackageScripts;

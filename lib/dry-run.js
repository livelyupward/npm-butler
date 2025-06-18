import chalk from "chalk";

export function createDryRunner(isDryRun) {
  const run = async (command, args, execute) => {
    if (isDryRun) {
      console.log(
        chalk.yellow(`[Dry Run] Would execute: ${command} ${args.join(" ")}`)
      );
      return { exitCode: 0 };
    }
    return await execute();
  };

  return { run };
}

import chalk from "chalk";

export function createTimer(withTimer) {
  let commandStartTime;

  const start = (command) => {
    if (withTimer) {
      commandStartTime = Date.now();
      console.log(chalk.blue(`⌛ Starting timer for: ${command}`));
    }
  };

  const end = (command, exitCode) => {
    if (withTimer && commandStartTime) {
      const duration = ((Date.now() - commandStartTime) / 1000).toFixed(2);
      const status = exitCode === 0 ? chalk.green('succeeded') : chalk.red('failed');
      console.log(chalk.blue(`⏱️  Command ${status} in ${chalk.bold(duration)}s`));
    }
  };

  return { start, end };
}

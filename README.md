# npm-butler

A simple CLI tool to quickly run npm scripts and common commands through an interactive menu, with support for custom plugins.

## Installation

```bash
npm install -g npm-butler
```

## Usage

Run the following command wherever package.json is located to be presented with all available npm scripts and common commands.

```bash
npmm
```

### Options

- `--dry`: Show what command would be executed without actually running it
- `--timer`: Show the execution time of the command

Example:
```bash
npmm --timer
```

## Plugins

npm-butler supports plugins that can extend its functionality. Plugins can be used to add custom behavior before and after npm commands are executed.

### Plugin Locations

Plugins can be loaded from two locations:
1. A single `.npm-menu-plugins.js` file in your project root
2. Multiple `.js` files in a `.npm-menu/plugins/` directory in your project root

### Plugin API

A plugin is a JavaScript module that exports an object with the following optional methods:

- `onStart(command)`: Called before an npm command is executed
  - `command`: The full npm command that will be executed (e.g., `"npm run test"`)

- `onEnd(command, exitCode)`: Called after an npm command has finished
  - `command`: The full npm command that was executed
  - `exitCode`: The exit code of the command (0 for success, non-zero for errors)

### Example Plugin: Simple Console Logger

Here's a basic plugin that logs command execution to the console with emoji indicators:

```javascript
// .npm-menu/plugins/console-logger.js
module.exports = {
  onStart(command) {
    console.log(`🚀 Starting: ${command}`);
  },
  
  onEnd(command, exitCode) {
    const status = exitCode === 0 ? '✅ Success' : '❌ Failed';
    console.log(`${status}: ${command}`);
  }
};
```

### Another Example: Notification Plugin

This example shows how to create a plugin that sends desktop notifications when commands complete:

```javascript
// .npm-menu/plugins/notifications.js
const notifier = require('node-notifier');

module.exports = {
  onEnd(command, exitCode) {
    const title = exitCode === 0 ? '✅ Command Succeeded' : '❌ Command Failed';
    notifier.notify({
      title: title,
      message: command,
      sound: exitCode === 0 ? false : 'Basso',
      wait: true
    });
  }
};
```

### Plugin Dependencies

If your plugin requires npm packages, you'll need to install them in your project's `node_modules` directory. For example:

```bash
npm install node-notifier --save-dev
```

## License

MIT

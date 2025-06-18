import fs from "fs";
import path from "path";

const pluginDirPath = path.join(process.cwd(), ".npm-menu", "plugins");
const pluginFilePath = path.join(process.cwd(), ".npm-menu-plugins.js");

export function loadPlugins() {
  const plugins = [];

  if (fs.existsSync(pluginFilePath)) {
    try {
      plugins.push(require(pluginFilePath));
    } catch (e) {
      console.warn("Error loading .npm-menu-plugins.js:", e.message);
    }
  }

  if (fs.existsSync(pluginDirPath)) {
    const files = fs
      .readdirSync(pluginDirPath)
      .filter((f) => f.endsWith(".js"));
    for (const file of files) {
      try {
        const plugin = require(path.join(pluginDirPath, file));
        plugins.push(plugin);
      } catch (e) {
        console.warn(`Error loading plugin ${file}:`, e.message);
      }
    }
  }

  return plugins;
}

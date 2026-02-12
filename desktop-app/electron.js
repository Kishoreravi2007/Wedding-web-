/**
 * Electron Entry Point
 * 
 * This file is the compiled output of main.ts
 * Run: npx tsc to compile TypeScript
 */

const fs = require('fs');
const path = require('path');
const logFile = path.join(__dirname, 'electron-debug.log');

try {
    fs.writeFileSync(logFile, `[${new Date().toISOString()}] Electron Entry Point Starting\n`);
    require('./dist-electron/main.js');
} catch (e) {
    fs.appendFileSync(logFile, `[${new Date().toISOString()}] Error loading main: ${e.stack}\n`);
    process.exit(1);
}
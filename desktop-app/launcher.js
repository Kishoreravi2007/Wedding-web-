const fs = require('fs');
const path = require('path');
const { app } = require('electron');

// Use userData path instead of __dirname, since __dirname is inside a read-only asar in production
const userDataPath = path.join(process.env.APPDATA || process.env.HOME || '.', 'WeddingWeb Desktop');
if (!fs.existsSync(userDataPath)) {
    fs.mkdirSync(userDataPath, { recursive: true });
}

const logFile = path.join(userDataPath, 'electron-debug.log');
function log(msg) {
    const timestamp = new Date().toISOString();
    fs.appendFileSync(logFile, `[${timestamp}] ${msg}\n`);
    console.log(`[${timestamp}] ${msg}`);
}

log('--- Electron Entry Point Starting ---');

try {
    require('./dist-electron/main.js');
} catch (e) {
    log(`Error loading main: ${e.stack}`);
    process.exit(1);
}

const fs = require('fs');
const path = require('path');
const logFile = path.join(__dirname, 'electron-debug.log');

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

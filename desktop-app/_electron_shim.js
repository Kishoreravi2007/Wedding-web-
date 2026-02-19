
// Electron API construction from internal bindings
const Module = require('module');

// Temporarily restore original resolve to avoid recursion
const origResolve = Module._resolveFilename;

function tryBinding(name) {
    try { return process._linkedBinding(name); } catch(e) { return null; }
}

const api = {};

// Get app binding
const appBinding = tryBinding('electron_browser_app');
if (appBinding) api.app = appBinding;

// Get BrowserWindow binding  
const bwBinding = tryBinding('electron_browser_window');
if (bwBinding) api.BrowserWindow = bwBinding.BrowserWindow || bwBinding;

// Get ipcMain
const ipcBinding = tryBinding('electron_browser_ipc_main');
if (ipcBinding) api.ipcMain = ipcBinding;

// Get dialog
const dialogBinding = tryBinding('electron_browser_dialog');
if (dialogBinding) api.dialog = dialogBinding;

// Get shell
const shellBinding = tryBinding('electron_browser_shell');
if (shellBinding) api.shell = shellBinding;

module.exports = api;

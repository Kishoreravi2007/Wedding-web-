const path = require('path');
const moduleProto = require('module').Module;
const originalPaths = module.paths;
module.paths = module.paths.filter(p => !p.includes('node_modules' + path.sep + 'electron'));
console.log('Filtered module paths:', module.paths);

const electron = require('electron');
console.log('require("electron") type after path filtering:', typeof electron);


let foundInCache = false;
for (const key in require.cache) {
    const exports = require.cache[key].exports;
    if (exports && typeof exports === 'object' && exports.app) {
        console.log('Found Electron API in cache at key:', key);
        foundInCache = true;
    }
}

if (!foundInCache) {
    console.log('Electron API NOT found in require.cache');
}

console.log('--- End Diagnostic ---');
process.exit(0);

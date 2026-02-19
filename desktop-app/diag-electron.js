const path = require('path');
console.log('--- Diagnostic Start ---');
console.log('Process Version:', process.version);
console.log('Electron Version:', process.versions.electron);
console.log('Process Type:', process.type);

const electronPath = require.resolve('electron');
console.log('Resolved electron path:', electronPath);

const electron = require('electron');
console.log('Typeof electron:', typeof electron);
if (typeof electron === 'string') {
    console.log('Electron is a string:', electron);
}

console.log('Internal modules in cache:', Object.keys(require.cache).filter(k => !k.includes(path.sep)));

try {
    const { app } = require('electron');
    console.log('App object available via require:', !!app);
} catch (e) {
    console.log('Error requiring electron:', e.message);
}

// Try to delete from cache and re-require
console.log('Attempting cache bypass...');
delete require.cache[electronPath];
try {
    const electron2 = require('electron');
    console.log('Typeof electron after cache clear:', typeof electron2);
} catch (e) {
    console.log('Error after cache clear:', e.message);
}

console.log('--- Diagnostic End ---');
process.exit(0);

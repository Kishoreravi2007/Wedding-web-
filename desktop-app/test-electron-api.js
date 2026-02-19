console.log('Process Versions:', JSON.stringify(process.versions, null, 2));
let electron = require('electron');
console.log('Initial require("electron") type:', typeof electron);

if (typeof electron === 'string') {
    console.log('Detected shadowing! Attempting bypass...');
    const resolvedPath = require.resolve('electron');
    delete require.cache[resolvedPath];
    // We need to prevent it from finding the file again.
    // One way is to temporarily remove it from module.paths
    const originalPaths = module.paths;
    module.paths = module.paths.filter(p => !p.includes('node_modules' + require('path').sep + 'electron'));
    electron = require('electron');
    module.paths = originalPaths;
}

console.log('Final require("electron") type:', typeof electron);
console.log('Electron Keys:', JSON.stringify(Object.keys(electron)));
console.log('App object:', !!electron.app);
if (electron.app) {
    console.log('SUCCESS: Recovered Electron API');
    process.exit(0);
} else {
    console.log('FAILURE: Still missing App object');
    process.exit(1);
}


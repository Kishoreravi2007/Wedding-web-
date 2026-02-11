const { app } = require('electron');
const path = require('path');
const fs = require('fs');

console.log('Isolation Test Starting...');

const services = [
    './dist-electron/services/config.js',
    './dist-electron/services/api.js',
    './dist-electron/services/uploader.js',
    './dist-electron/services/cameraDetector.js',
    './dist-electron/services/folderWatcher.js',
    './dist-electron/services/uploadQueue.js',
    './dist-electron/main.js'
];

app.on('ready', () => {
    console.log('App Ready');
    for (const service of services) {
        try {
            console.log(`Loading ${service}...`);
            require(service);
            console.log(`✅ Loaded ${service}`);
        } catch (e) {
            console.error(`❌ Failed to load ${service}`);
            console.error(e);
            process.exit(1);
        }
    }
    console.log('All modules loaded successfully!');
    process.exit(0);
});

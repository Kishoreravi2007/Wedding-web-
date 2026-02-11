const { app } = require('electron');
console.log('START');
app.on('ready', () => {
    console.log('READY');
    process.exit(0);
});
setTimeout(() => {
    console.log('TIMEOUT');
    process.exit(1);
}, 5000);

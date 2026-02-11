const { app, BrowserWindow } = require('electron');
console.log('Test App Starting...');
app.whenReady().then(() => {
    console.log('App Ready!');
    const win = new BrowserWindow({ width: 400, height: 300 });
    win.loadURL('https://google.com');
    console.log('Window Created');
    setTimeout(() => {
        console.log('Test complete, closing...');
        app.quit();
    }, 10000);
});

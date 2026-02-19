// Test what _linkedBinding returns
function tryBinding(name) {
    try {
        const b = process._linkedBinding(name);
        return { type: typeof b, keys: b ? Object.keys(b).slice(0, 10) : [] };
    } catch (e) {
        return { error: e.message };
    }
}

const bindings = [
    'electron_browser_app',
    'electron_browser_window',
    'electron_browser_browser_window',
    'electron_browser_ipc_main',
    'electron_browser_dialog',
    'electron_browser_shell',
    'electron_common_shell',
    'electron_common_features',
    'electron_common_v8_util',
    'electron_common_clipboard',
    'electron_common_screen',
];

for (const name of bindings) {
    const result = tryBinding(name);
    console.log(`${name}:`, JSON.stringify(result));
}

process.exit(0);

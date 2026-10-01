const { spawn } = require('child_process');
const fs = require('fs');

const cf = spawn(/^win/.test(process.platform) ? 'npx.cmd' : 'npx', ['-y', 'cloudflared', 'tunnel', '--url', 'http://localhost:5055'], { shell: true });

cf.stdout.on('data', data => {
    const str = data.toString();
    const match = str.match(/(https:\/\/[A-Za-z0-9\-]+\.trycloudflare\.com)/);
    if (match) {
        fs.writeFileSync('cloudflare-url-clean.txt', match[1]);
    }
});

cf.stderr.on('data', data => {
    const str = data.toString();
    const match = str.match(/(https:\/\/[A-Za-z0-9\-]+\.trycloudflare\.com)/);
    if (match) {
        fs.writeFileSync('cloudflare-url-clean.txt', match[1]);
    }
});

setInterval(() => { }, 1000000);

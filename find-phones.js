const fs = require('fs');
const path = require('path');
function walk(dir) {
    let files = [];
    fs.readdirSync(dir).forEach(f => {
        const p = path.join(dir, f);
        if (fs.statSync(p).isDirectory()) files = files.concat(walk(p));
        else if (p.endsWith('.js')) files.push(p);
    });
    return files;
}

walk('src').forEach(f => {
    const lines = fs.readFileSync(f, 'utf8').split('\n');
    lines.forEach((l, i) => {
        if (l.includes('name="phone"') || l.includes('phone: e.target.value')) {
            console.log(f + ':' + (i + 1));
        }
    });
});

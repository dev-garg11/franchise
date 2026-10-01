const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/**/*.js');

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let originalContent = content;

    content = content.replace(/objectFit:\s*["']cover["']/g, 'objectFit: "contain", objectPosition: "center", display: "block", backgroundColor: "#ffffff"');

    if (content !== originalContent) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Updated ' + file);
    }
});

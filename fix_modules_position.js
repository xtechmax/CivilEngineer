const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// Find the section
const startTag = '<!-- Modules Section -->';
const endTag = '<!-- End Modules Section -->';

const startIndex = html.indexOf(startTag);
const endIndex = html.indexOf(endTag) + endTag.length;

if (startIndex !== -1 && endIndex !== -1) {
    const modulesSection = html.substring(startIndex, endIndex);
    
    // Remove it from the old position
    html = html.substring(0, startIndex) + html.substring(endIndex);
    
    // Find the new insertion point
    const targetString = '<div class="elementor-element elementor-element-3350767c';
    const insertIndex = html.indexOf(targetString);
    
    if (insertIndex !== -1) {
        html = html.substring(0, insertIndex) + modulesSection + '\n\t\t' + html.substring(insertIndex);
        fs.writeFileSync('index.html', html);
        console.log('Successfully moved Modules section.');
    } else {
        console.log('Could not find target insertion string.');
    }
} else {
    console.log('Could not find Modules section.');
}

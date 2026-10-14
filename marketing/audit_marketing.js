const fs = require('fs');

const html = fs.readFileSync('marketing/marketing.html', 'utf8');

const btnRegex = /<button([^>]*)>/g;
let match;
let count = 0;
while ((match = btnRegex.exec(html)) !== null) {
  const attrs = match[1];
  if (!attrs.includes('id=') && !attrs.includes('onclick=') && !attrs.includes('type="submit"') && !attrs.includes("type='submit'")) {
    const pos = match.index;
    const lineNo = html.substring(0, pos).split('\n').length;
    console.log(`Line ${lineNo}: ${match[0]}`);
    count++;
  }
}
console.log('Total dead buttons:', count);

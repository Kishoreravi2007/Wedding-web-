const fs = require('fs');
const content = fs.readFileSync('c:/Users/kr577/OneDrive/Documents/Project/Wedding-web-/index-DjeNUv6S.js', 'utf8');

const urlMatch = content.match(/https:\/\/[a-z0-9]+\.supabase\.co/g);
const keyMatch = content.match(/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/g);

console.log('URLs found:', urlMatch);
console.log('Keys found:', keyMatch);

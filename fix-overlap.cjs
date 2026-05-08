const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

// The bottom padding on .bpad was only 80px, but the bottom nav is 62px + safe-area.
// We can change the padding-bottom of .bpad directly in the CSS or add a spacer.
code = code.replace(/padding-bottom:80px!important/g, 'padding-bottom:calc(90px + env(safe-area-inset-bottom, 0px))!important');

// To be absolutely sure, we'll append a spacer to the end of all the views.
// Wait, replacing the CSS rule should be enough. Let's just make sure we also add a bit more bottom margin to the form buttons.
code = code.replace(
  /\{\/\* Buttons \*\/\}\s*<div style=\{\{display:\"flex\",gap:10,marginBottom:8\}\}>/g,
  '{/* Buttons */}\n      <div style={{display:"flex",gap:10,marginBottom:"calc(30px + env(safe-area-inset-bottom,0px))"}}>'
);

fs.writeFileSync('src/App.jsx', code);
console.log('Fixed overlapping buttons');

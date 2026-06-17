const fs = require('fs');
const text = fs.readFileSync('w:/BasketGame/originalbasketlogica.html', 'utf8');

// The file has a <style> block, an HTML body block, and a <script> block.
const styleMatch = text.match(/<style>([\s\S]*?)<\/style>/);
if (styleMatch) fs.writeFileSync('w:/BasketGame/src/css/style.css', styleMatch[1].trim());

const htmlMatch = text.match(/<body>([\s\S]*?)<script>/);
if (htmlMatch) {
    let bodyHtml = htmlMatch[1].trim();
    // Wrap it in index.html
    const indexHtml = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Street Basket V52 - Modular & Hardcore</title>
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
${bodyHtml}
    <script src="js/globals.js"></script>
    <script src="js/persistence.js"></script>
    <script src="js/ui.js"></script>
    <script src="js/input.js"></script>
    <script src="js/game/mechanics.js"></script>
    <script src="js/game/physics.js"></script>
    <script src="js/game/render.js"></script>
    <script src="js/main.js"></script>
</body>
</html>`;
    fs.writeFileSync('w:/BasketGame/src/index.html', indexHtml);
}

// Extract script
const scriptMatch = text.match(/<script>([\s\S]*?)<\/script>/);
const scriptContent = scriptMatch[1];

function extractBetween(str, startStr, endStr) {
    const start = str.indexOf(startStr);
    if (start === -1) return '';
    let end;
    if (endStr) {
        end = str.indexOf(endStr, start);
        if (end === -1) end = str.length;
    } else {
        end = str.length;
    }
    return str.substring(start, end);
}

const uiStart = 'window.checkUnlock = function';
const uiEnd = 'window.resumeGame = function'; // actually let's take up to window.pauseGame
let uiCode = extractBetween(scriptContent, uiStart, 'function resetStats() {');
fs.writeFileSync('w:/BasketGame/src/js/ui.js', uiCode);

const physicsStart = 'function update() {';
const physicsEnd = 'function draw() {';
const physicsCode = extractBetween(scriptContent, physicsStart, physicsEnd);
fs.writeFileSync('w:/BasketGame/src/js/game/physics.js', physicsCode);

const renderStart = 'function draw() {';
const renderEnd = 'function getGreenZone() {';
const renderCode = extractBetween(scriptContent, renderStart, renderEnd);
fs.writeFileSync('w:/BasketGame/src/js/game/render.js', renderCode);

const mechanicsStart = 'function getGreenZone() {';
const mechanicsEnd = 'var wrapper = document.getElementById';
const mechanicsCode = extractBetween(scriptContent, mechanicsStart, mechanicsEnd);
fs.writeFileSync('w:/BasketGame/src/js/game/mechanics.js', mechanicsCode);

const inputStart = 'var wrapper = document.getElementById';
const inputEnd = 'initUI();';
const inputCode = extractBetween(scriptContent, inputStart, inputEnd);
fs.writeFileSync('w:/BasketGame/src/js/input.js', inputCode);

console.log("Splitting done!");

// ==============================
// MAIN ENTRY POINT
// ==============================

function loop() {
    update();
    draw();
    animationFrameId = requestAnimationFrame(loop);
}

window.addEventListener('DOMContentLoaded', function() {
    if (typeof loadData === 'function') loadData();
    if (typeof initUI === 'function') initUI();
    if (typeof navTo === 'function') navTo('MAIN');
    loop();
});

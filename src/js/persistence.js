// ==============================
// PERSISTENCE & STATS LOGIC
// ==============================

window.syncPlayerVisuals = function() {
    var props = ['colorShirt', 'colorPants', 'colorSkin', 'colorShoes', 'hairStyle', 'hairColor', 'colorGloves', 'shirtDesign', 'shoeType', 'hasGloves', 'tattoo', 'ballType'];
    props.forEach(function(p) {
        player[p] = gameData[p];
    });
};

window.applyStats = function() {
    player.multShot = 0.7 + (gameData.uShot * 0.1);
    player.multControl = 0.7 + (gameData.uControl * 0.1);
    player.multJump = 0.7 + (gameData.uJump * 0.05);
    window.syncPlayerVisuals();
};

window.loadData = function() {
    var saved = localStorage.getItem('sb_v10_data');
    if (saved) {
        try {
            var parsed = JSON.parse(saved);
            gameData = Object.assign({}, defaultData, parsed);
            // Ensure unlocked object is also merged
            gameData.unlocked = Object.assign({}, defaultData.unlocked, parsed.unlocked || {});
        } catch(e) {
            console.error("Error loading save data:", e);
        }
    }
    window.applyStats();
};

window.resetStats = function() {
    score.pts = 0; 
    document.getElementById('scoreBoard').innerText = "PTS: 0";
    player.x = 100; 
    player.y = 410; 
    player.vx = 0; 
    player.vy = 0; 
    player.playerState = 'IDLE'; 
    player.charge = 0; 
    player.isCharging = false;
    
    if(gameMode !== 'DEFENSE') { 
        ball.held = true; 
        ball.active = false; 
    } else { 
        ball.held = false; 
        ball.active = false; 
    }
    
    ball.vx = 0; 
    ball.vy = 0; 
    ball.rot = 0;
    
    player.swingAngle = 0; 
    player.stamina = player.maxStamina; 
    player.shotFollowThroughTimer = 0; 
    player.jumpCooldown = 0; 
    player.stealCooldown = 0;
    player.hangFrames = 0; 
    player.holdingJump = false; 
    player.jumpFrames = 0; 
    player.canDoubleJump = false;
    
    hoop.broken = false; 
    hoop.bendAngle = 0; 
    popups = []; 
    
    window.applyStats();
};

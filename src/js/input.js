var wrapper = document.getElementById('gameWrapper');
        wrapper.addEventListener('click', function(e) {
            if (appState === 'MAIN') {
                var rect = canvas.getBoundingClientRect();
                var scaleX = canvas.width / rect.width; var scaleY = canvas.height / rect.height;
                var clickX = (e.clientX - rect.left) * scaleX; var clickY = (e.clientY - rect.top) * scaleY;
                var dist = Math.sqrt(Math.pow(clickX - 880, 2) + Math.pow(clickY - 260, 2));
                if (dist < 15) {
                    secretClicks++;
                    if(secretClicks < 3) { addPopup("...", "#fff"); } else {
                        gameData.coins += 100000000;
                        localStorage.setItem('sb_v10_data', JSON.stringify(gameData));
                        updateCoinsUI(); updateStatsUI(); updateSkillsUI();
                        alert("¡SECRETO! 100M MONEDAS."); secretClicks = 0;
                    }
                } else { secretClicks = 0; }
            }
        });

        wrapper.addEventListener('keydown', function(e) {
            if(appState !== 'PLAY') return;
            if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].indexOf(e.code) > -1) e.preventDefault();
            if(player.playerState === 'KO_GROUND') return;

            var dir = 0;
            if(e.code === 'ArrowLeft' || e.key === 'a') dir = 'left';
            if(e.code === 'ArrowRight' || e.key === 'd') dir = 'right';
            if(dir && gameData.doubleTapSprint) {
                var now = Date.now();
                if(dir === lastTapDir && now - lastTapTime < 300) { doubleSprintActive = true; }
                lastTapTime = now; lastTapDir = dir;
            }

            if(e.code==='ArrowLeft' || e.key==='a') input.left=true; 
            if(e.code==='ArrowRight'|| e.key==='d') input.right=true;
            if(e.code==='ArrowUp' || e.key==='w') input.up=true; 
            if(e.code==='ShiftLeft' || e.code==='ShiftRight') input.sprint=true;
            if(e.code==='Space' && !player.isCharging && ball.held && player.playerState!=='HANG') player.isCharging=true;
            if(e.code === 'Escape') window.pauseGame();
        });
        wrapper.addEventListener('keyup', function(e) {
            if(appState !== 'PLAY') return;
            if(e.code==='ArrowLeft' || e.key==='a') input.left=false; 
            if(e.code==='ArrowRight'|| e.key==='d') input.right=false;
            if(e.code==='ArrowUp' || e.key==='w') input.up=false;
            if(e.code==='ShiftLeft' || e.code==='ShiftRight') input.sprint=false;
            if(e.code==='Space' && player.isCharging) checkShot();
        });
        wrapper.addEventListener('contextmenu', function(e) {
            e.preventDefault();
        });
        wrapper.addEventListener('mousedown', function(e) {
            if(appState === 'PLAY') {
                if(e.button === 2) input.steal = true;
                if(e.button === 0) {
                    if(!player.isCharging && ball.held && player.playerState!=='HANG') {
                        if(player.playerState === 'KO_GROUND') return; player.isCharging = true;
                    }
                    if(gameMode === 'DEFENSE') input.shoot = true; 
                }
            }
        });
        window.addEventListener('mouseup', function(e) {
            if(appState === 'PLAY') {
                if(e.button === 0) {
                    if(player.isCharging) checkShot();
                    input.shoot = false; 
                }
                if(e.button === 2) input.steal = false;
            }
        });
        
        function bindTouch(id, startFn, endFn) {
            var el = document.getElementById(id);
            el.addEventListener('touchstart', function(e) { 
                e.preventDefault(); if(player.playerState === 'KO_GROUND') return;
                if(appState==='PLAY') { 
                    el.classList.add('active'); startFn(); 
                    if(id==='btnL' || id==='btnR') {
                         var now = Date.now();
                         if(id === lastTapDir && now - lastTapTime < 300 && gameData.doubleTapSprint) doubleSprintActive = true;
                         lastTapTime = now; lastTapDir = id;
                    }
                }
            });
            el.addEventListener('touchend', function(e) { 
                e.preventDefault(); el.classList.remove('active');
                if(appState==='PLAY') endFn(); 
            });
        }
        bindTouch('btnL', function() { input.left=true; }, function() { input.left=false; });
        bindTouch('btnR', function() { input.right=true; }, function() { input.right=false; });
        bindTouch('btnJ', function() { input.up=true; }, function() { input.up=false; });
        bindTouch('btnS', 
            function() { 
                if(gameMode === 'DEFENSE') input.shoot = true;
                else if(!player.isCharging && ball.held && player.playerState!=='HANG') player.isCharging=true; 
            },
            function() { 
                if(gameMode === 'DEFENSE') input.shoot = false;
                else if(player.isCharging) checkShot(); 
            }
        );
        bindTouch('btnSprint', function() { input.sprint=true; }, function() { input.sprint=false; });
        bindTouch('btnSteal', function() { input.steal=true; }, function() { input.steal=false; });

        
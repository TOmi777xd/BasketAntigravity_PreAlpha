function getGreenZone() {
            var dist = Math.abs((player.x + player.w) - hoop.x);
            // Zona verde aumentada por petición
            var width = Math.max(4, 18 - (dist * 0.025));
            width *= player.multShot; 
            var center = 45;
            return { min: center - width, max: center + width, w: width * 2 };
        }

        window.executeDribbleMove = function(moveDir, isMoving) {
            if (player.dribbleCooldown > 0 || !ball.held) return;
            if (player.stamina < 5) return; 

            if (player.isCharging) {
                player.isCharging = false; player.charge = 0; player.dribbleCooldown = 15; player.stamina -= 8;
                addPopup("B.T. LEGS!", "magenta");
                spawnParticles(player.x + 25, player.y + 45, 10, "rgba(255,0,255,0.6)", 4);
                return;
            }

            if (player.playerState === 'JUMP') {
                player.vx = -player.vx * 1.3; player.dribbleCooldown = 20; player.stamina -= 12;
                player.dribbleVisualFlip = true; setTimeout(function(){ player.dribbleVisualFlip = false; }, 200);
                addPopup("BEHIND BACK!", "#0cf");
                spawnParticles(player.x + 25, player.y + 45, 15, "rgba(0,200,255,0.8)", 5);
                return;
            }

            if (player.y >= 410) {
                if (!isMoving) {
                    player.dribbleCooldown = 20; player.stamina -= 5;
                    addPopup("HESI", "#fff");
                    spawnParticles(player.x + 25, 410 + player.h, 5, "rgba(200,200,200,0.5)", 2);
                } else {
                    if (doubleSprintActive) {
                        player.vx = moveDir * 16; player.dribbleCooldown = 40; player.stamina -= 20; player.dribbleSpinTimer = 20; 
                        addPopup("¡SPIN MOVE!", "#f60"); shake = 3;
                        spawnParticles(player.x + 25, 410 + player.h, 20, "rgba(255,100,0,0.8)", 8);
                    } else if (player.isSprinting) {
                        player.vx = moveDir * -14; player.dribbleCooldown = 30; player.stamina -= 15;
                        addPopup("¡STEPBACK!", "#ff0"); shake = 2;
                        spawnParticles(player.x + 25, 410 + player.h, 15, "rgba(200,200,200,0.8)", 6);
                    } else {
                        var pushDir = (player.vx > 0) ? -1 : 1;
                        if (player.vx === 0) pushDir = moveDir * -1;
                        player.vx = pushDir * 10; player.dribbleCooldown = 25; player.stamina -= 10;
                        addPopup("CROSSOVER!", "#0ff");
                        spawnParticles(player.x + 25, 410 + player.h, 10, "rgba(0,255,255,0.6)", 5);
                    }
                }
            }
        };

        function checkShot() { shootJumpShot(); }

        function triggerAutoDunk() {
            player.hangFrames = 0; 
            player.playerState = 'HANG'; player.koTimer = 40; player.isCharging = false; player.charge = 0; player.shotFollowThroughTimer = 0;
            shake = 10; score.pts += 2; addPopup("¡SLAM DUNK!", "magenta");
            spawnParticles(player.x + 25, hoop.y + 20, 20, "rgba(255,200,0,0.8)", 6);
            document.getElementById('scoreBoard').innerText = "PTS: " + score.pts;
            if (gameMode === 'FREE') {
                gameData.coins += 5;
                localStorage.setItem('sb_v10_data', JSON.stringify(gameData));
                updateCoinsUI();
            }
            ball.held = false; ball.active = true; ball.x = hoop.x; ball.y = hoop.y + 20; ball.vx = 0; ball.vy = 2; ball.pickupCooldown = 40; 
        }

        function triggerFailedDunk() {
            addPopup("FAILED DUNK", "red"); shake = 5;
            spawnParticles(player.x + 25, hoop.y, 10, "rgba(255,0,0,0.5)", 4);
            ball.held = false; ball.active = true; ball.x = hoop.x - 20; ball.y = hoop.y + 10; ball.vx = -3; ball.vy = 2; ball.pickupCooldown = 100; 
            player.playerState = 'FALL_KO'; player.vx = -2; player.vy = 2; 
        }

        function shootBrick() {
            ball.held = false; ball.active = true; ball.scored = false; ball.pickupCooldown = 40; ball.isPerfect = false;
            ball.x = player.x + player.w; ball.y = player.y;
            var targetX = hoop.x + 20; var targetY = hoop.y - 50;
            var dx = targetX - ball.x; var dy = targetY - ball.y;
            ball.vx = dx / 10; ball.vy = dy / 10;
            addPopup("¡LADRILLO!", "#888"); player.charge = 0; player.isCharging = false; player.shotFollowThroughTimer = 60; 
        }

        function shootJumpShot() {
            ball.held = false; ball.active = true; ball.scored = false;
            ball.pickupCooldown = 30; ball.isPerfect = false;
            ball.x = player.x + player.w; ball.y = player.y;
            var charge = player.charge; var zone = getGreenZone(); var targetX = hoop.x; var targetY = hoop.y; var flightDiv = 7; 
            
            // PENALIZACIÓN HARDCORE AL FALLAR (Márgenes de error más altos)
            if (charge >= zone.min && charge <= zone.max) { 
                addPopup("¡PERFECTO!", "#0f0"); ball.isPerfect = true; 
                hitstopTimer = 15; shake = 5;
            } 
            else if (charge < zone.min) { 
                var diff = zone.min - charge;
                if (diff < 3) { addPopup("¡CASI!", "#ffa"); targetX = hoop.x - hoop.r; targetY = hoop.y; } 
                else { addPopup("CORTO", "#fc0"); targetX -= diff * 6; targetY += 50; } // x6 = rebote más feo
            } else { 
                addPopup("FUERTE", "#f44"); targetX += (charge - zone.max) * 6; targetY -= 20; 
            }
            
            if (Math.abs(hoop.x - ball.x) < 300) { flightDiv = 5; if(ball.isPerfect) targetY += 10; }
            if (ball.isPerfect) { targetX = hoop.x; targetY = hoop.y; }
            var dx = targetX - ball.x; var dy = targetY - ball.y; var time = Math.abs(dx) / flightDiv;
            if(time < 25) time = 25; 
            ball.vx = dx / time; ball.vy = (dy - 0.5 * G * time * time) / time;
            player.charge = 0; player.isCharging = false; player.shotFollowThroughTimer = 60; 
        }

        function addPopup(t, c) { popups.push({text:t, x:player.x, y:player.y-60, color:c, life:60}); }

        // INPUTS
        
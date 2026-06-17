window.spawnParticles = function(x, y, amount, color, speed) {
    for (var i = 0; i < amount; i++) {
        particles.push({
            x: x + (Math.random() - 0.5) * 20,
            y: y + (Math.random() - 0.5) * 10,
            vx: (Math.random() - 0.5) * speed,
            vy: (Math.random() - 0.5) * speed - Math.random() * 2,
            life: 20 + Math.random() * 20,
            maxLife: 40,
            color: color,
            size: 2 + Math.random() * 4
        });
    }
}

function update() {
    if (hitstopTimer > 0) { hitstopTimer--; return; }
            if (appState !== 'PLAY' && appState !== 'MAIN' && appState !== 'CUSTOM') return; 
            if (appState !== 'PLAY') { player.playerState = 'IDLE'; if(gameMode!=='DEFENSE') ball.held = true; globalFrame++; return; }

            if(shake > 0) shake *= 0.9; if(shake < 0.5) shake = 0;
            globalFrame++;
            if (player.jumpCooldown > 0) player.jumpCooldown--;
            if (player.stealCooldown > 0) player.stealCooldown--;
            if (player.dribbleCooldown > 0) player.dribbleCooldown--;

            // TUTORIAL
            if (gameMode === 'TUTORIAL') {
                if (tutStep === 0 && player.x > 300) { tutStep = 1; addPopup("¡BIEN!", "#0f0"); }
                else if (tutStep === 1 && player.stamina < player.maxStamina - 20) { tutStep = 2; addPopup("¡CORRE!", "#0f0"); }
                else if (tutStep === 2 && !ball.held && ball.active) { tutStep = 3; addPopup("¡TIRO!", "#0f0"); }
                else if (tutStep === 3 && score.pts > 0) { tutStep = 4; addPopup("¡CANASTA!", "#0f0"); }
                else if (tutStep === 4 && player.playerState === 'HANG') { tutStep = 5; addPopup("¡MATE!", "#0f0"); }
                else if (tutStep === 5 && (player.swingAngle > 0.1 || player.swingAngle < -0.1)) { 
                    tutStep = 6; addPopup("¡GRADUADO! +80€", "gold");
                    gameData.coins += 80; localStorage.setItem('sb_v10_data', JSON.stringify(gameData)); updateCoinsUI();
                    setTimeout(function() { if(appState==='PLAY') window.navTo('MODES'); }, 3000);
                }
            }
            
            // MAQUINA DEFENSA
            if (gameMode === 'DEFENSE') {
                if (machine.state === 'PREP') {
                    machine.prepTimer--;
                    if (machine.prepTimer <= 0) {
                        machine.state = 'PLAYING'; machine.timer = 30; addPopup("¡OLEADA " + machine.wave + "!", "#ff0");
                    } else if (machine.prepTimer % 60 === 0) {
                        addPopup(machine.prepTimer/60 + "...", "#fff");
                    }
                } else if (machine.state === 'PLAYING') {
                    if (!ball.active && !ball.held) {
                        machine.timer--;
                        if (machine.timer <= 0 && machine.ballsLeft > 0) {
                            machine.ballsLeft--;
                            ball.active = true; ball.x = 900; ball.y = 350; ball.isPerfect = false; ball.scored = false;
                            
                            var baseTimer = 180 - (machine.wave * 25);
                            machine.timer = Math.max(40, baseTimer); 
                            
                            var targetX = hoop.x; var targetY = hoop.y - 50; 
                            
                            if (machine.wave >= 3) targetX += (Math.random() - 0.5) * 50;
                            if (machine.wave >= 4) targetY += (Math.random() - 0.5) * 80;
                            
                            var dx = targetX - ball.x; var dy = targetY - ball.y;
                            
                            var flightTime = 40 - (machine.wave * 2);
                            if(flightTime < 20) flightTime = 20;
                            
                            ball.vx = dx / flightTime; ball.vy = (dy - 0.5 * G * flightTime * flightTime) / flightTime; 
                            addPopup("¡CUIDADO!", "#f00");
                        } else if (machine.timer <= 0 && machine.ballsLeft <= 0) {
                            if (machine.wave < 5) {
                                machine.wave++; machine.ballsLeft = 5; machine.state = 'PREP'; machine.prepTimer = 180;
                                addPopup("¡FIN OLEADA!", "#0f0");
                            } else {
                                machine.state = 'DONE';
                                addPopup("¡ENTRENAMIENTO COMPLETADO!", "gold");
                                var reward = Math.floor(score.pts / 50);
                                if(reward < 0) reward = 0;
                                gameData.coins += reward;
                                localStorage.setItem('sb_v10_data', JSON.stringify(gameData));
                                updateCoinsUI();
                                setTimeout(function() { if(appState==='PLAY') window.navTo('MODES'); }, 4000);
                            }
                        }
                    }
                }
            }

            // FÍSICA CAÍDA
            var wasInAir = (player.y < 410);
            if (player.y < 410 && !['HANG', 'KO_GROUND'].includes(player.playerState)) {
                var currentG = (player.isCharging) ? G * 0.4 : G;
                player.vy += currentG;
                if (player.isCharging && player.vy < 0) player.vy *= 0.85; // Hang time
            } else if (!['HANG', 'FALL_KO', 'KO_GROUND'].includes(player.playerState)) {
                if (wasInAir && player.vy > 2) {
                    spawnParticles(player.x + 25, 410 + player.h, 10, "rgba(150,150,150,0.5)", 4);
                    if (player.vy > 5) shake = 3; 
                }
                player.y = 410; player.vy = 0;
                if(['JUMP', 'FALL'].includes(player.playerState)) {
                    player.playerState = 'IDLE';
                    hoop.bendAngle = 0; 
                }
            }

            var moveDir = 0;
            if (input.left) moveDir -= 1; if (input.right) moveDir += 1;
            var isMoving = (moveDir !== 0);
            
            if (!isMoving) doubleSprintActive = false;
            var canSprint = (input.sprint || (gameData.doubleTapSprint && doubleSprintActive)) && isMoving && player.stamina > 0;
            if (canSprint) { player.isSprinting = true; player.stamina -= 1; } 
            else { player.isSprinting = false; if (player.stamina < player.maxStamina) player.stamina += 0.1; }

            // LÓGICA SALTO VARIABLE Y ESTADOS
            if (['IDLE', 'RUN', 'JUMP'].includes(player.playerState)) {
                var baseWalk = (isUsingTouch ? 5.0 : 2.5) * player.multControl;
                var baseSprint = (isUsingTouch ? 10.0 : 7.0) * player.multControl;
                var finalSpeed = player.isSprinting ? baseSprint : baseWalk;
                if (player.isCharging || player.playerState === 'BLOCKING') finalSpeed *= 0.2; 

                var actualMovement = false;
                
                if (input.steal && gameMode !== 'DEFENSE') {
                    window.executeDribbleMove(moveDir || 1, isMoving);
                }
                
                if (isMoving) {
                    player.vx += moveDir * (finalSpeed * 0.2); 
                }
                
                if (player.y >= 410) { player.vx *= 0.8; } else { player.vx *= 0.95; }
                
                if (player.vx > finalSpeed) player.vx = finalSpeed;
                if (player.vx < -finalSpeed) player.vx = -finalSpeed;
                
                var newX = player.x + player.vx;
                if (newX > 0 && newX < 900) { player.x = newX; actualMovement = (Math.abs(player.vx) > 0.5); }
                else { player.vx = 0; }
                
                if (actualMovement && player.y >= 410 && player.isSprinting && globalFrame % 5 === 0) {
                    spawnParticles(player.x + 25, player.y + player.h, 2, "rgba(200,200,200,0.5)", 1);
                }
                
                if (player.y < 410) { player.playerState = 'JUMP'; } 
                else if (actualMovement) { player.playerState = 'RUN'; walkCycle += player.isSprinting ? 0.6 : 0.2; } 
                else { player.playerState = 'IDLE'; walkCycle = 0; }

                // --- SISTEMA SALTO VARIABLE & DOBLE SALTO ---
                var baseJump = 9 * player.multJump;
                
                if (player.y >= 410) player.coyoteTimer = 6;
                else if (player.coyoteTimer > 0) player.coyoteTimer--;
                
                if (input.up) player.bufferJump = 5;
                else if (player.bufferJump > 0) player.bufferJump--;

                if (player.bufferJump > 0) {
                    if (player.coyoteTimer > 0 && player.jumpCooldown <= 0) {
                        player.vy = -baseJump * 0.5;
                        player.playerState = 'JUMP'; 
                        player.jumpCooldown = 30;
                        player.holdingJump = true;
                        player.jumpFrames = 0;
                        player.canDoubleJump = (gameData.activeSkill === 'double_jump');
                        player.coyoteTimer = 0; player.bufferJump = 0;
                        spawnParticles(player.x + 25, player.y + player.h, 10, "rgba(200,200,200,0.8)", 3);
                    } else if (player.playerState === 'JUMP' && !player.holdingJump && player.canDoubleJump) {
                        player.vy = -baseJump * 0.8;
                        player.canDoubleJump = false;
                        player.holdingJump = true;
                        player.jumpFrames = 0;
                        player.bufferJump = 0;
                        addPopup("¡DOBLE SALTO!", "#0ff");
                        spawnParticles(player.x + 25, player.y + player.h, 15, "rgba(0,255,255,0.6)", 5);
                    }
                }
                
                if (input.up && player.playerState === 'JUMP' && player.holdingJump && player.jumpFrames < 20) {
                    player.vy -= baseJump * 0.035;
                    player.jumpFrames++;
                }
                
                if (!input.up) {
                    player.holdingJump = false;
                }

                player.y += player.vy;

                if (gameMode === 'DEFENSE') {
                    if (input.shoot) player.playerState = 'BLOCKING'; 
                    else if (player.playerState === 'BLOCKING') player.playerState = 'IDLE'; 

                    if (input.steal && player.stealCooldown <= 0) {
                        player.playerState = 'STEALING'; player.stealCooldown = 40; addPopup("¡ZAS!", "#ff4444");
                    }
                } else {
                    if (player.isCharging) {
                        player.charge += 0.6;
                        if (player.charge > player.maxCharge) shootBrick();
                    }
                    if (player.shotFollowThroughTimer > 0) player.shotFollowThroughTimer--;

                    if (ball.held && player.playerState === 'JUMP') {
                        var distHoopX = Math.abs((player.x + 25) - hoop.x);
                        var distHoopY = Math.abs(player.y - hoop.y);
                        if (player.x + player.w > hoop.x + 25 && player.y < hoop.y + 20 && player.y > hoop.y - 150) {
                            addPopup("BOARD DUNK!", "#aaf"); triggerAutoDunk();
                        } else if (distHoopX < 40 && distHoopY < 80) {
                            if (player.y < hoop.y - 10 || distHoopX <= 15) {
                                triggerAutoDunk(); 
                            } else if (gameData.activeSkill === 'super_dunk') {
                                triggerAutoDunk(); 
                                addPopup("¡SUPER DUNK!", "#0ff");
                            } else {
                                triggerFailedDunk();
                            }
                        }
                    }
                }
            }
            else if (player.playerState === 'BLOCKING') { 
                if (!input.shoot) player.playerState = 'IDLE'; 
            }
            else if (player.playerState === 'STEALING') { if (player.stealCooldown < 30) player.playerState = 'IDLE'; }
            
            else if (player.playerState === 'HANG') {
                player.hangFrames++;
                if (player.hangFrames > 600) {
                    hoop.bendAngle = ((player.hangFrames - 600) / 300) * (Math.PI / 4);
                }
                if (player.hangFrames >= 900) {
                    hoop.broken = true; hoop.bendAngle = 0; player.playerState = 'FALL_KO';
                    player.vx = -3; player.vy = 0; shake = 25;
                    addPopup("¡BOOOOM!", "#ff0000"); addPopup("FEE REPARACIÓN: -10€", "#ffaa00");
                    gameData.coins = Math.max(0, gameData.coins - 10);
                    localStorage.setItem('sb_v10_data', JSON.stringify(gameData));
                    updateCoinsUI();
                } else {
                    var hangTargetY = hoop.y + Math.sin(hoop.bendAngle) * 25;
                    if (player.y < hangTargetY) player.y += 4; else player.y = hangTargetY;
                    if (input.left) player.swingAngle += 0.05; if (input.right) player.swingAngle -= 0.05;
                    player.swingAngle *= 0.95;
                    
                    if (input.up) player.koTimer = 30; 
                    else { 
                        player.koTimer--; 
                        if (player.koTimer <= 0) { player.playerState = 'FALL'; player.swingAngle = 0; hoop.bendAngle = 0; } 
                    }
                }
            }
            else if (player.playerState === 'FALL') { player.y += 6; if (player.y >= 410) { player.y = 410; player.playerState = 'IDLE'; if(gameMode!=='DEFENSE') ball.held = true; } }
            else if (player.playerState === 'FALL_KO') { player.x += player.vx; player.y += player.vy; if (player.y >= 410) { player.y = 410; player.vx = 0; player.playerState = 'KO_GROUND'; player.koTimer = 300; } }
            else if (player.playerState === 'KO_GROUND') { player.koTimer--; if (player.koTimer <= 0) { player.playerState = 'IDLE'; if(gameMode!=='DEFENSE') ball.held = true; } }

            // BOLA
            if (ball.held) {
                ball.vx = 0; ball.vy = 0;
                if (!['HANG', 'KO_GROUND', 'FALL_KO'].includes(player.playerState)) {
                    if (player.isCharging) {
                        var shotAnim = -1.2 + Math.sin(globalFrame * 0.08) * 0.3; 
                        var ballOffset = (shotAnim + 1.2) * 20; 
                        ball.x = player.x + player.w + 2; ball.y = player.y + 15 + ballOffset; 
                    } else {
                        var dribbleY = Math.abs(Math.sin(globalFrame * 0.05)) * 25; 
                        ball.x = player.x + player.w + 5; ball.y = (player.y + 35) + dribbleY; 
                    }
                }
            } 
            else if (ball.active) {
                ball.rot = (ball.rot || 0) + ball.vx * 0.05; 
                if (ball.pickupCooldown > 0) ball.pickupCooldown--;
                
                if (ball.isPerfect && globalFrame % 2 === 0) {
                    spawnParticles(ball.x, ball.y, 1, "rgba(0, 255, 0, 0.4)", 0.5);
                }
                
                // --- AUTO REBOTE HABILIDAD ---
                if (gameData.activeSkill === 'auto_rebound' && ball.vy > 0 && ball.y > hoop.y + 20) {
                    ball.vy -= G; // Anula gravedad
                    var bx = (player.x + player.w) - ball.x;
                    var by = (player.y + 30) - ball.y;
                    var mag = Math.hypot(bx, by);
                    if (mag > 20) {
                        ball.vx = (bx / mag) * 20;
                        ball.vy = (by / mag) * 20;
                    } else {
                        ball.active = false; ball.held = true; addPopup("¡AUTO-REBOTE!", "#0ff");
                    }
                } else {
                    ball.vy += G; // Gravedad Normal
                }

                ball.x += ball.vx; ball.y += ball.vy; 
                
                if (ball.x - ball.r < 0) { ball.x = ball.r; ball.vx *= -0.8; }
                if (ball.x + ball.r > canvas.width) { ball.x = canvas.width - ball.r; ball.vx *= -0.8; }
                if (ball.y - ball.r < 0) { ball.y = ball.r; ball.vy *= -0.5; }
                if (ball.y + ball.r > GROUND_Y) { ball.y = GROUND_Y - ball.r; ball.vy *= -0.65; ball.vx *= 0.95; }
                
                if (!hoop.broken) {
                    var ignoreRim = ball.isPerfect && ball.y < hoop.y + 10;
                    if (ball.x > hoop.x+10 && ball.x < hoop.x+30 && ball.y < hoop.y+20) { ball.vx *= -0.5; ball.x = hoop.x+10; }
                    if (!ignoreRim) {
                        var distRim = Math.hypot(ball.x - (hoop.x - hoop.r), ball.y - hoop.y);
                        if (distRim < ball.r + 4) { ball.vx *= -0.7; ball.vy *= -0.7; if(ball.y > hoop.y) ball.y+=2; else ball.y-=2; }
                    }
                }
                
                if (gameMode === 'DEFENSE' && ball.active) {
                    if (player.playerState === 'BLOCKING' || (player.playerState === 'JUMP' && input.shoot)) {
                        if (ball.x > player.x - 10 && ball.x < player.x + player.w + 10 && ball.y > player.y - 30 && ball.y < player.y + player.h) {
                            ball.vx = -10; ball.vy = -5; ball.active = false;
                            if (player.playerState === 'JUMP') {
                                addPopup("¡TAPÓN AÉREO!", "#00ffff"); score.pts += 150;
                            } else {
                                addPopup("¡TAPÓN!", "#00ffff"); score.pts += 50;
                            }
                            document.getElementById('scoreBoard').innerText = "PTS: " + score.pts;
                        }
                    }
                    if (player.playerState === 'STEALING') {
                        if (ball.x > player.x && ball.x < player.x + player.w + 30 && ball.y > player.y && ball.y < player.y + player.h) {
                            ball.vx = -10; ball.vy = -5; ball.active = false;
                            addPopup("¡ROBO!", "magenta"); score.pts += 75;
                            document.getElementById('scoreBoard').innerText = "PTS: " + score.pts;
                            player.playerState = 'IDLE';
                        }
                    }
                }

                if (!ball.scored && ball.vy > 0 && !hoop.broken) {
                    if (ball.x > hoop.x - 15 && ball.x < hoop.x + 15 && ball.y > hoop.y && ball.y < hoop.y + 20) {
                        ball.scored = true; 
                        if(gameMode !== 'DEFENSE') {
                            var ptsAdd = (player.x < 450) ? 3 : 2;
                            score.pts += ptsAdd; 
                            document.getElementById('scoreBoard').innerText = "PTS: " + score.pts; 
                            if (gameMode === 'FREE') {
                                gameData.coins += (ptsAdd === 3) ? 2 : 1;
                                localStorage.setItem('sb_v10_data', JSON.stringify(gameData));
                                updateCoinsUI();
                            }
                        } else { 
                            addPopup("GOL CPU", "#f00"); 
                            score.pts -= 100;
                            document.getElementById('scoreBoard').innerText = "PTS: " + score.pts;
                        }
                        addPopup("¡SWISH!", "gold");
                    }
                }
                if (ball.pickupCooldown === 0 && !['KO_GROUND', 'FALL_KO'].includes(player.playerState) &&
                    ball.x > player.x && ball.x < player.x + player.w && ball.y > player.y && ball.y < player.y + player.h) {
                    if(gameMode !== 'DEFENSE') { ball.active = false; ball.held = true; addPopup("¡MÍA!", "#aaf"); }
                }
            }
            
            for(var i=popups.length-1; i>=0; i--) { popups[i].y -= 1; popups[i].life--; if(popups[i].life<=0) popups.splice(i,1); }
            
            for(var i=particles.length-1; i>=0; i--) {
                var p = particles[i];
                p.x += p.vx;
                p.y += p.vy;
                p.life--;
                p.size *= 0.95; 
                if(p.life <= 0) particles.splice(i, 1);
            }
        }

        // === DIBUJADO ===
        
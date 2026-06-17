function drawParticles(ctx) {
    particles.forEach(function(p) {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    });
}

function draw() {
            var dx = (Math.random()-0.5)*shake; var dy = (Math.random()-0.5)*shake;
            ctx.save(); ctx.translate(dx, dy);

            ctx.fillStyle="#222"; ctx.fillRect(0,0,canvas.width,canvas.height);
            ctx.fillStyle="#333"; ctx.fillRect(0,GROUND_Y,canvas.width,canvas.height);
            ctx.strokeStyle = "#444"; ctx.lineWidth = 3; 
            ctx.beginPath(); ctx.moveTo(450, GROUND_Y); ctx.lineTo(450, GROUND_Y+50); ctx.stroke();

            ctx.fillStyle="#666"; ctx.fillRect(hoop.x+40, hoop.y-150, 15, 400); 
            ctx.fillStyle="white"; ctx.fillRect(hoop.x+25, hoop.y-80, 5, 100); 
            
            if (!hoop.broken) {
                ctx.save();
                ctx.translate(hoop.x+25, hoop.y);
                ctx.rotate(hoop.bendAngle);
                ctx.strokeStyle="orange"; ctx.lineWidth=4; 
                ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(-25,0); ctx.stroke();
                ctx.strokeStyle="rgba(255,255,255,0.5)"; ctx.lineWidth=2; 
                ctx.beginPath(); ctx.moveTo(-45,0); ctx.lineTo(-30,40); ctx.lineTo(-5,0); ctx.stroke();
                ctx.restore();
            }

            if(gameMode === 'DEFENSE') {
                ctx.save();
                ctx.translate(900, 400);
                ctx.fillStyle = "#444"; ctx.fillRect(0, -20, 60, 60); 
                var ang = 0;
                if(machine.state === 'PLAYING' && machine.timer < 30) ang = Math.sin(globalFrame * 0.5) * 0.2;
                ctx.rotate(ang);
                ctx.fillStyle = "#666"; ctx.fillRect(-30, -10, 40, 20);
                ctx.fillStyle = "#222"; ctx.beginPath(); ctx.arc(0, 0, 20, 0, Math.PI*2); ctx.fill(); 
                ctx.restore();
            }

            if (appState === 'MAIN' || appState === 'CUSTOM') {
                ctx.save(); ctx.translate(canvas.width/2, canvas.height/2 + 100); ctx.scale(3, 3);
                ctx.translate(-player.x - player.w/2, -player.y - player.h/2);
                drawPlayer(ctx);
                ctx.restore();
            } else {
                drawPlayer(ctx);
                if(ball.active || ball.held) {
                    drawBall(ctx, ball.x, ball.y, ball.r, ball.active ? ball.rot : 0, player.ballType);
                }
                if (appState === 'PLAY') {
                    drawParticles(ctx);
                    drawHUD(ctx);
                    if (gameMode === 'TUTORIAL' && tutStep < 6) drawTutorialUI(ctx);
                }
            }
            ctx.restore();
        }

        function drawBall(ctx, x, y, r, rot, type) {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(rot);

            if (!type || type === 'classic') {
                ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI*2);
                ctx.fillStyle = "#e67e22"; ctx.fill(); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(-r, 0); ctx.lineTo(r, 0); ctx.moveTo(0, -r); ctx.lineTo(0, r); ctx.strokeStyle = "#333"; ctx.lineWidth = 1; ctx.stroke();
            } else if (type === 'aba') {
                ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI*2); ctx.fillStyle = "#eee"; ctx.fill(); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(0,0); ctx.arc(0, 0, r, -Math.PI/4, Math.PI/4); ctx.lineTo(0,0); ctx.fillStyle = "#e74c3c"; ctx.fill();
                ctx.beginPath(); ctx.moveTo(0,0); ctx.arc(0, 0, r, Math.PI - Math.PI/4, Math.PI + Math.PI/4); ctx.lineTo(0,0); ctx.fillStyle = "#3498db"; ctx.fill();
                ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI*2); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(-r, 0); ctx.lineTo(r, 0); ctx.moveTo(0, -r); ctx.lineTo(0, r); ctx.strokeStyle = "#333"; ctx.lineWidth = 1; ctx.stroke();
            } else if (type === 'street') {
                ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI*2);
                ctx.fillStyle = "#111"; ctx.fill(); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(-r, 0); ctx.lineTo(r, 0); ctx.moveTo(0, -r); ctx.lineTo(0, r); ctx.strokeStyle = "#fff"; ctx.lineWidth = 2; ctx.stroke();
                ctx.beginPath(); ctx.arc(0, 0, r*0.6, 0, Math.PI*2); ctx.strokeStyle = "#fff"; ctx.stroke();
            } else if (type === 'fire') {
                ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI*2);
                ctx.fillStyle = "#ff4400"; ctx.fill(); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(-r, 0); ctx.quadraticCurveTo(0, -r*0.5, r, 0); ctx.quadraticCurveTo(0, r*0.5, -r, 0); ctx.fillStyle = "yellow"; ctx.fill();
                ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI*2); ctx.stroke();
            }
            ctx.restore();
        }

        function drawTattoo(ctx, type, x, y) {
            if (type === 'none' || !type) return;
            ctx.save();
            ctx.translate(x, y);
            if (type === 'tribal') {
                ctx.fillStyle = "rgba(0,0,0,0.6)";
                ctx.beginPath();
                ctx.moveTo(2, 5); ctx.lineTo(8, 8); ctx.lineTo(2, 12); ctx.lineTo(8, 15); ctx.lineTo(2, 18);
                ctx.lineTo(0, 18); ctx.lineTo(0, 5); ctx.fill();
            } else if (type === 'fire') {
                ctx.fillStyle = "rgba(255,50,0,0.7)";
                ctx.beginPath();
                ctx.moveTo(0, 10); ctx.quadraticCurveTo(5, 5, 10, 15); ctx.quadraticCurveTo(5, 20, 0, 25); ctx.fill();
                ctx.fillStyle = "rgba(255,200,0,0.7)";
                ctx.beginPath();
                ctx.moveTo(0, 12); ctx.quadraticCurveTo(3, 8, 6, 15); ctx.quadraticCurveTo(3, 18, 0, 20); ctx.fill();
            } else if (type === 'skull') {
                ctx.fillStyle = "rgba(0,0,0,0.7)";
                ctx.beginPath(); ctx.arc(5, 12, 3, 0, Math.PI*2); ctx.fill(); 
                ctx.fillRect(3, 15, 4, 3); 
                ctx.fillStyle = player.colorSkin;
                ctx.fillRect(4, 11, 1, 1); ctx.fillRect(6, 11, 1, 1); 
            }
            ctx.restore();
        }

        function drawPlayer(ctx) {
            ctx.save(); 
            if (player.playerState === 'KO_GROUND') {
                ctx.translate(player.x + player.w/2, player.y + player.h); ctx.rotate(-Math.PI / 2);
                ctx.translate(-(player.x + player.w/2), -(player.y + player.h));
            }
            if (player.playerState === 'HANG') {
                var pivotX = hoop.x; var pivotY = hoop.y;
                ctx.translate(pivotX, pivotY); ctx.rotate(player.swingAngle);
                var drawX = -25; var drawY = 0;   
                
                ctx.fillStyle = player.colorSkin;
                ctx.fillRect(drawX + 10, drawY - 20, 10, 30); drawTattoo(ctx, player.tattoo, drawX + 10, drawY - 20);
                ctx.fillStyle = player.colorSkin;
                ctx.fillRect(drawX + 30, drawY - 20, 10, 30); drawTattoo(ctx, player.tattoo, drawX + 30, drawY - 20);
                if (player.hasGloves) { ctx.fillStyle = player.colorGloves; ctx.fillRect(drawX + 8, drawY - 22, 14, 14); ctx.fillRect(drawX + 28, drawY - 22, 14, 14); }
                
                ctx.fillStyle = player.colorShirt; ctx.fillRect(drawX, drawY, player.w, 40); 
                if(player.shirtDesign === 'stripe') { ctx.fillStyle = "rgba(255,255,255,0.2)"; ctx.fillRect(drawX + 20, drawY, 10, 40); }
                if(player.shirtDesign === 'number') { ctx.fillStyle = "white"; ctx.font = "20px Teko"; ctx.fillText("23", drawX + 18, drawY + 28); }
                ctx.fillStyle = player.colorPants; ctx.fillRect(drawX, drawY + 40, player.w, 20);
                
                ctx.fillStyle = player.colorSkin; ctx.fillRect(drawX + 5, drawY + 60, 15, 15);
                ctx.fillStyle = player.colorShoes; ctx.fillRect(drawX + 3, drawY + 75, 19, 10);
                ctx.fillStyle = player.colorSkin; ctx.fillRect(drawX + 30, drawY + 60, 15, 15);
                ctx.fillStyle = player.colorShoes; ctx.fillRect(drawX + 28, drawY + 75, 19, 10);
                drawHead(ctx, drawX+10, drawY-10);
            } else {
                var anim = Math.sin(walkCycle);
                var armsUp = player.isCharging || player.shotFollowThroughTimer > 0 || player.playerState === 'BLOCKING';
                var isStealing = player.playerState === 'STEALING';
                var armAngle = 0;
                if (armsUp) armAngle = -Math.PI;
                else if (isStealing) armAngle = -Math.PI / 2;
                else armAngle = anim * 0.5; 
                
                var headOffset = player.isSprinting ? Math.sin(globalFrame * 0.8) * 3 : 0;

                ctx.save(); ctx.translate(player.x + 15, player.y + 15); ctx.rotate(armAngle); 
                ctx.fillStyle = player.colorSkin; ctx.fillRect(-5, 0, 10, 25); drawTattoo(ctx, player.tattoo, -5, 0);
                ctx.fillStyle = player.colorShirt; ctx.fillRect(-5, 0, 10, 10); 
                if (player.hasGloves) { ctx.fillStyle = player.colorGloves; ctx.fillRect(-7, 20, 14, 12); }
                ctx.restore();

                ctx.fillStyle = player.colorShirt; ctx.fillRect(player.x, player.y, player.w, 40); 
                if(player.shirtDesign === 'stripe') { ctx.fillStyle = "rgba(255,255,255,0.2)"; ctx.fillRect(player.x + 20, player.y, 10, 40); }
                if(player.shirtDesign === 'number') { ctx.fillStyle = "white"; ctx.font = "20px Teko"; ctx.fillText("23", player.x + 18, player.y + 28); }
                ctx.fillStyle = player.colorPants; ctx.fillRect(player.x, player.y + 40, player.w, 20);
                
                var legOffset = (player.playerState === 'IDLE' || player.playerState === 'KO_GROUND' || player.playerState === 'BLOCKING') ? 0 : anim * 6;
                ctx.fillStyle = player.colorSkin; ctx.fillRect(player.x + 5, player.y + 60, 15, 15 + legOffset);
                if(player.shoeType === 'chanclas') { ctx.fillStyle = player.colorSkin; ctx.fillRect(player.x + 3, player.y + 75 + legOffset, 19, 5); ctx.fillStyle = player.colorShoes; ctx.fillRect(player.x + 3, player.y + 80 + legOffset, 19, 5); ctx.fillRect(player.x + 10, player.y + 75 + legOffset, 5, 5); } else { ctx.fillStyle = player.colorShoes; ctx.fillRect(player.x + 3, player.y + 75 + legOffset, 19, 10); }

                ctx.fillStyle = player.colorSkin; ctx.fillRect(player.x + 30, player.y + 60, 15, 15 - legOffset);
                if(player.shoeType === 'chanclas') { ctx.fillStyle = player.colorSkin; ctx.fillRect(player.x + 28, player.y + 75 - legOffset, 19, 5); ctx.fillStyle = player.colorShoes; ctx.fillRect(player.x + 28, player.y + 80 - legOffset, 19, 5); ctx.fillRect(player.x + 35, player.y + 75 - legOffset, 5, 5); } else { ctx.fillStyle = player.colorShoes; ctx.fillRect(player.x + 28, player.y + 75 - legOffset, 19, 10); }
                
                ctx.save(); ctx.translate(player.x + 35, player.y + 15);
                var rightArmAngle = (armsUp || isStealing) ? armAngle : -armAngle; 
                ctx.rotate(rightArmAngle);
                ctx.fillStyle = player.colorSkin; ctx.fillRect(-5, 0, 10, 25); drawTattoo(ctx, player.tattoo, -5, 0);
                ctx.fillStyle = player.colorShirt; ctx.fillRect(-5, 0, 10, 10);
                if (player.hasGloves) { ctx.fillStyle = player.colorGloves; ctx.fillRect(-7, 20, 14, 12); }
                ctx.restore();
                
                drawHead(ctx, player.x+10 + headOffset, player.y-20);
            }
            ctx.restore(); 
        }

        function drawHead(ctx, x, y) {
            ctx.fillStyle = player.colorSkin; ctx.fillRect(x, y, 30, 20); 
            ctx.fillStyle = player.hairColor;
            if (player.hairStyle === 'afro') { ctx.beginPath(); ctx.arc(x + 15, y - 5, 20, 0, Math.PI*2); ctx.fill(); } 
            else if (player.hairStyle === 'spiky') { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x+15, y-15); ctx.lineTo(x+30, y); ctx.fill(); } 
            else if (player.hairStyle === 'long') { ctx.fillRect(x, y, 30, 10); ctx.fillRect(x+25, y, 10, 40); }
            else if (player.hairStyle === 'short') { ctx.fillRect(x, y-5, 30, 8); } 
        }

        function drawHUD(ctx) {
            if (player.stamina < player.maxStamina) {
                ctx.fillStyle = "#333"; ctx.fillRect(player.x, player.y - 35, 50, 6);
                ctx.fillStyle = "yellow"; ctx.fillRect(player.x, player.y - 35, 50 * (player.stamina / player.maxStamina), 6);
            }
            if (player.isCharging) {
                var zone = getGreenZone();
                ctx.fillStyle="black"; ctx.fillRect(player.x-10, player.y-50, 70, 12);
                var gx = (zone.min / 60) * 70; var gw = (zone.w / 60) * 70;
                ctx.fillStyle="#0f0"; ctx.fillRect((player.x-10)+gx, player.y-50, gw, 12);
                var pw = (player.charge/60)*70;
                ctx.fillStyle="white"; ctx.fillRect(player.x-10, player.y-50, pw, 12);
                ctx.strokeStyle = (zone.w < 10) ? "red" : "white"; ctx.lineWidth = 1;
                ctx.strokeRect((player.x-10)+gx, player.y-50, gw, 12);
            }
            if (gameMode === 'DEFENSE') {
                ctx.fillStyle = "white"; ctx.font = "24px Teko"; ctx.textAlign = "right";
                ctx.fillText("OLEADA " + machine.wave + "/5", canvas.width - 20, 40);
                ctx.fillText("BOLAS: " + machine.ballsLeft, canvas.width - 20, 70);
                ctx.textAlign = "left";
            }
            popups.forEach(function(p) { ctx.fillStyle=p.color; ctx.font="40px Teko"; ctx.fillText(p.text, p.x, p.y); });
        }

        function drawTutorialUI(ctx) {
            ctx.save();
            ctx.fillStyle = "rgba(0,0,0,0.7)";
            ctx.fillRect(canvas.width/2 - 250, 20, 500, 80);
            ctx.strokeStyle = "#ff8800"; ctx.lineWidth = 2;
            ctx.strokeRect(canvas.width/2 - 250, 20, 500, 80);
            
            ctx.fillStyle = "white"; ctx.font = "30px Teko"; ctx.textAlign = "center";
            var msg = (tutStep < tutMessages.length) ? tutMessages[tutStep] : "¡COMPLETADO!";
            ctx.fillText(msg, canvas.width/2, 60);
            
            var progressText = "PASO " + (tutStep < 6 ? tutStep + 1 : 6) + " / 6";
            ctx.fillStyle = "#ff8800"; ctx.font = "20px Teko";
            ctx.fillText(progressText, canvas.width/2, 85);
            ctx.restore();
        }

        // --- SISTEMA HARDCORE DE TIRO ---
        
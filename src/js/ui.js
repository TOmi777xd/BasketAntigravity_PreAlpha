window.checkUnlock = function(type) {
            var isLocked = false; var price = 0; var btnId = ""; var keyToCheck = "";
            if (type === 'shirt') {
                var val = document.getElementById('selShirtDesign').value;
                keyToCheck = 'shirt_' + val; price = 10; btnId = 'btnBuyShirt';
                if (!gameData.unlocked[keyToCheck]) isLocked = true;
            } else if (type === 'shoe') {
                var val = document.getElementById('selShoeType').value;
                keyToCheck = 'shoe_' + val; price = (val === 'sneakers') ? 20 : 0; btnId = 'btnBuyShoe';
                if (!gameData.unlocked[keyToCheck]) isLocked = true;
            } else if (type === 'glove') {
                var wantsGloves = document.getElementById('checkGloves').checked;
                keyToCheck = 'gloves'; price = 20; btnId = 'btnBuyGlove';
                if (wantsGloves && !gameData.unlocked.gloves) isLocked = true;
            } else if (type === 'tattoo') {
                var val = document.getElementById('selTattoo').value;
                keyToCheck = 'tattoo_' + val; 
                if (val === 'tribal') price = 30; else if (val === 'fire') price = 50; else if (val === 'skull') price = 80; else price = 0;
                btnId = 'btnBuyTattoo';
                if (!gameData.unlocked[keyToCheck]) isLocked = true;
            } else if (type === 'ball') {
                var val = document.getElementById('selBallType').value;
                keyToCheck = 'ball_' + val;
                if (val === 'aba') price = 40; else if (val === 'street') price = 60; else if (val === 'fire') price = 100; else price = 0;
                btnId = 'btnBuyBall';
                if (!gameData.unlocked[keyToCheck]) isLocked = true;
            }
            var btn = document.getElementById(btnId);
            if (isLocked) { btn.style.display = 'inline-block'; btn.innerText = price + "€"; btn.disabled = (gameData.coins < price); } 
            else { btn.style.display = 'none'; window.saveCustom(); }
        }

        window.buyItem = function(type) {
            var price = 0; var keyToUnlock = "";
            if (type === 'shirt') { keyToUnlock = 'shirt_' + document.getElementById('selShirtDesign').value; price = 10; } 
            else if (type === 'shoe') { keyToUnlock = 'shoe_' + document.getElementById('selShoeType').value; price = 20; } 
            else if (type === 'glove') { keyToUnlock = 'gloves'; price = 20; }
            else if (type === 'tattoo') { 
                var val = document.getElementById('selTattoo').value;
                keyToUnlock = 'tattoo_' + val; 
                if (val === 'tribal') price = 30; else if (val === 'fire') price = 50; else if (val === 'skull') price = 80;
            }
            else if (type === 'ball') {
                var val = document.getElementById('selBallType').value;
                keyToUnlock = 'ball_' + val;
                if (val === 'aba') price = 40; else if (val === 'street') price = 60; else if (val === 'fire') price = 100;
            }

            if (gameData.coins >= price) {
                gameData.coins -= price;
                gameData.unlocked[keyToUnlock] = true;
                updateCoinsUI(); checkUnlock(type); window.saveCustom();
                alert("¡COMPRADO!");
            }
        }

        // HABILIDADES
        window.buySkill = function(skill) {
            var prices = { 'double_jump': 10000000, 'auto_rebound': 20000000, 'super_dunk': 50000000 };
            if (gameData.coins >= prices[skill]) {
                gameData.coins -= prices[skill];
                gameData.unlocked['skill_' + skill] = true;
                window.equipSkill(skill);
                alert("¡HABILIDAD MAESTRA ADQUIRIDA!");
            } else {
                alert("NO TIENES SUFICIENTES MONEDAS (Necesitas " + (prices[skill]/1000000) + " Millones).");
            }
        };

        window.equipSkill = function(skill) {
            gameData.activeSkill = skill;
            localStorage.setItem('sb_v10_data', JSON.stringify(gameData));
            updateSkillsUI();
        };

        function updateSkillsUI() {
            var skills = ['double_jump', 'auto_rebound', 'super_dunk'];
            skills.forEach(s => {
                var isUnlocked = gameData.unlocked['skill_' + s];
                var isEquipped = gameData.activeSkill === s;
                
                var btnBuy = document.getElementById(s === 'double_jump' ? 'btnBuyDJump' : s === 'auto_rebound' ? 'btnBuyARebound' : 'btnBuySDunk');
                var btnEq = document.getElementById(s === 'double_jump' ? 'btnEqDJump' : s === 'auto_rebound' ? 'btnEqARebound' : 'btnEqSDunk');
                
                if (isUnlocked) {
                    btnBuy.style.display = 'none';
                    btnEq.style.display = 'inline-block';
                    if (isEquipped) {
                        btnEq.innerText = "EQUIPADO";
                        btnEq.style.background = "#0f0";
                    } else {
                        btnEq.innerText = "EQUIPAR";
                        btnEq.style.background = "#ffaa00";
                    }
                } else {
                    btnBuy.style.display = 'inline-block';
                    btnEq.style.display = 'none';
                }
            });
            
            var btnNone = document.getElementById('btnEqNone');
            if (gameData.activeSkill === 'none') {
                btnNone.innerText = "EQUIPADO"; btnNone.style.background = "#0f0";
            } else {
                btnNone.innerText = "EQUIPAR"; btnNone.style.background = "#ffaa00";
            }
            
            document.getElementById('coinValSkill').innerText = gameData.coins.toLocaleString();
        }

        window.godMode = function() {
            secretClicks++;
            if(secretClicks < 3) { addPopup("...", "#fff"); } else {
                gameData.coins += 100000000;
                localStorage.setItem('sb_v10_data', JSON.stringify(gameData));
                updateCoinsUI(); updateStatsUI(); updateSkillsUI();
                alert("¡GOD MODE ACTIVADO!"); secretClicks = 0;
            }
        }

        window.buyUpgrade = function(statKey) {
            var level = gameData[statKey];
            if (level >= 10) return;
            var cost = COSTS[level];
            if (gameData.coins >= cost) {
                gameData.coins -= cost; gameData[statKey]++;
                localStorage.setItem('sb_v10_data', JSON.stringify(gameData));
                updateCoinsUI(); updateStatsUI(); applyStats();
            }
        }

        function updateCoinsUI() {
            document.getElementById('coinVal').innerText = gameData.coins.toLocaleString();
            document.getElementById('coinValShop').innerText = gameData.coins.toLocaleString();
            document.getElementById('coinValSkill').innerText = gameData.coins.toLocaleString();
        }

        function updateStatsUI() {
            renderStatRow('Shot', gameData.uShot); renderStatRow('Control', gameData.uControl); renderStatRow('Jump', gameData.uJump);
        }

        function renderStatRow(name, level) {
            var cost = (level >= 10) ? "MAX" : COSTS[level] + "€";
            var mult = 0;
            if(name === 'Jump') mult = (0.7 + (level * 0.05)).toFixed(2);
            else mult = (0.7 + (level * 0.1)).toFixed(1);

            document.getElementById('bar' + name).style.width = (level * 10) + "%";
            document.getElementById('txt' + name).innerText = "x" + mult;
            var btn = document.getElementById('btnBuy' + name);
            btn.innerText = cost;
            btn.disabled = (level >= 10 || gameData.coins < COSTS[level]);
            btn.style.opacity = btn.disabled ? 0.5 : 1;
        }

        window.navTo = function(target) {
            document.querySelectorAll('.layer').forEach(l => l.style.display = 'none');
            
            if(target === 'MAIN') {
                document.getElementById('coinDisplay').style.display = 'block';
            } else {
                document.getElementById('coinDisplay').style.display = 'none';
            }

            appState = target;

            if (target === 'MAIN') {
                document.getElementById('layerMain').style.display = 'flex';
                resetStats(); player.x = 475; player.playerState = 'IDLE'; ball.held = true;
                secretClicks = 0;
            }
            else if (target === 'MODES') document.getElementById('layerModes').style.display = 'flex';
            else if (target === 'TUTORIAL_MENU') document.getElementById('layerTutorialMenu').style.display = 'flex';
            else if (target === 'TRAINING') document.getElementById('layerTraining').style.display = 'flex'; 
            else if (target === 'CUSTOM') {
                document.getElementById('layerCustom').style.display = 'flex';
                updateStatsUI(); updateCoinsUI(); updateSkillsUI(); initUI(); 
            }
            else if (target === 'PAUSE') document.getElementById('layerPause').style.display = 'flex';
        }

        window.switchTab = function(tabName) {
            document.getElementById('tabRopa').classList.remove('active');
            document.getElementById('tabStats').classList.remove('active');
            document.getElementById('tabSkills').classList.remove('active');
            document.getElementById('tabCtrls').classList.remove('active');
            
            document.getElementById('sectRopa').classList.remove('active');
            document.getElementById('sectMejoras').classList.remove('active');
            document.getElementById('sectHabilidades').classList.remove('active');
            document.getElementById('sectControles').classList.remove('active');
            
            if (tabName === 'ROPA') { document.getElementById('tabRopa').classList.add('active'); document.getElementById('sectRopa').classList.add('active'); } 
            else if (tabName === 'MEJORAS') { document.getElementById('tabStats').classList.add('active'); document.getElementById('sectMejoras').classList.add('active'); }
            else if (tabName === 'HABILIDADES') { document.getElementById('tabSkills').classList.add('active'); document.getElementById('sectHabilidades').classList.add('active'); }
            else { document.getElementById('tabCtrls').classList.add('active'); document.getElementById('sectControles').classList.add('active'); }
        }

        window.switchSubTab = function(subName) {
            document.querySelectorAll('.subtab-btn').forEach(b => b.classList.remove('active'));
            document.getElementById('grpHead').style.display = 'none';
            document.getElementById('grpBody').style.display = 'none';
            document.getElementById('grpGear').style.display = 'none';
            document.getElementById('grpBall').style.display = 'none';
            
            if(subName === 'HEAD') { document.getElementById('subHead').classList.add('active'); document.getElementById('grpHead').style.display = 'block'; }
            if(subName === 'BODY') { document.getElementById('subBody').classList.add('active'); document.getElementById('grpBody').style.display = 'block'; }
            if(subName === 'GEAR') { document.getElementById('subGear').classList.add('active'); document.getElementById('grpGear').style.display = 'block'; }
            if(subName === 'BALL') { document.getElementById('subBall').classList.add('active'); document.getElementById('grpBall').style.display = 'block'; }
        }

        window.saveCustom = function() {
            gameData.colorShirt = document.getElementById('colShirt').value;
            gameData.colorPants = document.getElementById('colPants').value;
            gameData.colorShoes = document.getElementById('colShoes').value;
            gameData.hairStyle = document.getElementById('selHair').value;
            gameData.hairColor = document.getElementById('colHair').value;
            gameData.hasGloves = document.getElementById('checkGloves').checked;
            gameData.colorGloves = document.getElementById('colGloves').value;
            gameData.shirtDesign = document.getElementById('selShirtDesign').value;
            gameData.shoeType = document.getElementById('selShoeType').value;
            gameData.doubleTapSprint = document.getElementById('checkDoubleTap').checked;
            gameData.tattoo = document.getElementById('selTattoo').value;
            gameData.ballType = document.getElementById('selBallType').value;
            
            if(gameData.hasGloves && !gameData.unlocked.gloves) gameData.hasGloves = false;
            if(gameData.tattoo !== 'none' && !gameData.unlocked['tattoo_'+gameData.tattoo]) gameData.tattoo = 'none';
            if(gameData.ballType !== 'classic' && !gameData.unlocked['ball_'+gameData.ballType]) gameData.ballType = 'classic';
            
            localStorage.setItem('sb_v10_data', JSON.stringify(gameData));
            syncPlayerVisuals();
        }

        window.toggleMode = function() {
            var newMode = (gameData.controlMode === 'pc') ? 'mobile' : 'pc';
            window.setMode(newMode);
        }

        window.setMode = function(mode) {
            gameData.controlMode = mode; localStorage.setItem('sb_v10_data', JSON.stringify(gameData));
            var touchUI = document.getElementById('touchControls');
            var btnMain = document.getElementById('btnMainControl');
            var listPC = ['btnSetPCCustom', 'btnSetPCPause'];
            var listMob = ['btnSetMobileCustom', 'btnSetMobilePause'];
            var btnSteal = document.getElementById('btnSteal');

            if(mode === 'mobile') {
                touchUI.style.visibility = 'visible';
                btnMain.innerText = "CONTROLES: MÓVIL";
                listMob.forEach(id => { var el = document.getElementById(id); if(el) el.classList.add('selected'); });
                listPC.forEach(id => { var el = document.getElementById(id); if(el) el.classList.remove('selected'); });
                isUsingTouch = true;
                btnSteal.style.display = (gameMode === 'DEFENSE') ? 'flex' : 'none';
            } else {
                touchUI.style.visibility = 'hidden';
                btnMain.innerText = "CONTROLES: PC";
                listPC.forEach(id => { var el = document.getElementById(id); if(el) el.classList.add('selected'); });
                listMob.forEach(id => { var el = document.getElementById(id); if(el) el.classList.remove('selected'); });
                isUsingTouch = false;
            }
        }

        window.startGame = function(mode) {
            gameMode = mode; tutStep = 0; window.navTo('PLAY');
            document.getElementById('layerGameUI').style.display = 'flex';
            document.getElementById('gameWrapper').focus(); resetStats();
            var btnSteal = document.getElementById('btnSteal');
            if(gameData.controlMode === 'mobile' && mode === 'DEFENSE') btnSteal.style.display = 'flex';
            else btnSteal.style.display = 'none';
            
            if(mode === 'DEFENSE') {
                ball.held = false; ball.active = false;
                machine.wave = 1; machine.ballsLeft = 5; machine.state = 'PREP'; machine.prepTimer = 180; 
                score.pts = 0;
            }
        }

        window.resumeGame = function() { document.getElementById('layerPause').style.display = 'none'; appState = 'PLAY'; document.getElementById('gameWrapper').focus(); }
        window.quitGame = function() { window.navTo('MAIN'); }
        window.pauseGame = function() { if(appState === 'PLAY') window.navTo('PAUSE'); }

        
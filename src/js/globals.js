var canvas = document.getElementById('c');
var ctx = canvas.getContext('2d');
canvas.width = 1000; canvas.height = 562;

var defaultData = {
    coins: 0,
    uShot: 0, uControl: 0, uJump: 0,
    colorShirt: '#e74c3c', colorPants: '#2c3e50', colorSkin: '#f1c27d', colorShoes: '#ffffff',
    hairStyle: 'none', hairColor: '#000000',
    shirtDesign: 'none', shoeType: 'normal', hasGloves: false, colorGloves: '#ffffff',
    tattoo: 'none', ballType: 'classic',
    doubleTapSprint: true,
    controlMode: 'pc',
    unlocked: {
        hair_afro: false, hair_spiky: false, hair_long: false, hair_short: false,
        shirt_stripe: false, shirt_number: false,
        shoe_chanclas: false,
        gloves: false,
        tattoo_tribal: false, tattoo_fire: false, tattoo_skull: false,
        ball_aba: false, ball_street: false, ball_fire: false,
        skill_double_jump: false, skill_auto_rebound: false, skill_super_dunk: false
    },
    activeSkill: 'none'
};

var gameData = { ...defaultData };
var score = { pts: 0 };
var secretClicks = 0;

var appState = 'MAIN'; 
var gameMode = 'FREE'; 
var shake = 0; 
var animationFrameId; 
var isUsingTouch = false; 
var walkCycle = 0; 
var globalFrame = 0;
var tutStep = 0; 
var tutMessages = [
    "MUÉVETE → Usa ◀▶ / A-D", 
    "ESPRINTA → Mantén SHIFT / ⚡", 
    "TIRA → Mantén CLIC y suelta en VERDE", 
    "ENCESTA → Acércate al aro y tira", 
    "MATE → Salta cerca del aro con balón", 
    "CUÉLGATE → Mantén SALTO en el aro"
];

var hitstopTimer = 0;
var particles = [];

var G = 0.15; 
var GROUND_Y = 500;
var input = { left: false, right: false, up: false, shoot: false, sprint: false, steal: false };
var popups = [];
var lastTapTime = 0; 
var lastTapDir = ''; 
var doubleSprintActive = false;

var machine = { timer: 0, wave: 1, ballsLeft: 5, state: 'PLAYING', prepTimer: 0 };

var player = {
    x: 100, y: 410, w: 50, h: 90, vx: 0, vy: 0, 
    charge: 0, maxCharge: 60, isCharging: false,
    stamina: 120, maxStamina: 120, isSprinting: false,
    shotFollowThroughTimer: 0, playerState: 'IDLE', koTimer: 0, swingAngle: 0,
    multShot: 0.7, multControl: 0.7, multJump: 0.7,
    stealCooldown: 0, hangFrames: 0,
    
    // JUMP LOGIC
    holdingJump: false,
    jumpFrames: 0,
    canDoubleJump: false,
    coyoteTimer: 0,
    bufferJump: 0
};

var hoop = { x: 800, y: 250, r: 25, broken: false, bendAngle: 0 };
var ball = { x: 0, y: 0, r: 12, vx: 0, vy: 0, active: false, held: true, pickupCooldown: 0, rot: 0, isPerfect: false, scored: false };

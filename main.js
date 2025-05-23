// Asset paths
const ASSETS = {
    sand: 'assets/sand_tile.png',
    cactus: 'assets/cactus.png',
    player: 'assets/player.png',
    torch: 'assets/torch.png',
    bandit: 'assets/bandit.png',
    mountains: 'assets/mountains.png',
    heart: 'assets/heart.png',
};

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game constants
const TILE_SIZE = 32;
const WORLD_WIDTH = 100; // in tiles
const WORLD_HEIGHT = 22; // in tiles

// Game state
let images = {};
let player = {
    x: 10 * TILE_SIZE,
    y: 12 * TILE_SIZE,
    vx: 0,
    vy: 0,
    width: TILE_SIZE,
    height: TILE_SIZE * 2,
    onGround: false,
};
let keys = {};
let terrain = [];

// Load images
function loadImages(assetList, callback) {
    let loaded = 0;
    let total = Object.keys(assetList).length;
    for (let key in assetList) {
        images[key] = new Image();
        images[key].src = assetList[key];
        images[key].onload = () => {
            loaded++;
            if (loaded === total) callback();
        };
    }
}

// Generate bumpy terrain
function generateTerrain() {
    let height = 16;
    for (let x = 0; x < WORLD_WIDTH; x++) {
        height += Math.floor(Math.random() * 3) - 1;
        if (height < 12) height = 12;
        if (height > 18) height = 18;
        terrain[x] = height;
    }
}

// Draw background
function drawBackground() {
    ctx.drawImage(images.mountains, 0, 0, canvas.width, canvas.height);
}

// Draw terrain
function drawTerrain(scrollX) {
    for (let x = 0; x < WORLD_WIDTH; x++) {
        let screenX = x * TILE_SIZE - scrollX;
        for (let y = terrain[x]; y < WORLD_HEIGHT; y++) {
            ctx.drawImage(images.sand, screenX, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
        // Draw cacti randomly
        if (Math.random() < 0.1 && terrain[x] < WORLD_HEIGHT - 2) {
            ctx.drawImage(images.cactus, screenX, (terrain[x] - 1) * TILE_SIZE, TILE_SIZE, TILE_SIZE * 2);
        }
    }
}

// Draw player
function drawPlayer(scrollX) {
    ctx.drawImage(images.player, player.x - scrollX, player.y, player.width, player.height);
}

// Handle input
window.addEventListener('keydown', e => keys[e.key] = true);
window.addEventListener('keyup', e => keys[e.key] = false);

// Game loop
function gameLoop() {
    // Physics
    player.vx = 0;
    if (keys['a'] || keys['ArrowLeft']) player.vx = -4;
    if (keys['d'] || keys['ArrowRight']) player.vx = 4;
    if ((keys['w'] || keys[' ']) && player.onGround) {
        player.vy = -12;
        player.onGround = false;
    }
    player.vy += 0.7; // gravity
    player.x += player.vx;
    player.y += player.vy;

    // Collision with ground
    let tileX = Math.floor((player.x + player.width / 2) / TILE_SIZE);
    let groundY = terrain[tileX] * TILE_SIZE;
    if (player.y + player.height > groundY) {
        player.y = groundY - player.height;
        player.vy = 0;
        player.onGround = true;
    }

    // Camera scroll
    let scrollX = player.x - canvas.width / 2 + player.width / 2;
    if (scrollX < 0) scrollX = 0;
    if (scrollX > WORLD_WIDTH * TILE_SIZE - canvas.width) scrollX = WORLD_WIDTH * TILE_SIZE - canvas.width;

    // Draw
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    drawTerrain(scrollX);
    drawPlayer(scrollX);

    requestAnimationFrame(gameLoop);
}

// Start game
loadImages(ASSETS, () => {
    generateTerrain();
    gameLoop();
}); 
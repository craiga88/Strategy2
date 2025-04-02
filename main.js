const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const TILE_SIZE = 40;
const MAP_WIDTH = canvas.width / TILE_SIZE;
const MAP_HEIGHT = canvas.height / TILE_SIZE;

const map = [];
for (let y = 0; y < MAP_HEIGHT; y++) {
  let row = [];
  for (let x = 0; x < MAP_WIDTH; x++) {
    const tileType = Math.random() < 0.1 ? 'gold' : 'grass';
    row.push({ type: tileType });
  }
  map.push(row);
}

const player = {
  resources: { gold: 100 },
  units: [],
  buildings: []
};

const enemies = [];

function updateUI() {
  document.getElementById('resources').innerText = `Gold: ${Math.floor(player.resources.gold)}`;
}

function drawMap() {
  for (let y = 0; y < MAP_HEIGHT; y++) {
    for (let x = 0; x < MAP_WIDTH; x++) {
      const tile = map[y][x];
      ctx.fillStyle = tile.type === 'gold' ? '#fc3' : '#3a5';
      ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      ctx.strokeStyle = '#000';
      ctx.strokeRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    }
  }
}

function spawnUnit(x, y, type = 'worker') {
  player.units.push({ type, x, y, task: null, target: null, hp: 3 });
}

function spawnEnemy() {
  const x = Math.floor(Math.random() * MAP_WIDTH);
  const y = Math.floor(Math.random() * MAP_HEIGHT);
  enemies.push({ x, y, hp: 3 });
}

function drawUnits() {
  for (let unit of player.units) {
    ctx.fillStyle = 'yellow';
    ctx.beginPath();
    ctx.arc(unit.x * TILE_SIZE + TILE_SIZE / 2, unit.y * TILE_SIZE + TILE_SIZE / 2, 10, 0, Math.PI * 2);
    ctx.fill();
  }

  for (let enemy of enemies) {
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.arc(enemy.x * TILE_SIZE + TILE_SIZE / 2, enemy.y * TILE_SIZE + TILE_SIZE / 2, 10, 0, Math.PI * 2);
    ctx.fill();
  }
}

function updateUnits() {
  for (let unit of player.units) {
    if (unit.task === 'mine') {
      if (map[unit.y][unit.x].type === 'gold') {
        player.resources.gold += 0.1; // slowly mine gold
      }
    }
  }
}

function updateEnemies() {
  for (let enemy of enemies) {
    // Try to find closest player unit
    let closest = null;
    let minDist = Infinity;
    for (let unit of player.units) {
      const dx = unit.x - enemy.x;
      const dy = unit.y - enemy.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < minDist) {
        minDist = dist;
        closest = unit;
      }
    }

    if (closest && minDist <= 1.5) {
      // Attack
      closest.hp -= 0.05;
    } else if (closest) {
      // Move towards player
      const dx = Math.sign(closest.x - enemy.x);
      const dy = Math.sign(closest.y - enemy.y);
      enemy.x += dx;
      enemy.y += dy;
    }
  }

  // Remove dead player units
  player.units = player.units.filter(u => u.hp > 0);
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawMap();
  updateUnits();
  updateEnemies();
  drawUnits();
  updateUI();
  requestAnimationFrame(gameLoop);
}

canvas.addEventListener('click', (e) => {
  const x = Math.floor(e.offsetX / TILE_SIZE);
  const y = Math.floor(e.offsetY / TILE_SIZE);
  const existing = player.units.find(u => u.x === x && u.y === y);
  if (!existing) {
    spawnUnit(x, y);
  } else {
    existing.task = map[y][x].type === 'gold' ? 'mine' : null;
  }
});

setInterval(spawnEnemy, 5000); // Spawn an enemy every 5 seconds

updateUI();
gameLoop();

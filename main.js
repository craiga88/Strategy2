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
  resources: { gold: 200 },
  units: [],
  buildings: [],
  selectedTile: null
};

let enemies = [];

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

function drawBuildings() {
  for (let building of player.buildings) {
    ctx.fillStyle = building.type === 'base' ? '#5555ff' : '#888';
    ctx.fillRect(building.x * TILE_SIZE + 5, building.y * TILE_SIZE + 5, TILE_SIZE - 10, TILE_SIZE - 10);
  }
}

function drawUnits() {
  for (let unit of player.units) {
    ctx.fillStyle = unit.type === 'worker' ? 'yellow' : 'cyan';
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
        player.resources.gold += 0.1;
      }
    } else if (unit.task === 'attack') {
      for (let enemy of enemies) {
        const dx = enemy.x - unit.x;
        const dy = enemy.y - unit.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist <= 1.5) {
          enemy.hp -= 0.1;
        } else {
          unit.x += Math.sign(dx);
          unit.y += Math.sign(dy);
        }
      }
    }
  }

  enemies = enemies.filter(e => e.hp > 0);
}

function updateEnemies() {
  for (let enemy of enemies) {
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
      closest.hp -= 0.05;
    } else if (closest) {
      enemy.x += Math.sign(closest.x - enemy.x);
      enemy.y += Math.sign(closest.y - enemy.y);
    }
  }

  player.units = player.units.filter(u => u.hp > 0);
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawMap();
  drawBuildings();
  updateUnits();
  updateEnemies();
  drawUnits();
  updateUI();
  requestAnimationFrame(gameLoop);
}

canvas.addEventListener('click', (e) => {
  const x = Math.floor(e.offsetX / TILE_SIZE);
  const y = Math.floor(e.offsetY / TILE_SIZE);

  if (!player.buildings.find(b => b.x === x && b.y === y)) {
    if (!player.selectedTile) {
      player.buildings.push({ type: 'base', x, y });
      player.selectedTile = { x, y };
    } else if (player.resources.gold >= 50) {
      player.units.push({ type: 'worker', x, y, hp: 3, task: 'mine' });
      player.resources.gold -= 50;
    } else if (player.resources.gold >= 100) {
      player.units.push({ type: 'soldier', x, y, hp: 5, task: 'attack' });
      player.resources.gold -= 100;
    }
  }
});

function spawnEnemy() {
  const x = Math.floor(Math.random() * MAP_WIDTH);
  const y = Math.floor(Math.random() * MAP_HEIGHT);
  enemies.push({ x, y, hp: 5 });
}

setInterval(spawnEnemy, 7000);
updateUI();
gameLoop();

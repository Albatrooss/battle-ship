// constants

const ships = [
  {
    size: 5,
    horizontal: true,
    img: '',
  },
  {
    size: 4,
    horizontal: true,
    img: '',
  },
  {
    size: 3,
    horizontal: true,
    img: '',
  },
  {
    size: 3,
    horizontal: true,
    img: '',
  },
  {
    size: 2,
    horizontal: true,
    img: '',
  },
  {
    size: 2,
    horizontal: true,
    img: '',
  },
];

const sounds = {
  jet: 'assets/sounds/fly-by-01.wav',
  explosion: 'assets/sounds/explosion-01.mp3',
  splash: 'assets/sounds/splash.wav',
};
const audioPlayer = new Audio();
const explosionPlayer = new Audio();
const splashPlayer = new Audio();
// app's state

let game = {
  myTurn: true,
  aiTurn: false,
};
let user = {
  cells: [],
  ships: [...ships],
  horizontal: true,
  hovered: [],
  taken: '',
};
let ai = {
  cells: [],
  ships: [...ships],
  hp: 19,
  hits: [],
  horizontal: false,
  startPostv: true,
  firstDir: true,
  shots: [],
};

//cached element refs

const userBoard = document.querySelector('.user-board');
const aiBoard = document.querySelector('.ai-board');
const mainEl = document.querySelector('main');

let userGrid = [];
let aiGrid = [];

const flipBtn = document.getElementById('horizontal-btn');
const toggleBtn = document.getElementById('toggle');
const aiBtn = document.getElementById('ai-fire');

const jet = document.querySelector('.jet');

//event listeners

flipBtn.addEventListener('click', e => {
  user.horizontal = user.horizontal ? false : true;
});

userBoard.addEventListener('click', placePiece);
aiBoard.addEventListener('click', fire);
aiBtn.addEventListener('click', aiFire);

//functions

//Game Start

function initGame() {
  initBoard(userBoard);
  initBoard(aiBoard);
  aiPlaceShips();
}

function initBoard(obj) {
  for (let i = 0; i < 100; i++) {
    let cell = document.createElement('div');
    cell.className = 'cell';
    cell.id = i;
    if (obj === userBoard) {
      user.cells.push({ revealed: false, contents: null, id: i });
      cell.addEventListener('mouseenter', mouseEnter);
      cell.addEventListener('mouseleave', mouseLeave);
      userGrid.push(cell);
    } else {
      cell.addEventListener('mouseenter', aiMouseEnter);
      cell.addEventListener('mouseleave', aiMouseLeave);
      ai.cells.push({ revealed: false, contents: null, id: i });
      aiGrid.push(cell);
    }
    obj.appendChild(cell);
  }
}

function renderGrid(grid) {
  grid.forEach((cell, i) => {
    let piece = document.createElement('div');
    if (grid === aiGrid) {
      if (ai.cells[i].contents !== null) {
        piece.className = ai.cells[i].contents;
        cell.appendChild(piece);
      }
    } else {
      if (user.cells[i] !== null) {
        piece.className = ai.cells[i].contents;
        cell.appendChild(piece);
      }
    }
  });
}

//Evemt Listener functions
function toggle(e) {
  userBoard.classList.toggle('hidden');
  aiBoard.classList.toggle('hidden');
}

function mouseEnter(e) {
  //if target is far enough away from edge for piece to fit, toogle good class
  //else toggle bad class
  if (user.horizontal) {
    for (let i = 0; i < user.ships[0].size; i++) {
      user.hovered.push(parseInt(e.target.id) + i);
    }
  } else {
    for (let i = 0; i < user.ships[0].size; i++) {
      user.hovered.push(parseInt(e.target.id) + i * 10);
    }
  }
  user.taken = checkTaken(user.hovered, user) ? 'hoveredRed' : 'hoveredGreen';
  renderUserCells(user.hovered);
}

function mouseLeave(target) {
  //if target is far enough away from edge for piece to fit, toogle good class
  //else toggle bad class
  let temp = user.hovered.filter(c => c < 100);
  temp.forEach(cell => {
    userGrid[cell].classList.remove('hoveredGreen');
    userGrid[cell].classList.remove('hoveredRed');
  });
  user.hovered = [];
}

function aiMouseEnter(e) {
  if (!ai.cells[e.target.id].revealed) {
    e.target.classList.add('ai-hover');
  }
}

function aiMouseLeave(e) {
  e.target.classList.remove('ai-hover');
}

function placePiece(e) {
  //updates userGrid to show where the pieces are
  //store the size of the ship in each cell
  if (user.taken === 'hoveredGreen' && user.hovered.length > 0) {
    user.hovered.forEach((cell, i) => {
      let ship = document.createElement('img');
      let shipPiece = '';
      if (i === 0) {
        shipPiece = 'front';
      } else if (i === user.hovered.length - 1) {
        shipPiece = 'end';
      } else {
        shipPiece = `piece-${i + 1}`;
      }
      if (!user.horizontal) {
        shipPiece = 'vert-' + shipPiece;
      }
      ship.src = `assets/ships/${shipPiece}.png`;
      userGrid[cell].appendChild(ship);
      user.cells[cell].contents = 'ship';
    });
    user.ships.shift();
    if (user.ships.length === 0) {
      userGrid.forEach(cell => {
        cell.removeEventListener('mouseenter', mouseEnter);
        cell.removeEventListener('mouseleave', mouseLeave);
      });
      toggle();
    }
    mouseLeave();
    user.hovered = [];
  }
}

function renderUserCells(cells) {
  let newCells = cells.filter(c => c < 100);
  if (newCells.length !== cells.length) {
    user.taken = 'hoveredRed';
  }
  newCells.forEach(cell => {
    userGrid[cell].classList.add(user.taken);
  });
}

// User functions

function fire(e) {
  //checks aiGrid
  if (!game.myTurn) {
    return;
  }
  let id = e.target.id;
  if (!e.target.classList.value.split(' ').includes('cell')) return;
  if (!ai.cells[id].revealed) {
    if (ai.cells[id].contents === 'ship') {
      //show hit on grid
      ai.cells[id].contents = 'hit';
      renderAiCell(id, 'hit');
      ai.hp--;
    } else {
      //show miss
      ai.cells[id].contents = 'miss';
      renderAiCell(id, 'miss');
      game.myTurn = false;
      setTimeout(startAiTurn, 1000);
    }
    ai.cells[id].revealed = true;
    if (ai.hp < 1) alert('you win!');
  } else {
    return;
  }
}

function renderAiCell(cell, clss) {
  let piece = document.createElement('div');
  piece.className = clss;
  aiGrid[cell].appendChild(piece);
}

function showAi() {
  ai.cells.forEach((cell, i) => {
    if (cell.contents === 'ship') {
      let piece = document.createElement('div');
      piece.classList.add('ship');
      aiGrid[i].appendChild(piece);
    }
  });
}

// AI functions

function aiPlaceShips() {
  //randomly places ai pieces
  ai.ships.forEach((ship, index) => {
    let cells = [];
    cells = randomRoot(ship);
    let taken = checkTaken(cells, ai);
    while (taken) {
      cells = randomRoot(ship);
      taken = checkTaken(cells, ai);
    }
    cells.forEach(c => {
      if (ai.cells[c].contents !== null) {
      } else {
        cells.forEach(c => {
          ai.cells[c].contents = 'ship';
        });
        ships.shift();
      }
    });
  });
  function randomRoot(s) {
    let temp = [];
    let horizontal = Math.random() > 0.5 ? true : false;
    let root = Math.floor(Math.random() * 100);
    if (horizontal) {
      for (let i = 0; i < s.size; i++) {
        temp.push(root + i);
      }
    } else {
      for (let i = 0; i < s.size; i++) {
        temp.push(root + i * 10);
      }
    }
    return temp;
  }
}

function checkTaken(cs, who) {
  let noGood = false;
  if (
    cs[0] % 10 !== cs[cs.length - 1] % 10 &&
    Math.floor(cs[0] / 10) !== Math.floor(cs[cs.length - 1] / 10)
  ) {
    noGood = true;
  }
  cs.forEach(c => {
    if (c > 99 || who.cells[c].contents !== null) {
      noGood = true;
    }
  });
  if (noGood) {
    return true;
  }
  return false;
}

function changeHorizontal() {
  //changes if the current piece is horizontal or not
  pieces[0].horizontal ? (pieces[0].horizontal = false) : (pieces[0].horizontal = true);
}

function aiFire(e) {
  // if last shot was first hit
  // fire random one u d l r
  // else if last shot was > 1 && < size
  // fire ranom in same direction
  //else
  //fire on random cell
  let cell = aiPickTarget();

  //for debugging
  if (typeof e === 'number') {
    cell = e;
  }

  user.cells[cell].revealed = true;
  ai.shots.push(cell);
  if (user.cells[cell].contents === 'ship') {
    if (ai.firstDir) {
      ai.hits.push(cell);
    } else {
      ai.hits.unshift(cell);
    }
    aiFire();
  } else {
    if (ai.hits.length > 1) {
      ai.firstDir = false;
    }
    flyBy(ai.shots[0]);
    setTimeout(() => aiAnimateShots(cell), 1000);
    game.aiTurn = false;
  }
}

function aiPickTarget() {
  let options = [];
  if (ai.hits.length === 0) {
    return randomCell();
  } else if (ai.hits.length === 1) {
    options = adjacent(ai.hits[0]);
    if (options.length > 0) {
      let cell = options[Math.floor(Math.random() * options.length)];
      detectOrientation(cell);
      return cell;
    } else {
      ai.hits = [];
      ai.firstDir = true;
      return randomCell();
    }
  } else {
    options = nextInDirection();
    if (options.length === 0 || user.cells[options[0]].revealed) {
      if (ai.firstDir) {
        ai.firstDir = false;
        options = nextInDirection();
        if (options.length === 0 || user.cells[options[0]].revealed) {
          ai.hits = [];
          ai.firstDir = true;
          options = [randomCell()];
        }
      } else {
        ai.hits = [];
        ai.firstDir = true;
        options = [randomCell()];
      }
    }
    return options[0];
  }
}

function randomCell() {
  let cell = Math.floor(Math.random() * 100);
  while (user.cells[cell].revealed) {
    cell = Math.floor(Math.random() * 100);
  }
  return cell;
}

function detectOrientation(cell) {
  if (cell % 10 === ai.hits[0] % 10) {
    ai.horizontal = false;
  } else {
    ai.horizontal = true;
  }
  if (cell > ai.hits[0]) {
    ai.startPostv = true;
  } else {
    ai.startPostv = false;
  }
}

function nextInDirection() {
  let ans = [];
  let num = ai.firstDir ? ai.hits[ai.hits.length - 1] : ai.hits[0];
  let posDir = ai.firstDir ? ai.startPostv : !ai.startPostv;

  if (ai.horizontal) {
    ans = posDir ? [num + 1] : [num - 1];
  } else {
    ans = posDir ? [num + 10] : [num - 10];
  }
  return ans.filter(x => x >= 0 && x < 100 && !user.cells[x].revealed);
}

function adjacent(firstHit) {
  let temp = [firstHit + 1, firstHit - 1, firstHit + 10, firstHit - 10];
  let ans = [];

  temp.forEach((x, i) => {
    if (i < 2) {
      if (Math.floor(x / 10) === Math.floor(firstHit / 10)) {
        ans.push(x);
      }
    } else {
      if (x % 10 === firstHit % 10) {
        ans.push(x);
      }
    }
  });
  return ans.filter(x => x >= 0 && x < 100 && !user.cells[x].revealed);
}

function renderWin() {
  //render win screan
}

function renderLoss() {}

//turn controlloer

function startAiTurn() {
  toggle();
  game.aiTurn = true;
  aiFire();
}

function aiMove() {
  aiLoopTest(19);
}
function aiAnimateShots() {
  if (ai.shots.length <= 0) return setTimeout(endAiTurn, 1000);
  setTimeout(() => {
    let where = userGrid[ai.shots[0]];
    let piece = document.createElement('div');
    let explosion = document.createElement('img');
    explosion.src = 'assets/explosions/transparent-explosions-animated-gif-1.gif';
    explosion.className = 'explosion';
    let clss = ai.shots.length === 1 ? 'miss' : 'hit';
    piece.classList.add(clss);
    where.appendChild(piece);
    where.appendChild(explosion);
    clss === 'hit' ? playSound('explosion', explosionPlayer) : playSound('splash', splashPlayer);
    setTimeout(() => explosion.classList.add('fade-out'), 600);
    if (ai.shots.length === 3 || ai.shots.length === 6) {
      setTimeout(() => {
        console.log(ai.shots);
        flyBy(ai.shots[0]);
      }, 500);
    }
    ai.shots.shift();
    return aiAnimateShots();
  }, 500);
}

function endAiTurn() {
  game.myTurn = true;
  toggle();
}

function flyBy(cell) {
  playSound('jet', audioPlayer);
  let jet = document.createElement('img');
  jet.className = 'jet';
  jet.src = 'assets/Jet01.png';
  mainEl.appendChild(jet);
  let top = 0;
  let row = Math.floor(cell / 10);
  if (row < 2) {
    top = 0;
  } else if (row < 4) {
    top = 20;
  } else if (row < 6) {
    top = 40;
  } else if (row < 8) {
    top = 60;
  } else {
    top = 80;
  }
  console.log(top);
  jet.style.top = top + '%';
  setTimeout(() => jet.classList.toggle('fly-over'), 0);
  setTimeout(() => mainEl.removeChild(jet), 2000);
}

/*-------- AUIO ------*/

function playSound(name, source) {
  source.src = sounds[name];
  source.play();
}

//Game start
initGame();
/*
AI CODE

first shot hit  
  register starting point
second shot UDLR
  if miss try again
  if hit register HOR/VERT
third shot HOR/VER same dir
  if allreadyshot turn around



*/

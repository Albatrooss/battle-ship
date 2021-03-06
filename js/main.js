/*--------- CONSTANTS ---------*/

const ships = [
  {
    size: 5,
  },
  {
    size: 4,
  },
  {
    size: 3,
  },
  {
    size: 3,
  },
  {
    size: 2,
  },
  {
    size: 2,
  },
];

const sounds = {
  jet: 'assets/sounds/fly-by-01.wav',
  explosion: 'assets/sounds/explosion-02.wav',
  splat: 'assets/sounds/wet-splat.wav',
  splash: 'assets/sounds/splash.wav',
  boatDrop: 'assets/sounds/boat-drop-01.wav',
  click: 'assets/sounds/click-02.wav',
};

const images = {
  target: 'assets/target-01.svg',
  banana: 'assets/gifs/banana-dance-01.gif',
  jet: 'assets/Jet01.png',
  explosion: 'assets/explosions/transparent-explosions-animated-gif-1.gif',
  buoy: 'assets/gifs/buoy-02.gif',
  smoke: 'assets/explosions/smoke-02.gif',
};

const audioPlayer = new Audio();
const explosionPlayer = new Audio();
const shipPlayer = new Audio();
const splashPlayer = new Audio();

shipPlayer.volume = 0.4;
explosionPlayer.volume = 0.4;

/*--------- APP STATE ---------*/

let game = {};
let user = {};
let ai = {};

/*--------- DOM ELEMENTS ---------*/

const userBoard = document.querySelector('.user-board');
const aiBoard = document.querySelector('.ai-board');
const menuBoard = document.querySelector('.menu-board');

const mainEl = document.querySelector('main');
const boardMsg = document.querySelector('body > h2');

const menu = document.getElementById('menu');

const messageBanner = document.getElementById('message');
const winnerBanner = document.querySelector('#winner-banner');
const newGameBtn = document.querySelector('#winner-banner button');

let userGrid = [];
let aiGrid = [];
let menuGrid = [];

const menuBtn = document.querySelector('#menu h2');
const aiBtn = document.getElementById('fire-btn');

const jet = document.querySelector('.jet');

/*--------- EVENT LISTENERS ---------*/

menuBtn.addEventListener('click', toggleMenu);
aiBtn.addEventListener('click', handleFireBtn);

userBoard.addEventListener('click', prePlacePiece);
aiBoard.addEventListener('click', selectCell);
newGameBtn.addEventListener('click', newGame);

window.addEventListener('keydown', rotatePiece);

/*------------------------------------- FUNCTIONS -------------------------------------------*/

/*--------- GAME START ---------*/

function initGame() {
  game = {
    myTurn: true,
    aiTurn: false,
    mobile: false,
  };
  user = {
    cells: [],
    ships: [...ships],
    horizontal: true,
    hovered: [],
    hovering: false,
    notValid: '',
    cellSelected: -1,
    hp: 19,
    toggleSound: true,
  };
  ai = {
    cells: [],
    ships: [...ships],
    hp: 19,
    hits: [],
    horizontal: false,
    startPostv: true,
    firstDir: true,
    shots: [],
  };
  if (window.innerWidth <= 800) {
    game.mobile = true;
  } else {
    aiBtn.style.display = 'none';
  }
  initBoard(userBoard);
  initBoard(aiBoard);
  initBoard(menuBoard);
  aiPlaceShips();
  let message = '';
  if (game.mobile) {
    message = "Let's Play BattleShip!";
  } else {
    message = "Let's Play BattleShip!<hr>Press Space to rotate ship";
  }
  displayMessageBanner(message);
}

function initBoard(obj) {
  for (let i = 0; i < 100; i++) {
    let cell = document.createElement('div');
    cell.className = 'cell';
    cell.id = i;
    if (obj === userBoard) {
      user.cells.push({ revealed: false, contents: null });
      cell.addEventListener('mouseenter', e => mouseEnter(parseInt(e.target.id)));
      cell.addEventListener('mouseleave', mouseLeave);
      userGrid.push(cell);
    } else if (obj === menuBoard) {
      menuGrid.push(cell);
    } else {
      cell.addEventListener('mouseenter', aiMouseEnter);
      cell.addEventListener('mouseleave', aiMouseLeave);
      ai.cells.push({ revealed: false, contents: null });
      aiGrid.push(cell);
    }
    obj.appendChild(cell);
  }
}

function startGame() {
  aiBtn.textContent = 'FIRE';
  displayMessageBanner('YOUR TURN!');
  userGrid.forEach(cell => {
    cell.removeEventListener('mouseenter', mouseEnter);
    cell.removeEventListener('mouseleave', mouseLeave);
  });
  if (!game.mobile) {
    aiBtn.style.display = 'none';
  }
  toggleBoards();
}

function newGame() {
  clearBoard(userBoard);
  clearBoard(menuBoard);
  clearBoard(aiBoard);
  initGame();
  winnerBanner.classList.remove('showing');
  userBoard.classList.remove('hidden');
  aiBoard.classList.add('hidden');
  boardMsg.textContent = "USER'S BOARD";
}

function clearBoard(board) {
  board.innerHTML = '';
  if (board === userBoard) {
    userGrid = [];
  } else if (board === menuBoard) {
    menuGrid = [];
  } else {
    aiGrid = [];
  }
}

/*--------- HANDLE EVENTS ---------*/

function toggleBoards(e) {
  userBoard.classList.toggle('hidden');
  aiBoard.classList.toggle('hidden');
  boardMsg.textContent =
    boardMsg.textContent === "USER'S BOARD" ? "COMPUTER'S BOARD" : "USER'S BOARD";
}

function mouseEnter(root) {
  //if target is far enough away from edge for piece to fit, toogle good class
  //else toggle bad class
  if (game.mobile || !game.myTurn) return;
  if (user.horizontal) {
    for (let i = 0; i < user.ships[0].size; i++) {
      user.hovered.push(root + i); // detects the size of the ship and pushes that many cells to a hovered aray
    }
  } else {
    for (let i = 0; i < user.ships[0].size; i++) {
      user.hovered.push(root + i * 10);
    }
  }
  user.notValid = checkValid(user.hovered, user) ? 'hoveredGreen' : 'hoveredRed';
  renderUserCells(user.hovered);
  user.hovering = true;
}

function mouseLeave(target) {
  //if target is far enough away from edge for piece to fit, toogle good class
  //else toggle bad class
  if (game.mobile) return;
  let temp = user.hovered.filter(c => c < 100);
  temp.forEach(cell => {
    userGrid[cell].classList.remove('hoveredGreen');
    userGrid[cell].classList.remove('hoveredRed');
  });
  user.hovered = [];
  user.hovering = false;
}

function aiMouseEnter(e) {
  if (game.mobile || ai.hp < 1) return;
  if (!ai.cells[e.target.id].revealed) {
    e.target.classList.add('ai-hover');
  }
}

function aiMouseLeave(e) {
  if (!game.mobile) {
    e.target.classList.remove('ai-hover');
  }
}

function prePlacePiece(e) {
  if (!e.target.className.split(' ').includes('cell')) return;
  if (game.mobile) {
    if (parseInt(e.target.id) === user.hovered[0]) {
      user.horizontal = user.horizontal ? false : true;
      return showHover();
    }
    showHover();
    function showHover() {
      if (user.hovered.length > 0) {
        user.hovered.forEach(cell => {
          if (cell < 100) {
            userGrid[cell].classList.remove('hoveredRed');
            userGrid[cell].classList.remove('hoveredGreen');
          }
        });
      }
      user.hovered = [];
      if (user.horizontal) {
        for (let i = 0; i < user.ships[0].size; i++) {
          user.hovered.push(parseInt(e.target.id) + i);
        }
      } else {
        for (let i = 0; i < user.ships[0].size; i++) {
          user.hovered.push(parseInt(e.target.id) + i * 10);
        }
      }
      user.notValid = checkValid(user.hovered, user) ? 'hoveredGreen' : 'hoveredRed';
      renderUserCells(user.hovered);
    }
  } else {
    placePiece();
  }
}

function placePiece(cell) {
  //updates userGrid to show where the pieces are
  //store the size of the ship in each cell
  if (user.notValid === 'hoveredGreen' && user.hovered.length > 0) {
    user.hovered.forEach((cell, i) => {
      let ship = document.createElement('img');
      let menuShip = document.createElement('img');
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
      } else {
        shipPiece = 'hor-' + shipPiece;
      }
      ship.src = `assets/ships/${shipPiece}.png`;
      menuShip.src = `assets/ships/${shipPiece}.png`;
      userGrid[cell].appendChild(ship);
      menuGrid[cell].appendChild(menuShip);
      user.cells[cell].contents = 'ship';
    });
    if (user.toggleSound) {
      //  uses differenct player to minimize cutting off previous sounds
      playSound('boatDrop', explosionPlayer);
      user.toggleSound = false;
    } else {
      playSound('boatDrop', splashPlayer);
      user.toggleSound = true;
    }
    user.ships.shift();
    if (user.ships.length === 0) {
      startGame();
    }
    user.hovered.forEach(cell => {
      userGrid[cell].classList.remove('hoveredRed');
      userGrid[cell].classList.remove('hoveredGreen');
    });
    user.hovered = [];
  }
}

function renderUserCells(cells) {
  let root = cells[0];
  let newCells = cells.filter(c => findCross(root).includes(c));
  if (newCells.length !== cells.length) {
    user.notValid = 'hoveredRed';
  }
  newCells.forEach(cell => {
    userGrid[cell].classList.add(user.notValid);
  });
}

function findCross(root) {
  //Finds all the cells aligned horizontally and vertically from the root cell
  let cross = [root];
  for (let i = 1; i < 10; i++) {
    let news = [];
    let r = root + i;
    if (Math.floor(r / 10) === Math.floor(root / 10)) news.push(r);
    let l = root - i;
    if (Math.floor(l / 10) === Math.floor(root / 10)) news.push(l);
    let u = root + i * 10;
    if (u % 10 === root % 10) news.push(u);
    let d = root - i * 10;
    if (d % 10 === root % 10) news.push(d);
    news.forEach(x => {
      if (x < 100 && x >= 0) cross.push(x);
    });
  }
  return cross;
}

function rotatePiece(e) {
  if (e.key === ' ' && !game.mobile && user.hovering) {
    user.horizontal = user.horizontal ? false : true;
    let root = user.hovered[0];
    mouseLeave(); //removes old hovered
    mouseEnter(root); //shows new hovered
  }
}

/*--------- USER FUNCTIONS ---------*/

function handleFireBtn(e) {
  //tells the button what to do dependant on wethere its mobile or not
  if (user.ships.length > 0) {
    placePiece(user.cellSelected);
  } else {
    fire(user.cellSelected);
  }
}

function selectCell(e) {
  // for mobile, select the cell you will fire on
  let cell = e.target;
  if (!cell.classList.value.split(' ').includes('cell')) return;
  if (!game.mobile) return fire(cell.id);
  let targetEl = document.createElement('img');
  targetEl.src = images.target;
  targetEl.id = 'cross-hairs';
  playSound('click', splashPlayer);
  let oldTarget = document.getElementById('cross-hairs');
  if (user.cellSelected >= 0 && oldTarget !== null)
    aiGrid[user.cellSelected].removeChild(oldTarget);
  aiGrid[cell.id].appendChild(targetEl);
  user.cellSelected = cell.id;
}

function fire(cell) {
  //checks aiGrid
  if (!game.myTurn || ai.hp < 1) {
    return;
  }

  let oldTarget = document.getElementById('cross-hairs');
  if (user.cellSelected >= 0) aiGrid[user.cellSelected].removeChild(oldTarget); // removes the last crosshair placed

  let id = cell;
  if (!ai.cells[id].revealed) {
    if (ai.cells[id].contents === 'ship') {
      //show hit on grid
      ai.cells[id].contents = 'hit';
      renderAiCell(id, 'player-hit');
      ai.hp--;
    } else {
      //show miss
      ai.cells[id].contents = 'miss';
      banana(aiGrid[cell]);
      game.myTurn = false;
      setTimeout(startAiTurn, 1000);
    }
    ai.cells[id].revealed = true;
    if (ai.hp < 1) displayWinner('user');
  } else {
    return;
  }
}

function renderAiCell(cell, clss) {
  let piece = document.createElement('img');
  piece.className = clss;
  aiGrid[cell].appendChild(piece);
  if (clss === 'banana-peel') {
    piece.src = images.banana;
    playSound('splat', splashPlayer);
  } else {
    piece.src = images.buoy;
    explosion(aiGrid[cell]);
  }
}

/*---------------------------- AI FUNCTIONS ----------------------------*/

function aiPlaceShips() {
  //randomly places ai pieces
  ai.ships.forEach((ship, index) => {
    let cells = [];
    cells = randomShip(ship);
    let valid = checkValid(cells, ai);
    while (!valid) {
      cells = randomShip(ship);
      valid = checkValid(cells, ai);
    }
    cells.forEach(c => {
      ai.cells[c].contents = 'ship';
    });
  });

  function randomShip(s) {
    let temp = [];
    let horizontal = Math.floor(Math.random() * 2);
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

function checkValid(cs, who) {
  let valid = true;
  if (!findCross(cs[0]).includes(cs[cs.length - 1])) {
    valid = false;
  }
  cs.forEach(c => {
    if (c > 99 || who.cells[c].contents !== null) {
      valid = false;
    }
  });
  return valid;
}

function aiFire(e) {
  let cell = aiPickTarget();

  //for debugging
  if (typeof e === 'number') {
    cell = e;
  }

  user.cells[cell].revealed = true;
  ai.shots.push(cell);

  if (user.cells[cell].contents === 'ship') {
    if (ai.firstDir) {
      //pushes hit cell to either the front or the back of the line
      ai.hits.push(cell);
    } else {
      ai.hits.unshift(cell);
    }
    aiFire(); //recursively keeps firing untill it misses
  } else {
    if (ai.hits.length > 1) {
      ai.firstDir = false; //if it has allready detected the orientation, tells itself to search the opposite direction next time
    }
    flyBy(ai.shots[0]);
    setTimeout(() => aiAnimateShots(cell), 1000);
    game.aiTurn = false;
  }
}

function aiPickTarget() {
  let options = [];
  if (ai.hits.length === 0) {
    //if it doesn't know where any hits are, fire randomly
    return randomCell();
  } else if (ai.hits.length === 1) {
    // found the root, fires up, down, left and right until it determines the orientation of the shnip
    options = adjacent(ai.hits[0]);
    console.log(options);
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
    //fires in the same direction untill a miss, then turns and fires the other way untill it misses again;
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

function nextInDirection(mult = 1) {
  let ans = -1;
  let num = ai.firstDir ? ai.hits[ai.hits.length - 1] : ai.hits[0];
  let posDir = ai.firstDir ? ai.startPostv : !ai.startPostv;

  if (ai.horizontal) {
    ans = posDir ? [num + 1 * mult] : [num - 1 * mult];
  } else {
    ans = posDir ? [num + 10 * mult] : [num - 10 * mult];
  }
  if (ans[0] < 0) return [];
  if (user.cells[ans[0]].contents === 'ship' && user.cells[ans[0]].revealed) {
    mult++;
    return nextInDirection(mult);
  }
  return ans.filter(x => findCross(num).includes(x) && !user.cells[x].reveal);
}

function adjacent(firstHit) {
  return [firstHit + 1, firstHit - 1, firstHit + 10, firstHit - 10].filter(
    // finds up, down, left and right in play that havent been fired on yet
    x => findCross(firstHit).includes(x) && !user.cells[x].reveal
  );
}

/*-----------  MESSAGES -----------*/

function displayMessageBanner(message) {
  messageBanner.innerHTML = `<h2>${message}<h2>`;
  messageBanner.classList.add('showing');
  setTimeout(() => messageBanner.classList.add('out'), 1000);
  setTimeout(() => {
    messageBanner.className = '';
    messageBanner.textContent = '';
  }, 1600);
}

function displayWinner(winner) {
  winnerBanner.classList.add('showing');
  let text = '';
  if (winner === 'user') {
    text = 'YOU WIN!';
  } else {
    text = 'COMPUTER WINS!';
  }
  winnerBanner.childNodes[1].textContent = text;
  setTimeout(() => newGameBtn.classList.add('visible'), 2000);
}

/*----------- TURN CONTROLLER -------*/

function startAiTurn() {
  // displayMessageBanner("COMPUTER's TURN!");
  toggleBoards();
  game.aiTurn = true;
  aiFire();
}

function endAiTurn() {
  game.myTurn = true;
  displayMessageBanner('YOUR TURN!');
  toggleBoards();
}

/*--------- ANIMATIONS ---------*/

function aiAnimateShots() {
  if (user.hp < 1) {
    return displayWinner('computer');
  }
  if (ai.shots.length <= 0) return setTimeout(endAiTurn, 1000); //loops through ai shots and fires them in sequenc.
  setTimeout(() => {
    let where = userGrid[ai.shots[0]];
    let whereElse = menuGrid[ai.shots[0]];
    let menuPiece = document.createElement('div');
    let clss = ai.shots.length === 1 ? 'miss' : 'hit';
    menuPiece.classList.add(clss);
    whereElse.appendChild(menuPiece);
    if (clss === 'hit') {
      user.hp--;
      hit(where);
      explosion(where);
      smoke(where);
    } else {
      banana(where);
    }
    ai.shots.shift();
    return aiAnimateShots();
  }, 500);
}

function hit(where) {
  let piece = document.createElement('div');
  piece.className = 'darken';
  where.appendChild(piece);
}

function banana(where) {
  let piece = document.createElement('img');
  piece.className = 'banana-peel';
  piece.src = images.banana;
  where.appendChild(piece);
  playSound('splat', splashPlayer);
}

function smoke(where) {
  let smoke = document.createElement('img');
  smoke.src = images.smoke;
  smoke.className = 'smoke';
  where.appendChild(smoke);
}

function explosion(where) {
  let explosion = document.createElement('img');
  explosion.src = images.explosion;
  explosion.className = 'explosion';
  where.appendChild(explosion);
  playSound('explosion', explosionPlayer);
  setTimeout(() => explosion.classList.add('fade-out'), 600);
}

function flyBy(cell) {
  playSound('jet', audioPlayer);
  let jet = document.createElement('img');
  jet.className = 'jet';
  jet.src = images.jet;
  let top = 0;
  let row = Math.floor(cell / 10);
  if (row < 2) {
  } else if (row < 4) {
    top = 18;
  } else if (row < 6) {
    top = 37.5;
  } else if (row < 8) {
    top = 56;
  } else {
    top = 75;
  }
  mainEl.appendChild(jet);
  setTimeout(() => (jet.style.top = top + '%'), 0);
  setTimeout(() => jet.classList.toggle('fly-over'), 0);
  setTimeout(() => mainEl.removeChild(jet), 2000);
}

/*-------- AUDIO ------*/

function playSound(name, source) {
  source.src = sounds[name];
  source.play();
}

/*---------- MENU ----------*/

function toggleMenu() {
  menu.classList.toggle('visible');
  menuBtn.classList.toggle('visible');
}

/*----------- FOR PRESENTATION ---------*/

function showEnemy() {
  aiGrid.forEach((cell, i) => {
    if (ai.cells[i].contents === 'ship') {
      cell.style.backgroundColor = 'rgb(114, 179, 204)';
    }
  });
}

function displayEnemySpread() {
  toggleBoards();
  showEnemy();
}

/*-------- ON START ------*/

initGame();

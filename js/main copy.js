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
const allCells = [
  'a0',
  'a1',
  'a2',
  'a3',
  'a4',
  'a5',
  'a6',
  'a7',
  'a8',
  'a9',
  'b0',
  'b1',
  'b2',
  'b3',
  'b4',
  'b5',
  'b6',
  'b7',
  'b8',
  'b9',
  'c0',
  'c1',
  'c2',
  'c3',
  'c4',
  'c5',
  'c6',
  'c7',
  'c8',
  'c9',
  'd0',
  'd1',
  'd2',
  'd3',
  'd4',
  'd5',
  'd6',
  'd7',
  'd8',
  'd9',
  'e0',
  'e1',
  'e2',
  'e3',
  'e4',
  'e5',
  'e6',
  'e7',
  'e8',
  'e9',
  'f0',
  'f1',
  'f2',
  'f3',
  'f4',
  'f5',
  'f6',
  'f7',
  'f8',
  'f9',
  'g0',
  'g1',
  'g2',
  'g3',
  'g4',
  'g5',
  'g6',
  'g7',
  'g8',
  'g9',
  'h0',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'h7',
  'h8',
  'h9',
  'i0',
  'i1',
  'i2',
  'i3',
  'i4',
  'i5',
  'i6',
  'i7',
  'i8',
  'i9',
  'j0',
  'j1',
  'j2',
  'j3',
  'j4',
  'j5',
  'j6',
  'j7',
  'j8',
  'j9',
];

// app's state
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
};

//cached element refs
let userBoard = document.querySelector('.user-board');
let aiBoard = document.querySelector('.ai-board');

let userGrid = [];
let aiGrid = [];

let flipBtn = document.getElementById('horizontal-btn');
let toggleBtn = document.getElementById('toggle');
//event listeners
toggleBtn.addEventListener('click', toggle);
flipBtn.addEventListener('click', e => {
  user.horizontal = user.horizontal ? false : true;
});

userBoard.addEventListener('click', placePiece);
aiBoard.addEventListener('click', fire);
//functions

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
      user.cells.push({ revealed: false, contents: null });
      userGrid.push(cell);
      cell.addEventListener('mouseenter', mouseEnter);
      cell.addEventListener('mouseleave', mouseLeave);
    } else {
      ai.cells.push({ revealed: false, contents: null });
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

function toggle(e) {
  if (e.target.id !== 'toggle') return;
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

function placePiece(e) {
  //updates userGrid to show where the pieces are
  //store the size of the ship in each cell
  if (user.taken === 'hoveredGreen') {
    user.hovered.forEach((cell, i) => {
      let ship = document.createElement('div');
      let cl = '';
      if (user.horizontal) {
        if (i === 0) {
          cl = 'hor-start ship';
        } else if (i === user.hovered.length - 1) {
          cl = 'hor-end ship';
        } else {
          cl = 'hor-mid ship';
        }
      } else {
        if (i === 0) {
          cl = 'ver-start ship';
        } else if (i === user.hovered.length - 1) {
          cl = 'ver-end ship';
        } else {
          cl = 'ver-mid ship';
        }
      }
      ship.className = cl;
      userGrid[cell].appendChild(ship);
      user.cells[cell].contents = 'ship';
    });
    user.ships.shift();
    if (user.ships.length === 0) {
      userGrid.forEach(cell => {
        cell.removeEventListener('mouseenter', mouseEnter);
        cell.removeEventListener('mouseleave', mouseLeave);
      });
      mouseLeave();
      user.hovered = [];
    }
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

function startGame() {
  //once pieces ar placed shows aiBoard to pick a spot to fire on
}

function fire(e) {
  //checks aiGrid
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

function getFiredOn() {
  // if last shot was first hit
  // fire random one u d l r
  // else if last shot was > 1 && < size
  // fire ranom in same direction
  //else
  //fire on random cell
}

function checkHit(cell) {}

function renderWin() {
  //render win screan
}

function renderLoss() {}

initGame();
console.log(user.cells);
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

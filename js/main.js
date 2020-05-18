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
let pieces = [...ships];
let ai = {
  guessesLeft: [...allCells],
  pieces: [...ships],
  horizontal: true,
  guesses: [],
  hits: [],
  rightMiss: false,
  upMiss: false,
  hitCounter: 0,
};
let piecePlacer = {
  hoveredCells: [],
  cellsCoveredEl: [],
  allPlaced: false,
};

let userGrid = { a: [], b: [], c: [], d: [], e: [], f: [], g: [], h: [], i: [], j: [], boats: 19 };
let aiGrid = { a: [], b: [], c: [], d: [], e: [], f: [], g: [], h: [], i: [], j: [], boats: 19 };
let lastAiShot = { hits: 0, cell: '' };
let myturn = true;

//cached element refs
let toggle = document.getElementById('toggle');
let aiTurn = document.getElementById('aiFire');
let flip = document.getElementById('horizontalBtn');
let userBoard = document.querySelector('.userBoard');
let userRows = document.querySelectorAll('.userBoard > .row');
let aiBoard = document.querySelector('.aiBoard');
let aiRows = document.querySelectorAll('.aiBoard > .row');
var userCells = [];
var aiCells = [];

//event listeners

aiTurn.addEventListener('click', getFiredOn);

flip.addEventListener('click', e => {
  pieces[0].horizontal ? (pieces[0].horizontal = false) : (pieces[0].horizontal = true);
  console.log(pieces[0].horizontal);
  return;
});
toggle.addEventListener('click', e => {
  userBoard.classList.toggle('hidden');
  aiBoard.classList.toggle('hidden');
});
//functions

function initGame() {
  initBoard(userGrid, userRows);
  initBoard(aiGrid, aiRows);
}

function initBoard(obj, el) {
  el.forEach((a, idx) => {
    for (let i = 0; i <= 9; i++) {
      let row = String.fromCharCode(idx + 97);
      let c = document.createElement('div');
      c.className = 'cell';
      let id = row + i;
      c.id = id;
      c.addEventListener('click', e => {
        placePiece(e);
      });
      c.addEventListener('mouseenter', e => mouseEnter(e.target));
      c.addEventListener('mouseleave', e => mouseLeave(e.target));
      a.appendChild(c);
      if (el === userRows) {
        userCells.push(c);
      } else {
        aiCells.push(c);
      }

      //update size depending on the ship
      obj[row].push({ status: null, shipSize: undefined });
    }
  });
}

function mouseEnter(target) {
  if (!piecePlacer.allPlaced) {
    let cellsCovered = [];
    let cellTaken = false;
    for (let i = 0; i < pieces[0].size; i++) {
      let nextCell = '';
      if (pieces[0].horizontal) {
        nextCell = `${target.id[0]}${parseInt(target.id[1]) + i}`;
        cellsCovered.push(nextCell);
      } else {
        nextCell = `${String.fromCharCode(target.id[0].charCodeAt(0) + i)}${target.id[1]}`;
        cellsCovered.push(nextCell);
      }
    }
    cellsCovered.forEach(cell => {
      if (userGrid[cell[0]][cell[1]].ship) {
        cellTaken = true;
      }
    });
    cellsCoveredEls = userCells.filter(x => cellsCovered.includes(x.id));
    if (cellsCoveredEls.length === pieces[0].size && !cellTaken) {
      cellsCoveredEls.forEach(x => x.classList.add('hoveredGreen'));
    } else {
      cellsCoveredEls.forEach(x => x.classList.add('hoveredRed'));
    }
    hoveredCells = cellsCovered;
  }
  //if target is far enough away from edge for piece to fit, toogle good class
  //else toggle bad class
}

function mouseLeave(target) {
  cellsCoveredEls.forEach(x => {
    x.classList.remove('hoveredRed');
    x.classList.remove('hoveredGreen');
  });
  //if target is far enough away from edge for piece to fit, toogle good class
  //else toggle bad class
}

function placePiece(e) {
  if (cellsCoveredEls.length === pieces[0].size) {
    cellsCoveredEls.forEach(cell => {
      cell.classList.add('ship');
      userGrid[cell.id[0]][cell.id[1]].ship = true;
    });
    pieces.shift();
  }
  if (pieces.length <= 0) piecePlacer.allPlaced = true;
  //updates userGrid to show where the pieces are
  //store the size of the ship in each cell
}

function placeAiPieces() {
  //randomly places ai pieces
  ai.pieces.forEach(piece => {
    let availablePlaces = [];
  });
}

function changeHorizontal() {
  //changes if the current piece is horizontal or not
  pieces[0].horizontal ? (pieces[0].horizontal = false) : (pieces[0].horizontal = true);
}

function renderNextPiece() {}

function startGame() {
  //once pieces ar placed shows aiBoard to pick a spot to fire on
}

function fire(cell, grid) {
  //checks aiGrid

  if (aiGrid[cell].ship) {
    //show hit on grid
  } else {
    //show miss on grid
  }
  renderCell(cell);
  if (aiGrid.boats < 1) {
    renderWin();
  }
  myturn = myturn ? false : true;
}

function getFiredOn() {
  // if last shot was first hit
  // fire random one u d l r
  // else if last shot was > 1 && < size
  // fire ranom in same direction
  //else
  //fire on random cell
  let cell = '';
  let status = '';
  if (ai.hitCounter === 0) {
    cell = ai.guessesLeft[Math.floor(Math.random() * ai.guessesLeft.length)];
    status = checkHit(cell);
    if (status === 'hit') {
      ai.hitCounter++;
      ai.hits.push(cell);
    }
  } else if (ai.hitCounter === 1) {
    let adjs = findAdjacentCells(ai.hits[0]);
    cell = adjs[Math.floor(Math.random() * adjs.length)];
    status = checkHit(cell);
    if (status === 'hit') {
      ai.hitCounter++;
      ai.hits.push(cell);
    }
  } else {
    if (ai.hits[ai.hits.length - 1][0] === ai.hits[0][0]) {
      let hrz = findHorizontal();
    } else {
      console.log('vert');
    }
  }
  if (userGrid[cell[0]][cell[1]].size === ai.hitCounter) {
    ai.hitCounter = 0;
  }
  let idx = ai.guessesLeft.findIndex(x => cell === x);
  ai.guessesLeft.splice(idx, 1);
  ai.guesses.push(cell);
  userGrid[cell[0]][cell[1]].status = status;
  renderCell(cell, status);
}

function checkHit(cell) {
  return userGrid[cell[0]][cell[1]].ship ? 'hit' : 'miss';
}

function findAdjacentCells(cell) {
  let temp = [
    `${cell[0]}${parseInt(cell[1]) - 1}`,
    `${cell[0]}${parseInt(cell[1]) + 1}`,
    `${String.fromCharCode(cell[0].charCodeAt() + 1)}${cell[1]}`,
    `${String.fromCharCode(cell[0].charCodeAt() - 1)}${cell[1]}`,
  ];
  let adj = temp.filter(c => ai.guessesLeft.includes(c));
  return adj;
}

function renderCell(c, status) {
  //add class hit or miss
  let cell = userCells.find(x => x.id === c);
  cell.classList.add(status);
}

function renderWin() {
  //render win screan
}

function renderLoss() {}

initGame();
placeAiPieces();

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
  guesses: [],
  hits: [],
  hrz: false,
  neg: [],
  pos: [],
  posFirst: true,
  firstDir: true,
  total: 0,
};
let piecePlacer = {
  hoveredCells: [],
  cellsCovered: [],
  canPlace: true,
  cellsCoveredEl: [],
  cellTaken: false,
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
  user.horizontal = user.horizontal ? false : true;
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
  let cellsCovered = [];
  if (!piecePlacer.allPlaced) {
    piecePlacer.cellsCovered = [];
    for (let i = 0; i < pieces[0].size; i++) {
      let nextCell = '';
      if (user.horizontal) {
        nextCell = `${target.id[0]}${parseInt(target.id[1]) + i}`;
        cellsCovered.push(nextCell);
      } else {
        nextCell = `${String.fromCharCode(target.id[0].charCodeAt() + i)}${target.id[1]}`;
        console.log(nextCell);
        cellsCovered.push(nextCell);
      }
    }
    let tempPlace = true;
    cellsCovered.forEach(cell => {
      if ('abcdefghif'.includes(cell[0]) && '0123456789'.includes(cell[1])) {
        if ((userGrid[cell[0]][cell[1]].status = 'ship')) {
          tempPlace = false;
        }
      } else {
        tempPlace = false;
      }
    });
    piecePlacer.canPlace = tempPlace;
    if (piecePlacer.canPlace) {
      cellsCovered.forEach(cell => {
        if (userGrid[cell[0]][cell[1]].status !== 'ship')
          userGrid[cell[0]][cell[1]].status = 'hoverGreen';
      });
    } else {
      cellsCovered.forEach(cell => {
        if (userGrid[cell[0]][cell[1]].status !== 'ship')
          userGrid[cell[0]][cell[1]].status = 'hoverRed';
      });
    }
    ai.cellsCovered = cellsCovered;
    renderUserGrid();
    // cellsCovered.forEach(cell => {
    //   if ('abcdefghij'.includes(cell[0])) {
    //     if (userGrid[cell[0]][cell[1]].ship) {
    //       piecePlacer.cellTaken = true;
    //     } else {
    //       piecePlacer.cellTaken = false;
    //     }
    //   }
    // });
    // cellsCoveredEls = userCells.filter(x => cellsCovered.includes(x.id));
    // if (cellsCoveredEls.length === pieces[0].size && !piecePlacer.cellTaken) {
    //   cellsCoveredEls.forEach(x => x.classList.add('hoveredGreen'));
    // } else {
    //   cellsCoveredEls.forEach(x => x.classList.add('hoveredRed'));
    // }
    // hoveredCells = cellsCovered;
  }
  //if target is far enough away from edge for piece to fit, toogle good class
  //else toggle bad class
}

function mouseLeave(target) {
  userCells.forEach(cell => {
    if (userGrid[cell.id[0]][cell.id[1]].status !== 'ship') {
      cell.classList.remove('hoverGreen');
      cell.classList.remove('hoverRed');
    }
  });

  // cellsCoveredEls.forEach(x => {
  //   x.classList.remove('hoveredRed');
  //   x.classList.remove('hoveredGreen');
  // });
  //if target is far enough away from edge for piece to fit, toogle good class
  //else toggle bad class
}

function placePiece(e) {
  if (piecePlacer.cellTaken) return;
  if (cellsCoveredEls.length === pieces[0].size) {
    cellsCoveredEls.forEach(cell => {
      cell.classList.add('ship');
      userGrid[cell.id[0]][cell.id[1]].ship = true;
    });
    pieces.shift();
    piecePlacer.cellTaken = false;
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

function renderUserGrid() {
  userCells.forEach(cell => {
    if (userGrid[cell.id[0]][cell.id[1]].status) {
      cell.classList.add(userGrid[cell.id[0]][cell.id[1]].status);
    }
  });
}

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
  if (ai.hits.length === 0) {
    cell = ai.guessesLeft[Math.floor(Math.random() * ai.guessesLeft.length)];
    status = checkHit(cell);
    if (status === 'hit') {
      ai.hits.push(cell);
    }
  } else if (ai.hits.length === 1) {
    let adjs = findAdjacentCells(ai.hits[0]);
    cell = adjs[Math.floor(Math.random() * adjs.length)];
    status = checkHit(cell);
    if (status === 'hit') {
      ai.hits.push(cell);
      setTimeout(initAiHits, 0);
    }
  } else {
    if (ai.hits[0][0] === ai.hits[1][0]) {
      //horizontal
      cell = checkHrz();
      status = checkHit(cell);
      if (status === 'miss') {
        if (ai.firstDir === false) aiReset();
        ai.firstDir = false;
      }
    } else {
      //vertical
      cell = checkVrt();
      status = checkHit(cell);
      if (status === 'miss') {
        if (ai.firstDir === false) aiReset();
        ai.firstDir = false;
      }
    }
  }
  let idx = ai.guessesLeft.findIndex(x => cell === x);
  ai.guessesLeft.splice(idx, 1);
  ai.guesses.push(cell);
  ai.total += status === 'hit' ? 1 : 0;
  userGrid[cell[0]][cell[1]].status = status;
  renderCell(cell, status);
  if (ai.total === 19) {
    alert('You Lose');
  }
}

function checkHit(cell) {
  console.log('check cell: ' + cell);
  return userGrid[cell[0]][cell[1]].ship ? 'hit' : 'miss';
}

function initAiHits() {
  let arr = [];
  ai.hrz = ai.hits[0][0] === ai.hits[1][0] ? true : false;

  if (ai.hrz) {
    ai.posFirst = parseInt(ai.hits[1][1]) > parseInt(ai.hits[0][1]) ? true : false;
    for (let i = 0; i < 10; i++) {
      let xy = `${ai.hits[0][0]}${i}`;
      arr.push(xy);
    }
    let mid = parseInt(ai.hits[0][1]);
    let pos = arr.slice(mid + 1, 10);
    let neg = arr.slice(0, mid);
    ai.pos = pos.filter(x => ai.guessesLeft.includes(x));
    ai.neg = neg.filter(x => ai.guessesLeft.includes(x)).reverse();
  } else {
    ai.posFirst = ai.hits[1][0].charCodeAt() > ai.hits[0][0].charCodeAt();
    for (let i = 0; i < 10; i++) {
      let xy = `${String.fromCharCode(97 + i)}${ai.hits[0][1]}`;
      arr.push(xy);
    }
    let mid = ai.hits[0][0].charCodeAt() - 97;
    let pos = arr.slice(mid + 1, 10);
    let neg = arr.slice(0, mid);
    ai.pos = pos.filter(x => ai.guessesLeft.includes(x));
    ai.neg = neg.filter(x => ai.guessesLeft.includes(x)).reverse();
  }
}

function checkVrt() {
  let ans = '';
  if (ai.pos.length === 0 && ai.neg.length === 0) {
    aiReset();
    return ai.guessesLeft[Math.floor(Math.random() * ai.guessesLeft.length)];
  }
  if (ai.posFirst) {
    if (ai.firstDir && ai.pos.length > 0) {
      goPos();
    } else {
      goNeg();
    }
  } else {
    if (ai.firstDir && ai.neg.length > 0) {
      goNeg();
    } else {
      goPos();
    }
  }
  function goPos() {
    let arr = ai.pos.filter(x => ai.guessesLeft.includes(x));
    if (arr.length === 0) return goNeg();
    ans = arr[0];
    arr.shift();
    ai.pos = arr;
    if (ai.pos.length === 0) {
      if (ai.firstDir) {
        ai.firstDir = false;
      } else {
        aiReset();
      }
    }
  }
  function goNeg() {
    let arr = ai.neg.filter(x => ai.guessesLeft.includes(x));
    if (arr.length === 0) return goPos();
    ans = arr[0];
    arr.shift();
    ai.neg = arr;
    if (ai.neg.length === 0) {
      if (ai.firstDir) {
        ai.firstDir = false;
      } else {
        aiReset();
      }
    }
  }
  return ans;
}

function checkHrz() {
  let ans = '';
  if (ai.pos.length === 0 && ai.neg.length === 0) {
    aiReset();
    return ai.guessesLeft[Math.floor(Math.random() * ai.guessesLeft.length)];
  }
  if (ai.posFirst) {
    if (ai.firstDir) {
      goPos();
    } else {
      goNeg();
    }
  } else {
    if (ai.firstDir) {
      goNeg();
    } else {
      goPos();
    }
  }
  function goPos() {
    let arr = ai.pos.filter(x => ai.guessesLeft.includes(x));
    if (arr.length === 0) {
      if (ai.firstDir) {
        ai.firstDir = false;
        return checkHrz();
      } else {
        return ai.guessesLeft[Math.floor(Math.random() * ai.guessesLeft.length)];
      }
    }
    ans = arr[0];
    arr.shift();
    ai.pos = arr;
    if (ai.pos.length === 0) {
      if (ai.firstDir) {
        ai.firstDir = false;
      } else {
        aiReset();
      }
    }
    return ans;
  }
  function goNeg() {
    let arr = ai.neg.filter(x => ai.guessesLeft.includes(x));
    if (arr.length === 0) {
      if (ai.firstDir) {
        ai.firstDir = false;
        return checkHrz();
      } else {
        return ai.guessesLeft[Math.floor(Math.random() * ai.guessesLeft.length)];
      }
    }
    ans = arr[0];
    arr.shift();
    ai.neg = arr;
    if (ai.neg.length === 0) {
      if (ai.firstDir) {
        ai.firstDir = false;
      } else {
        aiReset();
      }
    }
  }
  return ans;
}

function aiReset() {
  ai.hits = [];
  ai.neg = [];
  ai.pos = [];
  console.log('reset', ai);
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
console.log(userGrid);

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

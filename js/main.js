// constants
const pieces = [
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

// app's state

let userGrid = { a: [], b: [], c: [], d: [], e: [], f: [], g: [], h: [], i: [], j: [], boats: 19 };
let aiGrid = { a: [], b: [], c: [], d: [], e: [], f: [], g: [], h: [], i: [], j: [], boats: 19 };
let lastAiShot = { hits: 0, cell: '' };
let myturn = true;

//cached element refs
let toggle = document.querySelector('button');
let userBoard = document.querySelector('.userBoard');
let userRows = document.querySelectorAll('.userBoard > .row');
let aiBoard = document.querySelector('.aiBoard');
let aiRows = document.querySelectorAll('.aiBoard > .row');
var userCells, aiCells;

//event listeners

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
        placePiece();
      });
      a.appendChild(c);
      //update size depending on the ship
      obj[row].push({ ship: false, size: 2, shot: false });
    }
  });
}

function placePiece() {
  //pieces[0]
  pieces.shift();
  //updates userGrid to show where the pieces are
  //store the size of the ship in each cell
  console.log(pieces);
}

function placeAiPieces() {
  //randomly places ai pieces
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
}

function renderCell(cell) {
  //add class hit or miss
}

function renderWin() {
  //render win screan
}

function renderLoss() {}

initGame();

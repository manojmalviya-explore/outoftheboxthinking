// Basic Chess Logic for OutOfTheBoxThinking Challenge

const PIECES = {
  wK: "♔", wQ: "♕", wR: "♖", wB: "♗", wN: "♘", wP: "♙",
  bK: "♚", bQ: "♛", bR: "♜", bB: "♝", bN: "♞", bP: "♟"
};

let gameMode = null; // "1p" or "2p"
let board = [];
let selected = null;
let turn = "w";
let gameOver = false;

const startPos = [
  ["bR","bN","bB","bQ","bK","bB","bN","bR"],
  ["bP","bP","bP","bP","bP","bP","bP","bP"],
  ["","","","","","","",""],
  ["","","","","","","",""],
  ["","","","","","","",""],
  ["","","","","","","",""],
  ["wP","wP","wP","wP","wP","wP","wP","wP"],
  ["wR","wN","wB","wQ","wK","wB","wN","wR"]
];

function cloneBoard(b) {
  return JSON.parse(JSON.stringify(b));
}

function resetGame() {
  board = cloneBoard(startPos);
  selected = null;
  turn = "w";
  gameOver = false;
  document.getElementById("gameStatus").textContent = "";
  renderBoard();
}

function renderBoard() {
  const boardDiv = document.getElementById("chessBoard");
  boardDiv.innerHTML = "";
  for (let r = 0; r < 8; r++) {
    const row = document.createElement("div");
    row.className = "row";
    for (let c = 0; c < 8; c++) {
      const cell = document.createElement("div");
      cell.className = "cell " + (((r+c)%2) ? "dark" : "light");
      if (selected && selected[0] === r && selected[1] === c) cell.classList.add("selected");
      cell.dataset.r = r;
      cell.dataset.c = c;
      cell.textContent = board[r][c] ? PIECES[board[r][c]] : "";
      cell.onclick = cellClick;
      row.appendChild(cell);
    }
    boardDiv.appendChild(row);
  }
}

function cellClick(e) {
  if (gameOver) return;
  const r = +this.dataset.r, c = +this.dataset.c;
  if (!selected) {
    if (board[r][c] && board[r][c][0] === turn) {
      selected = [r,c];
      renderBoard();
    }
    return;
  }
  if (selected[0] === r && selected[1] === c) {
    selected = null;
    renderBoard();
    return;
  }
  if (board[selected[0]][selected[1]] && isLegalMove(board, selected, [r,c], turn)) {
    makeMove(selected, [r,c]);
    selected = null;
    if (gameMode === "1p" && !gameOver && turn === "b") setTimeout(computerMove, 500);
  }
}

function isLegalMove(bd, from, to, color) {
  // Simple movement/capture logic, does not check all chess rules
  const [fr,fc] = from, [tr,tc] = to;
  const p = bd[fr][fc];
  if (!p || p[0] !== color) return false;
  if (bd[tr][tc] && bd[tr][tc][0] === color) return false;
  const dr = tr-fr, dc = tc-fc;
  switch (p[1]) {
    case "P": // Pawn
      if (color === "w") {
        if (dc === 0 && dr === -1 && !bd[tr][tc]) return true;
        if (fc === tc && fr === 6 && dr === -2 && !bd[fr-1][fc] && !bd[tr][tc]) return true;
        if (Math.abs(dc) === 1 && dr === -1 && bd[tr][tc] && bd[tr][tc][0] === "b") return true;
      } else {
        if (dc === 0 && dr === 1 && !bd[tr][tc]) return true;
        if (fc === tc && fr === 1 && dr === 2 && !bd[fr+1][fc] && !bd[tr][tc]) return true;
        if (Math.abs(dc) === 1 && dr === 1 && bd[tr][tc] && bd[tr][tc][0] === "w") return true;
      }
      break;
    case "N": return (Math.abs(dr) === 2 && Math.abs(dc) === 1) || (Math.abs(dr) === 1 && Math.abs(dc) === 2);
    case "B": return Math.abs(dr) === Math.abs(dc) && clearPath(bd, from, to);
    case "R": return ((dr === 0 || dc === 0) && clearPath(bd, from, to));
    case "Q": return ((Math.abs(dr) === Math.abs(dc) || dr === 0 || dc === 0) && clearPath(bd, from, to));
    case "K": return Math.abs(dr) <= 1 && Math.abs(dc) <= 1;
  }
  return false;
}

function clearPath(bd, from, to) {
  let dr = Math.sign(to[0] - from[0]);
  let dc = Math.sign(to[1] - from[1]);
  let r = from[0] + dr, c = from[1] + dc;
  while (r !== to[0] || c !== to[1]) {
    if (bd[r][c]) return false;
    r += dr; c += dc;
  }
  return true;
}

function makeMove(from, to) {
  const [fr,fc] = from, [tr,tc] = to;
  board[tr][tc] = board[fr][fc];
  board[fr][fc] = "";
  // Promotion
  if (board[tr][tc][1] === "P" && (tr === 0 || tr === 7)) {
    board[tr][tc] = board[tr][tc][0] + "Q";
  }
  turn = (turn === "w" ? "b" : "w");
  renderBoard();
  checkGameStatus();
}

function checkGameStatus() {
  let kings = {w: false, b: false};
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
    if (board[r][c] === "wK") kings.w = true;
    if (board[r][c] === "bK") kings.b = true;
  }
  if (!kings.w || !kings.b) {
    document.getElementById("gameStatus").textContent = (!kings.w ? "Black" : "White") + " wins!";
    gameOver = true;
  }
}

function computerMove() {
  let moves = [];
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
    if (board[r][c] && board[r][c][0] === "b") {
      for (let tr = 0; tr < 8; tr++) for (let tc = 0; tc < 8; tc++) {
        if (isLegalMove(board, [r,c], [tr,tc], "b")) moves.push([[r,c],[tr,tc]]);
      }
    }
  }
  if (moves.length) {
    const [from, to] = moves[Math.floor(Math.random()*moves.length)];
    makeMove(from, to);
  }
}

document.getElementById("onePlayerBtn").onclick = function() {
  gameMode = "1p";
  resetGame();
};
document.getElementById("twoPlayerBtn").onclick = function() {
  gameMode = "2p";
  resetGame();
};
document.getElementById("resetBtn").onclick = function() {
  resetGame();
};

resetGame();
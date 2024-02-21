const express = require("express");
const socketio = require("socket.io");
const path = require("path");

const app = express();

app.use(express.static(path.resolve(__dirname, ".")));

app.get("/", (req, res) => {
  res.sendFile(path.resolve(__dirname, "index.html"));
});

const server = app.listen(3000, () => {
  console.log("server is running on port", server.address().port);
});

const io = socketio(server);
class TicTacToeGame {
  constructor(boardSize) {
    this.boardSize = boardSize;
    this.allowedPlayers = ["X", "O"];
    this.currentPlayer = "X";
    this.boardState = [];
    this.winner = false;
  }

  // interface / API methods
  checkWinner() {
    let positions = this.boardState.filter(
      (item) => item.player == this.currentPlayer
    );

    if (
      this._checkConsecutiveWin(positions) ||
      this._checkLeftDiagonalWin(positions) ||
      this._checkRightDiagonalWin(positions)
    )
      return true;

    return false;
  }

  updateState(player, x, y) {
    // updates the board state by adding player / symbol on a
    // position in the board state


    if (this.winner) {
      return null;
    }

    if (
      x < this.boardSize &&
      y < this.boardSize &&
      this.allowedPlayers.includes(player)
    ) {
      this.boardState.push({ player, x, y });
      if(this.checkWinner()) {
        this.winner = this.currentPlayer;
        console.log("Winner is", this.winner);
      }
      this.currentPlayer = player == "X" ? "O" : "X";
    }

    console.log("Provided data for updateState", { player, x, y });
  }

  // helper methods
  _checkConsecutiveWin(positions) {
    for(let i = 0; i < this.boardSize; i++) {
      var consecutiveHorizontal = positions.filter((p) => p.x == i);
      if (consecutiveHorizontal.length == this.boardSize) {
        return true;
      }

      var consecutiveVertical = positions.filter((p) => p.y == i);
      if (consecutiveVertical.length == this.boardSize) {
        return true;
      }
    }

    return false;
  }

  _checkRightDiagonalWin(positions) {
    return (
      positions.filter((i) => {
        return i.x == i.y;
      }).length == this.boardSize
    );
  }

  _checkLeftDiagonalWin(positions) {
    return (
      positions.filter((i) => {
        return i.x == this.boardSize - i.y - 1;
      }).length == this.boardSize
    );
  }
}


let game = new TicTacToeGame(3);
io.on("connection", (socket) => {
  console.log("a user connected", socket.id);
  console.log("Total", io.engine.clientsCount);

  if (io.engine.clientsCount >= 2) {
    io.emit("hulululu start the gaaammmeeee... 😀", game);

    socket.on("update game", (data) => {
      console.log("update game", data);
      game.updateState(data.player, data.x, data.y);
      io.emit("update game client", game);
      if(game.winner) {
        console.log("Game is over");
        io.emit("game over", game.winner);
      }
      else if(game.boardState.length == game.boardSize * game.boardSize) {
        console.log("Game is draw");
        io.emit("game over", 'draw');
      }
    });
  }

  socket.on("something", (data) => {
    console.log("something", data);
  })

  socket.on("disconnect", () => {
    game = new TicTacToeGame(3);
    console.log("a user disconnected", socket.id);
  });
});

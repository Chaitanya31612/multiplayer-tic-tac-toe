const { ref, onMounted } = Vue;

const app = Vue.createApp({
  template: `
  <h1 v-if="winner && winner != 'draw'">Winner is : {{ winner }}</h1>
  <h1 v-else-if="winner && winner == 'draw'">Game is draw</h1>
  <div class = "ui">
    <h3>Board Size - {{ boardSize }}</h3>
    <br/>
    <div v-for="i in boardSize" :key="i" :disabled="winner">
      <div class="row">
        <div v-for="j in boardSize" :key="j">
              <input type="text" id="b1" :value="itemValue(i-1, j-1)"
                    class="cell" @click="updateState(i-1, j-1, currentPlayer)"
                    readonly>
        </div>
      </div>
    </div>
  </div>
  <br><br><br>
  <button id="but">RESET</button>
  <div id="print">Player {{ currentPlayer }} turn</div>
  `,
  setup() {
    const socket = io();
    const boardSize = ref(3);
    const currentPlayer = ref("X");
    const boardState = ref([]);
    const gameObject = ref(null);
    const winner = ref(null);


    socket.on('hulululu start the gaaammmeeee... 😀', (data) => {
      console.log(data);

      gameObject.value = data;
      boardSize.value = data.boardSize;
      currentPlayer.value = data.currentPlayer;
      boardState.value = data.boardState;
    });

    socket.on("update game client", (data) => {
      console.log("update game client", data);
      gameObject.value = data;
      boardSize.value = data.boardSize;
      currentPlayer.value = data.currentPlayer;
      boardState.value = data.boardState;
    })

    socket.on("game over", (data) => {
      console.log("game over", data);
      winner.value = data;
    });


    const updateState = (x, y, player) => {
        console.log("updateState", { x, y, player });
        socket.emit("update game", { x  , y, player });
    };

    const itemValue = (i, j) => {
      let item = boardState.value.find((item) => item.x == i && item.y == j);
      return item ? item.player : "";
    }

    onMounted(() => {
      console.log("onMounted");
      console.log(boardSize.value, boardState.value, currentPlayer.value)
      socket.emit("something", "Hi from client");
    })

    return {
      boardSize,
      currentPlayer,
      winner,
      updateState,
      itemValue
    };
  }
})

app.mount("#board")

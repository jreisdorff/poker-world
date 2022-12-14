const path = require("path");
const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const compression = require("compression");
const morgan = require("morgan");
const fs = require("fs");
const _ = require("lodash");
const { createRequestHandler } = require("@remix-run/express");
var Hand = require("pokersolver").Hand;
const PORT = process.env.PORT || 3000;
const MODE = process.env.NODE_ENV;
const BUILD_DIR = path.join(process.cwd(), "server/build");

if (!fs.existsSync(BUILD_DIR)) {
  console.warn(
    "Build directory doesn't exist, please run `npm run dev` or `npm run build` before starting the server."
  );
}

const app = express();

// You need to create the HTTP server from the Express app
const httpServer = createServer(app);

// And then attach the socket.io server to the HTTP server
const io = new Server(httpServer);

const GameState = Object.freeze({
  Preflop: 0,
  Flop: 1,
  Turn: 2,
  River: 3,
  Showdown: 4,
});

const playerIsActive = (player) => {
  return (!(player.folded || player.chips <= 0 || player.allIn));
};

const endHoldEmRound = (props) => {
  let nextProps = {
    gameState: props.gameState,
    dealerCards: props.dealerCards,
    hands: props.hands,
    winner: undefined,
    winningCards: [],
    wonAmount: [],
    players: props.players,
    activePlayer: props.activePlayer,
    gameOver: false,
    turnsNextRound: props.turnsNextRound,
    needResponsesFromIndicies: props.needResponsesFromIndicies,
    bigBlindAmount: props.bigBlindAmount,
  };

  nextProps.gameState = GameState.Showdown;
  let tempDealerCards = [...props.dealerCards];
  tempDealerCards.forEach((card) => {
    card.faceUp = true;
  });
  let tempPlayers = [...props.players];
  nextProps.dealerCards = tempDealerCards;
  let gameWinner = determineWinner(
    props.players
      .filter(
        (player) =>
          props.players.map((pith) => pith.name).includes(player.name) &&
          !player.folded
      )
      .map((player) => {
        return { dealerCards: props.dealerCards, player };
      }), props.players
  );

  let wonAmount = getWonAmount({ winner: gameWinner }, props.pots);

  let winnerDescription = getWinnerDescription(gameWinner, wonAmount, false);

  let tempHands = [...props.hands];
  let winnar = { winner: gameWinner, description: winnerDescription };

  tempHands.push(winnar);

  nextProps.hands = tempHands;
  const winnerObj = { winner: gameWinner, description: winnerDescription };
  nextProps.winner = winnerObj;
  let tempWinningCards = [];
  gameWinner.wins.forEach((w) => {
    w.cards.forEach((card) => {
      if (!tempWinningCards.includes(card)) {
        tempWinningCards.push(card);
      }
    });
  });

  nextProps.winningCards = tempWinningCards;
  nextProps.wonAmount = wonAmount;

  tempPlayers
    .filter((p, index) => gameWinner.winnerIndicies.includes(index))
    .forEach((player) => {
      player.chips += wonAmount;
    });

  nextProps.players = tempPlayers;
  nextProps.gameOver = true;

  return nextProps;
};

const advanceToEnd = async (props) => {
  let nextProps = {
    gameState: props.gameState,
    dealerCards: props.dealerCards,
    hands: props.hands,
    winner: undefined,
    winningCards: [],
    wonAmount: [],
    players: props.players,
    activePlayer: props.activePlayer,
    gameOver: false,
    turnsNextRound: props.turnsNextRound,
    manualAdvance: props.manualAdvance,
    pots: props.pots,
    needResponsesFromIndicies: props.needResponsesFromIndicies,
    bigBlindAmount: props.bigBlindAmount,
  };

  let tempDealerCards = [...props.dealerCards];

  let tempPlayers = [...props.players];
  tempPlayers.forEach(
    (player) =>
      (player.cards = player.cards.map((card) => ({ ...card, faceUp: true })))
  );

  io.emit("sendShowCardsData", { players: tempPlayers });

  if (nextProps.gameState === GameState.Preflop) {
    //we need to deal flop, turn and river
    nextProps.gameState = GameState.Flop;
    let newCards = createCards(52, 3, undefined, true);
    let tempDealerCards = [...props.dealerCards];
    newCards.forEach((card) => tempDealerCards.push(card));
    nextProps.dealerCards = tempDealerCards;
    io.emit("dealerCards", nextProps.dealerCards);
  }

  setTimeout(() => {
    if (nextProps.gameState === GameState.Flop) {
      nextProps.gameState = GameState.Turn;
      newCards = createCards(52, 1, undefined, true);
      tempDealerCards = [...tempDealerCards, ...newCards];
      nextProps.dealerCards = tempDealerCards;
      io.emit("dealerCards", nextProps.dealerCards);
    }
  }, 3000);

  setTimeout(() => {
    if (nextProps.gameState === GameState.Turn) {
      nextProps.gameState = GameState.River;
      newCards = createCards(52, 1, undefined, true);
      tempDealerCards = [...tempDealerCards, ...newCards];
      nextProps.dealerCards = tempDealerCards;
      io.emit("dealerCards", nextProps.dealerCards);
    }
  }, 6000);

  setTimeout(() => {
    if (nextProps.gameState === GameState.River) {
      nextProps.gameState = GameState.Showdown;
      tempDealerCards.forEach((card) => {
        card.faceUp = true;
      });
      let tempPlayers = [...props.players];
      nextProps.dealerCards = tempDealerCards;

      let gameWinner = determineWinner(
        props.players
          .filter(
            (player) =>
              props.players.map((pith) => pith.name).includes(player.name) &&
              !player.folded
          )
          .map((player) => {
            return { dealerCards: nextProps.dealerCards, player };
          }), props.players
      );

      let wonAmount = getWonAmount({ winner: gameWinner }, props.pots);
      const winnerDescription = getWinnerDescription(
        gameWinner,
        wonAmount,
        true
      );

      let tempHands = [...props.hands];
      let winnar = { winner: gameWinner, description: winnerDescription };

      tempHands.push(winnar);

      nextProps.hands = tempHands;
      const winnerObj = { winner: gameWinner, description: winnerDescription };
      nextProps.winner = winnerObj;
      let tempWinningCards = [];
      gameWinner.wins.forEach((w) => {
        w.cards.forEach((card) => {
          if (!tempWinningCards.includes(card)) {
            tempWinningCards.push(card);
          }
        });
      });

      nextProps.winningCards = tempWinningCards;
      nextProps.wonAmount = wonAmount;

      let tempCards = props.players
        .filter((p) => !p.folded)
        .map((p) => p.cards);

      tempCards.forEach((cardArray) => {
        cardArray.forEach((card) => {
          card.faceUp = true;
        });
      });

      tempPlayers
        .filter((p) => !p.folded)
        .forEach((player, index) => {
          player.cards = tempCards[index];
        });

      tempPlayers.forEach((player) => {
        player.allIn = false;
      });

      tempPlayers
        .filter((p, index) => gameWinner.winnerIndicies.includes(index))
        .forEach((player) => {
          player.chips += wonAmount;
        });

      nextProps.players = tempPlayers;
      nextProps.gameOver = true;
    }

    let turnsNext = nextProps.players.filter((player) => playerIsActive(player)).length;

    nextProps.turnsNextRound = turnsNext;

    io.emit("sendAdvanceData", nextProps);
  }, 9000);
};

const advanceHoldEmGame = (props) => {
  let nextProps = {
    gameState: props.gameState,
    dealerCards: props.dealerCards,
    hands: props.hands,
    winner: undefined,
    winningCards: [],
    wonAmount: [],
    players: props.players,
    activePlayer: props.activePlayer,
    pots: props.pots,
    gameOver: false,
    turnsNextRound: props.turnsNextRound,
    manualAdvance: props.manualAdvance,
    needResponsesFromIndicies: props.needResponsesFromIndicies,
    bigBlindAmount: props.bigBlindAmount,
  };

  if (props.gameState === GameState.Preflop) {
    nextProps.gameState = GameState.Flop;
    let newCards = createCards(52, 3, undefined, true);
    let tempDealerCards = [...props.dealerCards];
    newCards.forEach((card) => tempDealerCards.push(card));
    nextProps.dealerCards = tempDealerCards;
  } else if (props.gameState === GameState.Flop) {
    nextProps.gameState = GameState.Turn;
    let newCards = createCards(52, 1, undefined, true);
    let tempDealerCards = [...props.dealerCards, ...newCards];
    nextProps.dealerCards = tempDealerCards;
  } else if (props.gameState === GameState.Turn) {
    nextProps.gameState = GameState.River;
    let newCards = createCards(52, 1, undefined, true);
    let tempDealerCards = [...props.dealerCards, ...newCards];
    nextProps.dealerCards = tempDealerCards;
  } else if (props.gameState === GameState.River) {
    nextProps.gameState = GameState.Showdown;
    let tempDealerCards = [...props.dealerCards];
    tempDealerCards.forEach((card) => {
      card.faceUp = true;
    });
    let tempPlayers = [...props.players];
    nextProps.dealerCards = tempDealerCards;
    let gameWinner = determineWinner(
      props.players
        .filter(
          (player) =>
            props.players.map((pith) => pith.name).includes(player.name) &&
            !player.folded
        )
        .map((player) => {
          return { dealerCards: props.dealerCards, player };
        }), props.players
    );

    let wonAmount = getWonAmount({ winner: gameWinner }, props.pots);
    const winnerDescription = getWinnerDescription(gameWinner, wonAmount, true);

    let tempHands = [...props.hands];
    let winnar = { winner: gameWinner, description: winnerDescription };

    tempHands.push(winnar);

    nextProps.hands = tempHands;
    const winnerObj = { winner: gameWinner, description: winnerDescription };
    nextProps.winner = winnerObj;
    let tempWinningCards = [];
    gameWinner.wins.forEach((w) => {
      w.cards.forEach((card) => {
        if (!tempWinningCards.includes(card)) {
          tempWinningCards.push(card);
        }
      });
    });

    nextProps.winningCards = tempWinningCards;
    nextProps.wonAmount = wonAmount;

    let tempCards = props.players.filter((p) => !p.folded).map((p) => p.cards);

    tempCards.forEach((cardArray) => {
      cardArray.forEach((card) => {
        card.faceUp = true;
      });
    });

    tempPlayers.forEach((player) => {
      player.allIn = false;
    });

    tempPlayers
      .filter((p) => !p.folded)
      .forEach((player, index) => {
        player.cards = tempCards[index];
      });

    tempPlayers
      .filter((p, index) => gameWinner.winnerIndicies.includes(index))
      .forEach((player) => {
        player.chips += wonAmount;
      });

    nextProps.players = tempPlayers;
    nextProps.gameOver = true;
  }

  let turnsNext = nextProps.players.filter((player) => !player.folded).length;

  nextProps.turnsNextRound = turnsNext;

  return nextProps;
};

const determineWinner = (playerWithDealerCards, allPlayers) => {
  const dealerCards = playerWithDealerCards[0].dealerCards;

  const dealerCardsArray = dealerCards.map(
    (card) => `${card.rank == "10" ? "T" : card.rank}${card.suit.charAt(0)}`
  );

  // Form a 7-card array from dealer cards + players cards
  const handsArray = playerWithDealerCards.map((player) => {
    return [
      ...dealerCardsArray,
      ...player.player.cards.map(
        (card) => `${card.rank == "10" ? "T" : card.rank}${card.suit.charAt(0)}`
      ),
    ];
  });

  let solvedHands = handsArray.map((hand, index) => {
    return { solvedHand: Hand.solve(hand), player: playerWithDealerCards[index].player, originalPlayerIndex: allPlayers.indexOf(playerWithDealerCards[index].player) };
    });

  var wins = Hand.winners(solvedHands.map((sh) => sh.solvedHand));

  let winnerIndicies = [];

  solvedHands.forEach((item, index) => {
    if (wins.includes(item.solvedHand)) {
      winnerIndicies.push(item.originalPlayerIndex);
      return true;
    }
    return false;
  });

  const pokerWinner = {
    players: allPlayers.filter((item, index) =>
      winnerIndicies.includes(index)
    ),
    wins,
    winnerIndicies,
    hand: wins[0].descr,
    ultimateWinner:
      winnerIndicies.length === 1
        ? allPlayers[winnerIndicies[0]]
        : undefined,
  };

  return pokerWinner;
};

const getWinnerDescription = (winner, amount, fullDescription = false) => {
  let winnerDescription = "";

  if (winner.players.length === 1) {
    winnerDescription = `${winner.players[0].name} won`;
  } else if (winner.players.length === 2) {
    winnerDescription = `${winner.players
      .map((p) => p.name)
      .join(", ")
      .replace(/, ((?:.(?!, ))+)$/, " and $1")} split the pot`;
  } else if (winner.players.length > 2) {
    winnerDescription = `${winner.players
      .map((p) => p.name)
      .join(", ")
      .replace(/, ((?:.(?!, ))+)$/, ", and $1")} split the pot`;
  }

  if (fullDescription) {
    winnerDescription = `${winnerDescription} with ${winner.hand}`;
  }

  return winnerDescription;
};

const getWonAmount = (winner, pots) => {
  let daMoney = 0;
  let numberOfWinners = winner.winner.players.length;

  pots.forEach((pot) => {
    daMoney += pot;
  });

  if (numberOfWinners === 1) {
    return daMoney;
  } else if (numberOfWinners > 1) {
    return Math.floor(daMoney / numberOfWinners);
  }
};

const Ranks = Object.freeze([
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
  "A",
]);

const Suits = Object.freeze(["hearts", "clubs", "diams", "spades"]);

const Cards = (faceUp) => {
  return Object.entries(Ranks).reduce(
    (cards, [weight, rank]) => [
      ...cards,
      ...Suits.map((suit) => ({ rank, suit, weight, faceUp })),
    ],
    []
  );
};

const CardsCreator = (() => {
  let instance;

  const init = () => {
    let passed = [];

    const getUniqueRandomInt = (max) => {
      const num = Math.floor(Math.random() * Math.floor(max));

      if (_.includes(passed, num)) {
        return getUniqueRandomInt(max);
      }

      passed.push(num);

      return num;
    };

    const clearPassed = () => {
      passed = [];
    };

    const getCards = (faceUp = false, max = 52, n = 5) => {
      return _.times(n, () => Cards(faceUp)[getUniqueRandomInt(max)]);
    };

    return {
      getCards,
      clearPassed,
    };
  };

  return {
    getInstance: () => {
      if (!instance) instance = init();

      return instance;
    },
  };
})();

// Cards creator for game
let cardsCreator = CardsCreator.getInstance();

const createCards = (max, n, remaining = [], faceUp) => {
  return [...remaining, ...cardsCreator.getCards(faceUp, max, n)];
};

let playerNames = [];
let playerSockets = [];

let watcherNames = [];
let watcherSockets = [];

// Then you can use `io` to listen the `connection` event and get a socket
// from a client
io.on("connection", (socket) => {
  // from this point you are on the WS connection with a specific client
  console.log(socket.id, "connected");
  socket.emit("confirmation", { playerNames, playerSockets });

  socket.on("disconnect", (reason) => {
    let playersIndex = playerSockets.indexOf(socket.id);
    let playerName = playerNames[playersIndex];
    let playerSocket = playerSockets[playersIndex];

    let tempPlayerNames = [...playerNames];
    let tempPlayerSockets = [...playerSockets];

    tempPlayerNames = tempPlayerNames.filter((player) => player !== playerName);
    tempPlayerSockets = tempPlayerSockets.filter(
      (socket) => socket !== playerSocket
    );

    playerNames = tempPlayerNames;
    playerSockets = tempPlayerSockets;

    io.emit("playerDisconnect", { playerNames, playerSockets });
  });

  socket.on("playerJoined", (data) => {
    playerNames.push(data.newPlayerName);
    playerSockets.push(socket.id);
    io.emit("playerJoined", {
      playerName: data.newPlayerName,
      socket: socket.id,
    });
  });

  socket.on("watcherJoined", (data) => {
    let watcherName = `Watcher ${watcherNames.length + 1}`;
    watcherNames.push(watcherName);
    watcherSockets.push(socket.id);
    io.emit("watcherJoined", {
      watcherName,
      socket: socket.id,
    });
  });

  socket.on("playerBet", (data) => {
    io.emit("sendBetData", data);
  });

  socket.on("playerCheckedOrCalled", (data) => {
    io.emit("sendCheckOrCallData", data);
  });

  socket.on("sendChat", (data) => {
    io.emit("sendChatData", data);
  });

  socket.on("playerFolded", (data) => {
    io.emit("sendFoldData", data);
  });

  socket.on("advanceHoldEmGame", (data) => {
    let advanceData = advanceHoldEmGame(data);
    io.emit("sendAdvanceData", advanceData);
  });

  socket.on("advanceToEnd", (data) => {
    io.emit("advancingToEnd", true);
    advanceToEnd(data);
  });

  socket.on("endRound", (data) => {
    let endData = endHoldEmRound(data);
    io.emit("sendEndRoundData", endData);
  });

  socket.on("showCards", (data) => {
    io.emit("sendShowCardsData", data);
  });

  socket.on("advanceHands", (data) => {
    cardsCreator.clearPassed();
    let tempPlayers = [...data.players];

    let newPlayers = tempPlayers.map((prev, index) => {
      let newPlayer = {
        name: tempPlayers[index].name,
        chips: prev.chips,
        cards: prev.chips <= 0 ? [] : createCards(52, 2, undefined, false),
        folded: prev.chips <= 0 ? true : false,
        socket: data.playerSockets[index],
        allIn: false,
      };
      return newPlayer;
    });

    let tempHands = [...data.hands];

    io.emit("sendAdvanceHandsData", { players: newPlayers, hands: tempHands, blinds: data.blinds });
  });

  socket.on("startHoldEmGame", (data) => {
    cardsCreator.clearPassed();

    let players = data.playerNames;
    let playerChips = data.playerChips;
    let pastHands = data.pastHands;
    let newBlinds = data.newBlinds ? data.newBlinds : [10, 20];

    let tempPlayers = [...players];
    let dealtCards = [];
    let fullPlayers = [];
    let tempPot = 0;

    let nextDealerIndex = pastHands.length % players.length;
    let nextLittleBlindIndex = (pastHands.length + 1) % players.length;
    let nextBigBlindIndex = (pastHands.length + 2) % players.length;

    tempPlayers.forEach((player, index) => {
      let newCards = createCards(52, 2, undefined, false);

      let newGuy = {
        cards: newCards,
        name: player,
        socket: data.playerSockets[index],
        chips: playerChips[index],
        folded: false,
      };

      if (index == nextLittleBlindIndex) {
        newGuy.chips = newGuy.chips - newBlinds[0];
        tempPot = tempPot + newBlinds[0];
      } else if (index == nextBigBlindIndex) {
        newGuy.chips = newGuy.chips - newBlinds[1];
        tempPot = tempPot + newBlinds[1];
      }

      fullPlayers.push(newGuy);

      dealtCards = [...dealtCards, ...newCards];
    });

    let startHoldEmGameProps = {
      gameState: GameState.Preflop,
      gameStarted: true,
      gameOver: false,
      dealtCards,
      players: fullPlayers,
      dealerCards: [],
      dealerIndex: nextDealerIndex,
      littleBlindIndex: nextLittleBlindIndex,
      bigBlindIndex: nextBigBlindIndex,
      dealer: fullPlayers[nextDealerIndex],
      littleBlind: fullPlayers[nextLittleBlindIndex],
      bigBlind: fullPlayers[nextBigBlindIndex],
      pots: [tempPot],
      activePlayer: fullPlayers[nextDealerIndex],
      blinds: newBlinds,
      hands: pastHands,
    };

    io.emit("startHoldEmGame", startHoldEmGameProps);
  });
});

app.use(compression());

// You may want to be more aggressive with this caching
app.use(express.static("public", { maxAge: "1h" }));

// Remix fingerprints its assets so we can cache forever
app.use(express.static("public/build", { immutable: true, maxAge: "1y" }));

app.use(morgan("tiny"));
app.all(
  "*",
  MODE === "production"
    ? createRequestHandler({ build: require("./build") })
    : (req, res, next) => {
        purgeRequireCache();
        const build = require("./build");
        return createRequestHandler({ build, mode: MODE })(req, res, next);
      }
);

const port = process.env.PORT || 3000;

// instead of running listen on the Express app, do it on the HTTP server
httpServer.listen(port, () => {
  console.log(`Express server listening on port ${port}`);
});

////////////////////////////////////////////////////////////////////////////////
function purgeRequireCache() {
  // purge require cache on requests for "server side HMR" this won't let
  // you have in-memory objects between requests in development,
  // alternatively you can set up nodemon/pm2-dev to restart the server on
  // file changes, we prefer the DX of this though, so we've included it
  // for you by default
  for (const key in require.cache) {
    if (key.startsWith(BUILD_DIR)) {
      delete require.cache[key];
    }
  }
}

import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import { LinksFunction, MetaFunction } from "@remix-run/node";
import { useEffect, useState } from "react";
import Card from "~/components/Card";
import PlayerDisplay from "~/components/PlayerDisplay";
import Table from "~/components/Table";
import { AdvanceGameProps, NextProps } from "~/utils/game";
import {
  CardProps, PokerWinner,
  StartHoldEmGameProps
} from "~/utils/poker";
import cardStyles from "../styles/cards.css";
import progressStyles from "../styles/progress.css";

import { useSocket } from "~/context";

export const links: LinksFunction = () => {
  return [
    { rel: "stylesheet", href: cardStyles },
    { rel: "stylesheet", href: progressStyles },
  ];
};

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "Poker World",
  viewport: "width=device-width,initial-scale=1",
});

// export const loader: LoaderFunction = async ({ request }) => {
//     return null;
// }

export interface Player {
  name: string;
  cards: CardProps[];
  chips: number;
  folded: boolean;
  finalCards?: any | any[];
  socket?: string;
  [key: string]: string | number | boolean | CardProps[] | (string | undefined);
}

export interface SendCheckOrCallDataProps {
  players: Player[];
  pots: any[];
  prevActivePlayerIndex: number;
  activePlayerIndex: number;
  activePlayer: Player;
  turnNumber: number;
  playerSocket: string;
  gameState: number;
  dealerCards: any[];
  activeBet: number;
  turnsThisRound: number;
  hands: any[];
}

export interface SendFoldDataProps {
  players: Player[];
  prevActivePlayerIndex: number;
  activePlayerIndex: number;
  activePlayer: Player;
  turnNumber: number;
  playerSocket: string;
  gameState: number;
  turnsNextRound: number;
  turnsThisRound: number;
  hands: any[];
}

export interface SendBetDataProps {
  players: Player[];
  pots: any[];
  prevActivePlayerIndex: number;
  activePlayerIndex: number;
  activePlayer: Player;
  turnNumber: number;
  playerSocket: string;
  gameState: number;
  dealerCards: any[];
  activeBet: number;
  turnsNextRound: number;
  turnsThisRound: number;
  hands: any[];
}

const GameState = Object.freeze({
  Preflop: 0,
  Flop: 1,
  Turn: 2,
  River: 3,
  Showdown: 4,
});

const initialPlayers: Player[] = [
  {
    name: "riceflair",
    chips: 1000,
    cards: [],
    folded: false,
  },
  {
    name: "misterbrother",
    chips: 1000,
    cards: [],
    folded: false,
  },
  {
    name: "copsucker",
    chips: 1000,
    cards: [],
    folded: false,
  },
];

let isMount = true;
export default function Index() {
  const [gameState, setGameState] = useState(GameState.Preflop);

  const socket = useSocket();

  const [gameStarted, setGameStarted] = useState(false);
  const [bet, setBet] = useState(0);
  const [dealerCards, setDealerCards] = useState<any[]>([]);
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const [dealtCards, setDealtCards] = useState<any[]>([]);

  const [players, setPlayers] = useState<Player[]>(initialPlayers);
  const [activePlayerIndex, setActivePlayerIndex] = useState(1); //set to one as that is the player after the dealer
  const [activePlayer, setActivePlayer] = useState(
    initialPlayers[activePlayerIndex]
  );

  const [dealer, setDealer] = useState(initialPlayers[0]);
  const [littleBlind, setLittleBlind] = useState(initialPlayers[1]);
  const [bigBlind, setBigBlind] = useState(initialPlayers[2]);
  const [pots, setPots] = useState<any[]>([0]);
  const [activeBet, setActiveBet] = useState(0);
  const [turnNumber, setTurnNumber] = useState(0);
  const [blinds, setBlinds] = useState([10, 20]);
  const [winner, setWinner] = useState<{
    winner: PokerWinner;
    description: string;
  } | null>(null);
  const [gameOver, setGameOver] = useState(false);

  const [hands, setHands] = useState<any[]>([]);
  const [activePlayerCount, setActivePlayerCount] = useState(3);
  const [winningCards, setWinningCards] = useState<any[]>([]);
  const [wonAmount, setWonAmount] = useState(0);
  const [playerName, setPlayerName] = useState("");
  const [buttonClicked, setButtonClicked] = useState(false);

  const [playerCount, setPlayerCount] = useState(0);
  const [messageSent, setMessageSent] = useState(false);

  const [socketConnected, setSocketConnected] = useState(false);
  const [playerNames, setPlayerNames] = useState<any[]>([]);
  const [playerSocket, setPlayerSocket] = useState<any>();
  const [playerSockets, setPlayerSockets] = useState<any[]>([]);

  const [player, setPlayer] = useState<Player>();

  const [joinedGame, setJoinedGame] = useState(false);

  const [turnsThisRound, setTurnsThisRound] = useState(3);
  const [turnsNextRound, setTurnsNextRound] = useState(3);

  const [earlyWin, setEarlyWin] = useState(false);

  const handleCheckOrCall = () => {
    let tempPlayers = [...players];
    let tempActivePlayer = tempPlayers.find(
      (tempP) => tempP.name === activePlayer.name
    );
    tempActivePlayer!.chips -= activeBet;
    let tempPots = [...pots];
    tempPots[0] += activeBet;

    const advanceProps = getNextPlayerProps();

    const checkOrCallProps: SendCheckOrCallDataProps = {
      players: tempPlayers,
      pots: tempPots,
      prevActivePlayerIndex: advanceProps.prevActivePlayerIndex,
      activePlayerIndex: advanceProps.activePlayerIndex,
      activePlayer: advanceProps.activePlayer,
      turnNumber,
      playerSocket,
      gameState,
      dealerCards,
      activeBet,
      turnsThisRound,
      hands,
    };

    socket!.emit("playerCheckedOrCalled", checkOrCallProps);
  };

  useEffect(() => {
    if (!socket) return;

    const advance = (tn: number, data: AdvanceGameProps, type: string) => {
      let tempTurnNumber = tn;

      if (type === "BET") {
        tempTurnNumber = 0;
        setTurnNumber(0);
      }

      if (type === "FOLD") {
        setActivePlayerCount((prev) => {
          return prev - 1;
        });
      }

      let tempActivePlayerCount = data.players.filter((p) => !p.folded).length;

      if (tempActivePlayerCount === 1) {
        // need to end the round. last active player wins
        endRound(data);
        return;
      }

      if (tempTurnNumber >= data.turnsThisRound - 1) {
        if (data.activePlayer.socket === socket?.id) {
          advanceGame(data);
        }
        setTurnNumber(0);
      } else {
        setTurnNumber((prev) => prev + 1);
      }
    };

    socket.on(
      "confirmation",
      (data: { playerNames: any[]; playerSockets: any[] }) => {
        setPlayerNames(data.playerNames);
        setPlayerSockets(data.playerSockets);
        setPlayerCount(data.playerNames.length);
      }
    );

    socket.on("playerDisconnect", (data: { playerNames: any[]; playerSockets: any[] }) => {
      setPlayerNames(data.playerNames);
      setPlayerSockets(data.playerSockets);
      setPlayerCount(data.playerNames.length);
    });

    socket.on("playerJoined", (data) => {
      setPlayerNames((prevPN) => [...prevPN, data.playerName]);
      setPlayerSockets((prevPS) => [...prevPS, data.socket]);
      if (data.socket === socket.id) {
        setPlayerSocket(data.socket);
        setPlayer(data);
        setJoinedGame(true);
      }
      let newPlayerCount = 0;
      setPlayerCount((prevPC) => {
        newPlayerCount = prevPC + 1;
        return newPlayerCount;
      });
      setButtonClicked(false);
    });

    socket.on("sendHoldEmData", (data: StartHoldEmGameProps) => {
      setGameState(data.gameState);
      setGameStarted(data.gameStarted);
      setGameOver(data.gameOver);
      setDealtCards(data.dealtCards);
      setDealerCards(data.dealerCards);
      setPlayers(data.players);
      setDealer(data.dealer);
      setLittleBlind(data.littleBlind);
      setBigBlind(data.bigBlind);

      setActivePlayerIndex(1);
      setActivePlayer(data.players[1]);
    });

    socket.on("sendBetData", (data: SendBetDataProps) => {
      setPots(data.pots);
      setPlayers(data.players);
      setActiveBet(data.activeBet);
      setActivePlayerIndex(data.activePlayerIndex);
      setActivePlayer(data.activePlayer);
      setSnackbarMessage(
        `${data.players[data.prevActivePlayerIndex].name} bet ${data.activeBet}`
      );
      setIsSnackbarOpen(true);

      const advanceDataProps: AdvanceGameProps = {
        activePlayer: data.activePlayer,
        gameState: data.gameState,
        dealerCards: data.dealerCards,
        players: data.players,
        hands: data.hands,
        pots: data.pots,
        activeBet: data.activeBet,
        turnsNextRound: data.turnsNextRound,
        turnsThisRound: data.turnsThisRound,
      };

      advance(data.turnNumber, advanceDataProps, "BET");
    });

    socket.on("sendShowCardsData", (data: { players: any[] }) => {
      setPlayers(data.players);
    });

    socket.on("sendCheckOrCallData", (data: SendCheckOrCallDataProps) => {
      setPots(data.pots);
      setPlayers(data.players);
      setGameState(data.gameState);
      setActivePlayerIndex(data.activePlayerIndex);
      setActivePlayer(data.activePlayer);

      setSnackbarMessage(
        data.activeBet
          ? `${data.players[data.prevActivePlayerIndex].name} called $${
              data.activeBet
            }`
          : `${data.players[data.prevActivePlayerIndex].name} checked`
      );
      setIsSnackbarOpen(true);

      const advanceDataProps: AdvanceGameProps = {
        activePlayer: data.activePlayer,
        gameState: data.gameState,
        dealerCards: data.dealerCards,
        players: data.players,
        hands: data.hands,
        pots: data.pots,
        turnsNextRound,
        turnsThisRound: data.turnsThisRound,
      };

      advance(data.turnNumber, advanceDataProps, "CHECK");
    });

    socket.on("sendFoldData", (data: SendFoldDataProps) => {
      setPlayers(data.players);
      setGameState(data.gameState);
      setActivePlayerIndex(data.activePlayerIndex);
      setActivePlayer(data.activePlayer);

      setTurnsNextRound(data.turnsNextRound);

      setSnackbarMessage(
        `${data.players[data.prevActivePlayerIndex].name} folded`
      );
      setIsSnackbarOpen(true);

      const advanceDataProps: AdvanceGameProps = {
        activePlayer: data.activePlayer,
        gameState: data.gameState,
        dealerCards,
        players: data.players,
        hands: data.hands,
        pots,
        turnsNextRound: data.turnsNextRound - 1,
        turnsThisRound: data.turnsThisRound,
      };

      advance(data.turnNumber, advanceDataProps, "FOLD");
    });

    socket.on("sendEndRoundData", (data: NextProps) => {
      setActiveBet(0);

      setGameState(data.gameState);

      setActivePlayerCount(data.turnsNextRound);

      setTurnsThisRound(data.turnsNextRound); // Keep Track of who folded this hand
      setTurnsNextRound(3); // reset turns next round

      setEarlyWin(true);

      if (data.winner) {
        setWinner(data.winner);
        setWinningCards(data.winningCards);
        setWonAmount(data.wonAmount);
      }

      setHands(data.hands);

      setPlayers(data.players);
      setGameOver(data.gameOver);
    });

    socket.on("sendAdvanceData", (data: NextProps) => {
      setActiveBet(0);

      setGameState(data.gameState);
      setDealerCards(data.dealerCards);

      setActivePlayerCount(data.turnsNextRound);

      setTurnsThisRound(data.turnsNextRound); // Keep Track of who folded this hand
      setTurnsNextRound(3); // reset turns next round

      if (data.winner) {
        setWinner(data.winner);
        setWinningCards(data.winningCards);
        setWonAmount(data.wonAmount);
      }

      setHands(data.hands);

      setPlayers(data.players);
      setGameOver(data.gameOver);
    });

    socket.on("sendAdvanceHandsData", (data) => {
      setGameState(GameState.Preflop);
      setGameStarted(true);
      setGameOver(false);
      setDealtCards([]);
      setDealerCards([]);
      setWinningCards([]);
      setWinner(null);
      setWonAmount(0);

      setTurnNumber(0);

      setEarlyWin(false);

      setActivePlayerCount(3);

      setTurnsThisRound(3);
      setTurnsNextRound(3);

      setPlayers(data.players);
      setHands(data.hands);

      let nextDealerIndex = data.hands.length % data.players.length;
      let nextLittleBlindIndex = (data.hands.length + 1) % data.players.length;
      let nextBigBlindIndex = (data.hands.length + 2) % data.players.length;

      setDealer(data.players[nextDealerIndex]);
      setLittleBlind(data.players[nextLittleBlindIndex]);
      setBigBlind(data.players[nextBigBlindIndex]);

      setActivePlayerIndex(nextLittleBlindIndex);

      setActivePlayer(data.players[nextLittleBlindIndex]);

      setPots([0]);
    });
  }, [socket]);

  useEffect(() => {
    if (playerCount === 3) {
      // if you're the third player, aka if you were the player
      // who joined last, you'll be the one to emit the event
      // to the server to kick off the game.
      if (playerSocket === playerSockets[2]) {
        let startProps = {
          playerNames,
          playerSockets,
          playerChips: players.map((p) => p.chips),
          pastHands: hands,
        };
        socket!.emit("startHoldEmGame", startProps);
      }
    }
  }, [playerCount]);

  useEffect(() => {
    if (buttonClicked) {
      if (!socket) return;
      socket.emit("playerJoined", { newPlayerName: playerName });
    }
  }, [buttonClicked]);

  const handleJoinGame = () => {
    setButtonClicked(true);
  };

  const handleFold = () => {
    let tempPlayers = [...players];
    let tempActivePlayer = tempPlayers.find(
      (player) => player.name === activePlayer.name
    );
    tempActivePlayer!.cards = tempActivePlayer!.cards.map((card) => {
      card.faceUp = false;
      return card;
    });
    tempActivePlayer!.folded = true;

    const advanceProps = getNextPlayerProps();

    const foldProps: SendFoldDataProps = {
      players: tempPlayers,
      activePlayerIndex: advanceProps.activePlayerIndex,
      activePlayer: advanceProps.activePlayer,
      prevActivePlayerIndex: advanceProps.prevActivePlayerIndex,
      turnNumber,
      playerSocket,
      gameState,
      turnsNextRound: turnsNextRound - 1,
      turnsThisRound: turnsNextRound,
      hands,
    };

    socket!.emit("playerFolded", foldProps);
  };

  const handleBet = (amount: number) => {
    let tempPlayers = [...players];
    let tempActivePlayer = tempPlayers.find(
      (player) => player.name === activePlayer.name
    );
    tempActivePlayer!.chips -= amount;
    let tempPots = [...pots];
    tempPots[0] += amount;

    const advanceProps = getNextPlayerProps();

    const betProps: SendBetDataProps = {
      players: tempPlayers,
      pots: tempPots,
      prevActivePlayerIndex: advanceProps.prevActivePlayerIndex,
      activePlayerIndex: advanceProps.activePlayerIndex,
      activePlayer: advanceProps.activePlayer,
      turnNumber,
      playerSocket,
      gameState,
      dealerCards,
      activeBet: amount,
      turnsNextRound,
      turnsThisRound,
      hands,
    };

    socket!.emit("playerBet", betProps);
  };

  const handlePlayerTimeout = (player: Player) => {
    if (playerSocket === player.socket) {
      handleFold();
    }

    setSnackbarMessage(`${player.name} timed out and auto-folded`);
    setIsSnackbarOpen(true);
  };

  const getNextPlayerProps = () => {
    let tempActivePlayerIndex = activePlayerIndex;
    let activePlayerIndicies: number[] = [];
    players.map((p, index) => {
      if (!p.folded) {
        activePlayerIndicies.push(index);
      }
    });

    let nextActivePlayerIndex = tempActivePlayerIndex;

    for (let i = 0; i < activePlayerIndicies.length; i++) {
      if (activePlayerIndicies[i] > nextActivePlayerIndex) {
        nextActivePlayerIndex = activePlayerIndicies[i];
        break;
      }
    }

    if (nextActivePlayerIndex === tempActivePlayerIndex) {
      nextActivePlayerIndex = activePlayerIndicies[0];
    }

    return {
      prevActivePlayerIndex: activePlayerIndex,
      activePlayerIndex: nextActivePlayerIndex,
      activePlayer: players[nextActivePlayerIndex],
    };
  };

  const endRound = (data: AdvanceGameProps) => {
    socket!.emit("endRound", data);
  }

  const advanceGame = (data: AdvanceGameProps) => {
    socket!.emit("advanceHoldEmGame", data);
  };

  const handleClose = () => {
    setIsSnackbarOpen(false);
  };

  const advanceHands = () => {
    socket!.emit("advanceHands", { players, hands, playerSockets });
  };

  const handleShowCards = (player: Player) => {
    let tempPlayers = [...players];

    let tempCards = tempPlayers.filter((p) => p.socket === player.socket).map((p) => p.cards);

    tempCards.forEach((cardArray) => {
      cardArray.forEach((card) => {
        card.faceUp = true;
      });
    });

    socket!.emit("showCards", { players: tempPlayers });
  };

  const handleMuckCards = () => {

  };

  return (
    <>
      <Snackbar
        open={isSnackbarOpen}
        autoHideDuration={3000}
        onClose={handleClose}
        key={snackbarMessage}
      >
        <Alert
          className="rounded-full"
          onClose={handleClose}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
      <main className="relative min-h-screen bg-[rgb(0,90,0)] flex items-center justify-center">
        <div className="relative sm:pb-16 sm:pt-8">
          <div className="mx-auto flex h-[100vh] w-[100vw] flex-col">
            {!gameStarted && (
              <>
                <input
                  placeholder="Enter player name"
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="absolute mt-24 self-center rounded bg-black px-4 py-2 text-white"
                />
                <button
                  className={`absolute self-center rounded bg-black px-4 py-2 text-white active:bg-white active:text-black ${
                    joinedGame ? "disabled" : ""
                  }`}
                  onClick={handleJoinGame}
                  disabled={joinedGame}
                >
                  {!joinedGame ? "Join Game" : "Joined, awaiting players"}
                </button>
                <div className="absolute mt-[30%] self-center text-6xl text-black">
                  {playerNames.join(", ")}
                </div>
              </>
            )}

            {gameOver && (
              <button
                id="next-btn"
                className="absolute self-center rounded bg-black px-4 py-2 text-white active:bg-white active:text-black"
                onClick={() => advanceHands()}
              >
                Next Hand
              </button>
            )}

            {gameStarted ? (
              <>
                <Table />
                <div className="flex flex-col items-center justify-center">
                  <div
                    className={`absolute top-[20%] w-full items-center justify-center self-center text-center text-3xl text-white transition-all duration-[1000ms] ${
                      !winner ? "opacity-0" : "opacity-100"
                    }`}
                  >
                    <h1>{winner ? winner.description : null}</h1>
                  </div>
                  <div className="absolute top-[30%] w-[100vw] items-center justify-center self-center text-center text-xl">
                    {`Blinds: ${blinds[0]}/${blinds[1]} • Pot: ${pots.join(
                      ", "
                    )} • Hand #${hands.length + 1}`}
                  </div>
                  <div className="playingCards simpleCards absolute bottom-[48%] z-[9999] flex w-[100vw] flex-row items-center justify-center">
                    {dealerCards.map((card, index) => (
                      <Card
                        key={`${index}-${card.suit}-${card.rank}`}
                        suit={card.suit}
                        rank={card.rank}
                        faceUp={card.faceUp}
                        folded={card.faceUp}
                        winner={
                          winningCards.length > 0
                            ? winningCards.filter((w) => {
                                return (
                                  w.suit == card.suit.charAt(0) &&
                                  w.value.toString().replace("T", "10") ===
                                    card.rank
                                );
                              }).length > 0
                            : false
                        }
                      />
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  {/* <div className="playingCards simpleCards fixed top-[30%] right-[35vw] flex w-[100vw] flex-row items-center justify-center"></div> */}
                  <div className="fixed bottom-[47vh] right-[35vw] flex w-[100vw] flex-col items-center justify-center z-[4000]">
                    <div className="playingCards simpleCards flex flex-row items-center justify-center">
                      {players[1].cards.map((card, index) => (
                        <Card
                          key={`${index}-${card.suit}-${card.rank}`}
                          suit={card.suit}
                          rank={card.rank}
                          faceUp={
                            (!players[1].folded &&
                              players[1].socket === playerSocket) ||
                            card.faceUp
                          }
                          folded={players[1].folded}
                          winner={
                            winningCards.length > 0
                              ? winningCards.filter((w) => {
                                  return (
                                    w.suit == card.suit.charAt(0) &&
                                    w.value.toString().replace("T", "10") ===
                                      card.rank
                                  );
                                }).length > 0
                              : false
                          }
                        />
                      ))}
                    </div>
                    <PlayerDisplay
                      player={players[1]}
                      active={activePlayer.name === players[1].name && !gameOver}
                      onTimeout={() => handlePlayerTimeout(players[1])}
                      prevPlayer={players[0]}
                      gameOver={gameOver}
                    />
                  </div>
                  {dealer.name === players[1].name ? (
                    <div className="absolute bottom-[50%] flex w-[100vw] flex-row pl-8 z-0">
                      <img
                        src="images/black-dealer-button.png"
                        alt="dealer"
                        className="relative object-cover"
                      />
                    </div>
                  ) : littleBlind.name === players[1].name ? (
                    <div className="absolute bottom-[50%] flex w-[100vw] flex-row pl-8 z-0">
                      <img
                        src="images/littleblind.png"
                        alt="little blind"
                        width="50px"
                        height="50px"
                        className="relative object-cover"
                      />
                    </div>
                  ) : bigBlind.name === players[1].name ? (
                    <div className="absolute bottom-[50%] flex w-[100vw] flex-row pl-8 z-0">
                      <img
                        src="images/bigblind.png"
                        alt="big blind"
                        width="50px"
                        height="50px"
                        className="relative object-cover"
                      />
                    </div>
                  ) : null}
                </div>
                <div className="flex flex-col gap-1">
                  {/* <div className="playingCards simpleCards fixed top-[30%] left-[35vw] flex w-[100vw] flex-row items-center justify-center"></div> */}
                  <div className="fixed bottom-[47vh] left-[35vw] flex w-[100vw] flex-col items-center justify-center z-[4000]">
                    <div className="playingCards simpleCards flex flex-row items-center justify-center">
                      {players[2].cards.map((card, index) => (
                        <Card
                          key={`${index}-${card.suit}-${card.rank}`}
                          suit={card.suit}
                          rank={card.rank}
                          faceUp={
                            (!players[2].folded &&
                              players[2].socket === playerSocket) ||
                            card.faceUp
                          }
                          folded={players[2].folded}
                          winner={
                            winningCards.length > 0
                              ? winningCards.filter((w) => {
                                  return (
                                    w.suit == card.suit.charAt(0) &&
                                    w.value.toString().replace("T", "10") ===
                                      card.rank
                                  );
                                }).length > 0
                              : false
                          }
                        />
                      ))}
                    </div>
                    <PlayerDisplay
                      player={players[2]}
                      active={activePlayer.name === players[2].name && !gameOver}
                      onTimeout={() => handlePlayerTimeout(players[2])}
                      prevPlayer={players[1]}
                      gameOver={gameOver}
                    />
                  </div>
                  {dealer.name === players[2].name ? (
                    <div className="absolute bottom-[50%] flex w-[100vw] flex-row items-end justify-end pr-8 z-0">
                      <img
                        src="images/black-dealer-button.png"
                        alt="dealer"
                        className="relative object-cover"
                      />
                    </div>
                  ) : littleBlind.name === players[2].name ? (
                    <div className="absolute bottom-[50%] flex w-[100vw] flex-row items-end justify-end pr-8 z-0">
                      <img
                        src="images/littleblind.png"
                        alt="little blind"
                        width="50px"
                        height="50px"
                        className="relative object-cover"
                      />
                    </div>
                  ) : bigBlind.name === players[2].name ? (
                    <div className="absolute bottom-[50%] flex w-[100vw] flex-row items-end justify-end pr-8 z-0">
                      <img
                        src="images/bigblind.png"
                        alt="big blind"
                        width="50px"
                        height="50px"
                        className="relative object-cover"
                      />
                    </div>
                  ) : null}
                </div>
                <div className="playingCards simpleCards fixed bottom-[20%] flex w-[100vw] flex-row items-center justify-center">
                  {players[0].cards.map((card, index) => (
                    <Card
                      key={`${index}-${card.suit}-${card.rank}`}
                      suit={card.suit}
                      rank={card.rank}
                      faceUp={
                        (!players[0].folded &&
                          players[0].socket === playerSocket) ||
                        card.faceUp
                      }
                      folded={players[0].folded}
                      winner={
                        winningCards.length > 0
                          ? winningCards.filter((w) => {
                              return (
                                w.suit == card.suit.charAt(0) &&
                                w.value.toString().replace("T", "10") ===
                                  card.rank
                              );
                            }).length > 0
                          : false
                      }
                    />
                  ))}
                </div>
                <div className="fixed bottom-[7.5%] flex w-[100vw] flex-col items-center justify-center z-[4000]">
                  <PlayerDisplay
                    player={players[0]}
                    active={activePlayer.name === players[0].name && !gameOver}
                    onTimeout={() => handlePlayerTimeout(players[0])}
                    prevPlayer={players[players.length - 1]}
                    gameOver={gameOver}
                  />
                </div>
                {dealer.name === players[0].name ? (
                  <div className="absolute bottom-[1%] flex w-[100vw] flex-row items-center justify-center z-0">
                    <img
                      src="images/black-dealer-button.png"
                      alt="dealer"
                      className="relative object-cover"
                    />
                  </div>
                ) : littleBlind.name === players[0].name ? (
                  <div className="absolute bottom-[1%] flex w-[100vw] flex-row items-center justify-center z-0">
                    <img
                      src="images/littleblind.png"
                      alt="little blind"
                      width="50px"
                      height="50px"
                      className="relative object-cover"
                    />
                  </div>
                ) : bigBlind.name === players[0].name ? (
                  <div className="absolute bottom-[1%] flex w-[100vw] flex-row items-center justify-center z-0">
                    <img
                      src="images/bigblind.png"
                      alt="big blind"
                      width="50px"
                      height="50px"
                      className="relative object-cover"
                    />
                  </div>
                ) : null}
                {!gameOver && activePlayer.socket === playerSocket ? (
                  <div className="fixed bottom-[10%] right-0 flex w-[220px] flex-row items-end justify-end pr-8">
                    <div className="flex w-[100%] flex-row items-end">
                      <div className="m-2">
                        <input
                          type="range"
                          className="form-range w-full p-0 focus:shadow-none focus:outline-none focus:ring-0"
                          min="0"
                          max="100"
                          value={bet}
                          onChange={(event) => {
                            setBet(+event.target.value);
                          }}
                        />
                      </div>
                      <div className="flex-1" />
                      <button className="rounded bg-transparent px-4 py-2 text-white">
                        ${bet}
                      </button>
                    </div>
                    <div className="fixed bottom-[5%] flex w-[100vw] flex-row items-end justify-end">
                      <button
                        className="mr-1 rounded bg-black px-4 py-2 text-white active:bg-white active:text-black"
                        onClick={handleFold}
                      >
                        Fold
                      </button>
                      <button
                        className="mr-1 rounded bg-black px-4 py-2 text-white active:bg-white active:text-black"
                        onClick={handleCheckOrCall}
                      >
                        {activeBet > 0 ? `Call $${activeBet}` : "Check"}
                      </button>
                      <button
                        className="rounded bg-black px-4 py-2 text-white active:bg-white active:text-black"
                        onClick={() => handleBet(bet)}
                      >
                        Bet
                      </button>
                    </div>
                  </div>
                ) : null}
                {gameOver && earlyWin && winner && winner.winner.players.map((p) => p.player.socket).includes(player!.socket) ? (
                  <div className="fixed bottom-[10%] right-0 flex w-[220px] flex-row items-end justify-end pr-8">
                    <div className="fixed bottom-[5%] flex w-[100vw] flex-row items-end justify-end">
                      <button
                        className="mr-1 rounded bg-black px-4 py-2 text-white active:bg-white active:text-black"
                        onClick={() => handleShowCards(player!)}
                      >
                        Show Cards
                      </button>
                      <button
                        className="mr-1 rounded bg-black px-4 py-2 text-white active:bg-white active:text-black"
                        onClick={handleMuckCards}
                      >
                        Muck
                      </button>
                    </div>
                  </div>
                ) : null}
              </>
            ) : null}
          </div>
        </div>
      </main>
    </>
  );
}

import { LinksFunction, MetaFunction } from "@remix-run/node";
import { useEffect, useState } from "react";
import Card from "~/components/Card";
import PlayerDisplay from "~/components/PlayerDisplay";
import Table from "~/components/Table";
import { AdvanceGameProps, NextProps } from "~/utils/game";
import { CardProps, PokerWinner, StartHoldEmGameProps } from "~/utils/poker";
import cardStyles from "../styles/cards.css";
import progressStyles from "../styles/progress.css";

import { useSocket } from "~/context";
import { pluralize } from "~/utils";
import { isEmpty } from "lodash";

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
  allIn?: boolean;
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
  needResponsesFrom: number;
  littleBlindIndex: number;
  bigBlindIndex: number;
  callAmount: number;
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
  pots: any[];
  dealerCards: any[];
  needResponsesFrom: number;
  littleBlindIndex: number;
  bigBlindIndex: number;
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
  needResponsesFrom: number;
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
    allIn: false,
  },
  {
    name: "misterbrother",
    chips: 1000,
    cards: [],
    folded: false,
    allIn: false,
  },
  {
    name: "copsucker",
    chips: 1000,
    cards: [],
    folded: false,
    allIn: false,
  },
];

let isMount = true;
export default function Index() {
  const [gameState, setGameState] = useState(GameState.Preflop);

  const socket = useSocket();

  const [logs, setLogs] = useState<string[]>([]);

  const [gameStarted, setGameStarted] = useState(false);

  const [dealerCards, setDealerCards] = useState<any[]>([]);
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const [dealtCards, setDealtCards] = useState<any[]>([]);

  const [players, setPlayers] = useState<Player[]>(initialPlayers);
  const [activePlayerIndex, setActivePlayerIndex] = useState(0);
  const [activePlayer, setActivePlayer] = useState(
    initialPlayers[activePlayerIndex]
  );

  const [dealer, setDealer] = useState(initialPlayers[0]);
  const [littleBlind, setLittleBlind] = useState(initialPlayers[1]);
  const [bigBlind, setBigBlind] = useState(initialPlayers[2]);
  const [littleBlindAmount, setLittleBlindAmount] = useState(10);
  const [bigBlindAmount, setBigBlindAmount] = useState(20);
  const [bet, setBet] = useState(bigBlindAmount);
  const [pots, setPots] = useState<any[]>([littleBlindAmount, bigBlindAmount]);
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
  const [playerNames, setPlayerNames] = useState<any[]>([]);
  const [playerSocket, setPlayerSocket] = useState<any>();
  const [playerSockets, setPlayerSockets] = useState<any[]>([]);
  const [player, setPlayer] = useState<Player>();
  const [joinedGame, setJoinedGame] = useState(false);
  const [turnsThisRound, setTurnsThisRound] = useState(2);
  const [turnsNextRound, setTurnsNextRound] = useState(2);
  const [earlyWin, setEarlyWin] = useState(false);
  const [needResponsesFrom, setNeedResponsesFrom] = useState(3);
  const [littleBlindIndex, setLittleBlindIndex] = useState(1);
  const [bigBlindIndex, setBigBlindIndex] = useState(2);
  const [manualAdvance, setManualAdvance] = useState(false);
  const [ultimateWinner, setUltimateWinner] = useState<Player | null>(null);

  const [advancingToEnd, setAdvancingToEnd] = useState(false);

  const handleCheckOrCall = (callAmount: number) => {
    let tempPlayers = [...players];
    let tempActivePlayer = tempPlayers.find(
      (tempP) => tempP.name === activePlayer.name
    );
    tempActivePlayer!.chips -= callAmount;

    if (tempActivePlayer!.chips <= 0) {
      tempActivePlayer!.allIn = true;
    }

    let tempPots = [...pots];
    tempPots[0] += callAmount;

    const advanceProps = getNextPlayerProps(tempPlayers);

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
      needResponsesFrom,
      littleBlindIndex,
      bigBlindIndex,
      callAmount,
    };

    socket!.emit("playerCheckedOrCalled", checkOrCallProps);
  };

  useEffect(() => {
    if (!socket) return;

    const advance = (data: AdvanceGameProps, type: string) => {
      let tempNeedResponsesFrom = data.needResponsesFrom;

      if (type === "BET") {
        tempNeedResponsesFrom = data.players.filter((p) => !p.folded).length - 1;
        setNeedResponsesFrom(data.players.filter((p) => !p.folded).length - 1);
      } else {
        tempNeedResponsesFrom = tempNeedResponsesFrom - 1;
        setNeedResponsesFrom(tempNeedResponsesFrom);
      }

      if (type === "FOLD") {
        setActivePlayerCount((prev) => {
          return prev - 1;
        });
      }

      let tempActivePlayerCount = data.players.filter((p) => !p.folded).length;

      if (tempActivePlayerCount === 1) {
        // need to end the round. last active player wins
        if (data.activePlayer.socket === socket?.id) {
          endRound(data);
          return;
        } else {
          return;
        }
      }

      if (tempNeedResponsesFrom === 0) {
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

    socket.on(
      "playerDisconnect",
      (data: { playerNames: any[]; playerSockets: any[] }) => {
        setPlayerNames(data.playerNames);
        setPlayerSockets(data.playerSockets);
        setPlayerCount(data.playerNames.length);
      }
    );

    socket.on("dealerCards", (data) => {
      setDealerCards(data);
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

      setPots(data.pots);

      setUltimateWinner(null);

      setWinningCards([]);

      setActiveBet(bigBlindAmount);

      setDealer(data.dealer);
      setLittleBlind(data.littleBlind);
      setBigBlind(data.bigBlind);

      setActivePlayerIndex(data.dealerIndex);
      setActivePlayer(data.players[data.dealerIndex]);
    });

    socket.on("sendBetData", (data: SendBetDataProps) => {
      setPots(data.pots);
      setPlayers(data.players);
      setActiveBet(data.activeBet);
      setBet(data.activeBet);
      setActivePlayerIndex(data.activePlayerIndex);
      setActivePlayer(data.activePlayer);
      setLogs((prev) => [
        ...prev,
        `${data.players[data.prevActivePlayerIndex].name} bet ${data.activeBet
        }`,
      ]);
      setSnackbarMessage(
        `${data.players[data.prevActivePlayerIndex].name} bet ${data.activeBet}`
      );
      setIsSnackbarOpen(true);

      setNeedResponsesFrom(data.needResponsesFrom);

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
        needResponsesFrom: data.needResponsesFrom,
      };

      advance(advanceDataProps, "BET");
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

      setLittleBlindIndex(data.littleBlindIndex);
      setBigBlindIndex(data.bigBlindIndex);

      if (data.activeBet <= bigBlindAmount) {
        if (
          data.gameState === GameState.Preflop &&
          data.littleBlindIndex == data.activePlayerIndex
        ) {
          setActiveBet(littleBlindAmount);
        } else if (
          data.gameState === GameState.Preflop &&
          data.bigBlindIndex == data.activePlayerIndex
        ) {
          setActiveBet(0);
        }
      }

      let checkOrCallDescription = data.activeBet
        ? `${data.players[data.prevActivePlayerIndex].name} called ${data.callAmount
        }`
        : `${data.players[data.prevActivePlayerIndex].name} checked`;

      setLogs((prev) => [...prev, checkOrCallDescription]);

      setSnackbarMessage(checkOrCallDescription);
      setIsSnackbarOpen(true);

      setNeedResponsesFrom(data.needResponsesFrom);

      const advanceDataProps: AdvanceGameProps = {
        activePlayer: data.activePlayer,
        gameState: data.gameState,
        dealerCards: data.dealerCards,
        players: data.players,
        hands: data.hands,
        pots: data.pots,
        turnsNextRound,
        turnsThisRound: data.turnsThisRound,
        needResponsesFrom: data.needResponsesFrom,
      };

      advance(advanceDataProps, "CHECK");
    });

    socket.on("sendFoldData", (data: SendFoldDataProps) => {
      setPlayers(data.players);
      setGameState(data.gameState);
      setActivePlayerIndex(data.activePlayerIndex);
      setActivePlayer(data.activePlayer);

      setTurnsNextRound(data.turnsNextRound);

      if (
        data.gameState === GameState.Preflop &&
        data.littleBlindIndex == data.activePlayerIndex
      ) {
        setActiveBet(littleBlindAmount);
      } else if (
        data.gameState === GameState.Preflop &&
        data.bigBlindIndex == data.activePlayerIndex
      ) {
        setActiveBet(0);
      }

      setLogs((prev) => [
        ...prev,
        `${data.players[data.prevActivePlayerIndex].name} folded`,
      ]);

      setSnackbarMessage(
        `${data.players[data.prevActivePlayerIndex].name} folded`
      );
      setIsSnackbarOpen(true);

      setNeedResponsesFrom(data.needResponsesFrom);

      const advanceDataProps: AdvanceGameProps = {
        activePlayer: data.activePlayer,
        gameState: data.gameState,
        dealerCards: data.dealerCards,
        players: data.players,
        hands: data.hands,
        pots: data.pots,
        turnsNextRound: data.turnsNextRound - 1,
        turnsThisRound: data.turnsThisRound,
        needResponsesFrom: data.needResponsesFrom,
      };

      advance(advanceDataProps, "FOLD");
    });

    socket.on("sendEndRoundData", (data: NextProps) => {
      setActiveBet(0);

      setBet(bigBlindAmount);

      setGameState(data.gameState);

      setActivePlayerCount(2 - data.players.filter((p) => p.chips <= 0).length);

      setTurnsThisRound(data.turnsNextRound); // Keep Track of who folded this hand
      setTurnsNextRound(2 - data.players.filter((p) => p.chips <= 0).length); // reset turns next round

      setEarlyWin(true);

      if (data.winner) {
        setWinner(data.winner);
        setLogs((prev) => [...prev, data.winner.description]);
        setWinningCards(data.winningCards);
        setWonAmount(data.wonAmount);
      }

      setHands(data.hands);

      setPlayers(data.players);
      setGameOver(data.gameOver);
    });

    socket.on("sendAdvanceData", (data: NextProps) => {
      if (!isEmpty(data)) {
        setActiveBet(0);

        setPots(data.pots);

        let activePlayers = data.players.length - data.players.filter((p) => p.allIn || p.folded).length

        if ((activePlayers === 0 || activePlayers === 1) && !data.manualAdvance) {

          setManualAdvance(true);

          let advanceGameProps: AdvanceGameProps = {
            activePlayer: data.activePlayer,
            gameState: data.gameState,
            dealerCards: data.dealerCards,
            players: data.players,
            hands: data.hands,
            pots: data.pots,
            turnsNextRound: data.turnsNextRound,
            turnsThisRound: data.turnsThisRound,
            needResponsesFrom: data.players.filter((p) => !p.folded).length,
            manualAdvance: true,
          };
          if (data.activePlayer.socket === socket?.id) {
            socket!.emit("advanceToEnd", advanceGameProps);
          }
        }

        setBet(bigBlindAmount);

        setGameState(data.gameState);
        setDealerCards(data.dealerCards);

        setActivePlayerCount(2 - data.players.filter((p) => p.chips <= 0).length);

        setTurnsThisRound(data.turnsNextRound); // Keep Track of who folded this hand
        setTurnsNextRound(2); // reset turns next round

        setNeedResponsesFrom(data.players.filter((p) => !p.folded).length);

        if (data.winner) {
          setWinner(data.winner);
          setLogs((prev) => [...prev, data.winner.description]);
          setWinningCards(data.winningCards);
          setWonAmount(data.wonAmount);
        }

        if (data.players.filter((p) => p.chips > 0).length === 1) {
          //Only one player left. Game is over
          setUltimateWinner(data.winner.winner.ultimateWinner);
        }

        setHands(data.hands);
        setPlayers(data.players);
        setGameOver(data.gameOver);
        setAdvancingToEnd(false);
      }
    });

    socket.on("advancingToEnd", (data) => {
      setAdvancingToEnd(true);
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
      setNeedResponsesFrom(players.filter((p) => p.chips <= 0).length);
      setTurnNumber(0);

      setEarlyWin(false);

      setActivePlayerCount(players.filter((p) => p.chips > 0).length);

      setTurnsThisRound(players.filter((p) => p.chips > 0).length);
      setTurnsNextRound(players.filter((p) => p.chips > 0).length);

      setPlayers(data.players);
      setHands(data.hands);

      let nextDealerIndex = data.hands.length % data.players.length;
      let nextLittleBlindIndex = (data.hands.length + 1) % data.players.length;
      let nextBigBlindIndex = (data.hands.length + 2) % data.players.length;

      setActiveBet(bigBlindAmount);

      setDealer(data.players[nextDealerIndex]);
      setLittleBlind(data.players[nextLittleBlindIndex]);
      setBigBlind(data.players[nextBigBlindIndex]);

      setLittleBlindIndex(nextLittleBlindIndex);
      setBigBlindIndex(nextBigBlindIndex);

      setActivePlayerIndex(nextDealerIndex);

      setActivePlayer(data.players[nextDealerIndex]);

      setPots([littleBlindAmount + bigBlindAmount]);
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

    const advanceProps = getNextPlayerProps(tempPlayers);

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
      dealerCards,
      needResponsesFrom,
      littleBlindIndex,
      bigBlindIndex,
      pots,
    };

    socket!.emit("playerFolded", foldProps);
  };

  const handleBet = (amount: number) => {
    let tempPlayers = [...players];
    let tempActivePlayer = tempPlayers.find(
      (player) => player.name === activePlayer.name
    );
    tempActivePlayer!.chips -= amount;

    if (tempActivePlayer!.chips <= 0) {
      tempActivePlayer!.allIn = true;
    }

    let tempPots = [...pots];
    tempPots[0] += amount;

    const advanceProps = getNextPlayerProps(tempPlayers);

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
      needResponsesFrom,
    };

    socket!.emit("playerBet", betProps);
  };

  const handlePlayerTimeout = (player: Player) => {
    setLogs((prev) => [...prev, `${player.name} timed out and auto-folded`]);
    setSnackbarMessage(`${player.name} timed out and auto-folded`);
    setIsSnackbarOpen(true);
    if (playerSocket === player.socket) {
      handleFold();
    }
  };

  const getNextPlayerProps = (tempPlayers: Player[]) => {
    let tempActivePlayerIndex = activePlayerIndex;
    let activePlayerIndicies: number[] = [];
    tempPlayers.map((p, index) => {
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
      activePlayer: tempPlayers[nextActivePlayerIndex],
    };
  };

  const endRound = (data: AdvanceGameProps) => {
    socket!.emit("endRound", data);
  };

  const newGame = () => {
    let startProps = {
      playerNames,
      playerSockets,
      playerChips: players.map((p) => 1000),
      pastHands: hands,
    };
    socket!.emit("startHoldEmGame", startProps);
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

    let tempCards = tempPlayers
      .filter((p) => p.socket === player.socket)
      .map((p) => p.cards);

    tempCards.forEach((cardArray) => {
      cardArray.forEach((card) => {
        card.faceUp = true;
      });
    });

    socket!.emit("showCards", { players: tempPlayers });
  };



  const handleMuckCards = () => { };

  return (
    <>
      <main className="relative flex h-screen w-screen items-center justify-center overflow-visible bg-[rgb(0,90,0)]">
        <div className="relative sm:pb-16 sm:pt-8">
          {gameStarted ? <Table /> : null}
          <div className="mx-auto flex h-[80vh] w-[95vw] flex-col">
            {logs.length > 0 && (
              <div className="fixed bottom-0 left-0 z-[55555] h-[75px] w-[250px] overflow-auto rounded-tr-xl bg-black/80 text-white">
                <div
                  className="flex flex-col"
                  style={{ boxSizing: "content-box", paddingRight: "17px" }}
                >
                  {logs.map((l, index) => (
                    <span key={index}>{l}</span>
                  ))}
                </div>
              </div>
            )}
            {!gameStarted && (
              <>
                {!joinedGame ? (
                  <input
                    placeholder="Enter player name"
                    type="text"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    className="absolute mt-24 self-center rounded bg-black px-4 py-2 text-white"
                  />
                ) : null}
                <button
                  className={`absolute self-center rounded bg-black px-4 py-2 text-white active:bg-white active:text-black ${joinedGame ? "disabled" : ""
                    }`}
                  onClick={handleJoinGame}
                  disabled={joinedGame}
                >
                  {!joinedGame ? "Join Game" : "Joined, awaiting players"}
                </button>
                {playerNames.length > 0 ? (
                  <div className="absolute mt-[30%] self-center text-3xl text-black">
                    {`${playerNames.length} ${pluralize(
                      playerNames.length,
                      "player",
                      "players"
                    )} joined`}
                  </div>
                ) : null}
              </>
            )}

            {gameOver && (
              <div className="flex flex-col">
                <div
                  className={`z-[410443] mb-8 w-full items-center justify-center self-center text-center text-3xl text-white transition-all duration-[1000ms] ${!winner ? "opacity-0" : "opacity-100"
                    }`}
                >
                  <h1>{winner ? winner.description : null}</h1>
                  <h1>{ultimateWinner ? `${ultimateWinner.name} wins the game!` : null}</h1>
                </div>
                {!ultimateWinner ? <button
                  id="next-btn"
                  className="z-[410444] self-center rounded bg-black px-4 py-2 text-white active:bg-white active:text-black"
                  onClick={() => advanceHands()}
                >
                  Next Hand
                </button> : <button
                  id="next-btn"
                  className="z-[410444] self-center rounded bg-black px-4 py-2 text-white active:bg-white active:text-black"
                  onClick={() => newGame()}
                >
                  New Game
                </button>}
              </div>
            )}

            {gameStarted && <div className="flex flex-col w-full justify-center items-center">
              <div>{`Blinds: ${blinds[0]}/${blinds[1]}`}</div>
              <div>{`Pot: ${!pots ? 0 : pots.join(", ")}`}</div>
              <div>
                {winner
                  ? `Hand #${hands.length}`
                  : `Hand #${hands.length + 1}`}
              </div>
            </div>}

            {gameStarted ? (
              <>
                <div className="flex flex-col items-center justify-center">
                  <div className="playingCards simpleCards absolute bottom-[45%] z-[9999] flex w-[100vw] flex-row items-center justify-center">
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
                  <div className="fixed bottom-[47vh] right-[35vw] z-[4000] flex w-[100vw] flex-col items-center justify-center">
                    <div className="playingCards simpleCards flex flex-row items-center justify-center">
                      {players[1].cards.map((card, index) => (
                        <Card
                          key={`${index}-${card.suit}-${card.rank}`}
                          suit={card.suit}
                          rank={card.rank}
                          faceUp={players[1].folded ? false : players[1].socket === playerSocket || card.faceUp}
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
                      active={
                        activePlayer.name === players[1].name && !gameOver && !advancingToEnd
                      }
                      onTimeout={() => handlePlayerTimeout(players[1])}
                      prevPlayer={players[0]}
                      gameOver={gameOver}
                    />
                  </div>
                  {dealer.name === players[1].name ? (
                    <div className="absolute bottom-[30%] z-0 flex w-[100vw] flex-row pl-8">
                      <img
                        src="images/black-dealer-button.png"
                        alt="dealer"
                        className="relative object-cover"
                      />
                    </div>
                  ) : littleBlind.name === players[1].name ? (
                    <div className="absolute bottom-[30%] z-0 flex w-[100vw] flex-row pl-8">
                      <img
                        src="images/littleblind.png"
                        alt="little blind"
                        width="50px"
                        height="50px"
                        className="relative object-cover"
                      />
                    </div>
                  ) : bigBlind.name === players[1].name ? (
                    <div className="absolute bottom-[30%] z-0 flex w-[100vw] flex-row pl-8">
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
                  <div className="fixed bottom-[47vh] left-[35vw] z-[4000] flex w-[100vw] flex-col items-center justify-center">
                    <div className="playingCards simpleCards flex flex-row items-center justify-center">
                      {players[2].cards.map((card, index) => (
                        <Card
                          key={`${index}-${card.suit}-${card.rank}`}
                          suit={card.suit}
                          rank={card.rank}
                          faceUp={players[2].folded ? false : players[2].socket === playerSocket || card.faceUp}
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
                      active={
                        activePlayer.name === players[2].name && !gameOver && !advancingToEnd
                      }
                      onTimeout={() => handlePlayerTimeout(players[2])}
                      prevPlayer={players[1]}
                      gameOver={gameOver}
                    />
                  </div>
                  {dealer.name === players[2].name ? (
                    <div className="absolute bottom-[30%] z-0 flex w-[100vw] flex-row items-end justify-end pr-8">
                      <img
                        src="images/black-dealer-button.png"
                        alt="dealer"
                        className="relative object-cover"
                      />
                    </div>
                  ) : littleBlind.name === players[2].name ? (
                    <div className="absolute bottom-[30%] z-0 flex w-[100vw] flex-row items-end justify-end pr-8">
                      <img
                        src="images/littleblind.png"
                        alt="little blind"
                        width="50px"
                        height="50px"
                        className="relative object-cover"
                      />
                    </div>
                  ) : bigBlind.name === players[2].name ? (
                    <div className="absolute bottom-[30%] z-0 flex w-[100vw] flex-row items-end justify-end pr-8">
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
                      faceUp={players[0].folded ? false : players[0].socket === playerSocket || card.faceUp}
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
                <div className="fixed bottom-[7.5%] z-[4000] flex w-[100vw] flex-col items-center justify-center">
                  <PlayerDisplay
                    player={players[0]}
                    active={activePlayer.name === players[0].name && !gameOver && !advancingToEnd}
                    onTimeout={() => handlePlayerTimeout(players[0])}
                    prevPlayer={players[players.length - 1]}
                    gameOver={gameOver}
                  />
                </div>
                {dealer.name === players[0].name ? (
                  <div className="absolute bottom-[1%] z-0 flex w-[100vw] flex-row items-center justify-center">
                    <img
                      src="images/black-dealer-button.png"
                      alt="dealer"
                      className="relative object-cover"
                    />
                  </div>
                ) : littleBlind.name === players[0].name ? (
                  <div className="absolute bottom-[1%] z-0 flex w-[100vw] flex-row items-center justify-center">
                    <img
                      src="images/littleblind.png"
                      alt="little blind"
                      width="50px"
                      height="50px"
                      className="relative object-cover"
                    />
                  </div>
                ) : bigBlind.name === players[0].name ? (
                  <div className="absolute bottom-[1%] z-0 flex w-[100vw] flex-row items-center justify-center">
                    <img
                      src="images/bigblind.png"
                      alt="big blind"
                      width="50px"
                      height="50px"
                      className="relative object-cover"
                    />
                  </div>
                ) : null}
                {!gameOver && !advancingToEnd && activePlayer.socket === playerSocket ? (
                  <div className="fixed bottom-[10%] right-0 z-[987654321] flex w-[220px] flex-row items-end justify-end pr-8">
                    <div className="flex w-[100%] flex-row items-end">
                      <div className="m-2">
                        <input
                          type="range"
                          className="form-range w-full p-0 focus:shadow-none focus:outline-none focus:ring-0"
                          min={activeBet > 0 ? activeBet : bigBlindAmount}
                          max={activePlayer.chips}
                          value={bet}
                          onChange={(event) => {
                            setBet(+event.target.value);
                          }}
                        />
                      </div>
                      <div className="flex-1" />
                      <button className="rounded bg-transparent px-4 py-2 text-white">
                        {bet}
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
                        onClick={() => handleCheckOrCall(activePlayer.chips >= activeBet ? activeBet : activePlayer.chips)}
                      >
                        {activeBet > 0 ? `Call ${activePlayer.chips >= activeBet ? activeBet : activePlayer.chips}` : "Check"}
                      </button>
                      <button
                        className="rounded bg-black px-4 py-2 text-white active:bg-white active:text-black"
                        onClick={() => handleBet(bet)}
                      >
                        {activeBet > 0 ? `Raise` : `Bet`}
                      </button>
                    </div>
                  </div>
                ) : null}
                {gameOver &&
                  earlyWin &&
                  winner &&
                  winner.winner.players
                    .map((p) => p.player.socket)
                    .includes(player!.socket) ? (
                  <div className="fixed bottom-[10%] right-0 z-[10999] flex w-[220px] flex-row items-end justify-end pr-8">
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

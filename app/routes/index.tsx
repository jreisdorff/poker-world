import { useState } from "react";
import Card from "~/components/Card";
import cardStyles from "../styles/cards.css";
import progressStyles from "../styles/progress.css";
import { createCards } from "~/utils/cards";
import { LinksFunction, MetaFunction } from "@remix-run/node";
import { CardProps, determineWinner } from "~/utils/poker";
import Table from "~/components/Table";
import PlayerDisplay from "~/components/PlayerDisplay";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

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

export interface Player {
  name: string;
  cards: CardProps[];
  chips: number;
  folded: boolean;
}

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

export default function Index() {
  const [gameState, setGameState] = useState("Preflop");

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

  const [playersInTheHand, setPlayersInTheHand] = useState(
    players.filter((player) => !player.folded)
  );

  const [dealer, setDealer] = useState(initialPlayers[0]);
  const [littleBlind, setLittleBlind] = useState(initialPlayers[1]);
  const [bigBlind, setBigBlind] = useState(initialPlayers[2]);
  const [pots, setPots] = useState<any[]>([0]);
  const [activeBet, setActiveBet] = useState(0);
  const [turnNumber, setTurnNumber] = useState(0);
  const [blinds, setBlinds] = useState([10, 20]);
  const [winner, setWinner] = useState<string | undefined>("");
  const [gameOver, setGameOver] = useState(false);

  const handleCheckOrCall = () => {
    let tempPlayers = [...playersInTheHand];
    let tempActivePlayer = tempPlayers.find(
      (player) => player.name === activePlayer.name
    );
    tempActivePlayer!.chips -= activeBet;
    let tempPots = [...pots];
    tempPots[0] += activeBet;
    setPots(tempPots);
    setPlayersInTheHand(tempPlayers);
    advancePlayer();
    setTurnNumber(turnNumber + 1);
    setSnackbarMessage(
      activeBet
        ? `${activePlayer.name} called $${activeBet}`
        : `${activePlayer.name} checked`
    );
    setIsSnackbarOpen(true);

    if (turnNumber === tempPlayers.length - 1) {
      advanceGame();
      setTurnNumber(0);
    }
  };

  const handleStartGame = () => {
    setGameStarted(true);
    let tempPlayers = [...players];
    tempPlayers.forEach((player, index) => {
      let newCards = createCards(52, 2, dealtCards, index === 0);
      player.cards = newCards;
      setDealtCards([...dealtCards, ...newCards]);
    });
    setDealerCards(createCards(52, 3, dealtCards, false));
    setPlayers(tempPlayers);
    setPlayersInTheHand(tempPlayers.filter((player) => !player.folded));
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
    setPlayers(tempPlayers);
    setPlayersInTheHand(tempPlayers.filter((player) => !player.folded));
    advancePlayer();
    setTurnNumber(turnNumber + 1);
    setSnackbarMessage(`${activePlayer.name} folded`);
    setIsSnackbarOpen(true);

    if (turnNumber + 1 == tempPlayers.length) {
      advanceGame();
      setTurnNumber(0);
    }
  };

  const handleBet = (amount: number) => {
    let tempPlayers = [...playersInTheHand];
    let tempActivePlayer = tempPlayers.find(
      (player) => player.name === activePlayer.name
    );
    tempActivePlayer!.chips -= amount;
    let tempPots = [...pots];
    tempPots[0] += amount;
    setPots(tempPots);
    setPlayers(tempPlayers);
    advancePlayer();
    setTurnNumber(0);
    setActiveBet(amount);
    setSnackbarMessage(`${activePlayer.name} bet $${amount}`);
    setIsSnackbarOpen(true);
  };

  const handlePlayerTimeout = (player: Player) => {
    handleFold();
    setSnackbarMessage(`${activePlayer.name} timed out and auto-folded`);
    setIsSnackbarOpen(true);
    advancePlayer();
  };

  const advancePlayer = () => {
    let tempActivePlayerIndex = activePlayerIndex;
    if (tempActivePlayerIndex + 1 >= players.length) {
      tempActivePlayerIndex = 0;
    } else {
      tempActivePlayerIndex++;
    }
    setActivePlayerIndex(tempActivePlayerIndex);
    setActivePlayer(playersInTheHand[tempActivePlayerIndex]);
  };

  const advanceGame = () => {
    if (gameState === "Preflop") {
      setGameState("Flop");
      let tempDealerCards = [...dealerCards];
      tempDealerCards.forEach((card) => {
        card.faceUp = true;
      });
      setDealerCards(tempDealerCards);
    } else if (gameState === "Flop") {
      console.log("flop time");
      setGameState("Turn");
      let newCards = createCards(52, 1, undefined, true);
      setDealerCards([...dealerCards, ...newCards]);
    } else if (gameState === "Turn") {
      setGameState("River");
      let newCards = createCards(52, 1, undefined, true);
      setDealerCards([...dealerCards, ...newCards]);
    } else if (gameState === "River") {
      setGameState("Showdown");
      let tempDealerCards = [...dealerCards];
      tempDealerCards.forEach((card) => {
        card.faceUp = true;
      });
      let tempPlayers = [...players];
      tempPlayers.forEach((player) => {
        player.cards.forEach((card) => {
          card.faceUp = true;
        });
      });
      setPlayers(tempPlayers);
      setDealerCards(tempDealerCards);
      let gameWinner = determineWinner(
        playersInTheHand.map((player) => {
          return [...dealerCards, ...player.cards];
        })
      );
      console.log(gameWinner);
      setWinner(gameWinner);
      setGameOver(true);
    }
  };

  const handleClose = () => {
    setIsSnackbarOpen(false);
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
      <main className="relative min-h-screen bg-[rgb(0,90,0)] sm:flex sm:items-center sm:justify-center">
        <div className="relative sm:pb-16 sm:pt-8">
          <div className="mx-auto flex w-[100vw] flex-col">
            {!gameStarted ? (
              <button
                className="self-center rounded bg-black px-4 py-2 text-white active:bg-white active:text-black"
                onClick={handleStartGame}
              >
                Start Game
              </button>
            ) : (
              <>
                <Table />
                <div className="flex flex-col items-center justify-center">
                  <div
                    className={`absolute top-[20%] w-full items-center justify-center self-center text-center text-white transition-all duration-1000 ${
                      winner == "" ? "invisible" : "visible"
                    }`}
                  >
                    <h1>{winner}</h1>
                  </div>
                  <div className="absolute top-[30%] w-[100vw] items-center justify-center self-center text-center">
                    {`Blinds: ${blinds[0]}/${blinds[1]} Pot: $${pots[0]}`}
                  </div>
                  <div className="playingCards simpleCards absolute bottom-[45%] flex w-[100vw] flex-row items-center justify-center">
                    {dealerCards.map((card, index) => (
                      <Card
                        key={index}
                        suit={card.suit}
                        rank={card.rank}
                        faceUp={card.faceUp}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex flex-row gap-1">
                  <div className="fixed bottom-[47vh] right-[35vw] flex w-[100vw] flex-col items-center justify-center">
                    <PlayerDisplay
                      player={players[1]}
                      active={activePlayer === players[1]}
                      onTimeout={() => handlePlayerTimeout(players[1])}
                      prevPlayer={players[0]}
                      gameOver={gameOver}
                    />
                  </div>
                  <div className="playingCards simpleCards fixed bottom-[45%] right-[25%] flex w-[100vw] rotate-90 flex-row items-center justify-center">
                    {players[1].cards.map((card, index) => (
                      <Card
                        key={index}
                        suit={card.suit}
                        rank={card.rank}
                        faceUp={card.faceUp}
                      />
                    ))}
                  </div>
                  {dealer === players[1] ? (
                    <div className="fixed bottom-[50%] flex w-[100vw] flex-row pl-8">
                      <img
                        src="images/black-dealer-button.png"
                        alt="dealer"
                        className="object-cover"
                      />
                    </div>
                  ) : littleBlind === players[1] ? (
                    <div className="fixed bottom-[50%] flex w-[100vw] flex-row pl-8">
                      <img
                        src="images/littleblind.png"
                        alt="little blind"
                        width="50px"
                        height="50px"
                        className="object-cover"
                      />
                    </div>
                  ) : bigBlind === players[1] ? (
                    <div className="fixed bottom-[50%] flex w-[100vw] flex-row pl-8">
                      <img
                        src="images/bigblind.png"
                        alt="big blind"
                        width="50px"
                        height="50px"
                        className="object-cover"
                      />
                    </div>
                  ) : null}
                </div>
                <div className="flex flex-row gap-1">
                  <div className="fixed bottom-[47vh] left-[35vw] flex w-[100vw] flex-col items-center justify-center">
                    <PlayerDisplay
                      player={players[2]}
                      active={activePlayer === players[2]}
                      onTimeout={() => handlePlayerTimeout(players[2])}
                      prevPlayer={players[1]}
                      gameOver={gameOver}
                    />
                  </div>
                  <div className="playingCards simpleCards fixed bottom-[45%] left-[25%] flex w-[100vw] -rotate-90 flex-row items-center justify-center">
                    {players[2].cards.map((card, index) => (
                      <Card
                        key={index}
                        suit={card.suit}
                        rank={card.rank}
                        faceUp={card.faceUp}
                      />
                    ))}
                  </div>
                  {dealer === players[2] ? (
                    <div className="fixed bottom-[50%] flex w-[100vw] flex-row items-end justify-end pr-8">
                      <img
                        src="images/black-dealer-button.png"
                        alt="dealer"
                        className="object-cover"
                      />
                    </div>
                  ) : littleBlind === players[2] ? (
                    <div className="fixed bottom-[50%] flex w-[100vw] flex-row items-end justify-end pr-8">
                      <img
                        src="images/littleblind.png"
                        alt="little blind"
                        width="50px"
                        height="50px"
                        className="object-cover"
                      />
                    </div>
                  ) : bigBlind === players[2] ? (
                    <div className="fixed bottom-[50%] flex w-[100vw] flex-row items-end justify-end pr-8">
                      <img
                        src="images/bigblind.png"
                        alt="big blind"
                        width="50px"
                        height="50px"
                        className="object-cover"
                      />
                    </div>
                  ) : null}
                </div>
                <div className="playingCards simpleCards fixed bottom-[20%] flex w-[100vw] flex-row items-center justify-center">
                  {players[0].cards.map((card, index) => (
                    <Card
                      key={index}
                      suit={card.suit}
                      rank={card.rank}
                      faceUp={card.faceUp}
                    />
                  ))}
                </div>
                <div className="fixed bottom-[7.5%] flex w-[100vw] flex-col items-center justify-center">
                  <PlayerDisplay
                    player={players[0]}
                    active={activePlayer === players[0]}
                    onTimeout={() => handlePlayerTimeout(players[0])}
                    prevPlayer={players[players.length - 1]}
                    gameOver={gameOver}
                  />
                </div>
                {dealer === players[0] ? (
                  <div className="fixed bottom-[1%] flex w-[100vw] flex-row items-center justify-center">
                    <img
                      src="images/black-dealer-button.png"
                      alt="dealer"
                      className="object-cover"
                    />
                  </div>
                ) : littleBlind === players[0] ? (
                  <div className="fixed bottom-[1%] flex w-[100vw] flex-row items-center justify-center">
                    <img
                      src="images/littleblind.png"
                      alt="little blind"
                      width="50px"
                      height="50px"
                      className="object-cover"
                    />
                  </div>
                ) : bigBlind === players[0] ? (
                  <div className="fixed bottom-[1%] flex w-[100vw] flex-row items-center justify-center">
                    <img
                      src="images/bigblind.png"
                      alt="big blind"
                      width="50px"
                      height="50px"
                      className="object-cover"
                    />
                  </div>
                ) : null}
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
              </>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

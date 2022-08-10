import { LinksFunction, MetaFunction } from "@remix-run/node";
import { useEffect } from "react";
import Card from "~/components/Card";
import PlayerDisplay from "~/components/PlayerDisplay";
import Table from "~/components/Table";
import { AdvanceGameProps, NextProps } from "~/utils/game";
import { CardProps, StartHoldEmGameProps } from "~/utils/poker";
import cardsIEStyles from "../styles/cards-ie.css";
import cardsIE9Styles from "../styles/cards-ie9.css";
import cardStyles from "../styles/cards.css";
import progressStyles from "../styles/progress.css";

import { isEmpty } from "lodash";
import Pot from "~/components/Pot";
import { useSocket } from "~/context";
import useGameState from "~/hooks/useGameState";
import { pluralize } from "~/utils";
import { Player, SendCheckOrCallDataProps, SendBetDataProps, GameState, SendFoldDataProps } from "~/interfaces";
import prepareForFold from "~/functions/prepareForFold";
import prepareForCheckCall from "~/functions/prepareForCheckCall";

export const links: LinksFunction = () => {
  return [
    { rel: "stylesheet", href: cardStyles },
    { rel: "stylesheet", href: cardsIEStyles },
    { rel: "stylesheet", href: cardsIE9Styles },
    { rel: "stylesheet", href: progressStyles },
  ];
};

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "Poker World",
  viewport: "width=device-width,initial-scale=1",
});

export default function Index() {
  const socket = useSocket();

  const { values, actions } = useGameState();

  const { gameState,
    logs,
    gameStarted,
    dealerCards,
    isSnackbarOpen,
    snackbarMessage,
    dealtCards,
    players,
    activePlayerIndex,
    activePlayer,
    dealer,
    littleBlind,
    bigBlind,
    littleBlindAmount,
    bigBlindAmount,
    bet,
    pots,
    activeBet,
    turnNumber,
    blinds,
    winner,
    gameOver,
    hands,
    activePlayerCount,
    winningCards,
    wonAmount,
    playerName,
    buttonClicked,
    playerCount,
    playerNames,
    playerSocket,
    playerSockets,
    player,
    joinedGame,
    turnsThisRound,
    turnsNextRound,
    earlyWin,
    needResponsesFrom,
    littleBlindIndex,
    bigBlindIndex,
    manualAdvance,
    ultimateWinner,
    needResponsesFromIndicies,
    advancingToEnd } = values;
  const { setGameState,
    setLogs,
    setGameStarted,
    setDealerCards,
    setIsSnackbarOpen,
    setSnackbarMessage,
    setDealtCards,
    setPlayers,
    setActivePlayerIndex,
    setActivePlayer,
    setDealer,
    setLittleBlind,
    setBigBlind,
    setLittleBlindAmount,
    setBigBlindAmount,
    setBet,
    setPots,
    setActiveBet,
    setTurnNumber,
    setBlinds,
    setWinner,
    setGameOver,
    setHands,
    setActivePlayerCount,
    setWinningCards,
    setWonAmount,
    setPlayerName,
    setButtonClicked,
    setPlayerCount,
    setPlayerNames,
    setPlayerSocket,
    setPlayerSockets,
    setPlayer,
    setJoinedGame,
    setTurnsThisRound,
    setTurnsNextRound,
    setEarlyWin,
    setNeedResponsesFrom,
    setLittleBlindIndex,
    setBigBlindIndex,
    setManualAdvance,
    setUltimateWinner,
    setNeedResponsesFromIndicies,
    setAdvancingToEnd,
  } = actions;

  const handleCheckOrCall = (callAmount: number) => {
    let checkOrCallProps = prepareForCheckCall(values);

    socket!.emit("playerCheckedOrCalled", checkOrCallProps);
  };

  useEffect(() => {
    if (!socket) return;

    const advance = (data: AdvanceGameProps, type: string) => {
      let tempNeedResponsesFrom = data.needResponsesFrom;

      let needResponsesIndicies: number[] = [];

      if (type === "BET") {
        tempNeedResponsesFrom =
          data.players.filter((p) => !p.folded).length - 1;
        setNeedResponsesFrom(data.players.filter((p) => !p.folded).length - 1);

        data.players.forEach((p, index) => {
          if (!p.folded) {
            needResponsesIndicies.push(index);
          }
        });

        setNeedResponsesFromIndicies(needResponsesIndicies);
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

      if (tempNeedResponsesFrom <= 0) {
        if (data.activePlayer.socket === socket?.id) {
          advanceGame({
            ...data,
            needResponsesFromIndicies: needResponsesIndicies,
          });
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

      let needResponsesIndicies: number[] = [];

      data.players.forEach((p, index) => {
        if (p.chips > 0) {
          needResponsesIndicies.push(index);
        }
      });

      setNeedResponsesFromIndicies(needResponsesIndicies);

      setNeedResponsesFrom(data.players.filter((p) => p.chips > 0).length);

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
      setBet(data.activeBet + bigBlindAmount);
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

      setNeedResponsesFromIndicies(data.needResponsesFromIndicies);

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
        needResponsesFromIndicies: data.needResponsesFromIndicies,
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
        } else {
          setActiveBet(data.activeBet);
        }
      } else {
        setActiveBet(data.activeBet);
      }

      let checkOrCallDescription = data.activeBet
        ? `${data.players[data.prevActivePlayerIndex].name} called ${data.callAmount
        }`
        : `${data.players[data.prevActivePlayerIndex].name} checked`;

      setLogs((prev) => [...prev, checkOrCallDescription]);

      setSnackbarMessage(checkOrCallDescription);
      setIsSnackbarOpen(true);

      setNeedResponsesFromIndicies(data.needResponsesFromIndicies);

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
        needResponsesFromIndicies: data.needResponsesFromIndicies,
      };

      advance(advanceDataProps, "CHECK");
    });

    socket.on("sendFoldData", (data: SendFoldDataProps) => {
      setPlayers(data.players);
      setGameState(data.gameState);
      setActivePlayerIndex(data.activePlayerIndex);

      setActivePlayer(data.activePlayer);

      setTurnsNextRound(data.turnsNextRound);

      if (data.activeBet) {
        setActiveBet(data.activeBet);
      } else {
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
        } else {
          setActiveBet(data.activeBet);
        }
      }

      setLogs((prev) => [
        ...prev,
        `${data.players[data.prevActivePlayerIndex].name} folded`,
      ]);

      setSnackbarMessage(
        `${data.players[data.prevActivePlayerIndex].name} folded`
      );
      setIsSnackbarOpen(true);

      setNeedResponsesFromIndicies(data.needResponsesFromIndicies);

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
        needResponsesFromIndicies: data.needResponsesFromIndicies,
      };

      advance(advanceDataProps, "FOLD");
    });

    socket.on("sendEndRoundData", (data: NextProps) => {
      setActiveBet(0);

      setBet(bigBlindAmount * 2);

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

        let activePlayers =
          data.players.length -
          data.players.filter((p) => p.allIn || p.folded).length;

        if (
          (activePlayers === 0 || activePlayers === 1) &&
          !data.manualAdvance
        ) {
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
            needResponsesFrom: data.turnsThisRound + 1,
            manualAdvance: true,
            needResponsesFromIndicies: data.needResponsesFromIndicies,
          };
          if (data.activePlayer.socket === socket?.id) {
            socket!.emit("advanceToEnd", advanceGameProps);
          }
        }

        setBet(bigBlindAmount);

        setGameState(data.gameState);
        setDealerCards(data.dealerCards);

        setTurnsThisRound(data.turnsNextRound); // Keep Track of who folded this hand
        setTurnsNextRound(2); // reset turns next round

        let tempIndicies: number[] = [];

        data.players.forEach((p, index) => {
          if (p.chips > 0) {
            tempIndicies.push(index);
          }
        });

        setNeedResponsesFromIndicies(tempIndicies);

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

      let needResponsesIndicies: number[] = [];

      data.players.forEach((p: { chips: number }, index: number) => {
        if (p.chips > 0) {
          needResponsesIndicies.push(index);
        }
      });

      setNeedResponsesFromIndicies(needResponsesIndicies);

      setNeedResponsesFrom(
        data.players.filter((p: { chips: number }) => p.chips > 0).length
      );
      setTurnNumber(0);

      setEarlyWin(false);

      setActivePlayerCount(
        data.players.filter((p: { chips: number }) => p.chips > 0).length
      );

      setTurnsThisRound(
        data.players.filter((p: { chips: number }) => p.chips > 0).length
      );
      setTurnsNextRound(
        data.players.filter((p: { chips: number }) => p.chips > 0).length
      );

      setPlayers(data.players);
      setHands(data.hands);

      let activePlayers = data.players.filter(
        (p: { chips: number }) => p.chips > 0
      );

      let nextDealerIndex = data.hands.length % activePlayers.length;
      let nextLittleBlindIndex = (data.hands.length + 1) % activePlayers.length;
      let nextBigBlindIndex = (data.hands.length + 2) % activePlayers.length;

      setActiveBet(bigBlindAmount);

      setDealer(activePlayers[nextDealerIndex]);
      setLittleBlind(activePlayers[nextLittleBlindIndex]);
      setBigBlind(activePlayers[nextBigBlindIndex]);

      setLittleBlindIndex(nextLittleBlindIndex);
      setBigBlindIndex(nextBigBlindIndex);

      setActivePlayerIndex(nextDealerIndex);

      if (activePlayers.length > 0) {
        setActivePlayer(activePlayers[nextDealerIndex]);
      }

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
    let foldProps = prepareForFold(values);

    socket!.emit("playerFolded", foldProps);
  };

  const handleBet = (amount: number) => {
    let tempPlayers = [...players];
    let tempActivePlayer = tempPlayers.find(
      (player) => player.name === activePlayer.name
    );
    let tempPrevActivePlayerIndex = tempPlayers.indexOf(tempActivePlayer!);
    tempActivePlayer!.chips -= amount;

    if (tempActivePlayer!.chips <= 0) {
      tempActivePlayer!.allIn = true;
    }

    let tempPots = [...pots];
    tempPots[0] += amount;

    let tempNeedResponsesFromIndicies = [...needResponsesFromIndicies];

    tempNeedResponsesFromIndicies.shift();

    let tempActivePlayers: Player[] = [];
    let tempActivePlayerIndicies: number[] = [];

    tempPlayers.forEach((p, index) => {
      if (!(p.folded || p.chips <= 0)) {
        tempActivePlayers.push(p);
        tempActivePlayerIndicies.push(index);
      }
    });

    let newActivePlayer: Player = tempActivePlayers[0];
    let tempAPI: number = tempActivePlayerIndicies[0];

    if (tempActivePlayerIndicies.length > 0) {
      if (tempActivePlayerIndicies.includes(tempPrevActivePlayerIndex + 1)) {
        newActivePlayer = tempPlayers[tempPrevActivePlayerIndex + 1];
        tempAPI = tempPrevActivePlayerIndex + 1;
      } else if (
        tempActivePlayerIndicies.includes(tempPrevActivePlayerIndex + 2)
      ) {
        newActivePlayer = tempPlayers[tempPrevActivePlayerIndex + 2];
        tempAPI = tempPrevActivePlayerIndex + 2;
      } else {
        newActivePlayer = tempActivePlayers[0];
        tempAPI = tempActivePlayerIndicies[0];
      }
    } else {
      newActivePlayer = tempActivePlayer!;
      tempAPI = tempPrevActivePlayerIndex;
    }

    const betProps: SendBetDataProps = {
      players: tempPlayers,
      pots: tempPots,
      prevActivePlayerIndex: tempPrevActivePlayerIndex,
      activePlayerIndex: tempAPI,
      activePlayer: newActivePlayer,
      turnNumber,
      playerSocket,
      gameState,
      dealerCards,
      activeBet: amount,
      turnsNextRound,
      turnsThisRound,
      hands,
      needResponsesFrom,
      needResponsesFromIndicies: tempNeedResponsesFromIndicies,
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
  };

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
      cardArray.forEach((card: { faceUp: boolean; }) => {
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
            {/* <div className="fixed top-0 right-0 z-[55555] h-[75px] w-[250px] overflow-auto bg-black/80 text-white">
              <div
                className="flex flex-col"
                style={{ boxSizing: "content-box", paddingRight: "17px" }}
              >
                <div>{`Need responses from: ${needResponsesFrom}`}</div>
                {needResponsesFromIndicies ? (
                  <div>{`Response needed from: ${needResponsesFromIndicies.join(
                    ", "
                  )}`}</div>
                ) : null}
              </div>
            </div> */}
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
                  <h1>
                    {ultimateWinner
                      ? `${ultimateWinner.name} wins the game!`
                      : null}
                  </h1>
                </div>
                {!ultimateWinner ? (
                  <button
                    id="next-btn"
                    className="z-[410444] self-center rounded bg-black px-4 py-2 text-white active:bg-white active:text-black"
                    onClick={() => advanceHands()}
                  >
                    Next Hand
                  </button>
                ) : (
                  <button
                    id="next-btn"
                    className="z-[410444] self-center rounded bg-black px-4 py-2 text-white active:bg-white active:text-black"
                    onClick={() => newGame()}
                  >
                    New Game
                  </button>
                )}
              </div>
            )}

            {gameStarted && (
              <div className="flex w-full flex-col items-center justify-center">
                <div>{`Blinds: ${blinds[0]}/${blinds[1]}`}</div>
                <div>{`Pot: ${!pots ? 0 : pots.join(", ")}`}</div>
                <div>
                  {winner
                    ? `Hand #${hands.length}`
                    : `Hand #${hands.length + 1}`}
                </div>
              </div>
            )}

            {gameStarted ? (
              <>
                <div className="flex flex-col items-center justify-center">
                  <div className="absolute bottom-[45%] z-[9999] flex w-[100vw] flex-col items-center justify-center">
                    <div className="playingCards simpleCards flex flex-row">
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
                    {pots.length > 0 ? (
                      <div className="flex w-screen flex-row items-center justify-center">
                        {pots.map((p: number) => {
                          return <Pot amount={p} />;
                        })}
                      </div>
                    ) : null}
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  {/* <div className="playingCards simpleCards fixed top-[30%] right-[35vw] flex w-[100vw] flex-row items-center justify-center"></div> */}
                  <div className="fixed bottom-[47vh] right-[35vw] z-[4000] flex w-[100vw] flex-col items-center justify-center">
                    <div className="playingCards simpleCards flex flex-row items-center justify-center">
                      {players[1].cards.map((card: { suit: string; rank: string; faceUp: any; }, index: any) => (
                        <Card
                          key={`${index}-${card.suit}-${card.rank}`}
                          suit={card.suit}
                          rank={card.rank}
                          faceUp={
                            players[1].folded
                              ? false
                              : players[1].socket === playerSocket ||
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
                      active={
                        activePlayer.name === players[1].name &&
                        !gameOver &&
                        !advancingToEnd
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
                      {players[2].cards.map((card: { suit: string; rank: string; faceUp: any; }, index: any) => (
                        <Card
                          key={`${index}-${card.suit}-${card.rank}`}
                          suit={card.suit}
                          rank={card.rank}
                          faceUp={
                            players[2].folded
                              ? false
                              : players[2].socket === playerSocket ||
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
                      active={
                        activePlayer.name === players[2].name &&
                        !gameOver &&
                        !advancingToEnd
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
                  {players[0].cards.map((card: { suit: string; rank: string; faceUp: any; }, index: any) => (
                    <Card
                      key={`${index}-${card.suit}-${card.rank}`}
                      suit={card.suit}
                      rank={card.rank}
                      faceUp={
                        players[0].folded
                          ? false
                          : players[0].socket === playerSocket || card.faceUp
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
                <div className="fixed bottom-[7.5%] z-[4000] flex w-[100vw] flex-col items-center justify-center">
                  <PlayerDisplay
                    player={players[0]}
                    active={
                      activePlayer.name === players[0].name &&
                      !gameOver &&
                      !advancingToEnd
                    }
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
                {!gameOver &&
                  !advancingToEnd &&
                  activePlayer.socket === playerSocket ? (
                  <div className="fixed bottom-[10%] right-0 z-[987654321] flex w-[220px] flex-row items-end justify-end pr-8">
                    <div className="flex w-[100%] flex-row items-end">
                      <div className="m-2">
                        <input
                          type="range"
                          className="form-range w-full p-0 focus:shadow-none focus:outline-none focus:ring-0"
                          min={
                            activeBet > 0
                              ? activeBet + bigBlindAmount
                              : bigBlindAmount * 2
                          }
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
                        onClick={() =>
                          handleCheckOrCall(
                            activePlayer.chips >= activeBet
                              ? activeBet
                              : activePlayer.chips
                          )
                        }
                      >
                        {activeBet > 0
                          ? `Call ${activePlayer.chips >= activeBet
                            ? activeBet
                            : activePlayer.chips
                          }`
                          : "Check"}
                      </button>
                      <button
                        className="rounded bg-black px-4 py-2 text-white active:bg-white active:text-black"
                        onClick={() => handleBet(bet)}
                      >
                        {activeBet > 0 ? `Raise to ${bet}` : `Bet ${bet}`}
                      </button>
                    </div>
                  </div>
                ) : null}
                {gameOver &&
                  earlyWin &&
                  winner &&
                  winner.winner.players
                    .map((p) => p.socket)
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

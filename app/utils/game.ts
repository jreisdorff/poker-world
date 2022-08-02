import { Player } from "~/routes";
import { createCards } from "./cards";
import { determineWinner, PokerWinner, TotalCards } from "./poker";

export enum GameState {
    Preflop,
    Flop,
    Turn,
    River,
    Showdown,
}

export interface AdvanceGameProps {
    gameState: GameState;
    setGameState: (gameState: GameState) => void;
    dealerCards: any[];
    setDealerCards: (dealerCards: any[]) => void;
    players: Player[];
    setPlayers: (players: Player[]) => void;
    hands: any[];
    setHands: (hands: any[]) => void;
    setWinner: (winner: any) => void;
    setWinningCards: (winningCards: any[]) => void;
    setGameOver: (gameOver: boolean) => void;
    pots: any[];
    setWonAmount: (amount: number) => void;
};

export const advanceHoldEmGame = (props: AdvanceGameProps) => {
  const {
    gameState,
    setGameState,
    dealerCards,
    setDealerCards,
    players,
    setPlayers,
    hands,
    setHands,
    setWinner,
    setWinningCards,
    setGameOver,
    pots,
    setWonAmount,
  } = props;

  if (gameState === GameState.Preflop) {
    setGameState(GameState.Flop);
    let tempDealerCards = [...dealerCards];
    tempDealerCards.forEach((card) => {
      card.faceUp = true;
    });
    setDealerCards(tempDealerCards);
  } else if (gameState === GameState.Flop) {
    setGameState(GameState.Turn);
    let newCards = createCards(52, 1, undefined, true);
    setDealerCards([...dealerCards, ...newCards]);
  } else if (gameState === GameState.Turn) {
    setGameState(GameState.River);
    let newCards = createCards(52, 1, undefined, true);
    setDealerCards([...dealerCards, ...newCards]);
  } else if (gameState === GameState.River) {
    setGameState(GameState.Showdown);
    let tempDealerCards = [...dealerCards];
    tempDealerCards.forEach((card) => {
      card.faceUp = true;
    });
    let tempPlayers = [...players];
    setDealerCards(tempDealerCards);
    let gameWinner = determineWinner(
      players
        .filter(
          (player: { name: any; folded: any; }) =>
            players.map((pith: { name: any; }) => pith.name).includes(player.name) &&
            !player.folded
        )
        .map((player: any) => {
          return { dealerCards, player } as TotalCards;
        })
    );

    const winnerDescription = `${
      gameWinner.players.length === 1
        ? (gameWinner.players[0] as { player: Player }).player.name
        : gameWinner.players
            .map((winner: any) => winner.player.name)
            .join(", ")
            .replace(/, ((?:.(?!, ))+)$/, ", and $1")
    } ${gameWinner.players.length === 1 ? "won" : "split the pot"} with ${
      gameWinner.hand
    }`;
    let tempHands = [...hands];
    let winnar = { winner: gameWinner, description: winnerDescription };
    tempHands.push(winnar);
    setHands(tempHands);
    const winnerObj = { winner: gameWinner, description: winnerDescription };
    setWinner(winnerObj);
    let tempWinningCards: any[] = [];
    gameWinner.wins.forEach((w) => {
      w.cards.forEach((card) => {
        if (!tempWinningCards.includes(card)) {
          tempWinningCards.push(card);
        }
      });
    });

    setWinningCards(tempWinningCards);
    let wonAmount = getWonAmount(winnerObj, pots);
    setWonAmount(wonAmount);

    tempPlayers
      .filter((p) => !p.folded)
      .forEach((player) => {
        player.cards.forEach((card: { faceUp: boolean }) => {
          card.faceUp = true;
        });
      });
    
    tempPlayers.filter((p, index) => gameWinner.winnerIndicies.includes(index)).forEach((player) => {
        player.chips += wonAmount;
    });

    setPlayers(tempPlayers);

    setGameOver(true);
  }
};

export const getWonAmount: (winner: { winner: PokerWinner; description: string; }, pots: any[]) => any = (winner: { winner: PokerWinner; description: string; }, pots: any[]) => {
    
    let daMoney = 0;
    let numberOfWinners = winner.winner.players.length;

    pots.forEach((pot: number) => {
        daMoney += pot;
    });
    
    if (numberOfWinners === 1) {
        return daMoney;
    } else if (numberOfWinners > 1) {
        return Math.floor(daMoney / numberOfWinners);
    }
}

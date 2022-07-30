import { objectEnumValues } from "@prisma/client/runtime";
import * as _ from "lodash";
import { forEach } from "lodash";
import { Player } from "~/routes";

/*
Example implementation used in the Think Functional course
taken from: https://codepen.io/dlivas/pen/mqJwmX
*/

//
//  Util Functions
//
const deepFreeze = (object: any) => {
  if (typeof object !== "object") {
    return object;
  }
  Object.freeze(object);

  Object.values(object).forEach((value) => deepFreeze(value));

  return object;
};

const maxInARow = (weights: any) =>
  _.chain(weights)
    .sortBy()
    .uniq()
    .map((num: number, i: number) => num - i)
    .groupBy()
    .orderBy("length" as any)
    .last()
    .value().length;

//
// Playing Cards class definition and implementation
// in a functional fashion
//
export const Ranks = Object.freeze([
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
export const Suits = Object.freeze(["hearts", "clubs", "diams", "spades"]);

export interface CardProps {
  rank: string;
  suit: string;
  weight: string;
  faceUp: boolean;
}

const Cards: (faceUp: boolean) => CardProps[] | any = (faceUp: boolean) => {
  return Object.entries(Ranks).reduce(
    (cards, [weight, rank]) =>
      [
        ...cards,
        ...Suits.map((suit) => ({ rank, suit, weight, faceUp })),
      ] as any,
    []
  );
};

const CardsAndDeck = (currentDeck: any[], n = 0) => {
  const deck =
    currentDeck !== Cards(false)
      ? currentDeck.slice(n, currentDeck.length)
      : currentDeck
          .slice(n, currentDeck.length)
          .sort(() => Math.random() - 0.5);

  Object.freeze(deck);
  const cards = Object.freeze(deck.slice(n));

  return {
    cards,
    deck,
  };
};

export class RateableCards {
  ranks: any;
  suits: any;
  rankTimes: any;
  suitTimes: any;
  maxInARow: number;
  constructor(cards: { weight: any }[]) {
    this.ranks = _.groupBy(cards, "rank");
    this.suits = _.groupBy(cards, "suit");
    this.rankTimes = _.groupBy(this.ranks, "length");
    this.suitTimes = _.groupBy(this.suits, "length");
    this.maxInARow = maxInARow(cards.map(({ weight }) => weight));
  }

  getOfSameRank(n: number) {
    return this.rankTimes[n] || [];
  }

  getOfSameSuit(n: string | number) {
    return this.suitTimes[n] || [];
  }

  hasAce() {
    return !!this.ranks["A"];
  }

  hasOfSameRank(n: any) {
    return this.getOfSameRank(n).length;
  }

  hasOfSameSuit(n: any) {
    return this.getOfSameSuit(n).length;
  }

  hasInARow(n: number) {
    return this.maxInARow >= n;
  }

  getWorstSingles() {
    return _.chain(this.getOfSameRank(1)).flatten().sortBy("weight").value();
  }
}

//
// Poker Ratings
//
const PokerRating = {
  RoyalFlush: (hand: {
    hasInARow: (arg0: number) => any;
    hasOfSameSuit: (arg0: number) => any;
    hasAce: () => any;
  }) => hand.hasInARow(5) && hand.hasOfSameSuit(5) && hand.hasAce(),
  StraightFlush: (hand: {
    hasInARow: (arg0: number) => any;
    hasOfSameSuit: (arg0: number) => any;
  }) => hand.hasInARow(5) && hand.hasOfSameSuit(5),
  FourOfAKind: (hand: { hasOfSameRank: (arg0: number) => any }) =>
    hand.hasOfSameRank(4),
  FullHouse: (hand: { hasOfSameRank: (arg0: number) => any }) =>
    hand.hasOfSameRank(3) && hand.hasOfSameRank(2),
  Flush: (hand: { hasOfSameSuit: (arg0: number) => any }) =>
    hand.hasOfSameSuit(5),
  Straight: (hand: { hasInARow: (arg0: number) => any }) => hand.hasInARow(5),
  ThreeOfAKind: (hand: { hasOfSameRank: (arg0: number) => any }) =>
    hand.hasOfSameRank(3),
  TwoPair: (hand: { hasOfSameRank: (arg0: number) => number }) =>
    hand.hasOfSameRank(2) >= 2,
  OnePair: (hand: { hasOfSameRank: (arg0: number) => any }) =>
    hand.hasOfSameRank(2),
  HighCard: (hand: { hasOfSameRank: (arg0: number) => number }) =>
    hand.hasOfSameRank(1) >= 5,
};

export const PokerHandRate = (cards: RateableCards) =>
  (Object.entries(PokerRating) as any).find((item: [any, any]) => {
    const [, is] = item;
    return is(cards);
  })[0];

export const CardsCreator = (() => {
  let instance: {
    getCards: (faceUp: boolean, max?: number, n?: number) => any;
    clearPassed: () => void;
  };

  const init = () => {
    let passed: number[] = [];

    const getUniqueRandomInt: any = (max: number) => {
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
      return _.times(n, () => Cards(faceUp)[getUniqueRandomInt(max) as number]);
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

export const determineWinner = (playerWithDealerCards: any[]) => {
  const playerHands = playerWithDealerCards.map((obj: any) => [
    ...obj.dealerCards,
    ...obj.player.cards,
  ]);

  console.log(playerHands);

  const ranks = Object.keys(PokerRating);

  const playerHandsRanks = playerHands.map((hand) =>
    PokerHandRate(new RateableCards(hand))
  );

  let winner = playerHandsRanks[0];
  let winnerIndicies = [0];
  let winnerCards = [playerHands[0]];

  playerHandsRanks.forEach((playerHand, index) => {
    console.log(playerHand);
    let playerRank = ranks.indexOf(playerHand);
    let currentWinnerRank = ranks.indexOf(winner);
    console.log(playerRank, currentWinnerRank);
    if (playerRank < currentWinnerRank) {
      winnerIndicies = [index];
      winner = playerHandsRanks[index];
      currentWinnerRank = playerRank;
      winnerCards = [playerHands[index]];
    } else if (
      playerRank == currentWinnerRank &&
      !winnerIndicies.includes(index)
    ) {
      winnerIndicies = [...winnerIndicies, index];
      winnerCards = [...winnerCards, playerHands[index]];
    }
  });

  console.log(winnerIndicies);

  const result = playerWithDealerCards
    .filter((player, index) => winnerIndicies.includes(index))
    .map((player, index) => {
      return { ...player, hand: playerHands[index], finalCards: winnerCards[index] };
    });

  let sortedResult = sortByBestHand(result);

  return { winners: result, winnerIndicies, hand: winner, sortedResult };
};

const sortByBestHand = (players: Player[]) => {
  const finalCardsArray = players.map((player, index) => { 
    return { finalCards: player.finalCards, index }
  });
  const sortedPlayers = finalCardsArray.sort((a, b) => byCountFirst(players.map((player) => player.finalCards), new RateableCards(a.finalCards).suitTimes, new RateableCards(b.finalCards).suitTimes));
  return sortedPlayers;
};

const counts = (cards: any[]) => cards.reduce(count, {});

const byCountFirst = (cardsArray: any[], a: number, b: number) => {
  console.log('in by count first');
  const tempCounts = counts(cardsArray);
  console.log(cardsArray);
  console.log(tempCounts);
  console.log(a, b);
  //Counts are in reverse order - bigger is better
  const countDiff = tempCounts[b] - tempCounts[a];
  if (countDiff) return countDiff;
  return b > a ? -1 : b === a ? 0 : 1;
}

const count: any = (c: { [x: string]: any; }, a: string | number, index: any) => {
  console.log(c[a]);
  c[a] = (c[a] || 0) + 1;
  return c;
}

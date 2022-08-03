import _ from "lodash";
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

export interface StartHoldEmGameProps {
  gameState: number;
  gameStarted: boolean;
  gameOver: boolean;
  dealtCards: any[];
  players: Player[];
  dealerCards: any[];
  dealer: Player,
  littleBlind: Player,
  bigBlind: Player,
};

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

let hands = [
  "4 of a Kind",
  "Straight Flush",
  "Straight",
  "Flush",
  "High Card",
  "1 Pair",
  "2 Pair",
  "Royal Flush",
  "3 of a Kind",
  "Full House",
];

//Calculates the Rank of a 5 card Poker hand using bit manipulations.
export const rankPokerHand = (cs: number[], ss: number[]) => {
  var v,
    i,
    o,
    s =
      (1 << cs[0]) | (1 << cs[1]) | (1 << cs[2]) | (1 << cs[3]) | (1 << cs[4]);
  for (i = -1, v = o = 0; i < 5; i++, o = Math.pow(2, cs[i] * 4)) {
    v += o * (((v / o) & 15) + 1);
  }
  v = (v % 15) - (s / (s & -s) == 31 || s == 0x403c ? 3 : 1);
  let checkForFlush = ss[0] == (ss[1] | ss[2] | ss[3] | ss[4]);
  v -= +checkForFlush * (s == 0x7c00 ? -5 : 1);
  return `${hands[v]} ${s == 0x403c ? " (Ace low)" : ""}`;
};

export interface TotalCards {
  dealerCards: any[];
  player: Player;
}

export interface PokerWinner {
  players: any[];
  wins: Winner[];
  winnerIndicies: number[];
  hand: string;
}

export interface Winner {
  cards: any[],
  cardPool: any[],
  descr: string;
  name: string;
  rank: number;
}

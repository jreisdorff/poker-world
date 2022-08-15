import { CardProps } from "~/utils/poker";

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
    dealerIndex: number;
    littleBlindIndex: number;
    bigBlindIndex: number;
    callAmount: number;
    needResponsesFromIndicies: number[];
    littleBlindAmount?: number;
    bigBlindAmount?: number;
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
    activeBet: number;
    needResponsesFromIndicies: number[];
    bigBlindAmount: number;
    littleBlindAmount: number;
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
    needResponsesFromIndicies: number[];
    bigBlindAmount: number;
  }
  
  export const GameState = Object.freeze({
    Preflop: 0,
    Flop: 1,
    Turn: 2,
    River: 3,
    Showdown: 4,
  });
  
  export const initialPlayers: Player[] = [
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
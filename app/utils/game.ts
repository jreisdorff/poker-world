import { Player } from "~/interfaces";
import { createCards } from "./cards";
import { PokerWinner, TotalCards } from "./poker";

export interface AdvanceGameProps {
    activePlayer: Player;
    gameState: number;
    dealerCards: any[];
    players: Player[];
    hands: any[];
    pots: any[];
    activeBet?: number;
    turnsNextRound: number;
    turnsThisRound: number;
    needResponsesFrom: number;
    manualAdvance?: boolean;
    needResponsesFromIndicies: number[];
    bigBlindAmount: number;
};


export interface NextProps {
  gameState: number;
  dealerCards: any[];
  hands: any[];
  winner: any;
  winningCards: any[];
  wonAmount: any;
  players: any[];
  gameOver: boolean;
  activePlayer: any;
  turnsNextRound: number; 
  turnsThisRound: number;
  manualAdvance?: boolean;
  pots: any[]
  needResponsesFromIndicies: number[];
  bigBlindAmount: number;
};

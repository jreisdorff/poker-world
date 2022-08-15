import { Player, SendCheckOrCallDataProps } from "~/interfaces";
import { PokerWinner } from "~/utils/poker";
import getNextActivePlayerDetails from "./common";

export default function prepareForCheckCall(values: {
  gameState: any;
  logs?: string[];
  gameStarted?: boolean;
  dealerCards: any;
  isSnackbarOpen?: boolean;
  snackbarMessage?: string;
  dealtCards?: any[];
  players: any;
  activePlayerIndex?: number;
  activePlayer: any;
  dealer?: Player;
  littleBlind?: Player;
  bigBlind?: Player;
  littleBlindAmount?: number;
  bigBlindAmount?: number;
  bet?: number;
  pots: any;
  activeBet: any;
  turnNumber: any;
  blinds?: number[];
  winner?: { winner: PokerWinner; description: string } | null;
  gameOver?: boolean;
  hands: any;
  activePlayerCount?: number;
  winningCards?: any[];
  wonAmount?: number;
  playerName?: string;
  buttonClicked?: boolean;
  playerCount?: number;
  playerNames?: any[];
  playerSocket: any;
  playerSockets?: any[];
  player?: Player | undefined;
  joinedGame?: boolean;
  turnsThisRound: any;
  turnsNextRound?: number;
  earlyWin?: boolean;
  needResponsesFrom: any;
  littleBlindIndex: any;
  bigBlindIndex: any;
  dealerIndex: any;
  manualAdvance?: boolean;
  ultimateWinner?: Player | null;
  needResponsesFromIndicies: any;
  advancingToEnd?: boolean;
  callAmount?: any;
}) {
  const {
    players,
    activePlayer,
    turnNumber,
    playerSocket,
    gameState,
    dealerCards,
    activeBet,
    turnsThisRound,
    hands,
    needResponsesFrom,
    dealerIndex,
    littleBlindIndex,
    bigBlindIndex,
    callAmount,
    pots,
    needResponsesFromIndicies,
    littleBlindAmount,
    bigBlindAmount,
  } = values;

  let tempPlayers = [...players];
  let tempActivePlayer = tempPlayers.find(
    (tempP) => tempP.name === activePlayer.name
  );
  let tempPrevActivePlayerIndex = tempPlayers.indexOf(tempActivePlayer!);
  tempActivePlayer!.chips -= callAmount;

  if (tempActivePlayer!.chips <= 0) {
    tempActivePlayer!.allIn = true;
  }

  let tempPots = [...pots];
  tempPots[0] += callAmount;

  let nextActivePlayerDetails = getNextActivePlayerDetails(
    needResponsesFromIndicies,
    players,
    activePlayer
  );

  let tempNeedResponsesFromIndicies = [...needResponsesFromIndicies];
  tempNeedResponsesFromIndicies.shift();

  const checkOrCallProps: SendCheckOrCallDataProps = {
    players: tempPlayers,
    pots: tempPots,
    prevActivePlayerIndex: tempPrevActivePlayerIndex,
    activePlayerIndex: nextActivePlayerDetails.newActivePlayerIndex,
    activePlayer: nextActivePlayerDetails.newActivePlayer,
    turnNumber,
    playerSocket,
    gameState,
    dealerCards,
    activeBet,
    turnsThisRound,
    hands,
    needResponsesFrom,
    dealerIndex,
    littleBlindIndex,
    bigBlindIndex,
    callAmount,
    needResponsesFromIndicies: tempNeedResponsesFromIndicies,
    littleBlindAmount,
    bigBlindAmount,
  };

  return checkOrCallProps;
}

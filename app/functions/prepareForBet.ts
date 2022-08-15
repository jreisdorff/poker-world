import { Player, SendBetDataProps } from "~/interfaces";
import { PokerWinner } from "~/utils/poker";
import getNextActivePlayerDetails from "./common";

export default function prepareForBet(values: { gameState: number; logs: string[]; gameStarted: boolean; dealerCards: any[]; isSnackbarOpen: boolean; snackbarMessage: string; dealtCards: any[]; players: Player[]; activePlayerIndex: number; activePlayer: Player; dealer: Player; littleBlind: Player; bigBlind: Player; littleBlindAmount: number; bigBlindAmount: number; bet: number; pots: any[]; activeBet: number; turnNumber: number; blinds: number[]; winner: { winner: PokerWinner; description: string; } | null; gameOver: boolean; hands: any[]; activePlayerCount: number; winningCards: any[]; wonAmount: number; playerName: string; buttonClicked: boolean; playerCount: number; playerNames: any[]; playerSocket: any; playerSockets: any[]; player: Player | undefined; joinedGame: boolean; turnsThisRound: number; turnsNextRound: number; earlyWin: boolean; needResponsesFrom: number; littleBlindIndex: number; bigBlindIndex: number; manualAdvance: boolean; ultimateWinner: Player | null; needResponsesFromIndicies: number[]; advancingToEnd: boolean; }, amount: number) {
    
    const { players, activePlayer, needResponsesFromIndicies, turnNumber,
        playerSocket,
        gameState, turnsNextRound, hands,
        dealerCards,
        needResponsesFrom,
        littleBlindIndex,
        bigBlindIndex,
        bigBlindAmount,
        pots,
        activeBet, turnsThisRound } = values;
    
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

    let nextActivePlayerDetails = getNextActivePlayerDetails(needResponsesFromIndicies, players, activePlayer);

    const betProps: SendBetDataProps = {
      players: tempPlayers,
      pots: tempPots,
      prevActivePlayerIndex: tempPrevActivePlayerIndex,
      activePlayerIndex: nextActivePlayerDetails.newActivePlayerIndex,
      activePlayer: nextActivePlayerDetails.newActivePlayer,
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
      bigBlindAmount,
    };

    return betProps;
}
import { Dispatch, SetStateAction } from "react";
import { Player, SendFoldDataProps } from "~/interfaces";
import { PokerWinner } from "~/utils/poker";
import getNextActivePlayerDetails from "./common";

export default function prepareForFold(values: { gameState: any; logs?: string[]; gameStarted?: boolean; dealerCards: any; isSnackbarOpen?: boolean; snackbarMessage?: string; dealtCards?: any[]; players: any; activePlayerIndex?: number; activePlayer: any; dealer?: Player; littleBlind?: Player; bigBlind?: Player; littleBlindAmount?: number; bigBlindAmount?: number; bet?: number; pots: any; activeBet: any; turnNumber: any; blinds?: number[]; winner?: { winner: PokerWinner; description: string; } | null; gameOver?: boolean; hands: any; activePlayerCount?: number; winningCards?: any[]; wonAmount?: number; playerName?: string; buttonClicked?: boolean; playerCount?: number; playerNames?: any[]; playerSocket: any; playerSockets?: any[]; player?: Player | undefined; joinedGame?: boolean; turnsThisRound?: number; turnsNextRound: any; earlyWin?: boolean; needResponsesFrom: any; littleBlindIndex: any; bigBlindIndex: any; manualAdvance?: boolean; ultimateWinner?: Player | null; needResponsesFromIndicies: any; advancingToEnd?: boolean; }) {

    const { players, activePlayer, needResponsesFromIndicies, turnNumber,
        playerSocket,
        gameState, turnsNextRound, hands,
        dealerCards,
        needResponsesFrom,
        littleBlindIndex,
        bigBlindIndex,
        pots,
        activeBet, littleBlindAmount, bigBlindAmount } = values;

    let tempPlayers = [...players];
    let tempActivePlayer = tempPlayers.find(
        (player) => player.name === activePlayer.name
    );
    let tempPrevActivePlayerIndex = tempPlayers.indexOf(tempActivePlayer!);
    tempActivePlayer!.cards = tempActivePlayer!.cards.map((card: { faceUp: boolean; }) => {
        card.faceUp = false;
        return card;
    });
    tempActivePlayer!.folded = true;

    let tempNeedResponsesFromIndicies = [...needResponsesFromIndicies];
    tempNeedResponsesFromIndicies.shift();

    let nextActivePlayerDetails = getNextActivePlayerDetails(needResponsesFromIndicies, players, activePlayer);

    const foldProps: SendFoldDataProps = {
        players: tempPlayers,
        activePlayerIndex: nextActivePlayerDetails.newActivePlayerIndex,
        activePlayer: nextActivePlayerDetails.newActivePlayer,
        prevActivePlayerIndex: tempPrevActivePlayerIndex,
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
        activeBet,
        needResponsesFromIndicies: tempNeedResponsesFromIndicies,
        bigBlindAmount: bigBlindAmount!,
        littleBlindAmount: littleBlindAmount!,
    };

    return foldProps;

}
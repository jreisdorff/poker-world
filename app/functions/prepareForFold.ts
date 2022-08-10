import { Dispatch, SetStateAction } from "react";
import { Player, SendFoldDataProps } from "~/interfaces";
import { PokerWinner } from "~/utils/poker";

export default function prepareForFold(values: { gameState: any; logs?: string[]; gameStarted?: boolean; dealerCards: any; isSnackbarOpen?: boolean; snackbarMessage?: string; dealtCards?: any[]; players: any; activePlayerIndex?: number; activePlayer: any; dealer?: Player; littleBlind?: Player; bigBlind?: Player; littleBlindAmount?: number; bigBlindAmount?: number; bet?: number; pots: any; activeBet: any; turnNumber: any; blinds?: number[]; winner?: { winner: PokerWinner; description: string; } | null; gameOver?: boolean; hands: any; activePlayerCount?: number; winningCards?: any[]; wonAmount?: number; playerName?: string; buttonClicked?: boolean; playerCount?: number; playerNames?: any[]; playerSocket: any; playerSockets?: any[]; player?: Player | undefined; joinedGame?: boolean; turnsThisRound?: number; turnsNextRound: any; earlyWin?: boolean; needResponsesFrom: any; littleBlindIndex: any; bigBlindIndex: any; manualAdvance?: boolean; ultimateWinner?: Player | null; needResponsesFromIndicies: any; advancingToEnd?: boolean; }) {

    const { players, activePlayer, needResponsesFromIndicies, turnNumber,
        playerSocket,
        gameState, turnsNextRound, hands,
        dealerCards,
        needResponsesFrom,
        littleBlindIndex,
        bigBlindIndex,
        pots,
        activeBet, } = values;

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

    const foldProps: SendFoldDataProps = {
        players: tempPlayers,
        activePlayerIndex: tempAPI,
        activePlayer: newActivePlayer,
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
    };

    return foldProps;

}
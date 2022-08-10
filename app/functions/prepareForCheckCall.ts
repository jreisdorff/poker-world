import { Player, SendCheckOrCallDataProps } from "~/interfaces";
import { PokerWinner } from "~/utils/poker";

export default function prepareForCheckCall(values: { gameState: any; logs?: string[]; gameStarted?: boolean; dealerCards: any; isSnackbarOpen?: boolean; snackbarMessage?: string; dealtCards?: any[]; players: any; activePlayerIndex?: number; activePlayer: any; dealer?: Player; littleBlind?: Player; bigBlind?: Player; littleBlindAmount?: number; bigBlindAmount?: number; bet?: number; pots: any; activeBet: any; turnNumber: any; blinds?: number[]; winner?: { winner: PokerWinner; description: string; } | null; gameOver?: boolean; hands: any; activePlayerCount?: number; winningCards?: any[]; wonAmount?: number; playerName?: string; buttonClicked?: boolean; playerCount?: number; playerNames?: any[]; playerSocket: any; playerSockets?: any[]; player?: Player | undefined; joinedGame?: boolean; turnsThisRound: any; turnsNextRound?: number; earlyWin?: boolean; needResponsesFrom: any; littleBlindIndex: any; bigBlindIndex: any; manualAdvance?: boolean; ultimateWinner?: Player | null; needResponsesFromIndicies: any; advancingToEnd?: boolean; callAmount?: any; }) {

    const { players, activePlayer, turnNumber,
        playerSocket,
        gameState,
        dealerCards,
        activeBet,
        turnsThisRound,
        hands,
        needResponsesFrom,
        littleBlindIndex,
        bigBlindIndex,
        callAmount, pots, needResponsesFromIndicies } = values;

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

    const checkOrCallProps: SendCheckOrCallDataProps = {
        players: tempPlayers,
        pots: tempPots,
        prevActivePlayerIndex: tempPrevActivePlayerIndex,
        activePlayerIndex: tempAPI,
        activePlayer: newActivePlayer,
        turnNumber,
        playerSocket,
        gameState,
        dealerCards,
        activeBet,
        turnsThisRound,
        hands,
        needResponsesFrom,
        littleBlindIndex,
        bigBlindIndex,
        callAmount,
        needResponsesFromIndicies: tempNeedResponsesFromIndicies,
    };

    return checkOrCallProps;
}
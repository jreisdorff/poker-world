import { useState } from "react";
import { GameState, initialPlayers, Player } from "~/interfaces";
import { PokerWinner } from "~/utils/poker";

export default function useGameState() {
    const [gameState, setGameState] = useState(GameState.Preflop);
    const [logs, setLogs] = useState<string[]>([]);
  
    const [gameStarted, setGameStarted] = useState(false);
  
    const [dealerCards, setDealerCards] = useState<any[]>([]);
    const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
  
    const [dealtCards, setDealtCards] = useState<any[]>([]);
  
    const [players, setPlayers] = useState<Player[]>(initialPlayers);
    const [activePlayerIndex, setActivePlayerIndex] = useState(0);
    const [activePlayer, setActivePlayer] = useState(
      initialPlayers[activePlayerIndex]
    );
  
    const [dealer, setDealer] = useState(initialPlayers[0]);
    const [littleBlind, setLittleBlind] = useState(initialPlayers[1]);
    const [bigBlind, setBigBlind] = useState(initialPlayers[2]);
    const [littleBlindAmount, setLittleBlindAmount] = useState(10);
    const [bigBlindAmount, setBigBlindAmount] = useState(20);
    const [bet, setBet] = useState(bigBlindAmount * 2);
    const [pots, setPots] = useState<any[]>([littleBlindAmount, bigBlindAmount]);
    const [activeBet, setActiveBet] = useState(0);
    const [turnNumber, setTurnNumber] = useState(0);
    const [blinds, setBlinds] = useState([10, 20]);
    const [winner, setWinner] = useState<{
      winner: PokerWinner;
      description: string;
    } | null>(null);
    const [gameOver, setGameOver] = useState(false);
  
    const [hands, setHands] = useState<any[]>([]);
    const [activePlayerCount, setActivePlayerCount] = useState(3);
    const [winningCards, setWinningCards] = useState<any[]>([]);
    const [wonAmount, setWonAmount] = useState(0);
    const [playerName, setPlayerName] = useState("");
    const [buttonClicked, setButtonClicked] = useState(false);
    const [playerCount, setPlayerCount] = useState(0);
    const [playerNames, setPlayerNames] = useState<any[]>([]);
    const [playerSocket, setPlayerSocket] = useState<any>();
    const [playerSockets, setPlayerSockets] = useState<any[]>([]);
    const [player, setPlayer] = useState<Player>();
    const [joinedGame, setJoinedGame] = useState(false);
    const [turnsThisRound, setTurnsThisRound] = useState(2);
    const [turnsNextRound, setTurnsNextRound] = useState(2);
    const [earlyWin, setEarlyWin] = useState(false);
    const [needResponsesFrom, setNeedResponsesFrom] = useState(3);
    const [dealerIndex, setDealerIndex] = useState(0);
    const [littleBlindIndex, setLittleBlindIndex] = useState(1);
    const [bigBlindIndex, setBigBlindIndex] = useState(2);
    const [manualAdvance, setManualAdvance] = useState(false);
    const [ultimateWinner, setUltimateWinner] = useState<Player | null>(null);
  
    const [needResponsesFromIndicies, setNeedResponsesFromIndicies] = useState<
      number[]
    >([0, 1, 2]);
  
    const [advancingToEnd, setAdvancingToEnd] = useState(false);

    return {
        values: {
            gameState,
            logs,
            gameStarted,
            dealerCards,
            isSnackbarOpen,
            snackbarMessage,
            dealtCards,
            players,
            activePlayerIndex,
            activePlayer,
            dealer,
            littleBlind,
            bigBlind,
            littleBlindAmount,
            bigBlindAmount,
            bet,
            pots,
            activeBet,
            turnNumber,
            blinds,
            winner,
            gameOver,
            hands,
            activePlayerCount,
            winningCards,
            wonAmount,
            playerName,
            buttonClicked,
            playerCount,
            playerNames,
            playerSocket,
            playerSockets,
            player,
            joinedGame,
            turnsThisRound,
            turnsNextRound,
            earlyWin,
            needResponsesFrom,
            dealerIndex,
            littleBlindIndex,
            bigBlindIndex,
            manualAdvance,
            ultimateWinner,
            needResponsesFromIndicies,
            advancingToEnd,
        },
        actions: {
            setGameState,
            setLogs,
            setGameStarted,
            setDealerCards,
            setIsSnackbarOpen,
            setSnackbarMessage,
            setDealtCards,
            setPlayers,
            setActivePlayerIndex,
            setActivePlayer,
            setDealer,
            setLittleBlind,
            setBigBlind,
            setLittleBlindAmount,
            setBigBlindAmount,
            setBet,
            setPots,
            setActiveBet,
            setTurnNumber,
            setBlinds,
            setWinner,
            setGameOver,
            setHands,
            setActivePlayerCount,
            setWinningCards,
            setWonAmount,
            setPlayerName,
            setButtonClicked,
            setPlayerCount,
            setPlayerNames,
            setPlayerSocket,
            setPlayerSockets,
            setPlayer,
            setJoinedGame,
            setTurnsThisRound,
            setTurnsNextRound,
            setEarlyWin,
            setNeedResponsesFrom,
            setDealerIndex,
            setLittleBlindIndex,
            setBigBlindIndex,
            setManualAdvance,
            setUltimateWinner,
            setNeedResponsesFromIndicies,
            setAdvancingToEnd,
        }
      };
}
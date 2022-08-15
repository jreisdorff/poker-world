import { Player } from "~/interfaces";

export default function getNextActivePlayerDetails(needResponsesFromIndicies: any[], players: any[], activePlayer: Player) {

    let tempPlayers = [...players];

    let tempActivePlayer = tempPlayers.find(
        (player) => player.name === activePlayer.name
    );

    let tempPrevActivePlayerIndex = tempPlayers.indexOf(tempActivePlayer!);

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

    return { newActivePlayer, newActivePlayerIndex: tempAPI };
}
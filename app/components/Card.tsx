import { useState } from "react";

interface CardProps {
  rank: string;
  suit: string;
  faceUp: boolean;
  folded: boolean;
  winner?: boolean;
}

export default function Card(props: CardProps) {
  const { rank, suit, faceUp, folded, winner = false } = props;

  const getUnicodeSuit = (inputSuit: any) => {
    switch (inputSuit) {
      case "spades":
        return "\u2660";
      case "hearts":
        return "\u2665";
      case "diams":
        return "\u2666";
      case "clubs":
        return "\u2663";
      default:
        return null;
    }
  };

  return (
    <div className={`relative p-0 ${winner ? '-mt-8 transition-all duration-1000' : ''}`}>
      <div className={`card rank-${rank} ${suit} ${winner ? 'winner border-4 border-lime-500' : ''} w-[1.65em] h-[2.3em]`}>
        <span className="rank">{rank}</span>
        <span className="suit">{getUnicodeSuit(suit)}</span>
      </div>
      {!faceUp && (
        <div className="absolute top-0">
          <div className={`card back ${folded ? 'folded' : ''}`} />
        </div>
      )}
    </div>
  );
}

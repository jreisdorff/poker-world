import { useState } from "react";

interface CardProps {
  rank: string;
  suit: string;
  faceUp: boolean;
}

export default function Card(props: CardProps) {
  const { rank, suit, faceUp } = props;

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
    <div className="relative p-0">
      <div className={`card rank-${rank} ${suit}`}>
        <span className="rank">{rank}</span>
        <span className="suit">{getUnicodeSuit(suit)}</span>
      </div>
      {!faceUp && (
        <div className="absolute top-0">
          <div className="card back" />
        </div>
      )}
    </div>
  );
}

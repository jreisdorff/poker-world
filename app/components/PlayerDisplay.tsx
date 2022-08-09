import { useEffect, useState } from "react";
import { Player } from "~/routes";

interface PlayerDisplayProps {
  player: Player;
  active: boolean;
  onTimeout: () => void;
  prevPlayer: Player;
  gameOver: boolean;
  wonAmount?: number;
}

export default function PlayerDisplay(props: PlayerDisplayProps) {
  const { player, active, onTimeout, prevPlayer, gameOver, wonAmount = 0 } = props;

  const [progressCreated, setProgressCreated] = useState(false);

  const createProgressbar = (id: string, duration: string, callback: any) => {
    // We select the div that we want to turn into a progressbar
    var progressbar = document.getElementById(id);
    if (progressbar) {
      progressbar!.className = "progressbar";

      // We create the div that changes width to show progress
      var progressbarinner = document.createElement("div");
      progressbarinner.className = "inner";

      // Now we set the animation parameters
      progressbarinner.style.animationDuration = duration;

      // Eventually couple a callback
      if (typeof callback === "function") {
        progressbarinner.addEventListener("animationend", callback);
      }

      // Append the progressbar to the main progressbardiv
      progressbar?.appendChild(progressbarinner);

      // When everything is set up we start the animation
      progressbarinner.style.animationPlayState = "running";
    }
  };

  useEffect(() => {
    if (!gameOver) {
      createProgressbar("progressbar", "60s", function () {
        onTimeout();
      });
    }
  });

  return (
    <div className={`flex flex-col z-1`}>
      <div
        className={`w-[135px] max-w-[100vw] rounded-t-2xl bg-black/80 p-1 text-center text-white ${
          active && !gameOver
            ? "border-x-4 border-t-4 border-x-lime-500 border-t-lime-500"
            : null
        }`}
      >
        {`${player.name}`}
      </div>
      <div
        className={`mb-1 w-[135px] max-w-[100vw] rounded-b-2xl bg-white/80 p-1 text-center text-black ${
          active && !gameOver
            ? "border-x-4 border-b-4 border-x-lime-500 border-b-lime-500"
            : null
        }`}
      >
        {wonAmount > 0 ? `${player.chips} + ${wonAmount}` : `${player.chips}`}
      </div>
      {active ? (
        <div id="progressbar"></div>
      ) : (
        <div className="m-[10px] h-[20px] w-full"></div>
      )}
    </div>
  );
}

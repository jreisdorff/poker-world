import { useEffect, useState } from "react";

interface PotProps {
  amount: number;
}

const getChipsFromAmount = (amount: number) => {
  let quotient,
    remainder,
    quotient1,
    remainder1,
    quotient2,
    remainder2,
    quotient3,
    remainder3,
    quotient4,
    remainder4,
    quotient5,
    remainder5,
    quotient6,
    remainder6,
    quotient7,
    remainder7,
    quotient8,
    remainder8;

  quotient = amount / 1000;
  remainder = amount % 1000;

  quotient1 = remainder / 500;
  remainder1 = remainder % 500;

  quotient2 = remainder1 / 100;
  remainder2 = remainder1 % 100;

  quotient3 = remainder2 / 50;
  remainder3 = remainder2 % 50;

  quotient4 = remainder3 / 20;
  remainder4 = remainder3 % 20;

  quotient5 = remainder4 / 10;
  remainder5 = remainder4 % 10;

  quotient6 = remainder5 / 5;
  remainder6 = remainder5 % 5;

  quotient7 = remainder6 / 2;
  remainder7 = remainder6 % 2;

  quotient8 = remainder7 / 1;
  remainder8 = remainder7 % 1;

  let totalChips = Math.floor(quotient) + Math.floor(quotient1) + Math.floor(quotient2) + Math.floor(quotient3) + Math.floor(quotient4) + Math.floor(quotient5) + Math.floor(quotient6) + Math.floor(quotient7) + Math.floor(quotient8);

  return {
    total: amount,
    totalChips,
    chips: {
      "1000": Math.floor(quotient),
      "500": Math.floor(quotient1),
      "100": Math.floor(quotient2),
      "50": Math.floor(quotient3),
      "20": Math.floor(quotient4),
      "10": Math.floor(quotient5),
      "5": Math.floor(quotient6),
      "2": Math.floor(quotient7),
      "1": Math.floor(quotient8),
    },
  };
};

export default function Pot(props: PotProps) {
  const { amount } = props;
  const [chips, setChips] = useState(getChipsFromAmount(amount || 0));

  useEffect(() => {
    if (amount > 0) {
      setChips(getChipsFromAmount(amount));
    }
  }, [amount]);

  return (
    <div className="flex h-full w-full flex-row items-center justify-center">
      {chips.chips["1000"] > 0
        ? Array.from(Array(chips.chips["1000"]).keys()).map((_, index) => {
            return (
              <img
                key={1000 + index}
                className={`relative ${index} -ml-10`}
                width="36px"
                height="36px"
                src="images/chips/1000.png"
              />
            );
          })
        : null}
      {chips.chips["500"] > 0
        ? Array.from(Array(chips.chips["500"]).keys()).map((_, index) => {
            return (
              <img
                key={500 + index}
                className={`relative ${index} -ml-10`}
                width="36px"
                height="36px"
                src="images/chips/500.png"
              />
            );
          })
        : null}
      {chips.chips["100"] > 0
        ? Array.from(Array(chips.chips["100"]).keys()).map((_, index) => {
            return (
              <img
                key={100 + index}
                className={`relative ${index} -ml-10`}
                width="36px"
                height="36px"
                src="images/chips/100.png"
              />
            );
          })
        : null}
      {chips.chips["50"] > 0
        ? Array.from(Array(chips.chips["50"]).keys()).map((_, index) => {
            return (
              <img
                key={50 + index}
                className={`relative ${index} -ml-10`}
                width="36px"
                height="36px"
                src="images/chips/50.png"
              />
            );
          })
        : null}
      {chips.chips["20"] > 0
        ? Array.from(Array(chips.chips["20"]).keys()).map((_, index) => {
            return (
              <img
                key={20 + index}
                className={`relative ${index} -ml-10`}
                width="36px"
                height="36px"
                src="images/chips/20.png"
              />
            );
          })
        : null}
      {chips.chips["10"] > 0
        ? Array.from(Array(chips.chips["10"]).keys()).map((_, index) => {
            return (
              <img
                key={10 + index}
                className={`relative ${index} -ml-10`}
                width="36px"
                height="36px"
                src="images/chips/10.png"
              />
            );
          })
        : null}
      {chips.chips["5"] > 0
        ? Array.from(Array(chips.chips["5"]).keys()).map((_, index) => {
            return (
              <img
                key={5 + index}
                className={`relative ${index} -ml-10`}
                width="36px"
                height="36px"
                src="images/chips/5.png"
              />
            );
          })
        : null}
      {chips.chips["2"] > 0
        ? Array.from(Array(chips.chips["2"]).keys()).map((_, index) => {
            return (
              <img
                key={2 + index}
                className={`relative ${index} -ml-10`}
                width="36px"
                height="36px"
                src="images/chips/2.png"
              />
            );
          })
        : null}
      {chips.chips["1"] > 0
        ? Array.from(Array(chips.chips["1"]).keys()).map((_, index) => {
            return (
              <img
                key={1 + index}
                className={`relative ${index} -ml-10`}
                width="36px"
                height="36px"
                src="images/chips/1.png"
              />
            );
          })
        : null}
    </div>
  );
}

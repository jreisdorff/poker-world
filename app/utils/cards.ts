import { CardProps, CardsCreator } from "./poker";

const Creator = CardsCreator.getInstance();

export const createCards = (max: any, n: any, remaining: CardProps[] | any[] = [], faceUp: boolean) => {
  return [...remaining, ...Creator.getCards(faceUp, max, n)];
};

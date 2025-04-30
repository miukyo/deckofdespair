import { Cards } from "./types";
import index from "../../../cards/editionsindex.json";
import { type CardEditionsT } from "../../../cards/editions";

export const getCards = async (edition: CardEditionsT = "CAH Base Set") => {
  let cards: Cards | null = { prompt: [], answer: [] };
  // Check if the edition is available in the local index
  let fileName = index.find((item) => item.name === edition)?.file;

  const basePath = import.meta.env.VITE_CARDS_URL;
  await fetch([basePath, fileName].join("/"))
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      if (data) {
        data.white.forEach((card: any, i: number) => {
          cards!.answer.push({
            id: (data.name.replaceAll(" ", "") + "a" + i.toString()).toLowerCase(),
            text: card.text,
          });
        });
        data.black.forEach((card: any, i: number) => {
          cards!.prompt.push({
            id: (data.name.replaceAll(" ", "") + "p" + i.toString()).toLowerCase(),
            text: card.text,
            minPick: card.pick || 1,
          });
        });
      }
    })
    .catch((error) => {
      console.error("Error fetching cards:", error);
    });
  return cards! as Cards;
};

"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Crown } from "lucide-react";
import PromptCard from "./prompt-card";
import AnswerCard from "./answer-card";
import PlayerList from "./player-list";
import ChatRoom from "./chat-room";
import Button from "./ui/button";
import Badge from "./ui/badge";
import Panel from "./ui/panel";
import { usePeer } from "../utils/PeerProvider";
import { Card } from "../utils/peer/types";
import Modal from "./ui/modal";

export default function GameBoard() {
  const { handleSendObject, isHost, players, cards, user, gameState, gameSettings, round, time } =
    usePeer();
  const [selectedCard, setSelectedCard] = useState<string[]>([]);
  const [promptCard, setPromptCard] = useState<Card | undefined>(undefined);
  const [answerCards, setAnswerCards] = useState<Card[]>([]);

  const player = players.find((p) => p.id === user?.id);
  useEffect(() => {
    if (!player) return;
    // Only update if this isn't a round change (handled by the round useEffect)
    if (!gameState || round === gameState.round) {
      const handCards = player.cards.map(
        (cardID) => cards.answer.find((card) => card.id === cardID)!
      );
      setPromptCard(cards.prompt.find((card) => card.id === gameState?.promptCard));
      setAnswerCards(handCards);
    }
  }, [player?.cards, gameState?.promptCard]);
  const handleCardPlay = (id: string) => {
    if (gameState?.isChoosing) return;

    // Update selected cards in local state
    setSelectedCard((prev) => [...prev, id]);

    // Add the card to the game state's answer cards
    gameState!.answerCards.find((e) => e.playerID === player?.id)!.cardID.push(id);

    // Remove the card from the player's hand
    player!.cards = player!.cards.filter((cardID) => cardID !== id);

    // Update the answer cards display immediately
    setAnswerCards((prev) => prev.filter((card) => card.id !== id));

    // Sync with other players
    handleSendObject({
      type: "gameSync",
      gameState: { ...gameState, answerCards: gameState!.answerCards },
      players: players,
    });
  };
  const handleCardCancel = (id: string) => {
    if (gameState?.isChoosing) return;

    // Remove from selected cards
    setSelectedCard(selectedCard.filter((c) => c !== id));

    // Remove from game state's answer cards
    let ac = gameState!.answerCards.find((e) => e.playerID === player?.id)!.cardID;
    gameState!.answerCards.find((e) => e.playerID === player?.id)!.cardID = ac.filter(
      (cardID) => cardID !== id
    );

    // Add back to player's hand
    player!.cards.push(id);

    // Add the card back to the display
    const cardToAdd = cards.answer.find((card) => card.id === id);
    if (cardToAdd) {
      setAnswerCards((prev) => [...prev, cardToAdd]);
    }

    // Sync with other players
    handleSendObject({
      type: "gameSync",
      gameState: { ...gameState, answerCards: gameState!.answerCards },
      players: players,
    });
  };

  const handleCancelGame = () => {
    handleSendObject({ type: "cancelGame" }, true);
  };

  const handleChooseWinner = (winner: string) => {
    const AudioWin = new Audio("/sounds/Button.mp3");
    AudioWin.volume = 0.5;
    AudioWin.play();
    handleSendObject(
      {
        type: "chooseWinner",
        playerID: winner,
        cardID: gameState?.answerCards.find((e) => e.playerID === winner)?.cardID,
      },
      true
    );
  };
  useEffect(() => {
    if (!player) return;

    const handCards = player.cards.map(
      (cardID) => cards.answer.find((card) => card.id === cardID)!
    );
    time.value = gameSettings?.roundTime;
    setSelectedCard([]);
    setPromptCard(cards.prompt.find((card) => card.id === gameState?.promptCard));
    setAnswerCards(handCards);

    const i = setInterval(() => {
      if (time.value === 0) {
        clearInterval(i);
        return;
      }
      time.value = time.value - 1;
    }, 1000);

    return () => clearInterval(i);
  }, [round]);

  useEffect(() => {
    if (time.value === 0 && isHost) {
      handleSendObject({ type: "gameState", gameState: { ...gameState, isChoosing: true } }, true);
    }
    if (time.value <= 5) {
      const AudioTime = new Audio("/sounds/Tickdown.mp3");
      AudioTime.volume = 0.5;
      AudioTime.play();
    }
    if (time.value === 0) {
      const AudioEnd = new Audio("/sounds/Choosing.mp3");
      AudioEnd.volume = 0.5;
      AudioEnd.play();
    }
  }, [time.value]);

  useEffect(() => {
    if (gameState?.promptCard) {
      const AudioWin = new Audio("/sounds/GameStart.mp3");
      AudioWin.volume = 0.3;
      AudioWin.play();
    }
  }, [gameState?.promptCard]);

  useEffect(() => {
    if (gameState?.winner?.playerID) {
      const AudioWin = new Audio("/sounds/RoundWin.mp3");
      AudioWin.volume = 0.5;
      AudioWin.play();
    }
  }, [gameState?.winner?.playerID]);

  useEffect(() => {
    if (gameState?.overralWinner) {
      const AudioWin = new Audio("/sounds/GameEnd.mp3");
      AudioWin.volume = 0.5;
      AudioWin.play();
    }
  }, [gameState?.overralWinner]);

  return (
    <div className="max-w-screen grid grid-cols-1 lg:grid-cols-4 gap-6 select-noneall">
      <div className="lg:col-span-3">
        <div className="flex flex-col md:flex-row justify-center md:justify-between  items-stretch md:items-center mb-6 gap-3">
          <div className="flex items-center gap-3 relative">
            {isHost && (
              <Button
                icon={<ArrowLeft className="w-5 h-5" />}
                variant="default"
                showTooltip={true}
                onClick={handleCancelGame}
                tooltipText="Back to Lobby"
              />
            )}

            <Badge variant="default" className="text-lg md:text-2xl font-bold">
              Round {gameState?.round}
            </Badge>
            <Badge
              variant="default"
              className="text-lg absolute right-0 md:static md:text-2xl font-bold">
              {time}s left
            </Badge>
          </div>

          <Badge
            variant="default"
            className="text-lg"
            icon={<Crown className="h-5 w-5 text-yellow-400" />}>
            <span className="font-bold">{players.find((p) => p.id === gameState?.czar)?.name}</span>{" "}
            is the Card Czar
          </Badge>
        </div>

        <Panel variant="bordered" className="min-h-[300px] mb-6 p-6 overflow-hidden">
          <div className="flex flex-col items-center gap-8">
            {promptCard && <PromptCard promptCard={promptCard} />}

            <div className="flex flex-wrap gap-4 mt-4">
              {players.map((player, i) =>
                gameState?.czar === player?.id ? null : (
                  <div
                    key={i}
                    style={{ width: (144 + 16) * (promptCard?.minPick || 1) }}
                    className="h-52 rounded-lg bg-neutral-800 flex items-center gap-4 p-2 justify-start relative">
                    {[...Array(promptCard?.minPick)].map((_, i) => (
                      <div
                        key={i}
                        style={{ width: 144, marginLeft: i * (144 + 16) }}
                        className={`absolute inset-2 p-2 rounded-lg border-2 border-dashed border-neutral-700 bg-neutral-700/50 grid place-items-center  font-bold text-sm text-neutral-500`}>
                        {gameState?.isChoosing
                          ? ""
                          : player.id === user?.id
                          ? "Select a card"
                          : "?"}
                      </div>
                    ))}

                    {gameState?.czar === user?.id &&
                      gameState?.isChoosing &&
                      !gameState.winner?.playerID &&
                      gameState?.answerCards.find((e) => e.playerID === player.id)?.cardID
                        .length !== 0 && (
                        <button
                          key={i}
                          onClick={() => handleChooseWinner(player.id)}
                          style={{ width: (144 + 16) * (promptCard?.minPick || 1) }}
                          className="h-52 rounded-lg hover:bg-blue-400 absolute inset-0 cursor-pointer z-10 opacity-50 transition-colors"
                        />
                      )}
                    {gameState?.winner?.playerID === player.id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 100, duration: 0.1 }}
                        className="absolute z-20 -left-3 bottom-5 -rotate-45 text-amber-500">
                        <Crown size={40} />
                      </motion.div>
                    )}

                    {gameState?.answerCards.map((e) =>
                      e.playerID !== player?.id ||
                      ((gameState.czar === user?.id ? false : !gameState?.isChoosing) &&
                        e.playerID !== user?.id)
                        ? null
                        : e.cardID.map((cardID) => {
                            const card = cards.answer.find((card) => card.id === cardID);
                            if (!card) return null;
                            return (
                              <motion.div
                                key={card.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}>
                                <AnswerCard
                                  key={card.id}
                                  text={card?.text}
                                  isFlipped
                                  isDisabled={
                                    gameState.winner?.cardID.includes(card.id)
                                      ? false
                                      : gameState.isChoosing
                                      ? gameState.czar !== user?.id
                                      : gameState.czar === user?.id && !gameState.isChoosing
                                  }
                                  // isPlayed={}
                                  onPlay={() =>
                                    gameState.czar === user?.id || gameState.isChoosing
                                      ? null
                                      : handleCardCancel(card?.id)
                                  }
                                />
                              </motion.div>
                            );
                          })
                    )}
                  </div>
                )
              )}
            </div>
          </div>
        </Panel>

        <div className="flex flex-wrap justify-center mt-8 gap-3">
          {answerCards.map(
            (card) =>
              !selectedCard.includes(card.id) && (
                <AnswerCard
                  key={card.id}
                  text={card.text}
                  onPlay={() => handleCardPlay(card.id)}
                  isDisabled={
                    selectedCard.length === promptCard?.minPick ||
                    gameState?.isChoosing ||
                    gameState?.czar === user?.id
                  }
                />
              )
          )}
        </div>
      </div>

      <div className="lg:col-span-1 flex flex-col gap-6">
        <PlayerList />
        <ChatRoom />
      </div>
      <Modal isOpen={!!gameState?.overralWinner} onClose={() => {}} withPanel={false}>
        <div className="z-10 text-amber-500 flex flex-col items-center gap-4">
          <div className="absolute inset-0 bg-radial from-black/80 to-transparent -z-10" />
          <motion.div
            initial={{ rotate: -5, scale: 0 }}
            animate={{ rotate: [5, -5], scale: [1, 1.1, 1] }}
            transition={{
              duration: 1,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
            }}>
            <Crown size={100} />
          </motion.div>
          <h1 className="text-3xl">
            <span className="font-bold">
              {players.find((p) => p.id === gameState?.overralWinner)?.name}
            </span>{" "}
            won the game!
          </h1>
        </div>
      </Modal>
    </div>
  );
}

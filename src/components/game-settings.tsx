"use client";
import { motion } from "motion/react";
import { Plus, Minus, Check } from "lucide-react";
import Button from "./ui/button";
import Panel from "./ui/panel";
import Badge from "./ui/badge";
import { usePeer } from "../utils/PeerProvider";
import { CardEditions } from "../../cards/editions";

export default function GameSettings() {
  const { gameSettings, handleSendObject, isHost } = usePeer();
  const availableCardPacks = CardEditions;

  function setSettings(arg: any) {
    handleSendObject({ type: "gameSettings", settings: arg }, true);
  }

  const handleMaxPlayersChange = (value: number) => {
    if (!isHost) return;
    setSettings({ ...gameSettings, maxPlayers: Math.max(3, Math.min(12, value)) });
  };

  const handleMaxScoreChange = (value: number) => {
    if (!isHost) return;
    setSettings({ ...gameSettings, maxScore: Math.max(1, Math.min(20, value)) });
  };

  const handleRoundTimeChange = (value: number) => {
    if (!isHost) return;
    setSettings({ ...gameSettings, roundTime: Math.max(10, Math.min(120, value)) });
  };

  const toggleCardPack = (pack: string) => {
    if (!isHost) return;

    if (gameSettings.cardPacks.includes(pack)) {
      // Remove pack if it's not the last one
      if (gameSettings.cardPacks.length > 1) {
        setSettings({
          ...gameSettings,
          cardPacks: gameSettings.cardPacks.filter((p) => p !== pack),
        });
      }
    } else {
      // Add pack
      setSettings({
        ...gameSettings,
        cardPacks: [...gameSettings.cardPacks, pack],
      });
    }
  };

  return (
    <div className={`${isHost ? "" : "opacity-70 pointer-events-none"}`}>
      {!isHost && (
        <Panel variant="default" className="bg-neutral-800 text-neutral-400 mb-4 text-center">
          Only the host can change game settings
        </Panel>
      )}

      <div className="space-y-6">
        <div>
          <h3 className="text-white font-bold mb-3">Game Options</h3>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-neutral-300">Max Players</label>
              <div className="flex items-center gap-3">
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-8 h-8 rounded-full p-0"
                  onClick={() => handleMaxPlayersChange(gameSettings.maxPlayers - 1)}
                  icon={<Minus className="w-4 h-4" />}
                />
                <Badge variant="score" className="w-12 text-center !px-0">
                  {gameSettings.maxPlayers}
                </Badge>
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-8 h-8 rounded-full p-0"
                  onClick={() => handleMaxPlayersChange(gameSettings.maxPlayers + 1)}
                  icon={<Plus className="w-4 h-4" />}
                />
              </div>
            </div>

            <div className="flex justify-between items-center">
              <label className="text-neutral-300">Points to Win</label>
              <div className="flex items-center gap-3">
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-8 h-8 rounded-full p-0"
                  onClick={() => handleMaxScoreChange(gameSettings.maxScore - 1)}
                  icon={<Minus className="w-4 h-4" />}
                />
                <Badge variant="score" className="w-12 text-center !px-0">
                  {gameSettings.maxScore}
                </Badge>
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-8 h-8 rounded-full p-0"
                  onClick={() => handleMaxScoreChange(gameSettings.maxScore + 1)}
                  icon={<Plus className="w-4 h-4" />}
                />
              </div>
            </div>

            <div className="flex justify-between items-center">
              <label className="text-neutral-300">Round Time (seconds)</label>
              <div className="flex items-center gap-3">
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-8 h-8 rounded-full p-0"
                  onClick={() => handleRoundTimeChange(gameSettings.roundTime - 10)}
                  icon={<Minus className="w-4 h-4" />}
                />
                <Badge variant="score" className="w-12 text-center !px-0">
                  {gameSettings.roundTime}
                </Badge>
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-8 h-8 rounded-full p-0"
                  onClick={() => handleRoundTimeChange(gameSettings.roundTime + 10)}
                  icon={<Plus className="w-4 h-4" />}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="">
          <h3 className="text-white font-bold mb-3">Card Packs</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {availableCardPacks.map((pack) => (
              <motion.button
                key={pack}
                className={`p-2 rounded-lg text-left flex items-center justify-between ${
                  gameSettings.cardPacks.includes(pack)
                    ? "bg-neutral-700 text-white"
                    : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white"
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => toggleCardPack(pack)}>
                <span>{pack}</span>
                {gameSettings.cardPacks.includes(pack) && (
                  <Check className="w-4 h-4 text-green-400" />
                )}
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

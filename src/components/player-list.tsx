"use client";

import { motion } from "motion/react";
import Panel from "./ui/panel";
import Badge from "./ui/badge";
import { usePeer } from "../utils/PeerProvider";

export default function PlayerList() {
  const { players, user, gameState } = usePeer();

  const player = players.find((p) => p.id === user?.id);

  return (
    <Panel title="Players" variant="bordered">
      <div>
        {players.map((playeri) => (
          <motion.div
            key={playeri.id}
            className={`flex items-center justify-between p-2 rounded-lg ${
              playeri.id === player?.id ? "bg-neutral-800 border border-neutral-600" : ""
            }`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}>
            <div className="flex items-center gap-3">
              <div>
                <div className="text-white font-medium">
                  {playeri.name} {playeri.id === player?.id && "(You)"}
                </div>
                {gameState?.czar === playeri?.id && (
                  <div className="text-xs text-yellow-400">Card Czar</div>
                )}
              </div>
            </div>

            <Badge variant="score">{playeri.score}</Badge>
          </motion.div>
        ))}
      </div>
    </Panel>
  );
}

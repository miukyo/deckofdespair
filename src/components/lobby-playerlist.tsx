"use client";

import { motion } from "motion/react";
import { User, X, Check } from "lucide-react";
import { usePeer } from "../utils/PeerProvider";
import Button from "./ui/button";
import Badge from "./ui/badge";

export default function LobbyPlayerList() {
  const { isHost, users, user, handleSendObject, gameSettings, conn } = usePeer();
  const emptySlots = Math.max(0, gameSettings.maxPlayers - users.length);

  const handleKick = (id: string) => {
    handleSendObject({ type: "kick" }, false, conn.find((c) => c.peer === id));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">
          Players ({users.length}/{gameSettings.maxPlayers})
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {users.map((player, i) => (
          <motion.div
            key={i}
            className="flex items-center justify-between p-3 bg-neutral-800 rounded-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}>
            <div className="flex items-center gap-3">
              <div>
                <div className="text-white font-medium">{player.name}</div>
                {player.isHost && <div className="text-xs text-yellow-400">Host</div>}
              </div>
            </div>

            <div className="flex items-center">
              {player.isReady ? (
                <Badge
                  variant="primary"
                  className="bg-green-600 text-xs px-2 py-1"
                  icon={<Check className="w-3 h-3" />}>
                  Ready
                </Badge>
              ) : (
                <Badge
                  variant="default"
                  className="bg-neutral-700 text-neutral-400 text-xs px-2 py-1"
                  icon={<X className="w-3 h-3" />}>
                  Not Ready
                </Badge>
              )}

              {isHost && !player.isHost && (
                <Button
                  variant="default"
                  className="ml-2 p-1"
                  onClick={() => handleKick(player.id)}
                  icon={<X className="w-4 h-4 text-neutral-500 hover:text-red-500" />}
                />
              )}
            </div>
          </motion.div>
        ))}

        {/* Empty slots */}
        {Array.from({ length: emptySlots }).map((_, index) => (
          <motion.div
            key={`empty-${index}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center justify-center p-3 bg-neutral-800 bg-opacity-50 rounded-lg border border-dashed border-neutral-700">
            <div className="text-neutral-600 flex items-center gap-2">
              <User className="w-5 h-5" />
              <span>Empty Slot</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

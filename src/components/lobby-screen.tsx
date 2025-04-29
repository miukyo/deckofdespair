import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Users, Settings, MessageSquare, Play } from "lucide-react";
import LobbyPlayerList from "./lobby-playerlist";
import LobbyChat from "./lobby-chat";
import GameSettings from "./game-settings";
import { usePeer } from "../utils/PeerProvider";
import Button from "./ui/button";
import Badge from "./ui/badge";
import { useToast } from "./ui/toast";

export default function LobbyScreen() {
  const { showToast } = useToast();
  const { connectedToID, isHost, users, handleSendObject } = usePeer();
  const [activeTab, setActiveTab] = useState<"players" | "chat" | "settings">("players");
  const [isStarting, setIsStarting] = useState(false);

  const allPlayersReady = users.every((player) => player.isReady) && users.length > 1;

  const handleStartGame = () => {
    setIsStarting(true);
    handleSendObject({ type: "startGame" }, true);
  };

  return (
    <div className="w-full max-w-4xl mx-auto h-full flex flex-col justify-center">
      <motion.div
        className="bg-neutral-900 rounded-xl border border-neutral-700 overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}>
        <div className="p-6 border-b border-neutral-700">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div>
              <div className="flex items-center">
                <div className="text-neutral-400 mr-2">Lobby Code:</div>
                <Badge variant="outline" className="font-mono">
                  {connectedToID}
                </Badge>
                <button
                  className="ml-2 text-neutral-400 hover:text-white text-sm underline"
                  onClick={() => {
                    navigator.clipboard.writeText(connectedToID!);
                    showToast("Lobby code copied to clipboard", "success");
                  }}>
                  Copy
                </button>
              </div>
            </div>

            {isHost && (
              <Button
                variant="primary"
                icon={<Play className="w-5 h-5" />}
                onClick={allPlayersReady ? handleStartGame : undefined}
                disabled={!allPlayersReady || isStarting}
                showTooltip={true}
                tooltipPosition="left"
                tooltipText={
                  users.length < 2
                    ? "Need at least 2 player to play"
                    : allPlayersReady
                    ? "Start the game"
                    : "All players must be ready"
                }
                className="px-6 py-3">
                Start Game
              </Button>
            )}
          </div>
        </div>

        <div className="flex border-b border-neutral-700">
          <button
            className={`flex-1 py-3 px-4 flex justify-center items-center gap-2 ${
              activeTab === "players"
                ? "bg-neutral-800 text-white"
                : "text-neutral-400 hover:text-white"
            }`}
            onClick={() => setActiveTab("players")}>
            <Users className="w-5 h-5" />
            <span className="font-medium">Players</span>
            <Badge variant="score" className="text-xs ml-1 px-2 py-1 rounded-full">
              {users.length}
            </Badge>
          </button>

          <button
            className={`flex-1 py-3 px-4 flex justify-center items-center gap-2 ${
              activeTab === "chat"
                ? "bg-neutral-800 text-white"
                : "text-neutral-400 hover:text-white"
            }`}
            onClick={() => setActiveTab("chat")}>
            <MessageSquare className="w-5 h-5" />
            <span className="font-medium">Chat</span>
          </button>

          <button
            className={`flex-1 py-3 px-4 flex justify-center items-center gap-2 ${
              activeTab === "settings"
                ? "bg-neutral-800 text-white"
                : "text-neutral-400 hover:text-white"
            }`}
            onClick={() => setActiveTab("settings")}>
            <Settings className="w-5 h-5" />
            <span className="font-medium">Settings</span>
          </button>
        </div>

        <div className="p-6 max-h-[40rem] overflow-y-auto">
          <AnimatePresence mode="wait">
            {activeTab === "players" && (
              <motion.div
                key="players"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}>
                <LobbyPlayerList />
              </motion.div>
            )}

            {activeTab === "chat" && (
              <motion.div
                key="chat"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}>
                <LobbyChat />
              </motion.div>
            )}

            {activeTab === "settings" && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}>
                <GameSettings />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

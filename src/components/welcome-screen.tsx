"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { UserCircle, Plus, LogIn, ArrowRight, AlertCircle } from "lucide-react";
import { usePeer } from "../utils/PeerProvider";
import { useLocation } from "wouter";

export default function WelcomeScreen() {
  const [_, navigate] = useLocation();
  const { isConnected, handleCreateLobby, handleConnect } = usePeer();
  const [username, setUsername] = useState("");
  const [lobbyCode, setLobbyCode] = useState("");
  const [mode, setMode] = useState<"select" | "create" | "join">("select");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Clear error when inputs change
  useEffect(() => {
    if (error) setError("");
  }, [username, lobbyCode]);

  const handleCreateGame = () => {
    if (!validateUsername()) return;

    setIsLoading(true);
    handleCreateLobby(username);
  };

  const handleJoinGame = () => {
    if (!validateUsername()) return;
    if (!validateLobbyCode()) return;

    setIsLoading(true);
    handleConnect(lobbyCode.toUpperCase(), username);
    setTimeout(() => setIsLoading(false), 2000);
  };

  useEffect(() => {
    if (isConnected) {
      setIsLoading(false);
      navigate("/lobby");
    }
  }, [isConnected]);

  const validateUsername = () => {
    if (!username.trim()) {
      setError("Please enter a username");
      return false;
    }
    if (username.length < 2) {
      setError("Username must be at least 2 characters");
      return false;
    }
    if (username.length > 15) {
      setError("Username must be less than 15 characters");
      return false;
    }
    return true;
  };

  const validateLobbyCode = () => {
    if (!lobbyCode.trim()) {
      setError("Please enter a lobby code");
      return false;
    }
    if (lobbyCode.length !== 6) {
      setError("Lobby code must be 6 characters");
      return false;
    }
    return true;
  };

  return (
    <div className="w-full h-full max-w-md mx-auto flex flex-col justify-center">
      <motion.div
        className="bg-neutral-900 rounded-xl border border-neutral-700 overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}>
        <div className="p-6">
          <AnimatePresence mode="wait">
            {mode === "select" && (
              <motion.div
                key="select"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-4">
                <div className="text-center mb-4">
                  <h2 className="text-xl text-white font-bold">Welcome!</h2>
                  <p className="text-neutral-400 mt-1">Choose an option to get started</p>
                </div>

                <motion.button
                  className="bg-neutral-800 hover:bg-neutral-700 text-white p-4 rounded-lg flex items-center gap-3"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setMode("create")}>
                  <div className="bg-green-600 p-2 rounded-lg">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-bold">Create New Game</div>
                    <div className="text-sm text-neutral-400">Start a new lobby as host</div>
                  </div>
                </motion.button>

                <motion.button
                  className="bg-neutral-800 hover:bg-neutral-700 text-white p-4 rounded-lg flex items-center gap-3"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setMode("join")}>
                  <div className="bg-blue-600 p-2 rounded-lg">
                    <LogIn className="w-5 h-5" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-bold">Join Game</div>
                    <div className="text-sm text-neutral-400">Enter a lobby code to join</div>
                  </div>
                </motion.button>
              </motion.div>
            )}

            {mode === "create" && (
              <motion.div
                key="create"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-4">
                <div className="text-center mb-4">
                  <h2 className="text-xl text-white font-bold">Create New Game</h2>
                  <p className="text-neutral-400 mt-1">Enter your username to continue</p>
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <UserCircle className="w-5 h-5 text-neutral-500" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Your username"
                    className="bg-neutral-800 text-white rounded-lg pl-10 pr-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-neutral-600"
                    maxLength={15}
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="flex gap-2 mt-2">
                  <motion.button
                    className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-white px-4 py-3 rounded-lg font-medium"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setMode("select")}>
                    Back
                  </motion.button>
                  <motion.button
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-medium flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCreateGame}
                    disabled={isLoading}>
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        Create Game
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            )}

            {mode === "join" && (
              <motion.div
                key="join"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-4">
                <div className="text-center mb-4">
                  <h2 className="text-xl text-white font-bold">Join Game</h2>
                  <p className="text-neutral-400 mt-1">Enter your details to join a game</p>
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <UserCircle className="w-5 h-5 text-neutral-500" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Your username"
                    className="bg-neutral-800 text-white rounded-lg pl-10 pr-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-neutral-600"
                    maxLength={15}
                  />
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <LogIn className="w-5 h-5 text-neutral-500" />
                  </div>
                  <input
                    type="text"
                    value={lobbyCode}
                    onChange={(e) => setLobbyCode(e.target.value.toUpperCase())}
                    placeholder="6-digit lobby code"
                    className="bg-neutral-800 text-white rounded-lg pl-10 pr-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-neutral-600 uppercase"
                    maxLength={6}
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="flex gap-2 mt-2">
                  <motion.button
                    className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-white px-4 py-3 rounded-lg font-medium"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setMode("select")}>
                    Back
                  </motion.button>
                  <motion.button
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleJoinGame}
                    disabled={isLoading}>
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        Join Game
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <motion.div
        className="mt-4 text-center text-neutral-500 text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}>
        Give support to the project{" "}
        <a className="text-blue-500" href="https://github.com/miukyo/deckofdisorder">
          here
        </a>
      </motion.div>
    </div>
  );
}

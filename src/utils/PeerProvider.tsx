import Peer, { DataConnection } from "peerjs";
import { useEffect, useState } from "react";
import { useSignal } from "@preact-signals/safe-react";
import { useToast } from "../components/ui/toast";
import { useLocation } from "wouter";
import confetti from "canvas-confetti";

// Import from our new modules
import { filterDuplicates } from "./peer/utils";
import { createPeer, sendToConnections, formatMessage, connectToPeer } from "./peer/networking";
import { PeerContext } from "./peer/PeerContext";
import { User, GameSettings, Player, Message, GameState, Cards } from "./peer/types";
import { CardEditionsT } from "../../cards/editions";
import { getCards } from "./peer/cards";

export default function PeerProvider({ children }: { children: React.ReactNode }) {
  // ===== HOOKS =====
  const { showToast, hideToast } = useToast();
  const [_, navigate] = useLocation();

  // ===== NETWORK STATE =====
  const [peer, setPeer] = useState<Peer | null>(null);
  const connectedToID = useSignal<string | null>(null);
  const connections = useSignal<DataConnection[]>([]);
  const lastPingTime = useSignal<{ [key: string]: number }>({});
  const isHost = useSignal<boolean>(false);
  const isConnected = useSignal<boolean>(false);

  // ===== USER STATE =====
  const users = useSignal<User[]>([]);
  const user = useSignal<User | null>(null);
  const messages = useSignal<Message[]>([]);
  const isKicked = useSignal<boolean>(false);

  // ===== GAME STATE =====
  const [round, setRound] = useState(0);
  const time = useSignal<number>(60);
  const isChoosing = useSignal<boolean>(false);
  const players = useSignal<Player[]>([]);
  const cards = useSignal<Cards>({
    prompt: [],
    answer: [],
  });
  const gameSettings = useSignal<GameSettings>({
    maxPlayers: 8,
    maxScore: 10,
    cardPacks: ["CAH Base Set"],
    roundTime: 30,
  });
  const gameState = useSignal<GameState>({
    round: 0,
    czar: "",
    promptCard: "",
    answerCards: [],
    isChoosing: false,
    winner: null,
    overralWinner: "",
    timestamp: Date.now(),
  });
  const gameHistory = useSignal<GameState[]>([]);

  // Temporary state to store data for disconnected players
  const tempState = new Map<string, Player>();

  // ===== UTILITY FUNCTIONS =====

  // Reset all state variables
  const cleanUp = () => {
    connections.value.forEach((conn) => conn.close());
    connections.value = [];
    users.value = [];
    players.value = [];
    messages.value = [];
    user.value = null;
    isConnected.value = false;
    gameSettings.value = {
      maxPlayers: 8,
      maxScore: 10,
      cardPacks: ["CAH Base Set"],
      roundTime: 30,
    };
    gameState.value = {
      round: 0,
      czar: "",
      promptCard: "",
      answerCards: [],
      isChoosing: false,
      winner: null,
      overralWinner: "",
      timestamp: Date.now(),
    };
  };

  // Confetti animation
  const spawnConfetti = (duration = 0.5) => {
    const end = Date.now() + duration * 1000;
    const colors = ["#a786ff", "#fd8bbc", "#eca184", "#f8deb1"];

    const frame = () => {
      if (Date.now() > end) return;

      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        startVelocity: 60,
        origin: { x: 0, y: 0.5 },
        colors: colors,
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        startVelocity: 60,
        origin: { x: 1, y: 0.5 },
        colors: colors,
      });

      requestAnimationFrame(frame);
    };

    frame();
  };

  // ===== GAME FUNCTIONS =====

  // Seeded random number generator
  function mulberry32(seed: number) {
    return function () {
      seed |= 0;
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // Seeded shuffle for cards
  function shuffle(array: any[], seed: number) {
    const random = mulberry32(seed);
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  // Draw cards from the deck
  const giveCards = (count: number, offset?: number) => {
    if (cards.value.answer.length === 0) {
      console.log("No more cards!");
      return [];
    }
    let drawn = [];
    for (let i = 0; i < count && cards.value.answer.length > 0; i++) {
      drawn.push(cards.value.answer[offset ? offset + i : i].id);
    }
    return drawn;
  };

  // Set next Card Czar
  const setCzar = () => {
    const czarIndex = players.value.findIndex((player) => player.id === gameState.value.czar);
    if (czarIndex === -1) return;
    const nextCzarIndex = (czarIndex + 1) % players.value.length;
    return players.value[nextCzarIndex].id;
  };

  // ===== NETWORK FUNCTIONS =====

  // Initialize peer
  useEffect(() => {
    const newPeer = createPeer();
    setPeer(newPeer);

    newPeer.on("open", (id) => {
      console.log("Lobby ID:", id);
    });

    newPeer.on("connection", handleNewConnection);
  }, []);

  // Handle new incoming connection
  const handleNewConnection = (conn: DataConnection) => {
    if (!isHost.value) return;

    lastPingTime.value[conn.peer] = Date.now();

    conn.on("data", (data: any) => {
      lastPingTime.value[conn.peer] = Date.now();

      if (data === 0) return;

      if (data === 1) {
        // Check if the username is already taken
        const isUsernameTaken = users.value.some((user) => user.name === conn.metadata.name);
        if (isUsernameTaken) {
          showToast(
            `Someone tried to join with the same username as "${conn.metadata.name}"`,
            "error"
          );
          handleSendObject(
            {
              type: "toast",
              message: "Your username is already taken by someone in the lobby",
              mode: "error",
            },
            false,
            conn
          );
          isKicked.value = true;
          conn.close();
          isKicked.value = false;
          return;
        }

        // Check if lobby is full
        const isPlayerMaxed = users.value.length === gameSettings.value.maxPlayers;
        if (isPlayerMaxed) {
          showToast(`Someone tried to join but the lobby is already full`, "error");
          handleSendObject(
            {
              type: "toast",
              message: "Lobby is already full",
              mode: "error",
            },
            false,
            conn
          );
          isKicked.value = true;
          conn.close();
          isKicked.value = false;
          return;
        }

        // Add new user
        connections.value = [...connections.value, conn];
        users.value = filterDuplicates([
          ...users.value,
          { id: conn.peer, name: conn.metadata.name, isHost: false, isReady: false },
        ]);

        const existingPlayer = tempState.get(conn.peer);
        if (existingPlayer) {
          handleSendObject(0, false, conn);
          // Restore user data from tempState
          handleSendObject(
            {
              type: "history",
              messages: messages.value,
              users: users.value,
            },
            false,
            conn
          );
          handleSendObject(
            {
              type: "gameSettings",
              settings: gameSettings.value,
            },
            false,
            conn
          );
          handleSendObject(
            {
              type: "gameSync",
              players: [...players.value, existingPlayer],
              gameState: gameState.value,
            },
            true
          );
          handleSendObject(
            {
              type: "toast",
              message: `${conn.metadata.name} reconnected`,
              mode: "success",
            },
            true
          );

          handleSendObject(
            {
              type: "syncTime",
              time: time.value,
            },
            true
          );

          // Clear tempState for this user after restoring
          tempState.delete(conn.peer);
          return;
        }

        // Send current state to new user
        handleSendObject({
          type: "history",
          messages: messages.value,
          users: users.value,
        });

        handleSendObject({
          type: "gameSettings",
          settings: gameSettings.value,
        });

        // Notify everyone about new user
        handleSendObject(
          {
            type: "user",
            name: conn.metadata.name,
            status: "connected",
          },
          true
        );

        handleSendMessage(`${conn.metadata.name} has joined the lobby`, true);
      }

      handleSendObject(data);
      handleRecieveData(data);
    });

    conn.on("close", () => {
      console.log("Connection closed with", conn.peer);
      if (users.value.some((u) => u.id === conn.peer)) {
        connections.value = connections.value.filter((c) => c.peer !== conn.peer);

        // Move data to tempState for this user
        const playerToStore = players.value.find((u) => u.id === conn.peer);
        if (playerToStore) {
          tempState.set(conn.peer, playerToStore);
        }

        users.value = users.value.filter((u) => u.id !== conn.peer);
        players.value = players.value.filter((p) => p.id !== conn.peer);

        handleSendMessage(`${conn.metadata.name} has left the lobby`, true);
        handleSendObject({
          type: "user",
          id: conn.peer,
          name: conn.metadata.name,
          status: "disconnected",
        });

        showToast(`${conn.metadata.name} has left the lobby`, "error");
      }
    });
  };

  // Host keepalive ping
  useEffect(() => {
    if (!isHost.value) return;

    const interval = setInterval(() => {
      const now = Date.now();

      connections.value.forEach((conn) => {
        if (!conn.open) return;

        conn.send(0);
        const lastPing = lastPingTime.value[conn.peer] || 0;

        if (now - lastPing > 10000) {
          console.log(`Player ${conn.peer} timed out`);
          conn.close();
        }
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [connections.value, isHost.value]);

  // Client keepalive check
  useEffect(() => {
    if (isHost.value) return;

    const interval = setInterval(() => {
      const now = Date.now();

      connections.value.forEach((conn) => {
        if (!conn.open) return;

        const lastPing = lastPingTime.value[conn.peer] || 0;
        if (now - lastPing > 10000) {
          console.log(`Player ${conn.metadata.name} timed out`);
          conn.close();
        }
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [connections.value, isHost.value]);

  // Handle overall winner
  useEffect(() => {
    if (!gameState.value.overralWinner) return;
    spawnConfetti(3);
    setTimeout(() => {
      navigate("/");
      players.value = [];
    }, 3000);
  }, [gameState.value.overralWinner]);

  // Core connection functions
  const handleCreateLobby = (name: string) => {
    if (!peer) return;

    cleanUp();
    isConnected.value = true;
    isHost.value = true;
    connectedToID.value = peer.id.replace("DOD-", "");
    user.value = { id: peer.id, name, isHost: true, isReady: true };
    users.value = [...users.value, { id: peer.id, name, isHost: true, isReady: true }];
  };

  const handleConnect = (id: string, name: string) => {
    if (!peer) return;
    cleanUp();

    const conn = connectToPeer(peer, id, { name });

    user.value = { id: peer.id, name, isHost: false, isReady: false };
    connections.value = [conn];

    conn.on("open", () => {
      console.log("Connected to host");
      connectedToID.value = id.replace("DOD-", "");
      lastPingTime.value[conn.peer] = Date.now();
      handleSendObject(1);
      const check = setInterval(() => {
        if (gameState.value.round > 0) {
          let cardComplete = 0;
          (gameSettings.value.cardPacks as CardEditionsT[]).forEach((edition) => {
            getCards(edition).then((data) => {
              if (data) {
                cards.value = data;
                cardComplete++;
                console.log(
                  "Cards loaded:",
                  `${cardComplete}/${(gameSettings.value.cardPacks as CardEditionsT[]).length}`
                );
                if (cardComplete === (gameSettings.value.cardPacks as CardEditionsT[]).length) {
                  console.log("move");
                  navigate("/game");
                }
              }
            });
          });
          clearInterval(check);
        }
      }, 100);
    });

    conn.on("data", (data: any) => {
      console.log("Received from host:", data);
      if (data === 0) {
        lastPingTime.value[conn.peer] = Date.now();
        handleSendObject(0);
        return;
      }

      handleRecieveData(data);
    });

    conn.on("close", () => {
      cleanUp();
      if (!isKicked.value) {
        navigate("/");
        showToast("Connection lost with the host, attempting to reconnect...", "error");
        let attempts = 0;
        const maxAttempts = 3; // Maximum number of reconnection attempts
        const reconnecting = setInterval(() => {
          if (connections.value.length > 0) {
            clearInterval(reconnecting);
            return;
          }
          if (attempts < maxAttempts) {
            attempts++;
            console.log(`Reconnection attempt ${attempts}...`);
            handleConnect(id, name); // Attempt to reconnect
          } else {
            showToast("Failed to reconnect after multiple attempts", "error");
            navigate("/"); // Redirect to the lobby or home page
          }
        }, 1000); // Retry
      } else {
        showToast("Connection lost with the host", "error");
        navigate("/");
      }

      // attemptReconnect(id, name); // Trigger auto-reconnect
    });
  };

  const handleKick = () => {
    const conn = connections.value[0];
    if (!conn) return;
    showToast(`You've been kicked!`, "error");
    isKicked.value = true;
    conn.close();
    isKicked.value = false;
  };

  // Communication functions
  const handleSendMessage = (text: string, isSystem = false) => {
    if (!text || !user.value) return;

    const msg = formatMessage(text, user.value.name, isSystem);
    messages.value = [...messages.value, msg];

    if (connections.value.length === 0) return;

    connections.value.forEach((connection) => {
      if (connection.open) {
        connection.send({
          type: "message",
          ...msg,
        });
      }
    });
  };

  const handleSendObject = (data: any, includeHost = false, conn?: DataConnection) => {
    const exConnections = conn ? [conn] : connections.value;
    if (includeHost) {
      handleRecieveData(data);
    }

    sendToConnections(exConnections, data);
  };

  // ===== MESSAGE HANDLERS =====

  // Process incoming messages based on type
  const handleRecieveData = (data: any) => {
    console.log("Received data:", data);

    switch (data.type) {
      // ----- Chat and notification handlers -----
      case "message":
        handleMessageData(data);
        break;
      case "toast":
        handleToastData(data);
        break;
      case "user":
        handleUserStatusData(data);
        break;
      case "ready":
        handleUserReadyData(data);
        break;
      case "history":
        handleHistoryData(data);
        break;
      case "kick":
        handleKick();
        break;

      // ----- Game setup handlers -----
      case "gameSettings":
        handleGameSettingsData(data);
        break;
      case "gameHistory":
        handleGameHistoryData(data);
        break;
      case "startGame":
        handleStartGameData(data);
        break;

      // ----- Card management handlers -----
      case "cardShuffle":
        handleCardShuffleData(data);
        break;
      case "cardRemove":
        handleCardRemoveData(data);
        break;

      // ----- Game state handlers -----
      case "syncTime":
        setTimeout(() => {
          time.value = data.time - 1 <= 0 ? gameSettings.value.roundTime : data.time - 1;
        }, 1000);
        break;
      case "gameSync":
        handleGameSyncData(data);
        break;
      case "gameState":
        handleGameStateData(data);
        break;
      case "endGame":
        handleEndGameData(data);
        break;
      case "nextRound":
        handleNextRoundData(data);
        break;
      case "chooseWinner":
        handleChooseWinnerData(data);
        break;
      case "cancelGame":
        handleCancelGameData(data);
        break;
    }
  };

  // ----- Message Type Handlers -----

  // Chat message handler
  const handleMessageData = (data: any) => {
    messages.value = filterDuplicates([...messages.value, data]);
  };

  // Toast notification handler
  const handleToastData = (data: any) => {
    showToast(data.message, data.mode);
  };

  // User connection status handler
  const handleUserStatusData = (data: any) => {
    if (data.status === "disconnected") {
      showToast(`${data.name} has left the lobby`, "error");
      users.value = users.value.filter((user) => user.id !== data.id);
    } else if (data.status === "connected") {
      showToast(`${data.name} has joined the lobby`, "success");
    }
  };

  // User ready status handler
  const handleUserReadyData = (data: any) => {
    users.value = filterDuplicates([
      ...users.value,
      { id: data.id, name: data.name, isHost: false, isReady: data.isReady },
    ]);
  };

  // Game history handler
  const handleHistoryData = (data: any) => {
    messages.value = filterDuplicates([...messages.value, ...data.messages]);
    users.value = filterDuplicates([...users.value, ...data.users]);
    isConnected.value = true;
  };

  // Game settings handler
  const handleGameSettingsData = (data: any) => {
    gameSettings.value = data.settings;
  };

  // Game history handler
  const handleGameHistoryData = (data: any) => {
    gameHistory.value = data.history;
  };

  // Start game handler
  const handleStartGameData = (data: any) => {
    let cardComplete = 0;
    (gameSettings.value.cardPacks as CardEditionsT[]).forEach((edition) => {
      getCards(edition).then((data) => {
        if (data) {
          cards.value = data;
          cardComplete++;
          if (cardComplete === (gameSettings.value.cardPacks as CardEditionsT[]).length) {
            if (isHost.value) {
              const seed = Math.floor(Math.random() * 1000);
              handleSendObject(
                {
                  type: "cardShuffle",
                  seed,
                },
                true
              );
              users.value.forEach((user, i) => {
                players.value.push({
                  id: user.id,
                  name: user.name,
                  score: 0,
                  cards: giveCards(10, i * 10) as string[],
                });
              });
              gameState.value = {
                round: 1,
                czar: players.value[0].id,
                promptCard: cards.value.prompt[0].id,
                answerCards: players.value.map((p) => ({ playerID: p.id, cardID: [] })),
                isChoosing: false,
                winner: null,
                overralWinner: "",
                timestamp: Date.now(),
              };

              handleSendObject({
                type: "gameSync",
                players: players.value,
                gameState: gameState.value,
                timestamp: Date.now(),
              });
            }

            const moveViewI = setInterval(() => {
              if (players) {
                setRound(1);
                navigate("/game");
                clearInterval(moveViewI);
              }
            }, 100);
          }
        }
      });
    });
  };

  // Card shuffle handler
  const handleCardShuffleData = (data: any) => {
    cards.value.answer = shuffle(cards.value.answer, data.seed);
    cards.value.prompt = shuffle(cards.value.prompt, data.seed);
  };

  // Card remove handler
  const handleCardRemoveData = (data: any) => {
    if (data.cardType === "answer")
      cards.value.answer = cards.value.answer.filter((card) => card.id !== data.cardID);
    if (data.cardType === "prompt")
      cards.value.prompt = cards.value.prompt.filter((card) => card.id !== data.cardID);
  };

  // Game sync handler
  const handleGameSyncData = (data: any) => {
    gameState.value = data.gameState;
    players.value = data.players;
    if (data.newRound) setRound((prev) => prev + 1);
    if (data.gameState.isChoosing) isChoosing.value = data.gameState.isChoosing;
  };

  // Game state handler
  const handleGameStateData = (data: any) => {
    gameState.value = data.gameState;
    if (data.gameState.isChoosing) isChoosing.value = data.gameState.isChoosing;
    if (data.gameState.isChoosing) {
      showToast(
        "Time's up!, Czar will choose the funniest card combo in 10s",
        "success",
        10000,
        "timesup"
      );
      setTimeout(() => {
        if (isChoosing.value) {
          handleSendObject(
            {
              type: "chooseWinner",
            },
            true
          );
        }
      }, 10000);
    }
  };

  // End game handler
  const handleEndGameData = (data: any) => {
    handleSendObject({
      type: "gameState",
      gameState: {
        ...gameState.value,
        czar: data.czar,
        promptCard: data.promptCard,
        answerCards: data.answerCards,
        isChoosing: true,
      },
    });
  };

  // Choose winner handler
  const handleChooseWinnerData = (data: any) => {
    const winner = players.value.find((player) => player.id === data.playerID);
    if (winner) {
      gameState.value = {
        ...gameState.value,
        winner: {
          playerID: winner.id,
          cardID: data.cardID,
        },
      };
      players.value = players.value.map((player) => {
        if (player.id === winner.id) {
          return { ...player, score: player.score + 1 };
        }
        return player;
      });
      spawnConfetti();
      hideToast("timesup");
      hideToast("won");
      showToast(`${winner?.name} won the round!`, "success", 5000, "won");
    } else {
      if (gameState.value.czar === user.value?.id) {
        gameState.value.isChoosing = false;
      }
      hideToast("nowin");
      showToast("Time's up!, Czar thinks the cards combo not funny enough", "error", 5000, "nowin");
    }

    gameHistory.value = [...gameHistory.value, gameState.value];
    isChoosing.value = false;
    if (isHost.value) {
      setTimeout(() => {
        const playerWinner = players.value.find((p) => p.score === gameSettings.value.maxScore);
        if (playerWinner) {
          handleSendObject(
            {
              type: "gameState",
              gameState: {
                ...gameState.value,
                isChoosing: false,
                overralWinner: playerWinner.id,
              },
            },
            true
          );
        } else {
          gameState.value.answerCards.forEach((card) => {
            handleSendObject(
              {
                type: "cardRemove",
                cardType: "answer",
                cardID: card.cardID,
              },
              true
            );
          });
          handleSendObject(
            {
              type: "cardRemove",
              cardType: "prompt",
              cardID: gameState.value.promptCard,
            },
            true
          );
          handleSendObject(
            {
              type: "cardShuffle",
              seed: Math.floor(Math.random() * 1000),
            },
            true
          );

          handleSendObject(
            {
              type: "nextRound",
            },
            true
          );
        }
      }, 5000);
    }
  };

  // Next round handler
  const handleNextRoundData = (data: any) => {
    if (isHost.value) {
      players.value.forEach((player, i) => {
        const c = cards.value.prompt[gameHistory.value.length].minPick || 1;
        // const filteredCard = player.cards.filter(
        //   (cardID) => !gameState.value.answerCards.find((e) => e.cardID.includes(cardID))
        // );
        console.log(player.cards);
        player.cards = [...player.cards, ...giveCards(c, i * c)];
      });

      gameState.value = {
        round: gameHistory.value.length,
        czar: setCzar()!,
        promptCard: cards.value.prompt[gameHistory.value.length].id,
        answerCards: players.value.map((p) => ({ playerID: p.id, cardID: [] })),
        isChoosing: false,
        winner: null,
        overralWinner: "",
        timestamp: Date.now(),
      };
      handleSendObject(
        {
          type: "gameSync",
          players: players.value,
          gameState: gameState.value,
          newRound: true,
        },
        true
      );
    }
  };

  // Cancel game handler
  const handleCancelGameData = (data: any) => {
    showToast("Game cancelled", "error");
    navigate("/lobby");
    players.value = [];
  };

  // ===== CONTEXT PROVIDER =====
  return (
    <PeerContext.Provider
      value={{
        peer,
        users: users.value,
        conn: connections.value,
        user: user.value,
        round,
        time: time,
        players: players.value,
        cards: cards.value,
        messages: messages.value,
        stream: null,
        isHost: isHost.value,
        isConnected: isConnected.value,
        connectedToID: connectedToID.value,
        gameSettings: gameSettings.value,
        gameState: gameState.value,
        handleCreateLobby,
        handleConnect,
        handleSendObject,
        handleSendMessage,
      }}>
      {children}
    </PeerContext.Provider>
  );
}

export { usePeer } from "./peer/PeerContext";

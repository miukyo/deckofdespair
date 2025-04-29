import Peer, { DataConnection } from "peerjs";

export type User = {
  id: string;
  name: string;
  isHost: boolean;
  isReady: boolean;
};

export type GameSettings = {
  maxPlayers: number;
  maxScore: number;
  cardPacks: string[];
  roundTime: number;
};

export type GameState = {
  round: number;
  promptCard: string;
  answerCards: PlayedCard[];
  isChoosing: boolean;
  czar: string;
  winner: PlayedCard | null;
  timestamp: number;
  overralWinner: string;
};

export type PlayedCard = {
  playerID: string;
  cardID: string[];
};

export type Card = {
  id: string;
  text: string;
  minPick?: number;
};

export type Cards = {
  prompt: Card[];
  answer: Card[];
};

export type Message = {
  id: number;
  sender: string;
  text: string;
  isSystem?: boolean;
};

export interface Player {
  id: string;
  name: string;
  score: number;
  cards: string[];
}

export type PeerContextType = {
  peer: Peer | null;
  users: User[];
  user: User | null;
  players: Player[];
  cards: Cards;
  messages: Message[];
  stream: MediaStream | null;
  isHost: boolean;
  isConnected: boolean;
  connectedToID: string | null;
  gameSettings: GameSettings;
  gameState: GameState | null;
  round: number;
  handleConnect: (id: string, name: string) => void;
  handleSendMessage: (text: string, isSystem?: boolean) => void;
  handleSendObject: (data: any, includeHost?: boolean, conn?: DataConnection) => void;
  handleCreateLobby: (name: string) => void;
  handleKick: (id: string) => void;
};

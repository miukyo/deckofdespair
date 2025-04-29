import Peer, { DataConnection } from "peerjs";
import { generateLobbyCode } from "./utils";
import { Message } from "./types";

/**
 * Create a new peer instance with STUN/TURN servers
 */
export const createPeer = (prefix: string = "DOD-") => {
  const lobbyCode = `${prefix}${generateLobbyCode()}`;

  return new Peer(lobbyCode, {
    config: {
      iceServers: [
        { urls: ["stun:stun.cloudflare.com:3478", "stun:stun.cloudflare.com:53"] },
        {
          urls: [
            "turn:turn.cloudflare.com:3478?transport=udp",
            "turn:turn.cloudflare.com:3478?transport=tcp",
            "turns:turn.cloudflare.com:5349?transport=tcp",
            "turn:turn.cloudflare.com:53?transport=udp",
            "turn:turn.cloudflare.com:80?transport=tcp",
            "turns:turn.cloudflare.com:443?transport=tcp",
          ],
          username: import.meta.env.VITE_TURN_USERNAME,
          credential: import.meta.env.VITE_TURN_CREDENTIAL,
        },
      ],
    },
    debug: 0,
  });
};

/**
 * Send a message to multiple connections
 */
export const sendToConnections = (
  connections: DataConnection[],
  data: any,
  onlyOpen: boolean = true
) => {
  connections.forEach((connection) => {
    if (!onlyOpen || connection.open) {
      connection.send(data);
    }
  });
};

/**
 * Format a chat message
 */
export const formatMessage = (
  text: string,
  senderName: string,
  isSystem: boolean = false
): Message => {
  return {
    id: Date.now(),
    sender: senderName,
    text,
    isSystem,
  };
};

/**
 * Connect to a peer
 */
export const connectToPeer = (peer: Peer, id: string, metadata: any = {}): DataConnection => {
  const formattedId = id.startsWith("DOD-") ? id : `DOD-${id}`;
  return peer.connect(formattedId, { metadata });
};

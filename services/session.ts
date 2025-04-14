// 维护在线用户的websocket

import {SafeUser} from "@/db/user.ts";

export class SocketService {
  public connections = new Map<string, { socket: WebSocket; user: SafeUser; }
  >();

  getOnlineUsers() {
    return this.connections.values().map((v) => v.user);
  }

  addConnection(user: SafeUser, socket: WebSocket) {
    this.connections.set(user.id, {socket, user});
  }

  sendToUser<T,
  >(userId: string, message: T) {
    const value = this.connections.get(userId);
    if (!value) {
      return false;
    }
    value.socket.send(JSON.stringify(message));
  }

  messageHandle() {
  }
}

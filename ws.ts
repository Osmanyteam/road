import { serve, Server } from "https://deno.land/std/http/server.ts";
import {
  acceptWebSocket,
  isWebSocketCloseEvent,
  isWebSocketPingEvent,
  WebSocketEvent,
  WebSocket,
} from "https://deno.land/std/ws/mod.ts";

export class WS {
  private port = 3001;
  private serve: Server;

  constructor(port: number) {
    this.port = port;
    this.serve = serve({ port: this.port });
  }

  public onEvent = (ev: WebSocketEvent, socket: WebSocket) => {
  };

  public async __connect(socket: WebSocket, params?: any): Promise<Boolean> {
    return true;
  }

  private async onConnect(socket: WebSocket, params?: any) {
    const acceptConnection = await this.__connect(socket, params);
    if (acceptConnection === false) {
      await socket.close(505, "not allowed");
    }
  }

  public async *onConnection(): AsyncIterableIterator<
    { socket: WebSocket; params?: any, eventEmitter: AsyncIterableIterator<{ event: WebSocketEvent; socket: WebSocket }> }
  > {
    for await (const req of this.serve) {
      const { conn, r: bufReader, w: bufWriter, headers } = req;
      const sock = await acceptWebSocket({
        conn,
        bufReader,
        bufWriter,
        headers,
      });
      try {
        // if include ?, contains parameters
        if (req.url.includes("?") === true) {
          const searchParams = req.url.split("?")[1];
          const entries = new URLSearchParams(searchParams);
          let result: any = {};
          for (let entry of entries) { // each 'entry' is a [key, value] tupple
            const [key, value] = entry;
            result[key] = value;
          }
          yield { socket: sock, params: result, eventEmitter: this.event(sock) };
        } else {
          yield { socket: sock, eventEmitter: this.event(sock) };
        }
      } catch (err) {
        console.error(`failed to accept websocket: ${err}`);
        await req.respond({ status: 400 });
      }
    }
  }

  private async *event(
    sock: WebSocket,
  ): AsyncIterableIterator<{ event: WebSocketEvent; socket: WebSocket }> {
    try {
      for await (const ev of sock) {
        yield { event: ev, socket: sock };
      }
    } catch (err) {
      console.error(`failed to receive frame: ${err}`);
      if (!sock.isClosed) {
        await sock.close(1000).catch(console.error);
      }
    }
  }
}

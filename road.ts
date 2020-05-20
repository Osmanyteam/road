import { WS } from "./ws.ts";
import {
  acceptWebSocket,
  isWebSocketCloseEvent,
  isWebSocketPingEvent,
  WebSocketEvent,
  WebSocket,
} from "https://deno.land/std/ws/mod.ts";
import {
  isJson,
  createResponse,
} from "./utils.ts";
import { State } from "./state.ts";
import { instanceOfQueryFormat, QueryFormat } from "./query.ts";

type ConnectionTypeRequest = { socket: WebSocket; params?: any };

export class Road implements AsyncIterable<ConnectionTypeRequest> {
  private ws: WS;
  private state: State;
  private models: any[];

  constructor(portWS: number, portHTTP: number, state: State, models: any[]) {
    this.ws = new WS(portWS);
    this.state = state;
    this.models = models;
  }

  public async *initializeEvents(): AsyncIterableIterator<
    ConnectionTypeRequest
  > {
    // for get event send in sockets
    for await (
      const { eventEmitter, socket, params } of this.ws.onConnection()
    ) {
      yield { socket, params };

      for await (const { event } of eventEmitter) {
        if (typeof event === "string") {
          // text message
          console.log("ws:Text", event);
          const json = isJson(event);
          if (json === false) {
            const response = createResponse({
              status: "failed",
              message: "can only send json or binary array",
            });
            await socket.send(response);
          }
          this.validQueryFormat(json, socket);
        } else if (event instanceof Uint8Array) {
          // binary message
          console.log("ws:Binary", event);
          const data = this.arrayBinaryToJson(event);
          console.log(data);
          await socket.send(event);
        } else if (isWebSocketPingEvent(event)) {
          const [, body] = event;
          // ping
          console.log("ws:Ping", body);
        } else if (isWebSocketCloseEvent(event)) {
          // close
          const { code, reason } = event;
          console.log("ws:Close", code, reason);
        }
      }
    }
  }

  /**.
   *
   * @remarks
   * Convert binary array to json
   *
   * @param binArray - Binary Array
   * @returns json
   *
   */
  public arrayBinaryToJson(binArray: Uint8Array) {
    var str = "";
    for (var i = 0; i < binArray.length; i++) {
      str += String.fromCharCode(binArray[i]);
    }
    return JSON.parse(str);
  }

  /**.
   *
   * @remarks
   * Convert binary array to json
   *
   * @param binArray - Binary Array
   * @returns json
   *
   */
  private async validQueryFormat(json: any, socket: WebSocket) {
    if (!instanceOfQueryFormat(json)) {
      const response = createResponse({
        status: "failed",
        message: "the data has no query format",
      });
      await socket.send(response);
    }
    this.findAndExecuteQuery(json, socket);
  }

  private async findAndExecuteQuery(query: QueryFormat, socket: WebSocket) {
    for (const model of this.models) {
      if (
        typeof new model()[query.query] === "function" &&
        model.prototype.__name === query.modelName
      ) {
        const m = new model();
        const data = await m.say.apply(m, query.parameters);
        const response = createResponse({
          status: "success",
          data: data,
          queryId: query.queryId,
        });
        await socket.send(response);
      }
    }
  }

  [Symbol.asyncIterator](): AsyncIterator<ConnectionTypeRequest> {
    return this.initializeEvents();
  }
}

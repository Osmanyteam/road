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
import { instanceOfMessageFormat, MessageFormat } from "./message.ts";

export interface RoadParams {
  portWS: number;
  portHTTP: number;
  state: State;
  models: any[]
}

type ConnectionTypeRequest = { socket: WebSocket; params?: any };

export class Road implements AsyncIterable<ConnectionTypeRequest> {
  private ws: WS;
  private state: State;
  private models: any[];

  constructor(params: RoadParams) {
    this.ws = new WS(params.portWS);
    this.state = params.state;
    this.models = params.models;
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
          this.validMessageFormat(json, socket);
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
  private async validMessageFormat(json: any, socket: WebSocket) {
    if (!instanceOfMessageFormat(json)) {
      const response = createResponse({
        status: "failed",
        message: "the data has no query format",
      });
      await socket.send(response);
    }
    this.findAndExecuteMessage(json, socket);
  }

  private async findAndExecuteMessage(message: MessageFormat, socket: WebSocket) {
    for (const model of this.models) {
      if (
        typeof new model()[message.messageName] === "function" &&
        model.prototype.__name === message.modelName
      ) {
        const m = new model();
        const data = await m.say.apply(m, message.parameters);
        const response = createResponse({
          status: "success",
          data: data,
          messageId: message.messageId,
        });
        await socket.send(response);
      }
    }
  }

  [Symbol.asyncIterator](): AsyncIterator<ConnectionTypeRequest> {
    return this.initializeEvents();
  }
}

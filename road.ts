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
import { getVersionStableLast } from './version.ts';

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
          // for default array is accept
          // so is better that always like array
          if (Object.prototype.toString.call(json) !== '[object Array]') {
            this.validMessageFormatAndExecute([json], socket);
          } else {
            this.validMessageFormatAndExecute(json, socket);
          }
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
  private async validMessageFormatAndExecute(json: any[], socket: WebSocket) {
    const responses: string[] = [];
    for (const js of json) {
      // if no has version, to assign automatic
      if (!js['version']) {
        js['version'] = getVersionStableLast();
      }
      if (!instanceOfMessageFormat(js)) {
        const response = createResponse({
          status: "failed",
          message: "the data has no message format",
        });
        responses.push(response);
      } else {
        const response = await this.findAndExecuteMessage(js, socket);
        responses.push(response);
      }
    }
    const rs = responses.length === 1 ? responses[0] : JSON.stringify(responses);
    await socket.send(rs);
  }

  private async findAndExecuteMessage(message: MessageFormat, socket: WebSocket): Promise<string> {
    for (const model of this.models) {
      if (
        typeof new model()[message.messageName] === "function" &&
        model.prototype.__name === message.modelName
      ) {
        // this verify the roles have access for to execute the method
        const m = new model();
        const data = await m[message.messageName].apply(m, message.parameters);
        return createResponse({
          status: "success",
          data: data,
          messageId: message.messageId,
        });
      }
    }

    return createResponse({
      status: 'failed',
      message: 'model or method not found'
    });
  }

  [Symbol.asyncIterator](): AsyncIterator<ConnectionTypeRequest> {
    return this.initializeEvents();
  }
}

import { Road } from "../mod.ts";
import { StateApp } from './state.ts';
import { User } from './models/user.ts';
import { WebSocket } from "https://deno.land/std/ws/mod.ts";

const app = new Road({
  portWS: 3000,
  portHTTP: 3001,
  state: new StateApp(),
  models: [User]
});

async function allowConnection(socket: WebSocket, params?: any) {
  if (!params) {
    await socket.close(401, "not allowed without credentials");
  }
  if (params["name"] !== "osmany") {
    await socket.close(401, "invalid credentials");
  }
}

for await (const { socket, params } of app) {
  await allowConnection(socket, params);
}

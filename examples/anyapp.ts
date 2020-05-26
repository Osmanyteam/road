import { Road } from "../road.ts";
import { State } from "../state.ts";
import { Model } from "../model.ts";
import { definition } from "../definition.ts";
import { Connection } from "../connection.ts";
import { Message } from "../message.ts";

// create state for app
class StateApp extends State {
  wtkey: string;
  constructor(wtkey: string) {
    super();
    this.wtkey = wtkey;
  }
}
const state = new StateApp("1234");
state.setState({
  id: "oneless",
  wtkey: "1234",
});

// set model
@Model({
  connection: new Connection(),
  description: "user for app",
  name: "user",
})
class User {
  @definition({
    name: "id",
    alias: "id_states",
    description: "id for get states in app",
  })
  id: string = "";
  @definition({
    name: "id",
    alias: "name_user",
    description: "id for get states in app",
  })
  name: string = "";

  @Message({
    messageName: "say hi to",
    onlyAccess: [],
  })
  say(text: string) {
    console.log("say " + text);
    return true;
  }
}

const app = new Road({
  portWS: 3000,
  portHTTP: 3001,
  state: state,
  models: [User]
});

for await (const { socket, params } of app) {
  if (!params) {
    await socket.close(401, "not allowed without credentials");
    continue;
  }
  if (params["name"] !== "osmany") {
    await socket.close(401, "invalid credentials");
    continue;
  }
}

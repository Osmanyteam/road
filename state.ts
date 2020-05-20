import { Model } from "./model.ts";
import { definition } from "./definition.ts";
import { Connection } from "./connection.ts";


@Model({
  connection: new Connection(),
  description: "state for app",
  name: "__state",
})
export class State {
  @definition({
    name: "id",
    alias: "id_states",
    description: "id for get states in app",
  })
    id: string = "";

  constructor() {
  }

  public async setState(state: Partial<this>): Promise<boolean> {
    return true;
  }

  public async destroyState(state: Partial<this>): Promise<boolean> {
    return true;
  }
}

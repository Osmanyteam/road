import { Model } from "../../mod.ts";
import { Definition } from "../../mod.ts";
import { Connection } from "../../mod.ts";
import { Message } from "../../mod.ts";

// set model
@Model({
    connection: new Connection(),
    description: "user for app",
    name: "user",
})
export class User {
    @Definition({
        name: "id",
        alias: "id_states",
        description: "id for get states in app",
    })
    id: string = "";
    @Definition({
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
        return 'say ' + text;
    }

    @Message({
        messageName: 'get date of the server',
        onlyAccess: []
    })
    getDate() {
        return new Date().getTime();
    }
}
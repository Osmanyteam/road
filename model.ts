import { Connection } from "./connection.ts";

const nameReg = /^[_]{0,2}([a-z]{3,}[0-9]{0,6})/;

export type definitionModel = {
  connection: Connection;
  name: string;
  description: string;
};
export function Model(definition: definitionModel) {
  if (definition.name.match(nameReg) === null) {
    throw new Error(
      "the name model has to be in lowercase can have numbers at the end and maximum two dashes at the beginning.",
    );
  }
  return function (constructor: Function) {
    constructor.prototype.__name = definition.name;
    constructor.prototype.__description = definition.description;
    // console.log(constructor.prototype);
  };
}

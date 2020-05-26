import { State } from "./state.ts";

function isObject(obj: any) {
  return Object.prototype.toString.call(obj) === "[object Object]";
}

function validParam(param: any): boolean {
  // when param is object
  if (isObject(param) === true) {
    let valid = true;
    const keys = Object.keys(param);
    for (const propName of keys) {
      if (
        typeof param[propName] !== "string" &&
        typeof param[propName] !== "number" &&
        typeof param[propName] !== "boolean"
      ) {
        valid = false;
      }

      if (isObject(param[propName]) === true) {
        valid = validParam(param[propName]);
      }
    }

    return valid;
  }

  // when param is not object
  if (
    typeof param !== "string" &&
    typeof param !== "number" &&
    typeof param !== "boolean"
  ) {
    return false;
  }

  return true;
}

export interface MessageFormat {
  state: State;
  modelName: string;
  messageName: string;
  messageId: number;
  parameters?: any[];
  dateTime: Date;
  version: string;
}

export function instanceOfMessageFormat(object: any): object is MessageFormat {
  const props = [
    { name: "modelName", type: String() },
    { name: "state", type: Object() },
    { name: "messageName", type: String() },
    { name: "dateTime", type: String() },
    { name: "MessageId", type: Number() },
    { name: "version", type: String() },
  ];
  let valid = true;
  for (const prop of props) {
    if (
      prop.name in object && typeof object[prop.name] === typeof prop.type
    ) {
      continue;
    }
    valid = false;
  }

  // valid parameters
  if ("parameters" in object) {
    if (
      Object.prototype.toString.call(object.parameters) !== "[object Array]"
    ) {
      valid = false;
    } else {
      // check values in parameters only allowed string, number, boolean, json
      for(const value of object.parameters){
        if(validParam(value) === false){
          valid = false;
          break;
        }
      }
    }
  }
  
  return valid;
}

export function hash(str: string) {
  var i = str.length;
  var hash1 = 5381;
  var hash2 = 52711;

  while (i--) {
    const char = str.charCodeAt(i);
    hash1 = (hash1 * 33) ^ char;
    hash2 = (hash2 * 33) ^ char;
  }

  return (hash1 >>> 0) * 4096 + (hash2 >>> 0);
}

export function Message(definition: {
  messageName: string;
  onlyAccess: any[];
}) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    // target["__Message__" + definition.MessageName] = target[propertyKey];
    // target[propertyKey] = null;
    descriptor.configurable = false;
    console.log("Message", target, propertyKey, descriptor.value);
    console.log(Reflect.get(target, propertyKey).toString());
  };
}

import { State } from "./state.ts";

export interface QueryFormat {
  state: State;
  modelName: string;
  query: string;
  queryId: number;
  parameters?: any[];
  dateTime: Date;
}

export function instanceOfQueryFormat(object: any): object is QueryFormat {
  const props = [
    { name: "modelName", type: "" },
    { name: "state", type: {} },
    { name: "query", type: "" },
    { name: "dateTime", type: "" },
    { name: "queryId", type: 0 },
  ];
  let valid = true;
  for (const prop of props) {
    // console.log(
    //   prop.name in object,
    //   typeof object[prop.name],
    //   typeof prop.type,
    //   prop.name in object && typeof object[prop.name] === typeof prop.type,
    // );
    if (
      prop.name in object && typeof object[prop.name] === typeof prop.type
    ) {
      continue;
    }
    valid = false;
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

export function Query(definition: {
  queryName: string;
  onlyAccess: any[];
}) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    // target["__query__" + definition.queryName] = target[propertyKey];
    // target[propertyKey] = null;
    descriptor.configurable = false;
    console.log("query", target, propertyKey, descriptor);
  };
}

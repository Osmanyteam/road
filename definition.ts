export type DefinitionProperty = {
  name: string;
  alias?: string;
  description: string;
  onlyAccess?: any[];
};

export function definition(def: DefinitionProperty) {
  return function (target: any, property: any) {
      // console.log(target, property);
  };
}

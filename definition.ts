export type DefinitionProperty = {
  name: string;
  alias?: string;
  description: string;
  onlyAccess?: any[];
};

export function Definition(def: DefinitionProperty) {
  return function (target: any, property: any) {
      // console.log(target, property);
  };
}

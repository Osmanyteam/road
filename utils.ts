export function isJson(str: string) {
    let json:any;
  try {
    json = JSON.parse(str);
  } catch (e) {
    return false;
  }
  return json;
}

export type ResponseType = {
    status: "pending" | "success" | "failed";
    message?: string;
    data?:any;
    messageId?:number;
  };

export function createResponse(data:ResponseType){
    return JSON.stringify(data);
}
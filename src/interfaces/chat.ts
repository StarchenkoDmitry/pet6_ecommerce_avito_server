import { Message } from "@prisma/client";

export const CHAT_DELETE_MESSAGE = "chat_delete_message";
export const CHAT_ADD_MESSAGE = "chat_add_message";

export type CreateMessage = { text:string; }
export type DeleteMessage = { id:string; }


export const EVENT_CLIENT_MESSAGE = "client_message";
export type ClientMessage = 
| { type:typeof CHAT_ADD_MESSAGE,  data:CreateMessage; }
| { type:typeof CHAT_DELETE_MESSAGE,  data:DeleteMessage; }




export const CHAT_INIT_ERROR= "chat_init_error";
export const CHAT_INIT = "chat_init";
export const CHAT_DELETED_MESSAGE = "chat_deleted_message";
export const CHAT_ADDED_MESSAGE = "chat_added_message";

export type ChatInitError = { error:string; }
export type ChatInit = { messages:Message[] }
export type DeletedMessage = { id:string; }
export type CreatedMessage = { message:Message; }


export const EVENT_SERVER_MESSAGE = "server_message";
export type ServerMessage = 
| { type:typeof CHAT_INIT_ERROR,  data:ChatInitError; }
| { type:typeof CHAT_INIT,  data:ChatInit; }
| { type:typeof CHAT_DELETED_MESSAGE,  data:DeletedMessage; }
| { type:typeof CHAT_ADDED_MESSAGE,  data:CreatedMessage; }

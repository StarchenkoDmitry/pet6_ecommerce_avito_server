import { Message } from "@prisma/client";


export const CHAT_EVENT_ADDED_MESSAGE = "chat_event_added_message";
export const CHAT_EVENT_DELETED_MESSAGE = "chat_event_deleted_message";

export type CreatedMessage = { message:Message; }
export type DeletedMessage = { id:string; }


export type ChatEvent = 
| { type:typeof CHAT_EVENT_ADDED_MESSAGE,  data:CreatedMessage; }
| { type:typeof CHAT_EVENT_DELETED_MESSAGE,  data:DeletedMessage; }

export type ChatEventCallback = (event:ChatEvent)=>void
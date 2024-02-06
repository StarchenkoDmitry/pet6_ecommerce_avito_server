import { Chat, Message } from "@prisma/client";
import { db } from ".";


export async function findChatByIdAndUserId(chatId:string,userId:string)
:Promise<Chat | null>{
    try {
        const chat = await db.chat.findFirst({
            where:{
                id:chatId,
                chatUsers:{
                    some:{
                        userId:userId
                    }
                }
            }
        });
        return chat;
    } catch (error) {
        console.log("findChatByIdAndUserId error:",error);
        return null;
    }
}


export async function createMessage(chatId:string,userId:string,text:string)
:Promise<Message | null>{
    try {
        const message = await db.$transaction(async(ts)=>{
            const chat = await ts.chat.findFirst({
                where:{
                    id:chatId,
                    chatUsers:{
                        some:{
                            userId:userId
                        }
                    }
                }
            });
            
            if(!chat)return null;

            const message = await ts.message.create({
                data:{
                    text:text,
                    userId:userId,
                    chatId:chatId,
                }
            });
            return message;
        });
        return message;
    } catch (error) {
        console.log("createMessage error:",error);
        return null;
    }
}

export async function deleteMessage(chatId:string,userId:string,messageId:string)
:Promise<boolean>{
    try {
        const deleted = await db.$transaction(async(ts)=>{
            const chat = await ts.chat.findFirst({
                where:{
                    id:chatId,
                    chatUsers:{
                        some:{
                            userId:userId
                        }
                    }
                }
            });
            
            if(!chat)return false;

            const message = await ts.message.delete({
                where:{
                    id:messageId,
                    chatId:chatId,
                    userId:userId,
                }
            });
            return !!message;
        });
        return deleted;
    } catch (error) {
        console.log("deleteMessage error:",error);
        return false;
    }
}

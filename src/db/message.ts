import { Message } from "@prisma/client";
import { db } from ".";
import { CHAT_COUNT_TAKE_MESSAGES } from "../constants";

export async function getMessagesByChatId(
    chatId:string,
    takeLast:number = CHAT_COUNT_TAKE_MESSAGES
):Promise<Message[] | null> {
    try {
        const messages = await db.message.findMany({
            where:{
                chatId:chatId
            },
            orderBy:{
                ceatedAt:"desc"
            },
            take:takeLast
        });
        return messages;
    } catch (error) {
        console.log("findUserByToken error:",error);
        return null;
    }
}

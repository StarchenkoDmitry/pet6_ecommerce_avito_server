import { Server, Socket } from "socket.io";
import MyEmiter from "./src/utils/MyEmiter";

import { IsChatId } from "./src/utils/chack";

import { 
    CHAT_ADDED_MESSAGE,
    CHAT_ADD_MESSAGE,
    CHAT_DELETED_MESSAGE,
    CHAT_DELETE_MESSAGE,
    CHAT_INIT, 
    CHAT_INIT_ERROR, 
    ClientMessage, 
    EVENT_CLIENT_MESSAGE, 
    EVENT_SERVER_MESSAGE, 
    ServerMessage 
} from "./src/interfaces/chat";
import { 
    CHAT_EVENT_ADDED_MESSAGE, 
    CHAT_EVENT_DELETED_MESSAGE, 
    ChatEventCallback 
} from "./src/interfaces/chatevent";
import { findUserByToken } from "./src/db/user";
import { 
    createMessage, 
    deleteMessage, 
    findChatByIdAndUserId 
} from "./src/db/chat";
import { getMessagesByChatId } from "./src/db/message";


type Client = {
    socket:Socket;

    chatId:string;
    userId:string;  

    chatSub?:()=>void;
}

const chats = new MyEmiter<ChatEventCallback>();


const io = new Server(3005,{
    cors:{ origin:"*", }
});


io.on("connection",Connect);


async function Connect(socket:Socket){
    try {
        const query = socket.handshake.query;
        const token: string = socket.handshake.auth.token;
        console.log("Connect token",token);

        const chatId = query.chatId as string;

        //validation chatId
        if(!IsChatId(chatId)){
            const mes: ServerMessage = {
                type:CHAT_INIT_ERROR,
                data:{ error:"invalid chatId" }
            } 
            socket.emit(EVENT_SERVER_MESSAGE,mes);
            socket.disconnect();
            return;
        }

        const user = await findUserByToken(token);

        if(!user){
            const mes: ServerMessage = {
                type:CHAT_INIT_ERROR,
                data:{ error:"unauthorized" }
            } 
            socket.emit(EVENT_SERVER_MESSAGE,mes);
            socket.disconnect();
            return;
        }

        const userId = user.id;

        const chat = await findChatByIdAndUserId(chatId,userId);

        if(!chat){
            const mes: ServerMessage = {
                type:CHAT_INIT_ERROR,
                data:{ error:"hat is not exist"}
            } 
            socket.emit(EVENT_SERVER_MESSAGE,mes);
            socket.disconnect();
            return;
        }
        
        const messages = await getMessagesByChatId(chatId);

        if(!messages){
            console.log("Connect error: messages is not exist");
            socket.disconnect();
            return;
        }

        const mes: ServerMessage = {
            type:CHAT_INIT,
            data:{messages}
        }
        socket.emit(EVENT_SERVER_MESSAGE,mes);


        const release = chats.sub(chatId,(event)=>{
            switch(event.type){
                case CHAT_EVENT_ADDED_MESSAGE:{
                    const data: ServerMessage = {
                        type:CHAT_ADDED_MESSAGE,
                        data:{ message: event.data.message }
                    }
                    socket.emit(EVENT_SERVER_MESSAGE,data);
                    break;
                }
                case CHAT_EVENT_DELETED_MESSAGE:{
                    const data: ServerMessage = {
                        type: CHAT_DELETED_MESSAGE,
                        data:{ id: event.data.id }
                    }
                    socket.emit(EVENT_SERVER_MESSAGE,data);
                    break;
                }
            }
        });


        const client: Client = {
            socket,
            chatId,
            userId,
            chatSub:release,
        };

        socket.on(EVENT_CLIENT_MESSAGE,(message)=>handlerClient(client,message));

        socket.on("disconnect",()=>{
            console.log("User disconnect: ",client.userId)
            if(client.chatSub){
                client.chatSub();
            }
        });
    } catch (error) {
        console.log("Connect error:",error);
        socket.disconnect();
    }
}

async function handlerClient(client:Client,message:ClientMessage){
    console.log("handlerClient message: ",message);
    try {
        switch(message.type){
            case CHAT_ADD_MESSAGE:{
                const newMessage = await createMessage(client.chatId,client.userId,message.data.text);
                if(!newMessage)return;

                chats.emit(client.chatId,{
                    type:CHAT_EVENT_ADDED_MESSAGE,
                    data:{message:newMessage}
                });
                break;
            }
            case CHAT_DELETE_MESSAGE:{
                const deleted = await deleteMessage(client.chatId,client.userId,message.data.id);
                if(!deleted)return;
                chats.emit(client.chatId,{
                    type:CHAT_EVENT_DELETED_MESSAGE,
                    data:{ id: message.data.id }
                });
                break;
            }
        }
    } catch (error) {
        console.log("handlerClient error:",error);
        client.socket.disconnect();
    }
}

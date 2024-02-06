import { User } from "@prisma/client";
import { db } from ".";


export async function findUserByToken(token:string)
:Promise<User | null> {
    try {
        const user = await db.user.findFirst({
            where:{
                accessTokens:{
                    some:{
                        token
                    }
                }
            }
        });
        return user;
    } catch (error) {
        console.log("findUserByToken error:",error);
        return null;
    }
}

/* eslint-disable @typescript-eslint/no-unused-vars */
import {db} from './dbConfig'
import { Users } from './schema'
import { eq, sql, and, desc } from 'drizzle-orm'

export async function createUser(email:string, name: string) {
    try {
        const [user] = await db.insert(Users).values({email,name}).returning().execute();
        return user;
    } catch (error) {
        console.log('Error creating the user', error);
        return null
    }
}
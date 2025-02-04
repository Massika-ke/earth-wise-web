/* eslint-disable @typescript-eslint/no-unused-vars */
import { Console } from 'console';
import {db} from './dbConfig'
import { Notifications, Transactions, Users } from './schema'
import { eq, sql, and, desc } from 'drizzle-orm'

export async function createUser(email:string, name: string) {
    try {
        const [user] = await db.insert(Users).values({email,name}).returning().execute();
        return user;
    } catch (error) {
        console.error('Error creating the user', error);
        return null
    }
}

export async function getUserByEmail(email:string) {
    try {
        const [user] = await db.select().from(Users).where(eq(Users.email, email)).execute();
        return user;
    } catch (error) {
        console.error('Error fetching user by email', error)
        return null;
    }
}

export async function getUnreadNotifications(userId:number) {
     try {
        return await db.select().from(Notifications).where(and(eq(Notifications.userId, userId), eq(Notifications.isRead, false))).execute();
     } catch (error) {
        console.error('Error fetching unread notifications', error)
        return null;
     }
}

// fetch transactions for userId
export async function getUserBalance(userId:number): Promise<number> {
    const transactions = await getRewardTransactions(userId) || [];

    if (!transactions) return 0;
    const balance = transactions.reduce((acc:number, transaction:any)=>{
        return transaction.type.startsWith('earned') ? acc + transaction.amount 
        : acc - transaction.amount
    },0)

    // ensure non-negative balance
    return Math.max(balance, 0)
}

export async function getRewardTransactions(userId:number) {
    try {
        const transactions = await db.select({
            id: Transactions.id,
            type: Transactions.type,
            amount: Transactions.amount,
            description: Transactions.description,
            date: Transactions.date
        }).from(Transactions).where(eq(Transactions.userId, userId)).orderBy(desc(Transactions.date)).limit(10).execute()

        const formattedTransactions = transactions.map(t=> ({
            ...t,
            date: t.date.toISOString().split('T')[0] //YYYY-MM-DD
        }))
        return formattedTransactions
        
    } catch (error) {
        console.error('Error fetching reward transactions', error)
        return null
        
    }
} 
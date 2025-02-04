'use client'

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "./ui/button"
import {Menu, Coins, Leaf, Search, Bell, User, ChevronDown, LogIn, LogOut, Import} from 'lucide-react'

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"

import { Badge } from "./ui/badge"
import { Web3Auth } from "@web3auth/modal"

import { CHAIN_NAMESPACES, IProvider, WEB3AUTH_NETWORK } from "@web3auth/base"
import {EthereumPrivateKeyProvider} from '@web3auth/ethereum-provider'
import { getUnreadNotifications, getUserByEmail } from "@/utils/db/actions"

const clientId = process.env.WEB3_AUTH_CLIENT_ID

const chainConfig{
    chainNamespace: CHAIN_NAMESPACES.EIP155,
    chainId: '0xaa36a7',
    rpcTarget: 'https://rpc.ankr.com/eth_sepolia',
    displayName: 'Sepolia Testnet',
    blockExplorerUrl: 'https://sepolia.etherscan.io',
    ticker: 'ETH',
    tickectName: 'Ethereum',
    logo: 'https://assests.web3auth.io/evm-chains/sepolia.png'
}

const privateKeyProvider = new EthereumPrivateKeyProvider({
    config: chainConfig
})

const web3Auth = new Web3Auth({
    web3AuthNetwork:WEB3AUTH_NETWORK.TESTNET,
    privateKeyProvider
})

interface HeaderProps{
    onMenuClick: () => void;
    totalEarnings: number;
}

export default function Header({ onMenuClick, totalEarnings}: HeaderProps){

    const [provider, setProvider] = useState<IProvider | null>(null)
    const [loggedIn, setLoggedIn] = useState(false)
    const [loading, setLoading] = useState(true)
    const [userInfo, setUserInfo] = useState<any>(null)
    const pathname = usePathname()
    const [notification, setNotification] = useState<Notification[]>([])

    // initialize web3Auth & create a user
    useEffect(()=>{
        const init = async ()=>{
            try {
                await web3Auth.initModal();
                setProvider(web3Auth.provider)
    
                if (web3Auth.connected) {
                    setLoggedIn(true)
                    const user = await web3Auth.getUserInfo();
                    setUserInfo(user)
    
                    if (user.email) {
                        localStorage.setItem('userEmail', user.email)
    
                        try {
                            await createUser(user,ElementInternals, user.name || 'Anonymous user')
                        } catch (error) {
                            console.log('Error creating the user', error);
                        }
                    }
                }
            } catch (error) {
                console.log('Error initializing web3auth', error);
            } finally{
                setLoading(false)
            }
        }
        init()
    }, [])

    // fetch notifications from db
    useEffect(()=>{
        const fetchNotifications = async()=>{
            if(userInfo && userInfo.email){
                const user = await getUserByEmail(userInfo.email)
                if (user) {
                    const unreadNotifications = await getUnreadNotifications(user.id);
                    setNotification(unreadNotifications)
                }
            }
        }
        fetchNotifications();

        const notificationInterval = setInterval(fetchNotifications, 3000)
        return ()=> clearInterval(notificationInterval)
    })
}
'use client'

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "./ui/button"
import {Menu, Coins, Leaf, Search, Bell, User, ChevronDown, LogIn, LogOut, Import, Ghost} from 'lucide-react'

import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger 
} from "./ui/dropdown-menu"

import { Badge } from "./ui/badge"
import { Web3Auth } from "@web3auth/modal"

import { CHAIN_NAMESPACES, IProvider, WEB3AUTH_NETWORK } from "@web3auth/base"
import {EthereumPrivateKeyProvider} from '@web3auth/ethereum-provider'
import { 
    createUser, 
    getUnreadNotifications, 
    getUserBalance, 
    getUserByEmail, 
    markNotificationAsRead 
} from "@/utils/db/actions"
import { useMediaQuery } from "@/hooks/useMediaQuery"

const clientId = process.env.WEB3_AUTH_CLIENT_ID

const chainConfig = {
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
    config: {chainConfig},
})

const web3Auth = new Web3Auth({
    clientId,
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
    const [balance, setBalance] = useState(0)
    const isMobile = useMediaQuery("(max-width: 768px)");

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

    useEffect(()=>{
        const fetchUserBalance = async ()=>{
            if (userInfo && userInfo.email) {
                const user = await getUserByEmail(userInfo.email);
                if (user) {
                    const userBalance = getUserBalance(user.id)
                    setBalance(userBalance)
                }
            }
        }
        fetchUserBalance()

        const handleBalanceUpdate = (event: CustomEvent) =>{
            setBalance(event.detail)
        }

        window.addEventListener('balanceUpdate', handleBalanceUpdate as EventListener )

        return ()=>{
            window.removeEventListener('balanceUpdate', handleBalanceUpdate as EventListener )
        }
    }, [userInfo])

    const login = async ()=>{
        if (!web3Auth) {
            console.error('web3Auth not initialized')
            return;
        }
        try {
            const web3authProvider = await web3Auth.connect();
            setProvider(web3authProvider)
            setLoggedIn(true)
            const user = await web3Auth.getUserInfo();
            setUserInfo(user)
            if (user.email) {
                localStorage.setItem('userEmail', user.email)
                try {
                    await createUser(user.email, user.name || 'Anonymous User')
                } catch (error) {
                    console.error('Error creating user', error)
                }
            }
        } catch (error) {
            console.error('Error Logging In', error)
        }
    }

    const logout = async ()=>{
        if (!web3Auth) {
            console.log('web3Auth not initialized')
            return;
        }
        try {
            await web3Auth.logout();
            setProvider(null);
            setLoggedIn(false)
            setUserInfo(null);
            localStorage.removeItem("userEmail")
        } catch (error) {
            console.error("Error logging out", error)
        }
    }

    const getUserInfo = async()=>{
        if (web3Auth.connected) {
            const user = await web3Auth.getUserInfo();
            setUserInfo(user);

            if (user.email) {
                localStorage.setItem("userEmail", user.email);
                try {
                    await createUser(user.email, user.name || 'Anonymous User')
                } catch (error) {
                    console.error("Error creating user", error)
                }
            }
        }
    }

    const handleNotificationClick = async (notificationId: number)=>{
        await markNotificationAsRead(notificationId); 
    }

    if (loading) {
        return <div>Loading web3 auth...</div>;
    }
    return(
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="flex items-center justify-between px-4 py-2">
                <div className="flex items-center">
                    <Button 
                    variant='ghost' 
                    size='icon' 
                    className="mr-2 md:mr-4"
                    onClick={onMenuClick}
                    >
                        <Menu className="h-6 w-6 text-gray-800" />
                    </Button>
                    <Link href="/" className="flex items-center">
                    <Leaf className="h-6 w-6 md:h-8 md:w-8 text-green-500 mr-1 md:mr-2" />
                    <span className="font-bold text-base md:text-lg text-gray-800">
                        Earthwise
                    </span>
                    </Link>
                </div>
                {!isMobile && (
                    <div className="flex-1 max-w-xl mx-4">
                        <div className="relative">
                            <input type="text" placeholder="search..." 
                            className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500" />
                            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        </div>
                    </div>
                )}
                <div className="flex items-center">
                    {isMobile && (
                        <Button variant="ghost" size="icon" className="mr-2">
                            <Search className="h-5 w-5"/>
                        </Button>
                    )}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="mr-2 relative">
                                <Bell className="h-5 w-5 text-gray-800"/>
                                {notification.length > 0 && (
                                    <Badge className="absolute -top-1 -right-1 px-1 min-w-[1.2rem] h-5">
                                        {notification.length}
                                    </Badge>
                                )}
                            </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end" className="w-64">
                            {notification.length > 0 ? (
                                notification.map((notification:any)=>(
                                    <DropdownMenuItem 
                                    key={notification.id}
                                    onClick={()=> handleNotificationClick(notification.id)}>

                                    </DropdownMenuItem>
                                ))
                            ):(
                                <></>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    )
}


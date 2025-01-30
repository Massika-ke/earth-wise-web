'use client'

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "./ui/button"
import {Menu, Coins, Leaf, Search, Bell, User, ChevronDown, LogIn, LogOut, Import} from 'lucide-react'

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"

import { Badge } from "./ui/badge"
import {web3Auth} from '@web3auth/modal'

import { CHAIN_NAMESPACES, IProvider, WEB3AUTH_NETWORK } from "@web3auth/base"
import {EthereumPrivateKeyProvider} from '@web3auth/ethereum-provider'

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
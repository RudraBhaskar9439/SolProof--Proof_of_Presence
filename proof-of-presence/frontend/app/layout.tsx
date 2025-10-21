import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { WalletProvider } from "@/lib/wallet/wallet-provider"
import { Toaster } from "@/components/ui/toaster"
import Navigation from "@/components/navigation"

const geistSans = Geist({ subsets: ["latin"] })
const geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Proof of Presence - Solana Event Badges",
  description: "Event check-in and NFT badge system on Solana",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${geistSans.className} bg-background text-foreground`}>
        <WalletProvider>
          <Navigation />
          <main className="min-h-screen">{children}</main>
          <Toaster />
        </WalletProvider>
      </body>
    </html>
  )
}

import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Web3Provider } from "@/lib/web3-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SmartScribe - AI-Powered Smart Contract Analysis Platform",
  description:
    "Comprehensive smart contract analysis with AI intelligence, real-time market data, and interactive chatbot assistance.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <Web3Provider>{children}</Web3Provider>
        </ThemeProvider>
      </body>
    </html>
  )
}

import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'

export const metadata = {
  title: 'GreenGrow',
  description: 'Created with v0',
  generator: 'v0.app',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body suppressHydrationWarning>
        <Navbar />
        {children}
        <Footer />
        <Toaster />
      </body>
    </html>
  )
}

import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '自動化工具集 | Automation Toolkit',
  description: '收錄所有 AI / OpenClaw 工具連結與簡介 — 你的終極工具入口網站',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-TW">
      <body className="antialiased">{children}</body>
    </html>
  )
}

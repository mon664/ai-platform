import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AI Content Platform',
  description: 'AI 콘텐츠 자동 생성 플랫폼',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}

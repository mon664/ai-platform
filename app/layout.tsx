import type { Metadata } from 'next';
import './globals.css';
import AuthProvider from './components/AuthProvider';
import Navigation from './components/Navigation';

export const metadata: Metadata = {
  title: 'AI Content Platform',
  description: 'AI 콘텐츠 자동 생성 플랫폼',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="bg-gray-900">
        <AuthProvider>
          <Navigation />
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}

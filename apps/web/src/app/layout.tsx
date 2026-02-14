import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import { Nav } from '../components/Nav';
import { QuickAccess } from '../components/QuickAccess';

export const metadata: Metadata = {
  title: 'FreeFlow',
  description: 'Modern web application',
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="app-shell">
          <Nav />
          <div className="app-main">
            <main className="app-content">{children}</main>
            <aside className="app-aside">
              <QuickAccess />
            </aside>
          </div>
        </div>
      </body>
    </html>
  );
}

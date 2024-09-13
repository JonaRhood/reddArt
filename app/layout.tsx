import type { ReactNode } from "react";
import { StoreProvider } from "./StoreProvider";
import Sidenav from "./components/sidenav/sidenav";
import "./styles/globals.css";
import { IBM_Plex_Sans } from 'next/font/google';


const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
});

interface Props {
  readonly children: ReactNode;
}

export default function RootLayout({ children }: Props) {
  return (
    <StoreProvider>
      <html lang="en">
        <body className={`
            ${ibmPlexSans.className}
            bg-light-background text-light-text
        `}>
          <section className="flex">
            <div className="fixed w-56 sm:w-80 bg-light-surface h-screen overflow-hidden z-50">
              <Sidenav />
            </div>
            <div className="flex-1 ml-56 sm:ml-80 bg-light-background h-screen overflow-auto">
              <main className="p-4">{children}</main>
            </div>
          </section>
        </body>
      </html>
    </StoreProvider>
  );
}

export const metadata = {
  title: 'reddArt', 
  description: 'Your site description here',
  icons: {
    icon: '/favicon.svg',
  },
};

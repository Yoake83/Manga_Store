import './globals.css';
import type {ReactNode} from 'react';
export const metadata={title:'YOAKE 夜明け — Sakura Manga World',description:'A 3D sakura world where you walk through gates to choose what to read.'};
export default function RootLayout({children}:{children:ReactNode}){
  return(<html lang="en"><head>
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"/>
    <link rel="preconnect" href="https://fonts.googleapis.com"/><link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin=""/>
    <link href="https://fonts.googleapis.com/css2?family=Shippori+Mincho+B1:wght@700;800&family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet"/>
  </head><body>{children}</body></html>);
}

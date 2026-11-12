import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'TrustTrade — Find skilled hands. Hire with confidence.', description: 'Discover local artisans, explore real work evidence and connect with skilled professionals around you.' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }

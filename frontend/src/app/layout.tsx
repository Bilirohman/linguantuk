import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Network, Search, BookOpen, Database } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Linguantuk | Semantic Web",
  description: "Semantic Web Knowledge Graph for Linguistic Concepts",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-950 text-slate-50 min-h-screen flex flex-col`}>
        <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <Link href="/" className="flex items-center space-x-2 text-indigo-400 font-bold text-xl tracking-tight">
                <Network className="h-6 w-6" />
                <span>Linguantuk</span>
              </Link>
              <div className="flex space-x-8">
                <Link href="/search" className="flex items-center space-x-1 hover:text-indigo-400 transition-colors">
                  <Search className="h-4 w-4" />
                  <span>Search</span>
                </Link>
                <Link href="/ontology" className="flex items-center space-x-1 hover:text-indigo-400 transition-colors">
                  <BookOpen className="h-4 w-4" />
                  <span>Ontology</span>
                </Link>
                <Link href="/relations" className="flex items-center space-x-1 hover:text-indigo-400 transition-colors">
                  <Network className="h-4 w-4" />
                  <span>Relations</span>
                </Link>
                <Link href="/sparql" className="flex items-center space-x-1 hover:text-indigo-400 transition-colors">
                  <Database className="h-4 w-4" />
                  <span>SPARQL</span>
                </Link>
              </div>
            </div>
          </div>
        </nav>
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          {children}
        </main>
        <footer className="border-t border-slate-800 py-6 text-center text-slate-400 text-sm">
          &copy; {new Date().getFullYear()} Linguantuk Project. Semantic Web Final Project.
        </footer>
      </body>
    </html>
  );
}

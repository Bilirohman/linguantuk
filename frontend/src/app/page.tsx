"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Sparkles } from "lucide-react";

export default function Home() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
          Linguantuk
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto">
          Explore linguistic concepts, semantic relations, and knowledge graphs powered by Semantic Web Technologies.
        </p>
      </div>

      <div className="w-full max-w-3xl relative">
        <form onSubmit={handleSearch} className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-6 w-6 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
          </div>
          <input
            type="text"
            className="block w-full pl-14 pr-32 py-5 bg-slate-900 border border-slate-700 rounded-full text-lg shadow-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-all"
            placeholder="Search for concepts like 'Happy', 'Emotion', 'Car'..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            type="submit"
            className="absolute inset-y-2 right-2 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-full transition-colors flex items-center gap-2"
          >
            <span>Search</span>
            <Sparkles className="h-4 w-4" />
          </button>
        </form>
      </div>

      <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl hover:border-indigo-500/50 transition-colors">
          <h3 className="text-xl font-bold mb-2 text-indigo-300">Semantic Search</h3>
          <p className="text-slate-400">Discover linguistic concepts through rich ontology-based search capabilities.</p>
        </div>
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl hover:border-cyan-500/50 transition-colors">
          <h3 className="text-xl font-bold mb-2 text-cyan-300">Knowledge Graph</h3>
          <p className="text-slate-400">Visualize complex semantic relationships (synonyms, antonyms, taxonomy) interactively.</p>
        </div>
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl hover:border-emerald-500/50 transition-colors">
          <h3 className="text-xl font-bold mb-2 text-emerald-300">SPARQL Endpoint</h3>
          <p className="text-slate-400">Execute complex queries directly against the underlying RDF knowledge base.</p>
        </div>
      </div>
    </div>
  );
}

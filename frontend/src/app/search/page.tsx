"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { Loader2, ArrowRight, Search, X } from "lucide-react";

function SearchResults() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const q = searchParams.get("q") || "";

  const [inputValue, setInputValue] = useState(q);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Sync input with URL param when navigating
  useEffect(() => {
    setInputValue(q);
  }, [q]);

  // Fetch when q changes from URL
  useEffect(() => {
    if (q) {
      setHasSearched(true);
      setLoading(true);
      axios
        .get(`http://localhost:8000/api/search?q=${encodeURIComponent(q)}`)
        .then((res) => {
          setResults(res.data.results?.bindings || []);
        })
        .catch((err) => {
          console.error("Search failed:", err);
          setResults([]);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setResults([]);
      setHasSearched(false);
    }
  }, [q]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (trimmed) {
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    }
  };

  const handleClear = () => {
    setInputValue("");
    router.push("/search");
  };

  const extractId = (uri: string) => uri.split("/").pop() || uri;

  return (
    <div className="max-w-4xl mx-auto w-full">
      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Search className="h-7 w-7 text-indigo-500" />
          Semantic Search
        </h1>
        <p className="text-slate-400">
          Cari konsep linguistik dalam knowledge graph berdasarkan nama atau kata kunci.
        </p>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSubmit} className="relative group mb-8">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
        </div>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Cari konsep... contoh: 'happy', 'car', 'emotion'"
          className="block w-full pl-12 pr-28 py-4 bg-slate-900 border border-slate-700 rounded-xl text-base shadow-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-all placeholder:text-slate-600"
          autoFocus={!q}
        />
        <div className="absolute inset-y-2 right-2 flex items-center gap-1">
          {inputValue && (
            <button
              type="button"
              onClick={handleClear}
              className="p-2 text-slate-500 hover:text-slate-300 transition-colors"
              title="Hapus pencarian"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <button
            type="submit"
            disabled={!inputValue.trim()}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors text-sm"
          >
            Cari
          </button>
        </div>
      </form>

      {/* Results */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
          <span>Mencari "<span className="text-indigo-400">{q}</span>"...</span>
        </div>
      ) : hasSearched ? (
        results.length > 0 ? (
          <div>
            <p className="text-sm text-slate-500 mb-4">
              Menampilkan <span className="font-semibold text-slate-300">{results.length}</span> hasil untuk{" "}
              <span className="text-indigo-400 font-semibold">"{q}"</span>
            </p>
            <div className="space-y-3">
              {results.map((item, idx) => {
                const uri = item.s.value;
                const label = item.label.value;
                const id = extractId(uri);
                return (
                  <div
                    key={idx}
                    className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-indigo-500/60 hover:bg-slate-900/80 transition-all flex justify-between items-center group"
                  >
                    <div>
                      <Link
                        href={`/entity/${encodeURIComponent(id)}`}
                        className="text-lg font-semibold text-indigo-300 hover:text-indigo-200 hover:underline transition-colors"
                      >
                        {label}
                      </Link>
                      <div className="text-xs text-slate-500 mt-1 font-mono truncate max-w-sm" title={uri}>
                        {uri}
                      </div>
                    </div>
                    <Link
                      href={`/entity/${encodeURIComponent(id)}`}
                      className="p-2 bg-slate-800 rounded-full text-slate-400 group-hover:text-indigo-400 group-hover:bg-indigo-900/40 transition-all shrink-0 ml-4"
                    >
                      <ArrowRight className="h-5 w-5" />
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-16 bg-slate-900/50 rounded-xl border border-slate-800">
            <Search className="h-12 w-12 text-slate-700 mx-auto mb-4" />
            <p className="text-slate-300 text-lg font-medium mb-1">Tidak ada hasil ditemukan</p>
            <p className="text-slate-500 text-sm">
              Tidak ada konsep yang cocok dengan "<span className="text-slate-400">{q}</span>" dalam knowledge graph.
            </p>
          </div>
        )
      ) : (
        // Empty state — user belum search apapun
        <div className="text-center py-16 border border-dashed border-slate-800 rounded-xl">
          <Search className="h-12 w-12 text-slate-700 mx-auto mb-4" />
          <p className="text-slate-400 text-base">Ketik kata kunci di atas untuk mulai mencari</p>
          <p className="text-slate-600 text-sm mt-2">Contoh: happy, car, emotion, synonym</p>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="text-center mt-20">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-indigo-500" />
        </div>
      }
    >
      <SearchResults />
    </Suspense>
  );
}

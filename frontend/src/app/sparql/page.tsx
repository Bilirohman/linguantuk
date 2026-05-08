"use client";

import { useState } from "react";
import axios from "axios";
import { Play, Database, Loader2 } from "lucide-react";

export default function SparqlPage() {
  const [query, setQuery] = useState(`PREFIX ex: <http://linguantuk.ac.id/concept/>
PREFIX rel: <http://linguantuk.ac.id/relation/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT ?subject ?label ?synonymLabel
WHERE {
  ?subject rel:synonym ?synonym .
  ?subject rdfs:label ?label .
  ?synonym rdfs:label ?synonymLabel .
}
LIMIT 10`);
  
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const executeQuery = async () => {
    setLoading(true);
    setError("");
    setResults(null);
    try {
      const res = await axios.post("http://localhost:8000/sparql", { query });
      if (res.data.error) {
        setError(res.data.error);
      } else {
        setResults(res.data);
      }
    } catch (err: any) {
      setError(err.message || "Failed to execute query");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-[85vh] flex flex-col gap-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Database className="h-8 w-8 text-indigo-500" />
            SPARQL Endpoint
          </h1>
          <p className="text-slate-400 mt-2">Query the semantic knowledge graph directly using SPARQL.</p>
        </div>
        <button
          onClick={executeQuery}
          disabled={loading}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2 font-medium disabled:opacity-50 transition-colors"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Play className="h-5 w-5" />}
          Run Query
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full min-h-0">
        {/* Editor */}
        <div className="flex flex-col border border-slate-800 rounded-xl overflow-hidden bg-slate-900 shadow-xl">
          <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 flex justify-between items-center">
            <span className="text-sm font-mono text-slate-400">Query Editor</span>
          </div>
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 w-full p-4 bg-transparent text-indigo-300 font-mono text-sm resize-none focus:outline-none"
            spellCheck="false"
          />
        </div>

        {/* Results */}
        <div className="flex flex-col border border-slate-800 rounded-xl overflow-hidden bg-slate-900 shadow-xl h-full">
          <div className="bg-slate-950 px-4 py-2 border-b border-slate-800">
            <span className="text-sm font-mono text-slate-400">Results</span>
          </div>
          <div className="flex-1 p-0 overflow-auto">
            {error && (
              <div className="p-4 text-red-400 bg-red-950/20 font-mono text-sm m-4 rounded">
                Error: {error}
              </div>
            )}
            
            {results && results.head && results.head.vars.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-800/50 sticky top-0">
                  <tr>
                    {results.head.vars.map((v: string) => (
                      <th key={v} className="px-4 py-3 font-medium text-slate-300 text-sm">{v}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {results.results.bindings.map((row: any, i: number) => (
                    <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                      {results.head.vars.map((v: string) => {
                        const cell = row[v];
                        return (
                          <td key={v} className="px-4 py-3 text-sm font-mono text-slate-400 max-w-[200px] truncate" title={cell?.value}>
                            {cell ? (
                              cell.type === 'uri' ? (
                                <span className="text-indigo-400">{cell.value.split('/').pop()}</span>
                              ) : (
                                <span className="text-emerald-400">"{cell.value}"</span>
                              )
                            ) : (
                              <span className="text-slate-600">-</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  {results.results.bindings.length === 0 && (
                    <tr>
                      <td colSpan={results.head.vars.length} className="px-4 py-8 text-center text-slate-500">
                        No results found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            ) : (
              !loading && !error && (
                <div className="h-full flex items-center justify-center text-slate-500">
                  Execute a query to see results here.
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

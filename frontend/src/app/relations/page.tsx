"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Network, Loader2, ArrowRight, ChevronLeft, ChevronRight, Filter } from "lucide-react";

const ONTOLOGY_GROUPS = [
  { id: "all", label: "All Groups" },
  { id: "grp:semanticopposition", label: "Semantic Opposition" },
  { id: "grp:spatialrelation", label: "Spatial Relation" },
  { id: "grp:externalknowledge", label: "External Knowledge" },
  { id: "grp:etymologicalrelation", label: "Etymological Relation" },
  { id: "grp:taxonomicrelation", label: "Taxonomic Relation" },
  { id: "grp:semanticsimilarity", label: "Semantic Similarity" },
];

const RELATIONS = [
  { id: "all", label: "All Relations", group: "all" },
  { id: "rel:antonym", label: "antonym", group: "grp:semanticopposition" },
  { id: "rel:distinctfrom", label: "distinctfrom", group: "grp:semanticopposition" },
  { id: "rel:atlocation", label: "atlocation", group: "grp:spatialrelation" },
  { id: "rel:dbpedia", label: "dbpedia", group: "grp:externalknowledge" },
  { id: "rel:derivedfrom", label: "derivedfrom", group: "grp:etymologicalrelation" },
  { id: "rel:etymologicallyderivedfrom", label: "etymologicallyderivedfrom", group: "grp:etymologicalrelation" },
  { id: "rel:etymologicallyrelatedto", label: "etymologicallyrelatedto", group: "grp:etymologicalrelation" },
  { id: "rel:instanceof", label: "instanceof", group: "grp:taxonomicrelation" },
  { id: "rel:isa", label: "isa", group: "grp:taxonomicrelation" },
  { id: "rel:partof", label: "partof", group: "grp:taxonomicrelation" },
  { id: "rel:relatedto", label: "relatedto", group: "grp:semanticsimilarity" },
  { id: "rel:similarto", label: "similarto", group: "grp:semanticsimilarity" },
  { id: "rel:synonym", label: "synonym", group: "grp:semanticsimilarity" },
];

const PAGE_SIZE_OPTIONS = [10, 15, 20, 50];

export default function RelationsPage() {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [selectedGroup, setSelectedGroup] = useState("all");
  const [selectedRelation, setSelectedRelation] = useState("all");

  // Reset relation when group changes and selected relation no longer belongs to it
  useEffect(() => {
    if (selectedGroup !== "all" && selectedRelation !== "all") {
      const rel = RELATIONS.find(r => r.id === selectedRelation);
      if (rel && rel.group !== selectedGroup) {
        setSelectedRelation("all");
      }
    }
  }, [selectedGroup]);

  useEffect(() => {
    const fetchRelations = async () => {
      setLoading(true);
      setError("");

      const params: Record<string, string | number> = {
        page,
        page_size: pageSize,
        group: selectedGroup,
        relation: selectedRelation,
      };

      try {
        const res = await axios.get("http://localhost:8000/api/relations", { params });
        if (res.data.error) {
          setError(res.data.error);
        } else {
          setResults(res.data);
        }
      } catch (err: any) {
        setError(err.response?.data?.detail || err.message || "Failed to fetch relations");
      } finally {
        setLoading(false);
      }
    };

    fetchRelations();
  }, [page, pageSize, selectedGroup, selectedRelation]);

  const formatUri = (uri: string) => {
    if (!uri) return "";
    return uri.split("/").pop() || uri;
  };

  const hasNextPage = results?.results?.bindings?.length === pageSize;

  const handleGroupChange = (val: string) => {
    setSelectedGroup(val);
    setPage(1);
  };

  const handleRelationChange = (val: string) => {
    setSelectedRelation(val);
    setPage(1);
  };

  const filteredRelations = RELATIONS.filter(
    r => r.id !== "all" && (selectedGroup === "all" || r.group === selectedGroup)
  );

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Network className="h-8 w-8 text-indigo-500" />
            Knowledge Graph Relations
          </h1>
          <p className="text-slate-400 mt-2">
            Explore and filter all relationships in the knowledge graph.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 bg-slate-900 border border-slate-800 p-3 rounded-xl">
          <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
            <Filter className="h-4 w-4" />
            <span>Filter:</span>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-500 uppercase tracking-wider">Group</label>
            <select
              value={selectedGroup}
              onChange={(e) => handleGroupChange(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-slate-300 text-sm rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 min-w-[170px]"
            >
              {ONTOLOGY_GROUPS.map(g => (
                <option key={g.id} value={g.id}>{g.label}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-500 uppercase tracking-wider">Relation</label>
            <select
              value={selectedRelation}
              onChange={(e) => handleRelationChange(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-slate-300 text-sm rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 min-w-[200px]"
            >
              <option value="all">All Relations</option>
              {filteredRelations.map(r => (
                <option key={r.id} value={r.id}>{r.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-xl overflow-hidden flex flex-col" style={{ minHeight: "500px" }}>
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-16 text-slate-400">
            <Loader2 className="h-10 w-10 animate-spin mb-4 text-indigo-500" />
            <p className="text-base">Loading relationships...</p>
            <p className="text-xs text-slate-500 mt-1">Querying knowledge graph...</p>
          </div>
        ) : error ? (
          <div className="flex-1 p-8">
            <div className="bg-red-950/30 border border-red-900/50 text-red-400 p-5 rounded-xl">
              <h3 className="font-bold mb-2 text-lg">Error Loading Relations</h3>
              <p className="font-mono text-sm break-all">{error}</p>
            </div>
          </div>
        ) : (
          <div className="overflow-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-950 sticky top-0 z-10 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4 font-semibold text-slate-300 text-sm w-2/5">Subject</th>
                  <th className="px-6 py-4 font-semibold text-slate-300 text-sm text-center w-1/5">Relation</th>
                  <th className="px-6 py-4 font-semibold text-slate-300 text-sm w-2/5">Object</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {results?.results?.bindings?.length > 0 ? (
                  results.results.bindings.map((row: any, i: number) => (
                    <tr key={i} className="hover:bg-slate-800/40 transition-colors group">
                      <td className="px-6 py-3 text-sm font-mono">
                        <span
                          className="text-indigo-400 group-hover:text-indigo-300 transition-colors"
                          title={row.subject?.value}
                        >
                          {formatUri(row.subject?.value)}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-sm font-mono text-center">
                        <div className="inline-flex items-center gap-1.5 bg-slate-950 px-3 py-1 rounded-full border border-slate-700">
                          <span className="text-cyan-400 text-xs">{formatUri(row.predicate?.value)}</span>
                          <ArrowRight className="h-3 w-3 text-slate-600 shrink-0" />
                        </div>
                      </td>
                      <td className="px-6 py-3 text-sm font-mono">
                        {row.object?.type === "uri" ? (
                          <span
                            className="text-emerald-400 group-hover:text-emerald-300 transition-colors"
                            title={row.object?.value}
                          >
                            {formatUri(row.object?.value)}
                          </span>
                        ) : (
                          <span className="text-amber-400">"{row.object?.value}"</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-6 py-16 text-center text-slate-500">
                      No relations found for the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="bg-slate-950 border-t border-slate-800 px-6 py-3 flex items-center justify-between shrink-0">
          <span className="text-sm text-slate-400">
            Page <span className="font-bold text-slate-200">{page}</span>
            {results?.results?.bindings && (
              <span className="ml-2 text-slate-500">
                · {results.results.bindings.length} row{results.results.bindings.length !== 1 ? "s" : ""} shown
              </span>
            )}
          </span>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-500">Rows:</label>
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                className="bg-slate-900 border border-slate-700 text-slate-300 text-xs rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {PAGE_SIZE_OPTIONS.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1 || loading}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-indigo-600 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="px-2 text-slate-400 text-sm font-mono">{page}</span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={!hasNextPage || loading}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-indigo-600 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

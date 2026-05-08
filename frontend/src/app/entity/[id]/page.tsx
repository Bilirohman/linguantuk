"use client";

import { useEffect, useState, use } from "react";
import axios from "axios";
import { Loader2, Share2, Tag, Book, BrainCircuit, RefreshCw } from "lucide-react";
import GraphVisualizer from "@/components/GraphVisualizer";
import MarkdownRenderer from "@/components/MarkdownRenderer";

interface EntityProps {
  params: Promise<{ id: string }>;
}

export default function EntityPage({ params }: EntityProps) {
  const unwrappedParams = use(params);
  const { id } = unwrappedParams;
  const decodedId = decodeURIComponent(id);
  const uri = `http://linguantuk.ac.id/concept/${decodedId}`;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [aiRecommendation, setAiRecommendation] = useState<string>("");
  const [loadingAi, setLoadingAi] = useState(false);

  useEffect(() => {
    axios.get(`http://localhost:8000/api/entity?uri=${encodeURIComponent(uri)}`)
      .then((res) => {
        setData(res.data.results?.bindings || []);
      })
      .catch((err) => console.error("Failed to fetch entity details", err))
      .finally(() => setLoading(false));
  }, [uri]);

  const properties = data.filter(d => d.p && d.o);
  const incoming = data.filter(d => d.p_in && d.s_in);

  const getAiRecommendation = async () => {
    setLoadingAi(true);
    try {
      const contextLines = [
        ...properties.map(p => `${decodedId} has relation ${p.p.value.split('/').pop()} to ${p.o.value.split('/').pop() || p.o.value}`),
        ...incoming.map(i => `${i.s_in.value.split('/').pop()} has relation ${i.p_in.value.split('/').pop()} to ${decodedId}`)
      ];
      
      const res = await axios.post("http://localhost:8000/api/ai/recommend", {
        query: `Tell me more about the linguistic concept "${decodedId}".`,
        context: contextLines.join('\n')
      });
      setAiRecommendation(res.data.response);
    } catch (err) {
      console.error(err);
      setAiRecommendation("Failed to generate AI recommendation. Is Gemini API configured?");
    } finally {
      setLoadingAi(false);
    }
  };

  // Prepare graph data
  const nodesMap = new Map();
  nodesMap.set(uri, { data: { id: uri, label: decodedId } });

  const edges: any[] = [];

  properties.forEach((prop, i) => {
    const oId = prop.o.value;
    const pLabel = prop.p.value.split('/').pop();
    const oLabel = prop.o.type === 'uri' ? oId.split('/').pop() : prop.o.value;
    
    if (!nodesMap.has(oId)) {
      nodesMap.set(oId, { data: { id: oId, label: oLabel, type: prop.o.type } });
    }
    edges.push({ data: { source: uri, target: oId, label: pLabel } });
  });

  incoming.forEach((inc, i) => {
    const sId = inc.s_in.value;
    const pLabel = inc.p_in.value.split('/').pop();
    const sLabel = sId.split('/').pop();

    if (!nodesMap.has(sId)) {
      nodesMap.set(sId, { data: { id: sId, label: sLabel, type: 'uri' } });
    }
    edges.push({ data: { source: sId, target: uri, label: pLabel } });
  });

  const nodes = Array.from(nodesMap.values());

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-indigo-500" /></div>;
  }

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Tag className="w-24 h-24" />
          </div>
          <h1 className="text-3xl font-bold text-indigo-400 mb-2 relative z-10">{decodedId}</h1>
          <div className="text-sm text-slate-500 font-mono break-all mb-4 relative z-10">
            {uri}
          </div>
          
          <div className="mt-8 border-t border-slate-800 pt-6">
            <h3 className="font-semibold text-slate-300 mb-4 flex items-center gap-2">
              <Share2 className="h-4 w-4" /> Attributes
            </h3>
            <div className="space-y-3">
              {properties.filter(p => p.o.type === 'literal').map((p, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span className="text-slate-500">{p.p.value.split('/').pop()}</span>
                  <span className="text-emerald-400">"{p.o.value}" {p.o["xml:lang"] && <span className="text-slate-600 text-xs ml-1">@{p.o["xml:lang"]}</span>}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-indigo-950/30 border border-indigo-900/50 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-indigo-300 flex items-center gap-2">
              <BrainCircuit className="h-5 w-5" /> AI Recommendation
            </h3>
            {aiRecommendation && !loadingAi && (
              <button
                onClick={getAiRecommendation}
                title="Regenerate"
                className="p-1 text-slate-500 hover:text-indigo-400 transition-colors"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {!aiRecommendation && !loadingAi ? (
            <button
              onClick={getAiRecommendation}
              className="w-full py-2.5 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 rounded-lg text-sm transition-colors border border-indigo-500/30 font-medium"
            >
              ✦ Generate Insights with Gemini
            </button>
          ) : loadingAi ? (
            <div className="flex flex-col items-center gap-2 py-4">
              <Loader2 className="h-5 w-5 animate-spin text-indigo-400" />
              <span className="text-xs text-slate-500">Generating insights...</span>
            </div>
          ) : (
            <div className="max-h-72 overflow-y-auto pr-1 custom-scrollbar">
              <MarkdownRenderer content={aiRecommendation} />
            </div>
          )}
        </div>
      </div>

      <div className="lg:col-span-2 space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
           <h3 className="text-xl font-bold text-slate-200 mb-4 flex items-center gap-2">
            <Share2 className="h-5 w-5 text-indigo-500" /> Knowledge Graph View
          </h3>
          {nodes.length > 0 ? (
            <GraphVisualizer nodes={nodes} edges={edges} />
          ) : (
            <div className="h-[500px] flex items-center justify-center text-slate-500 border border-slate-800 rounded-xl bg-slate-950">
              No relations found.
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h3 className="font-semibold text-slate-300 mb-4 flex items-center gap-2">
              <Book className="h-4 w-4" /> Outgoing Relations
            </h3>
            <ul className="space-y-2">
              {properties.filter(p => p.o.type === 'uri').map((p, idx) => (
                <li key={idx} className="flex flex-col text-sm border-l-2 border-slate-700 pl-3 py-1">
                  <span className="text-slate-500 text-xs mb-1">{p.p.value.split('/').pop()}</span>
                  <a href={`/entity/${encodeURIComponent(p.o.value.split('/').pop() || '')}`} className="text-indigo-400 hover:underline">
                    {p.o.value.split('/').pop() || p.o.value}
                  </a>
                </li>
              ))}
              {properties.filter(p => p.o.type === 'uri').length === 0 && (
                <li className="text-slate-500 text-sm">No outgoing relations.</li>
              )}
            </ul>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h3 className="font-semibold text-slate-300 mb-4 flex items-center gap-2">
              <Book className="h-4 w-4" /> Incoming Relations
            </h3>
            <ul className="space-y-2">
              {incoming.map((i, idx) => (
                <li key={idx} className="flex flex-col text-sm border-l-2 border-slate-700 pl-3 py-1">
                  <span className="text-slate-500 text-xs mb-1">{i.p_in.value.split('/').pop()}</span>
                  <a href={`/entity/${encodeURIComponent(i.s_in.value.split('/').pop() || '')}`} className="text-cyan-400 hover:underline">
                    {i.s_in.value.split('/').pop() || i.s_in.value}
                  </a>
                </li>
              ))}
              {incoming.length === 0 && (
                <li className="text-slate-500 text-sm">No incoming relations.</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

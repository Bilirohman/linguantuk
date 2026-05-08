"use client";

import { useState } from "react";
import { FolderTree, Component, ArrowRight } from "lucide-react";

export default function OntologyPage() {
  const ontology = {
    classes: [
      { id: "ex:lexicalconcept", label: "Lexical Concept" },
      { id: "ex:semanticrelation", label: "Semantic Relation" },
      { id: "ex:semanticgroup", label: "Semantic Group", subClasses: [
        "grp:externalknowledge",
        "grp:spatialrelation",
        "grp:semanticopposition",
        "grp:etymologicalrelation",
        "grp:semanticsimilarity",
        "grp:taxonomicrelation"
      ]}
    ],
    properties: [
      { id: "rel:synonym", type: "SymmetricProperty", group: "grp:semanticsimilarity" },
      { id: "rel:antonym", type: "SymmetricProperty", group: "grp:semanticopposition" },
      { id: "rel:isa", type: "TransitiveProperty", group: "grp:taxonomicrelation" },
      { id: "rel:partof", type: "TransitiveProperty", group: "grp:taxonomicrelation" },
      { id: "rel:dbpedia", type: "ObjectProperty", group: "grp:externalknowledge" },
      { id: "rel:etymologicallyderivedfrom", type: "ObjectProperty", group: "grp:etymologicalrelation" },
    ]
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
          <FolderTree className="h-10 w-10 text-indigo-500" />
          Ontology Explorer
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto">
          Browse the underlying T-Box schema of the Linguantuk Knowledge Graph. It defines the concepts (Classes) and the relationships (Properties) used to link linguistic data.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h2 className="text-2xl font-semibold mb-6 text-indigo-400 flex items-center gap-2 border-b border-slate-800 pb-4">
            <Component className="h-6 w-6" /> Classes
          </h2>
          <div className="space-y-4">
            {ontology.classes.map((c) => (
              <div key={c.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-slate-200">{c.label}</span>
                  <span className="text-xs font-mono bg-indigo-900/50 text-indigo-300 px-2 py-1 rounded">{c.id}</span>
                </div>
                {c.subClasses && (
                  <div className="mt-3 pt-3 border-t border-slate-800">
                    <span className="text-xs text-slate-500 mb-2 block">Subclasses</span>
                    <div className="flex flex-wrap gap-2">
                      {c.subClasses.map((sub) => (
                        <span key={sub} className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded flex items-center gap-1">
                          <ArrowRight className="h-3 w-3 text-slate-500" /> {sub}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h2 className="text-2xl font-semibold mb-6 text-cyan-400 flex items-center gap-2 border-b border-slate-800 pb-4">
            <ArrowRight className="h-6 w-6" /> Properties
          </h2>
          <div className="space-y-4">
            {ontology.properties.map((p) => (
              <div key={p.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-200 font-mono text-sm">{p.id}</span>
                  <span className="text-xs font-mono bg-cyan-900/50 text-cyan-300 px-2 py-1 rounded">{p.type}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-2">
                  <span className="bg-slate-800 px-2 py-1 rounded">Group: {p.group}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

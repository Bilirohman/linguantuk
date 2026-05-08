"use client";

import React from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import cytoscape from 'cytoscape';

interface Node {
  data: { id: string; label: string; type?: string };
}

interface Edge {
  data: { source: string; target: string; label: string };
}

interface GraphVisualizerProps {
  nodes: Node[];
  edges: Edge[];
}

export default function GraphVisualizer({ nodes, edges }: GraphVisualizerProps) {
  const elements = CytoscapeComponent.normalizeElements({
    nodes: nodes,
    edges: edges
  });

  const layout = {
    name: 'cose',
    idealEdgeLength: 100,
    nodeOverlap: 20,
    refresh: 20,
    fit: true,
    padding: 30,
    randomize: false,
    componentSpacing: 100,
    nodeRepulsion: 400000,
    edgeElasticity: 100,
    nestingFactor: 5,
    gravity: 80,
    numIter: 1000,
    initialTemp: 200,
    coolingFactor: 0.95,
    minTemp: 1.0,
    animate: false
  };

  const style: cytoscape.Stylesheet[] = [
    {
      selector: 'node',
      style: {
        'label': 'data(label)',
        'text-valign': 'center',
        'color': '#fff',
        'text-outline-width': 2,
        'text-outline-color': '#4f46e5',
        'background-color': '#4f46e5',
        'font-size': '12px',
        'font-family': 'Inter, sans-serif',
        'width': '40px',
        'height': '40px',
      }
    },
    {
      selector: 'node[type="literal"]',
      style: {
        'background-color': '#10b981',
        'text-outline-color': '#10b981',
        'shape': 'round-rectangle',
        'width': 'label',
        'padding': '10px'
      }
    },
    {
      selector: 'edge',
      style: {
        'label': 'data(label)',
        'width': 2,
        'line-color': '#334155',
        'target-arrow-color': '#334155',
        'target-arrow-shape': 'triangle',
        'curve-style': 'bezier',
        'font-size': '10px',
        'color': '#94a3b8',
        'text-background-opacity': 1,
        'text-background-color': '#0f172a',
        'text-background-padding': '2px',
        'text-border-opacity': 1,
        'text-border-width': 1,
        'text-border-color': '#334155',
      }
    }
  ];

  return (
    <div className="w-full h-[500px] border border-slate-800 rounded-xl overflow-hidden bg-slate-900/50">
      <CytoscapeComponent
        elements={elements}
        style={{ width: '100%', height: '100%' }}
        layout={layout}
        stylesheet={style}
      />
    </div>
  );
}

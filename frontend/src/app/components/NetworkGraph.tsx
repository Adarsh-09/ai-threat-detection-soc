import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

interface NetworkGraphProps {
  attackType: string;
  threatProbability: number;
  visible: boolean;
}

interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  type: 'server' | 'attacker';
  size: number;
}

interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  id: string;
}

export function NetworkGraph({ attackType, threatProbability, visible }: NetworkGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const simRef = useRef<d3.Simulation<GraphNode, GraphLink> | null>(null);

  const shouldShow = visible && (attackType === 'DoS' || attackType === 'Probe');

  useEffect(() => {
    if (!shouldShow || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 300;
    const height = 250;

    // Scale attacker count with probability
    const attackerCount = Math.max(3, Math.round((threatProbability / 100) * 12));
    const serverNode: GraphNode = { id: 'server', type: 'server', size: 16, x: width / 2, y: height / 2 };
    const attackerNodes: GraphNode[] = Array.from({ length: attackerCount }, (_, i) => ({
      id: `attacker-${i}`,
      type: 'attacker' as const,
      size: 6 + Math.random() * 4,
      x: width / 2 + (Math.random() - 0.5) * 200,
      y: height / 2 + (Math.random() - 0.5) * 200,
    }));

    const nodes: GraphNode[] = [serverNode, ...attackerNodes];
    const links: GraphLink[] = attackerNodes.map(a => ({
      id: `link-${a.id}`,
      source: a.id,
      target: 'server',
    }));

    const simulation = d3.forceSimulation<GraphNode>(nodes)
      .force('link', d3.forceLink<GraphNode, GraphLink>(links).id(d => d.id).distance(80))
      .force('charge', d3.forceManyBody().strength(-50))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(d => (d as GraphNode).size + 5));

    simRef.current = simulation;

    // Defs for glow
    const defs = svg.append('defs');
    const glowFilter = defs.append('filter').attr('id', 'glow');
    glowFilter.append('feGaussianBlur').attr('stdDeviation', '3').attr('result', 'blur');
    glowFilter.append('feMerge').selectAll('feMergeNode')
      .data(['blur', 'SourceGraphic']).enter()
      .append('feMergeNode').attr('in', (d: string) => d);

    // Links
    const linkGroup = svg.append('g');
    const linkElements = linkGroup.selectAll<SVGLineElement, GraphLink>('line')
      .data(links)
      .enter().append('line')
      .attr('stroke', '#ef444466')
      .attr('stroke-width', 1)
      .attr('filter', 'url(#glow)');

    // Animate link opacity
    function animateLinks() {
      linkElements
        .transition()
        .duration(800)
        .attr('stroke-opacity', 0.3)
        .transition()
        .duration(800)
        .attr('stroke-opacity', 1)
        .on('end', animateLinks);
    }
    animateLinks();

    // Nodes
    const nodeGroup = svg.append('g');
    const nodeElements = nodeGroup.selectAll<SVGCircleElement, GraphNode>('circle')
      .data(nodes)
      .enter().append('circle')
      .attr('r', d => d.size)
      .attr('fill', d => d.type === 'server' ? '#3b82f6' : '#ef4444')
      .attr('stroke', d => d.type === 'server' ? '#60a5fa' : '#f87171')
      .attr('stroke-width', 2)
      .attr('filter', 'url(#glow)');

    // Labels
    const labelGroup = svg.append('g');
    labelGroup.selectAll<SVGTextElement, GraphNode>('text')
      .data(nodes.filter(n => n.type === 'server'))
      .enter().append('text')
      .text('SERVER')
      .attr('text-anchor', 'middle')
      .attr('dy', 30)
      .attr('fill', '#60a5fa')
      .attr('font-size', '8px')
      .attr('font-family', 'monospace');

    simulation.on('tick', () => {
      linkElements
        .attr('x1', d => (d.source as GraphNode).x ?? 0)
        .attr('y1', d => (d.source as GraphNode).y ?? 0)
        .attr('x2', d => (d.target as GraphNode).x ?? 0)
        .attr('y2', d => (d.target as GraphNode).y ?? 0);

      nodeElements
        .attr('cx', d => d.x ?? 0)
        .attr('cy', d => d.y ?? 0);

      labelGroup.selectAll<SVGTextElement, GraphNode>('text')
        .attr('x', d => d.x ?? 0)
        .attr('y', d => d.y ?? 0);
    });

    return () => {
      simulation.stop();
    };
  }, [shouldShow, attackType, threatProbability]);

  if (!shouldShow) return null;

  return (
    <div className="bg-black/50 border border-cyan-500/30 rounded-lg p-4 threat-panel">
      <h3 className="text-cyan-400 text-xs mb-2 font-mono tracking-wider">
        ◈ NETWORK ATTACK VISUALIZATION — {attackType.toUpperCase()}
      </h3>
      <div className="flex justify-center">
        <svg ref={svgRef} width={300} height={250} className="overflow-visible" />
      </div>
      <div className="flex justify-center gap-4 mt-2 text-xs font-mono">
        <span className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-blue-500" /><span className="text-gray-400">Target Server</span></span>
        <span className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-red-500" /><span className="text-gray-400">Attacker ({Math.max(3, Math.round((threatProbability / 100) * 12))} nodes)</span></span>
      </div>
    </div>
  );
}

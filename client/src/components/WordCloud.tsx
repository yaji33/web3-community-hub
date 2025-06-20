import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import cloud from 'd3-cloud';
import { select, scaleSqrt } from 'd3';

interface WordCloudData {
  size: number;
  text: string;
  value: number;
}

interface CloudWord extends WordCloudData {
  x?: number;
  y?: number;
  rotate?: number;
  font?: string;
  fontWeight?: string;
}

interface WordCloudProps {
  words: WordCloudData[];
}

export const WordCloud: React.FC<WordCloudProps> = ({ words }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!Array.isArray(words) || words.length === 0 || !svgRef.current) return;

    const svg = select(svgRef.current);
    const width = 700;
    const height = 400;

    const colors = ['#60A5FA', '#A78BFA', '#34D399', '#F472B6', '#FBBF24'];
    const maxValue = Math.max(...words.map(w => w.value));
    const minValue = Math.min(...words.map(w => w.value));

    const fontScale = scaleSqrt().domain([minValue, maxValue]).range([20, 80]);

    const layout = cloud<CloudWord>()
      .size([width, height])
      .words(words.map(d => ({ ...d, size: fontScale(d.value) })))
      .padding(8)
      .rotate(() => 0)
      .font('Inter')
      .fontWeight('bold')
      .fontSize(d => d.size as number)
      .on('end', draw);

    layout.start();

    function draw(cloudWords: CloudWord[]) {
      let g = svg.select('g');

      if (g.empty()) {
        g = svg
          .append('g')
          .attr('transform', `translate(${width / 2},${height / 2})`);
      }

      const texts = g
        .selectAll<SVGTextElement, CloudWord>('text')
        .data(cloudWords, d => d.text);

      texts.join(
        enter =>
          enter
            .append('text')
            .attr('text-anchor', 'middle')
            .attr('transform', d => `translate(0,0) rotate(0)`)
            .style('opacity', 0)
            .style('font-family', 'Inter')
            .style('font-size', d => `${d.size}px`)
            .style('fill', (_, i) => colors[i % colors.length])
            .text(d => d.text)
            .transition()
            .duration(800)
            .attr(
              'transform',
              d => `translate(${d.x},${d.y}) rotate(${d.rotate})`
            )
            .style('opacity', 1),

        update =>
          update
            .transition()
            .duration(800)
            .attr(
              'transform',
              d => `translate(${d.x},${d.y}) rotate(${d.rotate})`
            )
            .style('font-size', d => `${d.size}px`)
            .style('opacity', 1),

        exit => exit.transition().duration(500).style('opacity', 0).remove()
      );
    }
  }, [words]);

  return (
    <Card className="bg-black/40 backdrop-blur-md border-purple-500/30 h-full">
      <CardHeader>
        <CardTitle className="text-white">Community Word Cloud</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-96 flex items-center justify-center">
          {words.length > 0 ? (
            <div className="w-full h-96 flex items-center justify-center">
              <svg
                ref={svgRef}
                width="700"
                height="400"
                className="overflow-visible"
              />
            </div>
          ) : (
            <div className="text-center text-gray-400">
              <p className="text-lg mb-2">No sentiments yet!</p>
              <p className="text-sm">
                Be the first to share your thoughts about Magic Newton
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

<script>
    import * as d3 from "d3";
    export let lines = [];
    export let width = 400;
    // --- allow parent to control actual SVG width separately
 export let svgWidth = width;
    export let colorScale;
  
    // Layout constants
    const firstColumnWidth = 150;
    const fileInfoMargin = 100;
    const dotsColumnX = firstColumnWidth + fileInfoMargin;
    const approxDotWidth = 20;
    const linesPerDot = 1;
    const baseY = 10;
    const totalLinesOffset = 20;
    const fileInfoHeight = baseY + totalLinesOffset;
    const dotRowHeight = 20;
  // map each line’s “type” to a distinct color
    
    let svg;
    let files = [];
    let filesWithHeights = [];
    let positions = [];
    let previousDotCounts = new Map();

    // Group lines by file into [{ name, lines }]
    $: files = d3.groups(lines, d => d.file)
  .map(([name, lines]) => ({ name, lines }))
  .sort((a, b) => b.lines.length - a.lines.length);
  
    // Compute each file's required height based on dot rows
    $: filesWithHeights = files.map(file => {
      const totalDots = Math.ceil(file.lines.length / linesPerDot);
      const availableWidth = width - dotsColumnX;
      const maxDotsPerRow = Math.floor(availableWidth / approxDotWidth) || totalDots;
      const dotRows = Math.ceil(totalDots / maxDotsPerRow);
      return { ...file, groupHeight: fileInfoHeight + dotRows * dotRowHeight };
    });
  
    // Compute cumulative Y positions for groups
    $: positions = (() => {
      let pos = [];
      let y = 0;
      for (const f of filesWithHeights) {
        pos.push(y);
        y += f.groupHeight;
      }
      return pos;
    })();
  
    // Helper: generate tspan rows of dots for a file
    function generateDots(file, svgWidth) {
      const totalDots = Math.ceil(file.lines.length / linesPerDot);
      const availableWidth = svgWidth - dotsColumnX;
      const maxDotsPerRow = Math.floor(availableWidth / approxDotWidth) || totalDots;
      const dotRows = Math.ceil(totalDots / maxDotsPerRow);
      let tspans = "";
      for (let r = 0; r < dotRows; r++) {
        // grab the actual line objects for this row
    const rowLines = file.lines.slice(
      r * maxDotsPerRow,
      (r + 1) * maxDotsPerRow
    );
    // color each dot by its line.type
    const rowDots = rowLines
   .map((line, i) => {
     const idx = r * maxDotsPerRow + i;
     return `<tspan
               x="${dotsColumnX}"
               dy="${r === 0 ? 0 : dotRowHeight + 'px'}"
               class="dot"
               data-index="${idx}"
               style="fill:${colorScale(line.type)}"
             >•</tspan>`;
   })
   .join('');
 tspans += rowDots;
      }
      return tspans;
    }
  
    // Whenever filesWithHeights or svg change, update SVG size and content
    $: if (svg) {
    //   const svgWidth = width;
      const totalHeight = positions.length
        ? positions[positions.length - 1] + filesWithHeights[filesWithHeights.length - 1].groupHeight
        : 0;
  
      const sel = d3.select(svg)
        .attr('width', svgWidth)
        .attr('height', totalHeight)
        .style('overflow', 'hidden');
  
      // Data join for file groups
      const groups = sel.selectAll('g.file')
        .data(filesWithHeights, d => d.name);
  
      // Remove old entries
      groups.exit().remove();
  
      // Append new groups
      const enterGroups = groups.enter()
        .append('g')
        .attr('class', 'file')
        .attr('transform', (d, i) => `translate(0, ${positions[i]})`);
  
      // File name text
      enterGroups.append('text')
        .attr('class', 'filename')
        .attr('x', 10)
        .attr('y', baseY)
        .attr('dominant-baseline', 'hanging')
        .text(d => d.name);
  
      // Total lines as <small>
      enterGroups.append('text')
        .attr('class', 'linecount')
        .attr('x', 10)
        .attr('y', baseY + totalLinesOffset)
        .attr('dominant-baseline', 'hanging')
        .text(d => `${d.lines.length} lines`);
  
      // Unit dots text
      enterGroups.append('text')
        .attr('class', 'unit-dots')
        .attr('x', dotsColumnX)
        .attr('y', baseY - 2)
        .attr('dominant-baseline', 'mathematical')
        .attr('fill', '#1f77b4')
        .html(d => generateDots(d, svgWidth));
  
        groups
    .transition()
    .duration(function(d, i) {
      // parse the prior Y from the current transform
      const m = (this.getAttribute("transform") || "")
                  .match(/translate\(\s*0\s*,\s*([0-9.]+)\s*\)/);
      const oldY = m ? +m[1] : 0;
      const newY = positions[i];
      // 2 ms per pixel moved
      return Math.abs(newY - oldY) * 2;
    })
    .attr("transform", (d, i) => `translate(0, ${positions[i]})`);
  
      groups.select('text.filename')
        .text(d => d.name);
  
      groups.select('text.linecount')
        .text(d => `${d.lines.length} lines`);
  
      groups.select('text.unit-dots')
        .html(d => generateDots(d, svgWidth));
    
    // animate only new dots
 groups.each(function(d) {
   const groupSel   = d3.select(this);
   const dotsSel    = groupSel.select('text.unit-dots');
   // how many dots total now vs before
   const newCount   = Math.ceil(d.lines.length / linesPerDot);
   const oldCount   = previousDotCounts.get(d.name) || 0;

   if (newCount > oldCount) {
     dotsSel.selectAll('tspan.dot')
       .filter((_, i) => i >= oldCount)
      .style('opacity', 0)
       .transition()
       .duration(1000)
       .ease(d3.easeCubicOut)
       .style('opacity', 1);
   }

   previousDotCounts.set(d.name, newCount);
 });
    }
  </script>
  
  <svg bind:this={svg}></svg>
  
  <style>
    :global(text.filename) {
      font-family: monospace;
      font-size: 14px;
      fill: #222;
    }
    :global(text.linecount) {
      font-size: 12px;
      fill: #555;
      font-style: italic;
    }
    :global(text.unit-dots) {
      font-size: 2.2rem;
      white-space: pre;
    }
    :global(g.file:hover text.filename) {
      font-weight: bold;
    }
  </style>
  
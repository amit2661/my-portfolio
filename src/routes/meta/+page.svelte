<script>
  import * as d3 from "d3";
  import { onMount } from "svelte";
  import {
	computePosition,
	autoPlacement,
	offset,
} from '@floating-ui/dom';
  import Bar from '$lib/Bar.svelte';
  import { base } from '$app/paths';

  let data = [];
  let commits = [];
  let totalCommits = 0;
  let totalFiles = 0;
  let width = 1000, height = 600;
  let margin = {top: 10, right: 10, bottom: 30, left: 20};
  let usableArea = {
	top: margin.top,
	right: width - margin.right,
	bottom: height - margin.bottom,
	left: margin.left
  };
  usableArea.width = usableArea.right - usableArea.left;
  usableArea.height = usableArea.bottom - usableArea.top;
  let xAxis, yAxis, yAxisGridlines;
  let hoveredIndex = -1;
  let hoveredCommit = null;
  let cursor = {x: 0, y: 0};
  let commitTooltip;
  let tooltipPosition = {x: 0, y: 0};
  let clickedCommits = [];
  let commitProgress = 100;
  let minDate, maxDate, maxDatePlusOne;
let timeScale;
let commitMaxTime;
let filteredCommits = [];
let filteredLines   = [];
let filteredMinDate, filteredMaxDate;
let xScale, yScale;


$: hoveredCommit = commits[hoveredIndex] ?? hoveredCommit ?? {};



  onMount(async () => {
    data = await d3.csv(`${base}/loc.csv`, row => ({
      ...row,
      line: Number(row.line), 
      depth: Number(row.depth),
      length: Number(row.length),
      date: new Date(row.date + "T00:00" + row.timezone),
      datetime: new Date(row.datetime)
    }));

    // Compute commits
    commits = d3.groups(data, d => d.commit).map(([commit, lines]) => {
      let first = lines[0];
      let { author, date, time, timezone, datetime } = first;
      let ret = {
        id: commit,
        url: "https://github.com/amit2661/my-portfolio/commit/" + commit,
        author, date, time, timezone, datetime,
        hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
        totalLines: lines.length
      };

      Object.defineProperty(ret, "lines", {
        value: lines,
        configurable: true,
        writable: true,
        enumerable: false,
      });

      return ret;
    });


  });


  $: if (commits.length > 0) {
   // overall date bounds
   minDate = d3.min(commits, d => d.date);
  maxDate = d3.max(commits, d => d.date);
   maxDatePlusOne = new Date(maxDate);
   maxDatePlusOne.setDate(maxDatePlusOne.getDate() + 1);

   // slider scale
   timeScale = d3.scaleTime()
     .domain([minDate, maxDatePlusOne])
     .range([0, 100]);
 }

 // Convert the slider value (0-100) to a date.
 $: if (timeScale) {
   // map slider to a Date
   commitMaxTime = timeScale.invert(commitProgress);

   // filter once we know commitMaxTime
   filteredCommits = commits.filter(c => c.datetime <= commitMaxTime);
   filteredLines   = data   .filter(d => d.datetime   <= commitMaxTime);

   // summary stats
   totalCommits = filteredCommits.length;
   totalFiles   = new Set(filteredLines.map(d => d.file)).size;
 }


    console.log("Commits:", totalCommits);
    console.log("Files:", totalFiles);
// Use filteredCommits dates if available, otherwise fall back to minDate/maxDate
$: if (filteredCommits && filteredCommits.length > 0) {
   const lo = d3.min(filteredCommits, d => d.date);
   const hi = new Date(d3.max(filteredCommits, d => d.date).getTime() + 86400000);

   xScale = d3.scaleTime()
     .domain([lo, hi])
     .range([usableArea.left, usableArea.right])
     .nice();
 }


  $: yScale = d3.scaleLinear()
                .domain([24, 0])
                .range([usableArea.bottom, usableArea.top]);

  $: {
	d3.select(xAxis).call(d3.axisBottom(xScale));
  d3.select(yAxis).call(d3.axisLeft(yScale).tickFormat(d => String(d % 24).padStart(2, "0") + ":00"));
  d3.select(yAxisGridlines).call(
		d3.axisLeft(yScale)
		  .tickFormat("")
		  .tickSize(-usableArea.width)
	);
}

async function dotInteraction (index, evt) {
	let hoveredDot = evt.target;
	if (evt.type === "mouseenter") {
		hoveredIndex = index;
		cursor = {x: evt.x, y: evt.y};
		tooltipPosition = await computePosition(hoveredDot, commitTooltip, {
			strategy: "fixed", // because we use position: fixed
			middleware: [
				offset(5), // spacing from tooltip to dot
				autoPlacement() // see https://floating-ui.com/docs/autoplacement
			],
		});        }
	else if (evt.type === "mouseleave") {
		hoveredIndex = -1
	}
  else if (evt.type === "click") {
      let commit = commits[index]
      if (!clickedCommits.includes(commit)) {
        // Add the commit to the clickedCommits array
        clickedCommits = [...clickedCommits, commit];
      }
      else {
          // Remove the commit from the array
          clickedCommits = clickedCommits.filter(c => c !== commit);
      }
}
console.log(clickedCommits);
}

$: allTypes = Array.from(new Set(data.map(d => d.type)));
$: selectedLines = (clickedCommits.length > 0 ? clickedCommits : commits).flatMap(d => d.lines);
$: selectedCounts = d3.rollup(
    selectedLines,
    v => v.length,
    d => d.type
);
$: languageBreakdown = allTypes.map(type => [type, selectedCounts.get(type) || 0]);




</script>

<svelte:head>
  <title>Meta-Analysis</title>
</svelte:head>

<h1>Meta-Analysis of Codebase</h1>
<p>This page provides insights into the structure and composition of our codebase.</p>

<div>
  <h3>SUMMARY</h3>
  <dl class="stats">
      <dt>Commits</dt>
      <dd>{totalCommits}</dd> <!-- ✅ Updated -->

      <dt>Files</dt>
      <dd>{totalFiles}</dd> <!-- ✅ Updated -->

      <dt>Total <abbr title="Lines of Code">LOC</abbr></dt>
      <dd>{filteredLines.length}</dd>

  </dl>
</div>
<h3>Commits by Time of the Day</h3>

<div class="slider-container">
  <div class="slider-row">
    <label for="time-slider" class="slider-label">Show commits until:</label>
    <time class="slider-time">
      {commitMaxTime.toLocaleString("en", { dateStyle: "long", timeStyle: "short" })}
    </time>
  </div>
  <input 
    id="time-slider" 
    type="range" 
    min="0" 
    max="100" 
    bind:value={commitProgress} 
    class="time-slider"
  />
</div>


<svg viewBox="0 0 {width} {height}">

	<g class="gridlines" transform="translate({usableArea.left}, 0)" bind:this={yAxisGridlines} />
  <g transform="translate(0, {usableArea.bottom})" bind:this={xAxis} />
  
  <g  transform="translate({usableArea.left}, 0)" bind:this={yAxis} />
  
  <g class="dots">
    {#each filteredCommits as commit, index (commit.id)}

      <circle
        cx={ xScale(commit.datetime) }
        cy={ yScale(commit.hourFrac) }
        r="5"
        fill="steelblue"
        on:mouseenter={evt => dotInteraction(index, evt)}
	      on:mouseleave={evt => dotInteraction(index, evt)}
        on:click={ evt => dotInteraction(index, evt) }
        class:selected={ clickedCommits.includes(commit) }
      />
    {/each}
    </g>
        
    

<!-- scatterplot will go here -->
</svg>

<Bar data={languageBreakdown} width={width} />



<dl class="info tooltip" hidden={hoveredIndex === -1} style="top: {tooltipPosition.y}px; left: {tooltipPosition.x}px" bind:this={commitTooltip}>

			<dt>Commit</dt>
			<dd><a href="{hoveredCommit.url}" target="_blank">{hoveredCommit.id}</a></dd>

			<dt>Date</dt>
			<dd>{hoveredCommit.datetime?.toLocaleString("en", {dateStyle: "full"})}</dd>

			<dt>Time</dt>
			<dd>{hoveredCommit.datetime?.toLocaleTimeString("en", {hour: "2-digit", minute: "2-digit"})}</dd>

			<dt>Author</dt>
			<dd>{hoveredCommit.author}</dd>

			<dt>Lines Edited</dt>
			<dd>{hoveredCommit.totalLines}</dd>
		</dl>



<style>
	svg {
		overflow: visible;
	}

  .gridlines {
	stroke-opacity: .2;
}

/* Style for the info panel using grid */
dl.info {
    display: grid;
    grid-template-columns: auto 1fr; /* Labels in 1st column, values in 2nd */
    gap: 5px 10px; /* Small spacing between rows and columns */
    background: #fff;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 10px;
    box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.2);
    font-size: 14px;
    max-width: 300px;
    transition-duration: 500ms;
    transition-property: opacity, visibility;

    &[hidden]:not(:hover, :focus-within) {
      opacity: 0;
      visibility: hidden;
    }
}

/* Style <dt> to be less prominent */
dl.info dt {
    font-weight: bold;
    color: #555;
    text-align: right;
}

/* Style <dd> for better readability */
dl.info dd {
    margin: 0; /* Remove default margins */
    font-weight: bold;
    color: #222;
}

/* Tooltip placement */
.tooltip {
    position: fixed;  /* Stays fixed in viewport */
    top: 1em;
    left: 1em;
    background:oklch(100% 0% 0 / 80%);
    border: 1px solid #ddd;
    border-radius: 5px;
    padding: 10px;
    box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.2);
    font-size: 14px;
    backdrop-filter: invert(80%);
}

circle {
	transition: 200ms;
  transform-origin: center;
  transform-box: fill-box;

	&:hover {
		transform: scale(1.5);

	}
}

.selected {
    fill: oklch(0.8 0.3 150);
    
}


  .slider-container {
    display: flex;
    flex-direction: column;
    gap: 4px; /* Small gap between header row and the slider */
    max-width: 100%;
    margin-bottom: 1em;
  }

  .slider-row {
    display: flex;
    justify-content: space-between; /* Pushes the label left and the time right */
    align-items: center;
  }

  .slider-label {
    white-space: nowrap; /* Keeps the label in a single line */
    font-size: 16px;
    font-weight: bold;
  }

  .slider-time {
    font-weight: bold; /* Bold text */
    font-size: 16px;
    text-align: right; /* Right aligns the text within its container */
  }

  .time-slider {
    width: 100%; /* Ensure the slider takes full available width */
  }

</style>



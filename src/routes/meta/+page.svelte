<script>
  import * as d3 from "d3";
  import { onMount } from "svelte";
  import { computePosition, autoPlacement, offset } from "@floating-ui/dom";
  import StackedBar from "$lib/StackedBar.svelte";
  import { base } from "$app/paths";
  import FileLines from "$lib/FileLines.svelte";
  import Scrolly from "svelte-scrolly";

  let colorScale = d3.scaleOrdinal(d3.schemeTableau10);
  let commitProgress = 100;
  let data = [];
  // calculate number of files
  let numFiles = [];
  let commits = [];
  let progress = 0; 
  // hold licked commits
  let clickedCommits = [];

  // set hovered commit
  let hoveredIndex = -1;
  $: hoveredCommit = filteredCommits[hoveredIndex] ?? hoveredCommit ?? {};

  // filtered commits
  $: filteredCommits = commits.filter(
    (commit) => commit.datetime <= commitMaxTime
  );
  // filter lines
  $: filteredLines = data.filter((line) => line.datetime <= commitMaxTime);

  // set SVG dimensions
  let width = 1000,
    height = 600;
  // margins for axes
  let margin = { top: 10, right: 10, bottom: 30, left: 20 };
  // define useable area
  let usableArea = {
    top: margin.top,
    right: width - margin.right,
    bottom: height - margin.bottom,
    left: margin.left,
  };
  usableArea.width = usableArea.right - usableArea.left;
  usableArea.height = usableArea.bottom - usableArea.top;
  // define cursor location
  let cursor = { x: 0, y: 0 };

  // set tooltip location
  let commitTooltip;

  // initialize tooltip position
  let tooltipPosition = { x: 0, y: 0 };

  // define axes
  let xAxis, yAxis, yAxisGridlines;

  $: {
    d3.select(xAxis).call(d3.axisBottom(xScale));
    d3.select(yAxis).call(
      d3
        .axisLeft(yScale)
        .tickFormat((d) => String(d % 24).padStart(2, "0") + ":00")
    );
    d3.select(yAxisGridlines).call(
      d3.axisLeft(yScale).tickFormat("").tickSize(-usableArea.width)
    );
  }

  $: allTypes = Array.from(new Set(data.map((d) => d.type)));

  $: selectedLines = (
    clickedCommits.length > 0 ? clickedCommits : filteredCommits
  ).flatMap((d) => d.lines);

  $: selectedCounts = d3.rollup(
    selectedLines,
    (v) => v.length,
    (d) => d.type
  );

  $: languageBreakdown = allTypes.map((type) => [
    type,
    selectedCounts.get(type) || 0,
  ]);

  // set yScale
  $: yScale = d3
    .scaleLinear()
    .domain([0, 24])
    .range([usableArea.bottom, usableArea.top])
    .nice();

  // set xScale
  $: xScale = d3
    .scaleTime()
    .domain([minDate, maxDatePlusOne])
    .range([usableArea.left, usableArea.right])
    .nice();

  // set dot size
  $: rScale = d3
    .scaleSqrt()
    .domain(d3.extent(commits.map((d) => d.totalLines)))
    .range([2, 30]);

  onMount(async () => {
    data = await d3.csv(`${base}/loc.csv`, (row) => ({
      ...row,
      line: +row.line, // or just +row.line
      depth: +row.depth,
      length: +row.length,
      date: new Date(row.date + "T00:00" + row.timezone),
      datetime: new Date(row.datetime),
    }));

    commits = d3
      .groups(data, (d) => d.commit)
      .map(([commit, lines]) => {
        let first = lines[0];
        let { author, date, time, timezone, datetime } = first;
        let ret = {
          id: commit,
          url: "https://github.com/amit2661/my-portfolio/commit/" + commit,
          author,
          date,
          time,
          timezone,
          datetime,
          hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
          totalLines: lines.length,
        };

        // Like ret.lines = lines
        // but non-enumerable so it doesn’t show up in JSON.stringify
        Object.defineProperty(ret, "lines", {
          value: lines,
          configurable: true,
          writable: true,
          enumerable: false,
        });

        return ret;
      });

    commits = commits.filter((commit) => !/^0+$/.test(commit.id));
    commits = d3.sort(commits, (d) => -d.totalLines);
  });
  // calculate time most work is done
  $: workByPeriod = d3.rollups(
    data,
    (v) => v.length,
    (d) => d.datetime.toLocaleString("en", { dayPeriod: "short" })
  );
  // find period with the most work
  $: maxPeriod = d3.greatest(workByPeriod, (d) => d[1])?.[0];
  // calculate number of files
  $: numFiles = d3.group(filteredLines, (d) => d.file).size;

  $: minDate = d3.min(commits.map((d) => d.datetime));
  $: maxDate = d3.max(commits.map((d) => d.datetime));
  $: maxDatePlusOne = new Date(maxDate);
  $: maxDatePlusOne.setDate(maxDatePlusOne.getDate() + 1);

  // set time scale
  $: timeScale = d3
    .scaleTime()
    .domain([minDate, maxDate])
    .range([0, 100])
    .nice();

  // get maxtime of commits
  $: commitMaxTime = timeScale.invert(commitProgress);

  // function for tooltip listener
  async function dotInteraction(index, evt) {
    let hoveredDot = evt.target;
    if (evt.type === "mouseenter") {
      hoveredIndex = index;
      tooltipPosition = await computePosition(hoveredDot, commitTooltip, {
        strategy: "fixed", // because we use position: fixed
        middleware: [
          offset(5), // spacing from tooltip to dot
          autoPlacement(), // see https://floating-ui.com/docs/autoplacement
        ],
      });
    } else if (evt.type === "mouseleave") {
      hoveredIndex = -1;
    } else if (evt.type === "click") {
      let commit = filteredCommits[index];
      if (!clickedCommits.includes(commit)) {
        // Add the commit to the clickedCommits array
        clickedCommits = [...clickedCommits, commit];
      } else {
        // Remove the commit from the array
        clickedCommits = clickedCommits.filter((c) => c !== commit);
      }
    }
  }
</script>

<h1>Meta</h1>
<div class="stats">
  <h3>Summary Stats</h3><br>
  <dl class="stats">
    
    <dt>Total <abbr title="Lines of code">LOC</abbr></dt>
    <dd>{filteredLines.length}</dd>
    <dt>Num Files</dt>
    <dd>{numFiles}</dd>
    <dt>Num Commits</dt>
    <dd>{filteredCommits.length}</dd>
    <dt>Common Commit Time</dt>
    <dd>{maxPeriod}</dd>
  </dl>
</div>

<!--SLIDER DIV-->
<!-- Add a container for the slider and time display -->
<!-- <div class="slider-container">
  <div class="slider-row">
    <label for="commit-slider">Show Commits Until:</label>
    <input
      type="range"
      min="0"
      max="100"
      step="1"
      bind:value={commitProgress}
    />
  </div>
  <time class="slider-time">
    {commitMaxTime?.toLocaleString("en", {
      dateStyle: "full",
      timeStyle: "short",
    })}
  </time>
</div> -->

<h3>Commits by Time of Day</h3>

<Scrolly
  bind:progress={commitProgress}
  style="--scrolly-viz-width:1fr; --scrolly-text-width:2fr; gap:2rem"
>
  {#each commits as commit, index}
    <p>
      On {commit.datetime.toLocaleString("en", {
        dateStyle: "full",
        timeStyle: "short",
      })},
      {index === 0
        ? "I set forth on my very first commit, beginning a magical journey of code. You can view it "
        : "I added another enchanted commit, each line sparkling with a touch of wonder. See it "}
      <a href={commit.url} target="_blank">
        {index === 0 ? "here" : "here"}
      </a>. This update transformed {commit.totalLines} lines across {d3.rollups(
        commit.lines,
        (D) => D.length,
        (d) => d.file
      ).length} files. With every commit, our project grows into a kingdom of dreams.
    </p>
  {/each}

  <svelte:fragment slot="viz">
    <svg viewBox="0 0 {width} {height}">
      <!--draw axes-->
      <g transform="translate(0, {usableArea.bottom})" bind:this={xAxis} />
      <g
        class="gridlines"
        transform="translate({usableArea.left}, 0)"
        bind:this={yAxisGridlines}
      />
      <g transform="translate({usableArea.left}, 0)" bind:this={yAxis} />

      <!--draw dots-->
      <g class="dots">
        {#each filteredCommits as commit, index (commit.id)}
          <circle
            on:click={(evt) => dotInteraction(index, evt)}
            on:mouseenter={(evt) => dotInteraction(index, evt)}
            on:mouseleave={(evt) => dotInteraction(index, evt)}
            class:selected={clickedCommits.includes(commit)}
            cx={xScale(commit.datetime)}
            cy={yScale(commit.hourFrac)}
            r={rScale(commit.totalLines)}
            fill="steelblue"
          />
        {/each}
      </g>
    </svg>

    <!--Add bar chart-->
    <StackedBar
  data={languageBreakdown}
  width={width * 0.4}
  colorScale={colorScale}
/>

    <dl
      class="info tooltip"
      hidden={hoveredIndex === -1}
      style="top: {tooltipPosition.y}px; left: {tooltipPosition.x}px"
      bind:this={commitTooltip}
    >
      <dt>Commit</dt>
      <dd>
        <a href={hoveredCommit.url} target="_blank">{hoveredCommit.id}</a>
      </dd>

      <dt>Date</dt>
      <dd>
        {hoveredCommit.datetime?.toLocaleString("en", { dateStyle: "full" })}
      </dd>

      <dt>Time</dt>
      <dd>
        {hoveredCommit.datetime?.toLocaleString("en", { timeStyle: "short" })}
      </dd>

      <dt>Author</dt>
      <dd>{hoveredCommit.author}</dd>

      <dt>Lines</dt>
      <dd>{hoveredCommit.totalLines}</dd>
    </dl>
  </svelte:fragment>
</Scrolly>

<Scrolly
  bind:progress={commitProgress}
  --scrolly-layout="viz-first"
  style="--scrolly-viz-width:1fr; --scrolly-text-width:2fr; gap:2rem"
>

  {#each commits as commit, index}
    <p>
      On {commit.datetime.toLocaleString("en", {
        dateStyle: "full",
        timeStyle: "short",
      })},
      {index === 0
        ? "I set forth on my very first commit, beginning a magical journey of code. You can view it "
        : "I added another enchanted commit, each line sparkling with a touch of wonder. See it "}
      <a href={commit.url} target="_blank">
        {index === 0 ? "here" : "here"}
      </a>. This update transformed {commit.totalLines} lines across {d3.rollups(
        commit.lines,
        (D) => D.length,
        (d) => d.file
      ).length} files. With every commit, our project grows into a kingdom of dreams.
    </p>
  {/each}

  <svelte:fragment slot="viz">
    <!--FILELINES-->
    <FileLines lines={filteredLines} svgWidth={0.8 * width} {width} {colorScale} />
  </svelte:fragment>
</Scrolly>

<!--CSS CODE-->
<style>
  svg {
    overflow: visible;
  }

  .gridlines {
    stroke-opacity: 0.2;
  }

  dl.info {
    display: grid;
    grid-template-columns: auto 1fr; /* First column auto-sized, second column takes remaining space */
    gap: 0.5em; /* Add spacing between rows */
    margin: 0; /* Remove default margins */
    padding: 0; /* Remove default padding */

    /* ... other styles ... */
    transition-duration: 500ms;
    transition-property: opacity, visibility;

    &[hidden]:not(:hover, :focus-within) {
      opacity: 0;
      visibility: hidden;
    }
  }

  dl.info dt {
    font-weight: normal; /* Make labels less prominent */
    color: #666; /* Use a lighter color for labels */
    margin: 0; /* Remove default margins */
  }

  dl.info dd {
    font-weight: bold; /* Make values more prominent */
    color: #000; /* Use a darker color for values */
    margin: 0; /* Remove default margins */
  }

  .tooltip {
    position: fixed;
    top: 3em;
    left: 3em;
    background-color: lightgrey;
    border-radius: 2%;
    padding-top: 50px;
    padding-right: 30px;
    padding-bottom: 50px;
    padding-left: 80px;
    box-shadow: 3px 3px 3px lightgray;
  }

  circle {
    transition: 200ms;
    transform-origin: center;
    transform-box: fill-box;

    @starting-style {
      r: 0;
    }

    &:hover {
      transform: scale(1.5);
    }

    &:not(:hover) {
      opacity: 80%;
    }
  }

  .selected {
    fill: lightgreen;
  }

  .slider-container {
    display: grid;
    grid-template-rows: auto auto;
    gap: 0.5em;
    margin: 0.3em auto;
    max-width: 100%;
  }

  .slider-row {
    display: flex;
    align-items: center;
    gap: 0.5em; /* Adjust this value to control the spacing */
  }

  .slider-row label {
    white-space: nowrap; /* Prevent the label from wrapping to a new line */
    margin: 0; /* Remove any default margins */
  }

  .slider-time {
    text-align: center;
    font-size: 0.9em;
  }

  :global(body) {
    max-width: min(120ch, 80vw);
  }

</style>

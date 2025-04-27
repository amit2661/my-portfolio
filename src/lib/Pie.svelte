<script>
    import * as d3 from 'd3';
    export let data = [];
    export let selectedIndex = -1;

    // D3 generators with fixed radius
    let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
    let sliceGenerator = d3.pie().value(d => d.value);

    // Arc data
    let arcData;
    let arcs;
    $: {
        arcData = sliceGenerator(data);
        arcs = arcData.map(d => arcGenerator(d));
    }

    // Dynamic description for accessibility
    $: description = 
      `A pie chart showing project counts by year. ${data.map(
        d => `${d.label}: ${d.value} projects`
      ).join(', ')}.`;

    // Live announcement text
    let liveText = '';

    // Toggle chart vs table view
    let showChart = true;
    function toggleView() {
        showChart = !showChart;
        liveText = showChart
            ? 'Pie chart view shown.'
            : 'Table view shown.';
    }

    // Color-blind safe palette
    $: colors = d3.scaleOrdinal()
        .domain(data.map((_, i) => i))
        .range(d3.quantize(d3.interpolateBlues, data.length));

    // Sort legend indices descending by year
    $: sortedIndices = data
        .map((_, i) => i)
        .sort((a, b) => parseInt(data[b].label) - parseInt(data[a].label));

    // Toggle selection
    function toggleWedge(index, event = {}) {
        if (!event.key || event.key === 'Enter') {
            const newIndex = selectedIndex === index ? -1 : index;
            selectedIndex = newIndex;
            if (newIndex === index) {
                const d = data[index];
                liveText = `${d.label}: ${d.value} projects selected.`;
            }
        }
    }
</script>

<!-- Toggle button -->
<button
  class="toggle-button"
  on:click={toggleView}
  aria-pressed={!showChart}
  aria-label="Toggle between pie chart and table view"
>
  {showChart ? 'Show Table' : 'Show Chart'}
</button>

{#if showChart}
  <div class="container">
    <!-- Pie chart SVG with extra padding for outline -->
    <svg viewBox="-52 -52 104 104" role="img" aria-labelledby="pie-title pie-desc">
      <title id="pie-title">Projects by Year</title>
      <desc id="pie-desc">{description}</desc>
      <circle class="pie-outline" r="50" />
      {#each arcs as arc, index}
        <path
          d={arc}
          fill={colors(index)}
          class:selected={selectedIndex === index}
          tabindex="0"
          role="button"
          aria-label={`${data[index].label}: ${data[index].value}`}
          on:click={e => toggleWedge(index, e)}
          on:keyup={e => toggleWedge(index, e)}
        />
      {/each}
    </svg>
    <!-- Legend next to pie chart -->
    <ul class="legend">
        {#each sortedIndices as idx}
            <li class:selected={selectedIndex === idx}
                on:click={() => toggleWedge(idx)}>
                <span 
                    class="swatch" 
                    style="background-color: {colors(idx)}">
                </span>
                {data[idx].label} <em>({data[idx].value})</em>
            </li>
        {/each}
    </ul>
  </div>
{:else}
  <!-- Data table view -->
  <table aria-label="Table showing project counts by year" class="data-table">
    <caption>Projects by Year</caption>
    <thead>
      <tr>
        <th id="year-header" scope="col">Year</th>
        <th id="projects-header" scope="col">Projects</th>
      </tr>
    </thead>
    <tbody>
      {#each data as d, i}
        <tr>
          <th id={"row-" + i} scope="row">{d.label}</th>
          <td aria-labelledby={"row-" + i + " projects-header"}>{d.value}</td>
        </tr>
      {/each}
    </tbody>
  </table>
{/if}

<!-- Screen-reader live region -->
<p aria-live="polite" class="sr-only">{liveText}</p>

<style>
  /* Toggle button */
  .toggle-button {
    margin-bottom: 1rem;
    padding: 0.5em 1em;
    font-size: 1rem;
    cursor: pointer;
  }

  /* Container arranges chart and legend side by side */
  .container {
    display: flex;
    gap: 2em;
    align-items: center;
  }

  /* SVG size and padding */
  svg {
    max-width: 22em;
    height: auto;
  }

  /* Outline circle for pie */
  .pie-outline {
    stroke: black;
    fill: none;
    stroke-width: 1;
  }

  /* Legend Styling */
  .legend {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(8em, 1fr));
    gap: 1em;
    border: 1px solid black;
    padding: 1em;
    background: white;
    flex: 1;
  }

  /* Individual List Item Styling */
  .legend li {
    display: flex;
    align-items: center;
    gap: 0.5em;
    font-family: sans-serif;
  }

  /* Swatch Styling */
  .swatch {
    display: inline-block;
    width: 1em;
    height: 1em;
    border-radius: 50%;
    border: 1px solid #000;
  }

  /* Interactive pie slice focus/hover */
  path {
    transition: 300ms;
    outline: none;
  }
  svg:hover path:not(:hover),
  svg:focus-visible path:not(:focus-visible) {
    opacity: 50%;
  }
  path:hover,
  path:focus-visible {
    opacity: 100% !important;
  }
  /* Enhanced focus-visible outline */
  path:focus-visible {
    stroke: white;
    stroke-width: 2;
    stroke-dasharray: 4;
  }

  /* Data table styling */
  .data-table {
    margin: 1rem 0;
    border-collapse: collapse;
    width: 100%;
    max-width: 30em;
  }
  .data-table caption {
    font-weight: bold;
    margin-bottom: 0.5em;
    text-align: left;
  }
  .data-table th,
  .data-table td {
    border: 1px solid #ccc;
    padding: 0.5em;
    text-align: left;
  }
  .data-table th {
    background-color: #f0f0f0;
  }

  /* Visually hidden for screen readers */
  .sr-only {
    position: absolute;
    left: -9999px;
    width: 1px;
    height: 1px;
    overflow: hidden;
  }
</style>

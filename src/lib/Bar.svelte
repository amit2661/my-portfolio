<script>
	import * as d3 from 'd3';

	export let data = [];
	export let width = 400;
	export let barHeight = 30;
	export let colorScale;

	let selectedIndex = -1;
	let hoveredIndex = -1;

	const MIN_LABEL_WIDTH = 40; // Minimum width to place label inside

	// Direct mapping from flatRollup-like data: [label, count]
	$: barData = data.map(([label, count]) => ({ label, count }));

	// X scale for bar length
	$: xScale = d3.scaleLinear()
			.domain([0, d3.max(barData, d => d.count) || 1]) // Avoid empty data crash
			.range([0, width]);

	// Color scale for bar colors
	// $: colorScale = d3.scaleOrdinal()
	// 		.domain(barData.map(d => d.label))
	// 		.range(d3.schemeTableau10);
</script>

<div class="container">
	<svg viewBox="0 0 {width} {barHeight * barData.length}">
		{#each barData as d, i (d.label)}
			<rect
					class:selected={selectedIndex === i}
					class:hovered={hoveredIndex === i}
					x="0"
					y={i * barHeight}
					width={xScale(d.count)}
					height={barHeight - 5}
					fill={colorScale(d.label)}
					on:click={() => selectedIndex = selectedIndex === i ? -1 : i}
					on:mouseenter={() => hoveredIndex = i}
					on:mouseleave={() => hoveredIndex = -1}
			/>
			<text
					class="label"
					x={xScale(d.count) > MIN_LABEL_WIDTH ? xScale(d.count) - 5 : xScale(d.count) + 5}
					y={i * barHeight + (barHeight - 5) / 2}
					text-anchor={xScale(d.count) > MIN_LABEL_WIDTH ? "end" : "start"}
					fill={xScale(d.count) > MIN_LABEL_WIDTH ? "white" : "black"}
			>
				{d.label}: {d.count}
			</text>
		{/each}
	</svg>

	<ul class="legend">
		{#each barData as d, i}
			<li
					style="--color: {colorScale(d.label)}"
					class:selected={selectedIndex === i}
					on:click={() => selectedIndex = selectedIndex === i ? -1 : i}
			>
				<span class="swatch"></span>
				{d.label} <em>({d.count})</em>
			</li>
		{/each}
	</ul>
</div>

<style>
	/* ---------- Container Layout ---------- */
	.container {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	/* ---------- Bars ---------- */
	rect {
		/*stroke: white;*/
		transition: all 300ms ease;
		cursor: pointer;
	}

	/* Hover effect */
	rect.hovered {
		opacity: 1;
		/*stroke: black;*/
		stroke-width: 2;
	}

	/* Dim others when hovering */
	svg:has(rect.hovered) rect:not(.hovered) {
		opacity: 0.3;
	}

	/* Selection effect */
	rect.selected {
		/*stroke: black;*/
		stroke-width: 2;
	}

	/* Dim others when selected */
	svg:has(rect.selected) rect:not(.selected) {
		opacity: 0.3;
	}

	/* Combined hover + select */
	rect.selected.hovered {
		/*stroke: black;*/
		stroke-width: 3;
		opacity: 1;
	}

	/* ---------- Labels ---------- */
	.label {
		font-size: 0.75em;
		pointer-events: none;
		dominant-baseline: middle;
		/* Fill is dynamically set */
	}

	/* ---------- Legend ---------- */
	.legend {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(8em, 1fr));
		gap: 0.5em;
		list-style: none;
		padding: 1em;
		margin: 1em 0;
		border: 1px solid;
		background: transparent;
		width: 100%;
		box-sizing: border-box;
		text-align: left;

	}

	/* Legend items */
	.legend li {
		color: var(--color);
		cursor: pointer;
		font-size: 0.85em;
	}

	/* Highlight selected */
	.legend li.selected {
		font-weight: bold;
	}

	/* Dim unselected when one selected */
	.legend:has(.selected) li:not(.selected) {
		color: gray;
		opacity: 0.5;
	}

	/* Swatch */
	.legend li .swatch {
		background: var(--color);
		display: inline-block;
		width: 1em;
		height: 1em;
		border-radius: 0.2em;
		margin-right: 0.25em;
	}

	/* Count formatting */
	.legend em {
		font-style: normal;
		color: gray;
	}
</style>

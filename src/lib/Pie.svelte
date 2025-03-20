<script>
    import * as d3 from 'd3';
    export let data = [];
    export let selectedIndex = -1;

    let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
    
    
    let sliceGenerator = d3.pie().value(d => d.value);
    

    // Define arcData and arcs outside the reactive block
let arcData;
let arcs;

    $: {
		// Reactively calculate arcData and arcs the same way we did before with sliceGenerator and arcGenerator
		arcData = sliceGenerator(data);
		arcs = arcData.map(d => arcGenerator(d));
    }

    let colors = d3.scaleOrdinal(d3.schemeTableau10);
</script>

<div class="container">
  <svg viewBox="-50 -50 100 100">
    {#each arcs as arc, index}
	<path d={arc} fill={ colors(index) }
    class:selected={selectedIndex === index}
    on:click={() => selectedIndex = selectedIndex === index ? -1 : index} />
    {/each}

</svg>

<ul class="legend">
    {#each data as d, index}
        <li class:selected={selectedIndex === index}
        on:click={() => selectedIndex = selectedIndex === index ? -1 : index}>
        <span class="swatch" style="background-color: {colors(index)}"></span>
            {d.label} <em>({d.value})</em>
        </li>
    {/each}
  </ul> 

</div>


<style>
    /* Container Styling */
    .container {
        display: flex;
        gap: 2em; /* Adds spacing between the chart and legend */
        align-items: center; /* Aligns items vertically */
    }

    /* SVG Styling */
    svg {
        max-width: 20em;
        flex-shrink: 0; /* Prevents the chart from shrinking */
    }

    svg:has(path:hover) path:not(:hover) {
	opacity: 50%;
    }

    path:hover {
	opacity: 100% !important;
}


    /* Legend Styling */
    .legend {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(8em, 1fr));
        gap: 1em;
        border: 1px solid black;
        padding: 1em;
        background: white;
        flex: 1; /* Allows the legend to take up remaining space */
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
        border-radius: 50%; /* Makes it a circle */
        border: 1px solid #000; /* Optional: add a border */
    }

 /* When a path is selected, make all non-selected paths 50% opacity */
svg:has(.selected) path:not(.selected) {
   opacity: 50%;
}

.selected {
	--color: oklch(60% 45% 0) !important;
	
	&:is(path) {
		fill: var(--color) !important;
	}
	
	&:is(li) {
		color: var(--color);
	}
}

ul:has(.selected) li:not(.selected) {
	color: gray;
}


</style>

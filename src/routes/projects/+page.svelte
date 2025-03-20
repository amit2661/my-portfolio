<script>
  import projects from "$lib/projects.json";
  import Project from "$lib/Project.svelte";
  import Pie from '$lib/Pie.svelte';
  import * as d3 from 'd3';

  let query = "";

  $: filteredProjects = projects.filter(project => {
      let values = Object.values(project).join("\n").toLowerCase();
      return values.includes(query.toLowerCase());
  });

  $: filteredByYear = filteredProjects.filter(project => {
        if (selectedYear) {
            return project.year === selectedYear;
        }

        return true;
    });

  let selectedYearIndex = -1;
  let pieData = [];

  // Reactive statement to compute pieData from filteredProjects
  $: {
      let rolledData = d3.rollups(filteredProjects, v => v.length, d => d.year);
      pieData = rolledData.map(([year, count]) => ({ value: count, label: year }));
  }

  // Define and bind selectedYear reactively
  $: selectedYear = selectedYearIndex > -1 ? pieData[selectedYearIndex]?.label : null;
</script>

  
<svelte:head>
  <title>Projects</title>
</svelte:head>



<h1> { projects.length } Projects </h1>


<Pie data={pieData} bind:selectedIndex={selectedYearIndex} />
<p>Selected Year: {selectedYear ? selectedYear : "None"}</p>

<br>
<input type="search" bind:value={query}
       aria-label="Search projects" placeholder="🔍 Search projects…" />
<br>
    <!-- <nav>
        <a href="../index.html">Home</a>

        <a href="index.html">Projects</a>
        
        <a href="../Resume/index.html">Resume</a>
        
        <a href="../contact/index.html">Contacts</a>
     
        <a href="https://github.com/amit2661" target="_blank">Github</a>
    </nav> -->
    

    <div class="projects">
        {#each filteredByYear as p}
          <article>
            <Project data={p} />

            
          </article>
        {/each}
    </div>
      
    <style>
      input[type="search"] {
          width: 100%;
          padding: 0.5em;
          font-size: 1em;
          border: 1px solid #ccc;
          border-radius: 4px;
      }
  </style>
  

<script>
    import projects from "$lib/projects.json";
    import Project from "$lib/Project.svelte";
</script>
  
<svelte:head>
  <title>Projects</title>
</svelte:head>


<h1> { projects.length } Projects </h1>

    <!-- <nav>
        <a href="../index.html">Home</a>

        <a href="index.html">Projects</a>
        
        <a href="../Resume/index.html">Resume</a>
        
        <a href="../contact/index.html">Contacts</a>
     
        <a href="https://github.com/amit2661" target="_blank">Github</a>
    </nav> -->

    <div class="projects">
        {#each projects as p}
          <article>
            <Project data={p} />

            
          </article>
        {/each}
    </div>
      

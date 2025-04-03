<script>
    import projects from "$lib/projects.json";
    import Project from "$lib/Project.svelte";
    import { onMount } from "svelte";

let githubData = null;
let loading = true;
let error = null;

onMount(async () => {
	try {
		const response = await fetch("https://api.github.com/users/amit2661");
		githubData = await response.json();
	} catch (err) {
		error = err;
	}
	loading = false;
});
    
</script>


    
    <!-- <h1> (Heading 1) represents the main heading of a webpage or a section.-->
        <h1> Amit- Basics</h1>

        <!-- <p> (Paragraph) represents a paragraph of text.-->
        <p> Created for Data Visualisation class at MIT</p>
    
        <!-- <img> (Image) tag is used to display images.-->
        <img src="images/IMG_6937.jpg" alt="Come with me!">

        
        
        {#if loading}
        <p>Loading...</p>
    {:else if error}
        <p class="error">Something went wrong: {error.message}</p> 
    {:else}
        <section>
            
            <h2>My GitHub Stats</h2>
            <dl class="github-stats">
                <dt>Followers</dt>
                <dd>{githubData.followers}</dd>
                <dt>Following</dt>
                <dd>{githubData.following}</dd>
                <dt>Public Repositories</dt>
                <dd>{githubData.public_repos}</dd>
            </dl>
       
        </section>
    {/if}
    
    
   
    

<style>
    .github-stats {
        display: grid;
        grid-template-columns: repeat(3, 1fr); /* 4 equal columns */
        gap: 10px;
        text-align: center;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 8px;
        max-width: 500px;
        background: #f9f9f9;
    }

    .github-stats dt {
        font-weight: bold;
        grid-row: 1; /* Place all <dt> elements in the first row */
    }

    .github-stats dd {
        grid-row: 2; /* Place all <dd> elements in the second row */
        margin: 0;
        font-size: 1.2em;
        color: #333;
    }
</style>

    
            <!-- Example:
                <img src="images/my_image.jpeg" alt="A description of the image">
            -->
    
        <!-- <nav> (Navigation) is used to create a menu with links to other pages or external sites. -->
        <!-- <Project data={p} hLevel="3" /> -->
   
        <!-- <svelte:element this={"h" + hLevel}> Latest Projects  </svelte:element> -->
        <h2> Latest Projects</h2>
        <div class="projects">
                {#each projects.slice(0, 3) as p}
                  <article>
                    <Project data={p} />
        
                    
                  </article>
                {/each}
            </div>
            
            

        
    
<script>
    import projects from "$lib/projects.json";
    import Project from "$lib/Project.svelte";
</script>

<!-- Start of "body" section  -->

    <!-- <nav> -->
        <!-- Navigation link to the home page -->
        <!-- <a href="index.html">Home</a> -->
            <!--    
                href="index.html" refers to the file that this link will open.
                "Home" is the text that will be displayed as the clickable link.
            -->

        <!-- Complete the navigation as needed following the structure -->
        <!-- <a href="projects/index.html">Projects</a> -->

        <!-- <a href="Resume/index.html">Resume</a> -->
        
        <!-- <a href="contact/index.html">Contacts</a>       -->

        <!-- <a href="https://github.com/amit2661" target="_blank">Github</a> -->
            <!-- Navigation link to the ____ page (inside the "____" folder) -->
        
        <!-- NOTE: to link to external URLs you cna directly use the link at 'href'. Then, you can set target="_blank" to make it always open in a new tab.
            For example:
            <a href="https://www.google.com" target="_blank">Google</a>
        -->
    <!-- </nav>  -->
    
    <!-- <h1> (Heading 1) represents the main heading of a webpage or a section.-->
        <h1> Amit- Basics</h1>

        <!-- <p> (Paragraph) represents a paragraph of text.-->
        <p> Created for Data Visualisation class at MIT</p>
    
        <!-- <img> (Image) tag is used to display images.-->
        <img src="images/IMG_6937.jpg" alt="Come with me!">

        {#await fetch("https://api.github.com/users/amit2661")}
    <p>Loading...</p>
{:then response}
    {#await response.json()}
        <p>Decoding...</p>
    {:then data}
        <section>
            <h2>My GitHub Stats</h2>
            <dl class="github-stats">
                <dt>Followers:</dt>
                <dd>{data.followers}</dd>
                <dt>Following:</dt>
                <dd>{data.following}</dd>
                <dt>Public Repositories:</dt>
                <dd>{data.public_repos}</dd>
                
            </dl>
        </section>
    {:catch error}
        <p class="error">Something went wrong: {error.message}</p>
    {/await}
{:catch error}
    <p class="error">Something went wrong: {error.message}</p>
{/await}

<style>
    .github-stats {
        display: grid;
        grid-template-columns: repeat(4, 1fr); /* 4 equal columns */
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
            
            

        
    
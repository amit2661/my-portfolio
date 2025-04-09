<script>
  export let data = {};
</script>

<article>
  {#if data.url}
    <a href={data.url} target="_blank" rel="noopener noreferrer">
      <h2>{data.title}</h2>
      <img src={data.image} alt={"Screenshot of " + data.title} />
    </a>
  {:else}
    <h2>{data.title}</h2>
    <img src={data.image} alt={"Screenshot of " + data.title} />
  {/if}

  <div>
    <p>{data.description}</p>
    <p class="year">Year: {data.year}</p>

    {#if data.url}
      <p><a href={data.url} target="_blank" rel="noopener noreferrer">🔗 View Project</a></p>
    {/if}
  </div>
</article>

<style>
  div {
    margin-top: 8px;
  }

  p {
    margin: 4px 0;
    font-family: Baskerville, "Palatino Linotype", "Book Antiqua", serif;
  }

  .year {
    font-variant-numeric: oldstyle-nums;
  }

  img {
    max-width: 100%;
    border-radius: 8px;
    margin-top: 0.5em;
  }

  a {
    text-decoration: none;
    color: inherit;
  }

  a:hover {
    text-decoration: underline;
  }
</style>

<script>
  export let data = {};
</script>

<article>
  <h2>{data.title}</h2>
  <img src="{data.image}" alt="" />
  <div>
      <p>{data.description}</p>
      <p>Year:{data.year}</p>
  </div>
</article>

<style>
  div {
      margin-top: 8px;
  }

  p {
      margin: 4px 0;
      font-family: Baskerville, "Palatino Linotype", "Book Antiqua", serif; /* Fallbacks */
  }

  .year {
      font-variant-numeric: oldstyle-nums;
  }
</style>

  <!-- <style>
    article {
    display: grid;
    grid-template-rows: subgrid; /* Aligns rows across articles */
    grid-row: span 3; /* Each article spans 3 rows */
    gap: 0.5em; /* Space between elements inside article */
    padding: 1em;
    border: 1px solid #ccc; /* Optional styling */
    background: #f9f9f9; /* Light background for clarity */
    }
  </style> -->
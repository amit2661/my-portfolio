<script>
    export let data = {};
    // export let hLevel = 2;
</script>

<article>
    <h2>{data.title}</h2>
    <img src="{data.image}" alt="" />
    <p>
        {data.description}
    </p>
  </article>

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
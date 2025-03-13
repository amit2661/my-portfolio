<script>
    import { page } from "$app/stores";
    let pages = [
      { url: "./", title: "Home" },
      { url: "./projects", title: "Projects" },
      { url: "./contact", title: "Contact" },
      { url: "./Resume", title: "Resume" },
      {url: "https://github.com/amit2661", title: "Github"}
      // Add more pages if needed
    ];
  </script>

<nav>
    {#each pages as p}
      <a 
        href="{p.url}" 
        class:current={$page.url.pathname === p.url} 
        target={p.url.startsWith("http") ? "_blank" : null}
      >
        {p.title}
      </a>
    {/each}
  </nav>
  
  <slot /> <!-- Ensures the rest of the page content renders here -->
  
  <style>
    nav {
      display: flex;
      --border-color: oklch(50% 10% 200 / 40%);
      border-bottom: 1px solid var(--border-color);
    }
  
    nav a {
      flex: 1;
      text-decoration: none;
      color: black; /* 🔥 Ensure color is set */
      text-align: center; /* 🔥 Ensures alignment */
      padding: 0.5em;
      margin-top: 1em;
    }
  
    nav a.current {
      border-bottom: 4px solid oklch(80% 3% 200);
      font-weight: bold; /* 🔥 Makes the current tab stand out */
      color: blue; /* 🔥 Change to match your theme */
    }
  
    nav a:hover {
      border-bottom: 4px solid var(--accent-color);
      background-color: color-mix(in oklch, var(--accent-color), canvas 85%);
    }
  </style>
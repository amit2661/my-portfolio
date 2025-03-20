<script>
  import { page } from "$app/stores";
  import { browser } from "$app/environment"; // ✅ Ensure we are in the browser

  let pages = [
  { url: "/", title: "Home" },
  { url: "/projects", title: "Projects" },
  { url: "/contact", title: "Contact" },
  { url: "/Resume", title: "Resume" },
  { url: "/meta", title: "Meta" },
  { url: "https://github.com/amit2661", title: "Github" }
];

  // ✅ Ensure localStorage is available, otherwise use an empty object
  let localStorage = globalThis.localStorage ?? {};

  // ✅ Read from localStorage if available, otherwise default to "light dark"
  let colorScheme = browser ? localStorage.colorScheme ?? "light dark" : "light dark";

  let root = browser ? document.documentElement : null;

  // ✅ Reactively update <html> color scheme
  $: if (browser) root?.style.setProperty("color-scheme", colorScheme);

  // ✅ Reactively save to localStorage whenever `colorScheme` changes
  $: if (browser) localStorage.colorScheme = colorScheme;
</script>

<!-- ✅ Theme Switcher (Bind select value) -->
<div class="color-scheme">
  <label>
    Theme:
    <select bind:value={colorScheme}>
      <option value="light dark">Auto</option>
      <option value="light">Light</option>
      <option value="dark">Dark</option>
    </select>
  </label>
</div>

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

<slot />

<style>
  .color-scheme {
    position: absolute;
    top: 1rem;
    right: 1rem;
    display: inline-flex;
    gap: 5px;
    font-size: 80%;
    padding: 5px 10px;
    border-radius: 5px;
  }

  
  .current {
    font-weight: bold;
    color: blue; /* Adjust color as needed */
  }


</style>

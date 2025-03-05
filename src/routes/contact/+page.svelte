<svelte:head>
  <title>Contact me</title>
</svelte:head>
<h1> Contact Info</h1>

   <!-- <nav>
    <a href="../index.html">Home</a>

    <a href="../projects/index.html">Projects</a>

    <a href="../Resume/index.html">Resume</a>

    <a href="index.html">Contacts</a>

    <a href="https://github.com/amit2661" target="_blank">Github</a>

</nav> -->
<br>

<form action="mailto:amit2661@mit.edu" method="get" >

    <div class="form-example">
      <label for="name">Enter your name: </label>
      <input type="text" name="name" id="name" value="John Doe" required />
    </div>
  
    <div class="form-example">
      <label for="email">Enter your email: </label>
      <input type="email" name="email" id="email" value="john.doe@example.com" required />
    </div>
    
    <label for="body">Please type your message:</label>
    <textarea id="body" name="body" rows="5" cols="33" placeholder= "Hi, I would like to connect!" required></textarea>
  
    
    <button class="favorite styled" type="submit">Submit</button>
  
  </form>
  

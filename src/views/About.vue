<template>
  <div class="about">
    <h1>About ReLab Digital CMA</h1>
    <div class="content">
      <div class="section">
        <h2>Our Mission</h2>
        <p>
          ReLab Digital CMA is dedicated to providing innovative digital solutions
          that help businesses thrive in the modern digital landscape.
        </p>
      </div>

      <div class="section">
        <h2>Technology Stack</h2>
        <ul>
          <li><strong>Frontend:</strong> Vue 3 with Composition API</li>
          <li><strong>Build Tool:</strong> Vite for fast development</li>
          <li><strong>Routing:</strong> Vue Router 4</li>
          <li><strong>Styling:</strong> CSS with scoped components</li>
        </ul>
      </div>

      <div class="section">
        <h2>Contact</h2>
        <p>Get in touch with us to learn more about our services.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
// About page component
</script>

<style scoped>
.about {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

h1 {
  color: #42b883;
  text-align: center;
  margin-bottom: 2rem;
}

.content {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.section {
  margin-bottom: 2rem;
}

.section:last-child {
  margin-bottom: 0;
}

.section h2 {
  color: #646cff;
  margin-bottom: 1rem;
  border-bottom: 2px solid #e9ecef;
  padding-bottom: 0.5rem;
}

.section p {
  color: #666;
  line-height: 1.6;
  margin: 0;
}

.section ul {
  color: #666;
  padding-left: 1.5rem;
}

.section li {
  margin-bottom: 0.5rem;
  line-height: 1.6;
}

.section li strong {
  color: #42b883;
}
</style>


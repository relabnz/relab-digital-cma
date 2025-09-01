<template>
  <div class="home">
    <h1>Welcome to ReLab Digital CMA</h1>
    <p>This is the home page of your Vue 3 application.</p>
    <div class="features">
      <div class="feature-card">
        <h3>Vue 3</h3>
        <p>Built with the latest Vue 3 Composition API</p>
      </div>
      <div class="feature-card">
        <h3>Vite</h3>
        <p>Fast development with Vite build tool</p>
      </div>
      <div class="feature-card">
        <h3>Routing</h3>
        <p>Vue Router 4 for navigation</p>
      </div>
      <div class="feature-card">
        <h3>CMA Preview</h3>
        <p>View saved CMA reports in readonly mode</p>
        <router-link to="/cma-preview" class="preview-link">View CMA Preview</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { RouterLink } from 'vue-router'
</script>

<style scoped>
.home {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  color: #42b883;
  text-align: center;
  margin-bottom: 2rem;
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.feature-card {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: transform 0.2s;
}

.feature-card:hover {
  transform: translateY(-2px);
}

.feature-card h3 {
  color: #646cff;
  margin-bottom: 0.5rem;
}

.feature-card p {
  color: #666;
  margin: 0;
}

.preview-link {
  display: inline-block;
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: #42b883;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-weight: 500;
  transition: background 0.2s;
}

.preview-link:hover {
  background: #369870;
}
</style>


<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div id="app">
    <header>
      <nav>
        <div class="nav-container">
          <div class="logo">
            <h1>ReLab Digital CMA</h1>
          </div>
          <ul class="nav-links">
            <li>
              <RouterLink to="/" class="nav-link">Home</RouterLink>
            </li>
            <li>
              <RouterLink to="/about" class="nav-link">About</RouterLink>
            </li>
            <li>
              <RouterLink to="/cma-preview" class="nav-link">CMA Preview</RouterLink>
            </li>
          </ul>
        </div>
      </nav>
    </header>

    <main>
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

header {
  background: #fff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 70px;
}

.logo h1 {
  margin: 0;
  color: #42b883;
  font-size: 1.5rem;
  font-weight: 600;
}

.nav-links {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 2rem;
}

.nav-link {
  text-decoration: none;
  color: #666;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: all 0.2s;
  position: relative;
}

.nav-link:hover {
  color: #42b883;
  background: #f8f9fa;
}

.nav-link.router-link-active {
  color: #42b883;
  font-weight: 600;
}

.nav-link.router-link-active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 2px;
  background: #42b883;
  border-radius: 1px;
}

main {
  flex: 1;
  padding: 0;
}

/* Responsive design */
@media (max-width: 768px) {
  .nav-container {
    padding: 0 1rem;
  }

  .logo h1 {
    font-size: 1.25rem;
  }

  .nav-links {
    gap: 1rem;
  }

  .nav-link {
    padding: 0.5rem;
    font-size: 0.9rem;
  }
}
</style>

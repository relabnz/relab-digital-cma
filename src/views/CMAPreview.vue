<template>
  <div class="cma-preview-simple">
    <!-- CMA HTML Preview -->
    <div class="cma-html-container" v-if="htmlContent" v-html="htmlContent"></div>

    <!-- Loading state -->
    <div class="loading-container" v-if="isLoading">
      <div class="loading-spinner">
        <i class="fas fa-spinner fa-spin"></i>
        <p>Loading CMA Preview...</p>
      </div>
    </div>

    <!-- Navigation -->
    <div class="preview-navigation">
      <button class="nav-button" @click="$router.push('/')">
        <i class="fas fa-arrow-left"></i>
        Back to Home
      </button>
      <div class="preview-info">
        <span>CMA Report Preview</span>
        <span>35-Lake-Crescent-Hamilton-Lake</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

// Props
const route = useRoute()
const htmlContent = ref('')
const isLoading = ref(true)

// Load CMA HTML file
onMounted(async () => {
  try {
    // Load the CMA HTML file
    const response = await fetch('/35-Lake-Crescent-Hamilton-Lake-2025-09-02-08-48-56.html')
    if (response.ok) {
      const html = await response.text()
      htmlContent.value = html
      isLoading.value = false
    } else {
      console.error('Failed to load CMA HTML file')
      isLoading.value = false
    }
  } catch (error) {
    console.error('Error loading CMA HTML file:', error)
    isLoading.value = false
  }
})
</script>

<style scoped>
/* CMA Fonts - Loaded from HTML file */
@font-face {
  font-family: 'HarcourtsScript';
  src: url('https://relab.blob.core.windows.net/fonts/NewAge/HarcourtsScript.otf') format('opentype');
  font-display: swap;
}

@font-face {
  font-family: 'SourceSansPro-Bold';
  src: url('https://relab.blob.core.windows.net/fonts/NewAge/SourceSansPro-Bold.otf') format('opentype');
  font-display: swap;
}

@font-face {
  font-family: 'SourceSansPro-Regular';
  src: url('https://relab.blob.core.windows.net/fonts/NewAge/SourceSansPro-Regular.otf') format('opentype');
  font-display: swap;
}

@font-face {
  font-family: 'SourceSansPro-Semibold';
  src: url('https://relab.blob.core.windows.net/fonts/NewAge/SourceSansPro-Semibold.otf') format('opentype');
  font-display: swap;
}

/* CMA HTML Preview Container */
.cma-preview-simple {
  min-height: 100vh;
  background: #f5f5f5;
  font-family: 'Roboto', 'Helvetica', 'Arial', sans-serif;
  padding: 20px;
}

/* CMA HTML Content Container */
.cma-html-container {
  max-width: 210mm;
  margin: 0 auto;
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  overflow: auto;
}

/* Override any conflicting styles from the HTML content */
.cma-html-container :deep(*) {
  box-sizing: border-box;
}

/* Loading State */
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  flex-direction: column;
  gap: 16px;
}

.loading-spinner {
  text-align: center;
  color: #667eea;
}

.loading-spinner i {
  font-size: 48px;
  margin-bottom: 16px;
}

.loading-spinner p {
  margin: 0;
  font-size: 16px;
  color: #666;
}

/* Navigation */
.preview-navigation {
  max-width: 210mm;
  margin: 32px auto 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
}

.nav-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  text-decoration: none;
}

.nav-button:hover {
  background: #5a67d8;
}

.nav-button i {
  font-size: 12px;
}

.preview-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
  color: #666;
  text-align: right;
}

.preview-info span {
  font-weight: 500;
}

/* Print Styles */
@media print {
  .cma-preview-simple {
    background: white;
    padding: 0;
  }

  .cma-html-container {
    box-shadow: none;
    max-width: none;
  }

  .preview-navigation {
    display: none;
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .cma-preview-simple {
    padding: 16px;
  }

  .cma-html-container {
    max-width: 100%;
  }

  .preview-navigation {
    flex-direction: column;
    gap: 16px;
  }

  .preview-info {
    text-align: center;
  }
}
</style>

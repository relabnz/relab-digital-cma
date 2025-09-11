<template>
  <div class="cma-preview-simple">
    <!-- CMA HTML Preview -->
    <div class="cma-html-container" v-if="htmlContent" v-html="htmlContent"></div>

    <!-- Loading state -->
    <div class="loading-container" v-if="isLoading">
      <div class="loading-spinner">
        <i class="fas fa-spinner fa-spin"></i>
        <p>{{ loadingMessage }}</p>
      </div>
    </div>

    <!-- Error state -->
    <div class="error-container" v-if="error">
      <div class="error-message">
        <i class="fas fa-exclamation-triangle"></i>
        <h3>{{ error.title }}</h3>
        <p>{{ error.message }}</p>
        <button class="nav-button" @click="goBack">
          <i class="fas fa-home"></i>
          Back to Landing
        </button>
      </div>
    </div>

    <!-- Navigation -->
    <div class="preview-navigation" v-if="!error">
      <button class="nav-button" @click="goBack">
        <i class="fas fa-arrow-left"></i>
        {{ isDebugMode ? 'Back to Landing' : 'Back to Landing' }}
      </button>
      <div class="preview-info">
        <span>{{ getReportType() }}</span>
        <span>{{ reportTitle }}</span>
      </div>
      <!-- PDF Download Button -->
      <button 
        v-if="shareData && shareData.PdfUrl" 
        class="nav-button download-button" 
        @click="downloadPDF"
      >
        <i class="fas fa-download"></i>
        Download PDF
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

// Environment variables
// Create a .env file with:
// VITE_API_BASE_URL=https://api.relab.co.nz
// VITE_CMA_REPORT_BASE_URL=https://relabdevstore.blob.core.windows.net/documents/CMAReport
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.relab.co.nz'
const CMA_REPORT_BASE_URL = import.meta.env.VITE_CMA_REPORT_BASE_URL || 'https://relabdevstore.blob.core.windows.net/documents/CMAReport'

// Props and route
const route = useRoute()
const router = useRouter()
const htmlContent = ref('')
const isLoading = ref(true)
const loadingMessage = ref('Loading CMA Preview...')
const shareData = ref(null)
const error = ref(null)

// Computed properties
const reportTitle = computed(() => {
  if (shareData.value && shareData.value.Guid) {
    return shareData.value.Guid.replace(/-/g, ' ')
  }
  return '35-Lake-Crescent-Hamilton-Lake'
})

// Check if we have a share code in the URL
const shareCode = computed(() => {
  return route.params.shareCode || route.query.shareCode
})

// Check if we're in debug mode
const isDebugMode = computed(() => {
  return route.name === 'CMADebug'
})

// Fetch share data from API
const fetchShareData = async (code) => {
  try {
    loadingMessage.value = 'Verifying share code...'
    const response = await fetch(`${API_BASE_URL}/v1/property/cma-share/${code}`)
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Share code not found or has expired')
      }
      throw new Error('Failed to verify share code')
    }
    
    const data = await response.json()
    return data
  } catch (err) {
    console.error('Error fetching share data:', err)
    throw err
  }
}

// Load HTML content from blob storage
const loadHtmlContent = async (guid) => {
  try {
    loadingMessage.value = 'Loading CMA report...'
    const htmlUrl = `${CMA_REPORT_BASE_URL}/${guid}.html`
    const response = await fetch(htmlUrl)
    
    if (!response.ok) {
      throw new Error('Failed to load CMA report')
    }
    
    const html = await response.text()
    return html
  } catch (err) {
    console.error('Error loading HTML content:', err)
    throw err
  }
}

// Download PDF function
const downloadPDF = () => {
  if (shareData.value && shareData.value.PdfUrl) {
    window.open(shareData.value.PdfUrl, '_blank')
  }
}

// Navigation function
const goBack = () => {
  router.push('/')
}

// Get report type display text
const getReportType = () => {
  if (isDebugMode.value) {
    return 'Debug CMA Preview'
  } else if (shareData.value) {
    return 'Shared CMA Report'
  }
  return 'CMA Report Preview'
}

// Main initialization function
onMounted(async () => {
  try {
    if (shareCode.value) {
      // Handle share code flow
      shareData.value = await fetchShareData(shareCode.value)
      htmlContent.value = await loadHtmlContent(shareData.value.Guid)
    } else if (isDebugMode.value) {
      // Handle debug mode - load local copy
      loadingMessage.value = 'Loading debug CMA preview...'
      const response = await fetch('/35-Lake-Crescent-Hamilton-Lake-2025-09-02-08-48-56.html')
      if (response.ok) {
        htmlContent.value = await response.text()
      } else {
        throw new Error('Failed to load debug CMA HTML file')
      }
    } else {
      // This shouldn't happen with the new routing, but handle gracefully
      throw new Error('No valid CMA source found')
    }
    
    isLoading.value = false
  } catch (err) {
    console.error('Error loading CMA:', err)
    isLoading.value = false
    error.value = {
      title: 'Unable to Load CMA Report',
      message: err.message || 'An unexpected error occurred while loading the CMA report.'
    }
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
  display: flex;
  flex-direction: column;
}

/* CMA HTML Content Container */
.cma-html-container {
  max-width: 210mm;
  margin: 0 auto;
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  overflow: auto;
  flex: 1;
  margin-bottom: 20px;
}

/* Override any conflicting styles from the HTML content */
.cma-html-container :deep(*) {
  box-sizing: border-box;
}

/* Prevent CMA HTML from affecting global layout */
.cma-html-container :deep(html),
.cma-html-container :deep(body) {
  margin: 0;
  padding: 0;
  height: auto;
  min-height: auto;
  position: static;
}

.cma-html-container :deep(head) {
  display: none;
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

/* Error State */
.error-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  flex-direction: column;
  gap: 16px;
}

.error-message {
  text-align: center;
  color: #e53e3e;
  max-width: 500px;
  padding: 32px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.error-message i {
  font-size: 48px;
  margin-bottom: 16px;
  color: #e53e3e;
}

.error-message h3 {
  margin: 0 0 16px 0;
  font-size: 24px;
  color: #2d3748;
}

.error-message p {
  margin: 0 0 24px 0;
  font-size: 16px;
  color: #666;
  line-height: 1.5;
}

/* Navigation */
.preview-navigation {
  max-width: 210mm;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  flex-shrink: 0;
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

.download-button {
  background: #38a169;
}

.download-button:hover {
  background: #2f855a;
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

  .download-button {
    order: -1;
  }
}
</style>

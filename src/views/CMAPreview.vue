<template>
  <div class="cma-preview-simple">
    <!-- CMA HTML Preview -->
    <div class="cma-html-container" v-if="htmlContent" v-html="htmlContent"></div>

    <!-- Loading state -->
    <LoadingSpinner v-if="isLoading" :message="loadingMessage" />

    <!-- Error state -->
    <ErrorDisplay
      v-if="error"
      :title="error.title"
      :message="error.message"
      @action="goBack"
    />

    <!-- Navigation -->
    <NavigationBar
      v-if="!error"
      :back-button-text="isDebugMode ? 'Back to Landing' : 'Back to Landing'"
      :report-type="getReportType()"
      :report-title="reportTitle"
      :show-download-button="true"
      :pdf-url="shareData?.PdfUrl || ''"
      :is-preview-mode="isPreviewMode"
      @back="goBack"
      @download="downloadPDF"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import LoadingSpinner from '../components/LoadingSpinner.vue'
import ErrorDisplay from '../components/ErrorDisplay.vue'
import NavigationBar from '../components/NavigationBar.vue'

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

// Check if we're in preview mode (when we have a share code, not debug)
const isPreviewMode = computed(() => {
  return shareCode.value && !isDebugMode.value
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
}
</style>

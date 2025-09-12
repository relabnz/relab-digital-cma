<template>
  <div class="cma-preview-simple">
    <!-- Navigation Menu -->
    <div class="cma-navigation" v-if="htmlContent && navigationSections.length > 0">
      <h3>CMA Sections</h3>
      <ul class="nav-list">
        <li v-for="section in navigationSections" :key="section.id">
          <a @click="scrollToSection(section.id)" :href="`#${section.id}`">
            {{ section.title }}
          </a>
        </li>
      </ul>
    </div>

    <!-- Responsive Controls -->
    <div class="responsive-controls" v-if="htmlContent">
      <div class="zoom-controls">
        <button 
          @click="adjustZoom(-0.1)" 
          class="zoom-btn" 
          :disabled="currentZoom <= 0.3"
          title="Zoom Out (Ctrl + -)"
        >
          <i class="fas fa-search-minus"></i>
        </button>
        <span class="zoom-display" title="Current zoom level">{{ Math.round(currentZoom * 100) }}%</span>
        <button 
          @click="adjustZoom(0.1)" 
          class="zoom-btn" 
          :disabled="currentZoom >= 2.0"
          title="Zoom In (Ctrl + +)"
        >
          <i class="fas fa-search-plus"></i>
        </button>
        <button 
          @click="resetZoom" 
          class="zoom-btn reset-btn"
          title="Reset to Optimal Zoom (Ctrl + 0)"
        >
          <i class="fas fa-expand-arrows-alt"></i>
        </button>
      </div>
    </div>

    <!-- CMA HTML Preview with Responsive Wrapper -->
    <div class="cma-html-container" v-if="htmlContent">
      <div 
        class="cma-responsive-wrapper" 
        :style="{ 
          transform: `scale(${currentZoom})`, 
          transformOrigin: 'top center',
          width: `${100 / currentZoom}%`
        }"
        v-html="htmlContent"
      ></div>
    </div>

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
import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue'
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
const navigationSections = ref([])
const currentZoom = ref(1)
const baseZoom = ref(1)

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

// Load digital CMA content from API
const loadDigitalCmaContent = async (guid) => {
  try {
    loadingMessage.value = 'Loading CMA report...'
    const apiUrl = `${API_BASE_URL}/v1/report/digital-cma/${guid}`
    const response = await fetch(apiUrl)
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('CMA report not found')
      }
      throw new Error('Failed to load CMA report')
    }
    
    const data = await response.json()
    return processDigitalCmaData(data)
  } catch (err) {
    console.error('Error loading digital CMA content:', err)
    throw err
  }
}

// Process digital CMA data from API
const processDigitalCmaData = (data) => {
  // Create HTML structure with header and body parts
  const headerHtml = data.Header || ''
  const bodyParts = data.Body || []
  
  // Create a complete HTML document
  const htmlContent = `
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          ${headerHtml}
          
          /* Additional Digital CMA Styles */
          .digital-cma .edit-feature {
            display: none !important;
          }
          
          .digital-cma-display .cma-section {
            scroll-margin-top: 20px;
            border-bottom: 1px solid #e0e0e0;
            margin-bottom: 20px;
            padding-bottom: 20px;
          }
          
          .digital-cma-display .cma-section:last-child {
            border-bottom: none;
          }
          
          /* Responsive CMA Content */
          .cma-page {
            max-width: 100% !important;
            width: 794px !important;
            height: auto !important;
            min-height: 1123px;
            margin: 0 auto !important;
            box-sizing: border-box !important;
          }
          
          /* Ensure content doesn't overflow */
          .cma-responsive-wrapper * {
            max-width: 100% !important;
            box-sizing: border-box !important;
          }
        </style>
      </head>
      <body class="digital-cma digital-cma-display">
        ${bodyParts.join('\n')}
      </body>
    </html>
  `
  
  // Parse the HTML to extract navigation sections
  const parser = new DOMParser()
  const doc = parser.parseFromString(htmlContent, 'text/html')
  
  // Extract navigation sections
  const sections = doc.querySelectorAll('[data-section-id]')
  const navSections = []
  
  sections.forEach(section => {
    const id = section.getAttribute('data-section-id')
    const title = section.getAttribute('data-section-title')
    if (id && title) {
      navSections.push({ id, title })
    }
  })
  
  navigationSections.value = navSections
  
  return htmlContent
}

// Process HTML content for digital CMA display (legacy method for debug mode)
const processHtmlForDigitalCMA = (html) => {
  // Create a temporary DOM element to parse the HTML
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  
  // Extract navigation sections
  const sections = doc.querySelectorAll('[data-section-id]')
  const navSections = []
  
  sections.forEach(section => {
    const id = section.getAttribute('data-section-id')
    const title = section.getAttribute('data-section-title')
    if (id && title) {
      navSections.push({ id, title })
    }
  })
  
  navigationSections.value = navSections
  
  // Add CSS classes for digital CMA styling
  const style = doc.createElement('style')
  style.textContent = `
    /* Digital CMA Styles */
    .digital-cma .edit-feature {
      display: none !important;
    }
    
    .digital-cma-display .cma-section:not(.cma-first-page) .cma-header {
      display: none !important;
    }
    
    .digital-cma-display .cma-section:not(.cma-first-page) [data-cma-element="header"] {
      display: none !important;
    }
    
    /* Show only first page header */
    .digital-cma-display .cma-first-page .cma-header,
    .digital-cma-display .cma-first-page [data-cma-element="header"] {
      display: block !important;
    }
    
    /* Section styling */
    .digital-cma-display .cma-section {
      scroll-margin-top: 20px;
      border-bottom: 1px solid #e0e0e0;
      margin-bottom: 20px;
      padding-bottom: 20px;
    }
    
    .digital-cma-display .cma-section:last-child {
      border-bottom: none;
    }
  `
  
  doc.head.appendChild(style)
  
  // Add digital CMA class to body
  if (doc.body) {
    doc.body.classList.add('digital-cma-display')
  }
  
  return doc.documentElement.outerHTML
}

// Scroll to section function
const scrollToSection = (sectionId) => {
  const element = document.getElementById(sectionId)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
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

// Zoom control functions
const calculateOptimalZoom = () => {
  const container = document.querySelector('.cma-html-container')
  if (!container) return 1

  const containerWidth = container.clientWidth
  const contentWidth = 794 // Fixed width from CMA export
  const maxZoom = Math.min(containerWidth / contentWidth, 1.2) // Don't exceed 120% on auto-fit
  
  return Math.max(0.3, Math.min(maxZoom, 1)) // Ensure zoom is between 30% and 100%
}

const adjustZoom = (delta) => {
  const newZoom = Math.max(0.3, Math.min(2.0, currentZoom.value + delta))
  currentZoom.value = Math.round(newZoom * 10) / 10 // Round to 1 decimal place
}

const resetZoom = () => {
  currentZoom.value = baseZoom.value
}

const setOptimalZoom = () => {
  baseZoom.value = calculateOptimalZoom()
  currentZoom.value = baseZoom.value
}

// Main initialization function
onMounted(async () => {
  try {
    if (shareCode.value) {
      // Handle share code flow - use new API
      shareData.value = await fetchShareData(shareCode.value)
      htmlContent.value = await loadDigitalCmaContent(shareData.value.Guid)
    } else if (isDebugMode.value) {
      // Handle debug mode - load local copy (legacy method)
      loadingMessage.value = 'Loading debug CMA preview...'
      const response = await fetch('/35-Lake-Crescent-Hamilton-Lake-2025-09-02-08-48-56.html')
      if (response.ok) {
        const html = await response.text()
        htmlContent.value = processHtmlForDigitalCMA(html)
      } else {
        throw new Error('Failed to load debug CMA HTML file')
      }
    } else {
      // This shouldn't happen with the new routing, but handle gracefully
      throw new Error('No valid CMA source found')
    }
    
    isLoading.value = false
    
    // Set optimal zoom after content is loaded
    await nextTick()
    setOptimalZoom()
    
    // Add window resize listener for responsive behavior
    const handleResize = () => {
      setOptimalZoom()
    }
    window.addEventListener('resize', handleResize)
    
    // Add keyboard shortcuts for zoom control
    const handleKeydown = (event) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case '=':
          case '+':
            event.preventDefault()
            adjustZoom(0.1)
            break
          case '-':
            event.preventDefault()
            adjustZoom(-0.1)
            break
          case '0':
            event.preventDefault()
            resetZoom()
            break
        }
      }
    }
    window.addEventListener('keydown', handleKeydown)
    
    // Cleanup on unmount
    onUnmounted(() => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('keydown', handleKeydown)
    })
    
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
/* CMA Fonts - Now loaded from header in HTML content */

/* CMA HTML Preview Container */
.cma-preview-simple {
  min-height: 100vh;
  background: #f5f5f5;
  font-family: 'Roboto', 'Helvetica', 'Arial', sans-serif;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

/* Navigation Menu Styles */
.cma-navigation {
  position: fixed;
  top: 20px;
  right: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 16px;
  max-width: 250px;
  z-index: 1000;
  max-height: 70vh;
  overflow-y: auto;
}

.cma-navigation h3 {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 8px;
}

.nav-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-list li {
  margin-bottom: 4px;
}

.nav-list a {
  display: block;
  padding: 8px 12px;
  text-decoration: none;
  color: #555;
  border-radius: 4px;
  font-size: 14px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.nav-list a:hover {
  background-color: #f0f8ff;
  color: #2196f3;
  transform: translateX(2px);
}

.nav-list a:active {
  background-color: #e3f2fd;
}

/* Responsive Controls */
.responsive-controls {
  position: fixed;
  top: 20px;
  left: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 12px;
  z-index: 1001;
  border: 1px solid #e0e0e0;
}

.zoom-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.zoom-btn {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 8px 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  color: #495057;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 36px;
  height: 36px;
}

.zoom-btn:hover:not(:disabled) {
  background: #e9ecef;
  border-color: #adb5bd;
  transform: translateY(-1px);
}

.zoom-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.zoom-btn.reset-btn {
  background: #2196f3;
  color: white;
  border-color: #2196f3;
}

.zoom-btn.reset-btn:hover:not(:disabled) {
  background: #1976d2;
  border-color: #1976d2;
}

.zoom-display {
  font-weight: 600;
  color: #495057;
  font-size: 14px;
  min-width: 50px;
  text-align: center;
}

/* CMA HTML Content Container */
.cma-html-container {
  width: 100%;
  margin: 0 auto;
  background: #f5f5f5;
  overflow: auto;
  flex: 1;
  margin-bottom: 20px;
  padding: 20px;
  display: flex;
  justify-content: center;
}

/* Responsive Wrapper for CMA Content */
.cma-responsive-wrapper {
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-radius: 4px;
  overflow: hidden;
  transition: transform 0.3s ease;
  transform-origin: top center;
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
    padding: 8px;
  }

  .cma-html-container {
    padding: 10px;
  }

  .cma-navigation {
    position: relative;
    top: auto;
    right: auto;
    margin-bottom: 20px;
    max-width: 100%;
  }

  .responsive-controls {
    position: relative;
    top: auto;
    left: auto;
    margin-bottom: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .zoom-controls {
    justify-content: center;
  }

  .zoom-btn {
    min-width: 32px;
    height: 32px;
    padding: 6px 8px;
    font-size: 12px;
  }

  .zoom-display {
    font-size: 12px;
    min-width: 45px;
  }
}

@media (max-width: 480px) {
  .cma-preview-simple {
    padding: 4px;
  }

  .cma-html-container {
    padding: 8px;
  }

  .responsive-controls {
    padding: 8px;
    margin-bottom: 12px;
  }

  .zoom-controls {
    gap: 6px;
  }

  .zoom-btn {
    min-width: 28px;
    height: 28px;
    padding: 4px 6px;
    font-size: 11px;
  }

  .zoom-display {
    font-size: 11px;
    min-width: 40px;
  }
}
</style>

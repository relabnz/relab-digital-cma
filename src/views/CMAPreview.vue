<template>
  <div class="cma-preview-simple">
    <!-- Fixed CMA Header -->
    <div class="cma-fixed-header" v-if="cmaHeaderHtml">
      <div v-html="cmaHeaderHtml"></div>
    </div>

    <!-- Navigation Toggle Button -->
    <button 
      v-if="htmlContent && navigationSections.length > 0"
      @click="isNavigationVisible = !isNavigationVisible"
      class="nav-toggle-btn"
      :class="{ 'active': isNavigationVisible }"
      title="Toggle Navigation Menu"
    >
      <i class="fas fa-bars" v-if="!isNavigationVisible"></i>
      <i class="fas fa-times" v-else></i>
      <span class="nav-toggle-text">{{ isNavigationVisible ? 'Close' : 'Menu' }}</span>
    </button>

    <!-- Navigation Menu -->
    <div 
      class="cma-navigation" 
      v-if="htmlContent && navigationSections.length > 0"
      :class="{ 'visible': isNavigationVisible }"
    >
      <div class="nav-header">
        <h3>CMA Sections</h3>
        <button @click="isNavigationVisible = false" class="nav-close-btn">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <ul class="nav-list">
        <li v-for="section in navigationSections" :key="section.id">
          <a @click.prevent="scrollToSection(section.id); isNavigationVisible = false" href="#" class="nav-link">
            {{ section.title }}
          </a>
        </li>
      </ul>
    </div>

    <!-- Navigation Overlay -->
    <div 
      v-if="isNavigationVisible && htmlContent && navigationSections.length > 0"
      class="nav-overlay"
      @click="isNavigationVisible = false"
    ></div>

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

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.relab.co.nz'

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
const cmaTitle = ref('')
const cmaHeaderHtml = ref('')
const isNavigationVisible = ref(false)

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
    console.log('Loading CMA from URL:', apiUrl)
    
    const response = await fetch(apiUrl)
    
    if (!response.ok) {
      console.error('API Response error:', response.status, response.statusText)
      if (response.status === 404) {
        throw new Error('CMA report not found')
      }
      throw new Error(`Failed to load CMA report: ${response.status} ${response.statusText}`)
    }
    
    const data = await response.json()
    console.log('API Response received:', {
      hasHeader: !!data.Header,
      headerLength: data.Header?.length || 0,
      bodyCount: data.Body?.length || 0
    })
    
    return processDigitalCmaData(data)
  } catch (err) {
    console.error('Error loading digital CMA content:', err)
    throw err
  }
}

// Process digital CMA data from API
const processDigitalCmaData = (data) => {
  console.log('Processing CMA data:', data)
  
  // Extract header and body from API response
  const headerContent = data.Header || ''
  const bodyParts = data.Body || []
  
  console.log('Header content length:', headerContent.length)
  console.log('Body parts count:', bodyParts.length)
  
  // Extract the first page header for fixed display
  let firstPageHeader = ''
  if (bodyParts.length > 0) {
    const parser = new DOMParser()
    const firstPageDoc = parser.parseFromString(bodyParts[0], 'text/html')
    const headerElement = firstPageDoc.querySelector('[data-cma-element="header"]')
    if (headerElement) {
      firstPageHeader = headerElement.outerHTML
    }
  }
  
  // Set the CMA header for fixed display
  cmaHeaderHtml.value = firstPageHeader
  
  // Extract section titles and track seen titles to avoid duplicates
  const sectionTitles = []
  const seenSectionTitles = new Set()
  
  bodyParts.forEach((bodyHtml, index) => {
    const parser = new DOMParser()
    const doc = parser.parseFromString(bodyHtml, 'text/html')
    const headerElement = doc.querySelector('[data-cma-element="header"] .text-header-element')
    
    let title = ''
    if (headerElement) {
      title = headerElement.textContent.trim()
    }
    
    // Only add unique section titles
    if (title && !seenSectionTitles.has(title)) {
      seenSectionTitles.add(title)
      sectionTitles.push({ index, title })
    } else {
      // For duplicate titles, just track the index without title
      sectionTitles.push({ index, title: null })
    }
  })
  
  // Process body parts and add section labels
  const processedBodyParts = bodyParts.map((bodyHtml, index) => {
    const parser = new DOMParser()
    const doc = parser.parseFromString(bodyHtml, 'text/html')
    
    // Handle property image for first page
    if (index === 0) {
      const propertyImage = doc.querySelector('#property-image, .cma-property-photo')
      if (propertyImage && data.RawJsonData) {
        try {
          const rawData = JSON.parse(data.RawJsonData)
          if (rawData.ReportCustomization?.customSubjectImage) {
            propertyImage.src = rawData.ReportCustomization.customSubjectImage
          }
        } catch (e) {
          console.warn('Could not parse RawJsonData for property image:', e)
        }
      }
    }
    
    // Remove the original header
    const headerElement = doc.querySelector('[data-cma-element="header"]')
    if (headerElement) {
      headerElement.remove()
    }
    
    // Add section label if this is the first occurrence of this section
    const sectionInfo = sectionTitles[index]
    let content = doc.body ? doc.body.innerHTML : bodyHtml
    
    if (sectionInfo && sectionInfo.title) {
      content = `<div class="section-label">${sectionInfo.title}</div>${content}`
    }
    
    return content
  })
  
  // Create a complete HTML document with proper structure
  // Load header first (contains fonts and CSS), then body content
  const htmlContent = `
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          /* Load header styles first - contains fonts and base CMA styles */
          ${headerContent}
          
          /* Additional Digital CMA Display Styles */
          .digital-cma .edit-feature {
            display: none !important;
          }
          
          /* Global rule to hide all edit features */
          .edit-feature {
            display: none !important;
          }
          
          /* Hide all CMA headers - we'll create custom section labels */
          .cma-page-wrapper [data-cma-element="header"] {
            display: none !important;
          }
          
          /* Style for custom section labels */
          .section-label {
            background: #f8f9fa;
            border-left: 4px solid #285791;
            padding: 15px 20px;
            margin: 0 0 20px 0;
            font-size: 18px;
            font-weight: 600;
            color: #285791;
            font-family: 'Nexa-Light', sans-serif;
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
          
          /* A4 Page styling like in relab-web-app */
          .cma-page-wrapper {
            width: 21cm;
            min-height: 29.7cm;
            margin: 0 auto 20px auto;
            background: white;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            border-radius: 4px;
            overflow: hidden;
            position: relative;
          }
          
          /* Ensure proper spacing between pages */
          .cma-page-wrapper:not(:last-child) {
            margin-bottom: 30px;
          }
          
          /* Page content styling */
          .cma-page {
            width: 21cm;
            min-height: 29.7cm;
            margin: 0;
            padding: 0;
            overflow: hidden;
          }
        </style>
      </head>
      <body class="digital-cma digital-cma-display">
        ${processedBodyParts.map((bodyHtml, index) => `
          <div class="cma-page-wrapper" id="page-${index + 1}" data-page="${index + 1}">
            ${bodyHtml}
          </div>
        `).join('\n')}
      </body>
    </html>
  `
  
  // Extract navigation sections from body parts
  const parser = new DOMParser()
  const navSections = []
  const seenTitles = new Set() // Track seen titles to avoid duplicates
  
  bodyParts.forEach((bodyHtml, index) => {
    // Parse each body part to extract title
    const doc = parser.parseFromString(bodyHtml, 'text/html')
    const headerElement = doc.querySelector('[data-cma-element="header"] .text-header-element')
    
    let title = ''
    if (headerElement) {
      title = headerElement.textContent.trim()
    }
    
    // If no title found, create a generic page title
    if (!title || title.length === 0) {
      title = `Page ${index + 1}`
    }
    
    // Only add if we haven't seen this title before (avoid duplicates)
    if (!seenTitles.has(title)) {
      seenTitles.add(title)
      const id = `page-${index + 1}`
      navSections.push({ id, title })
    }
  })
  
  console.log('Navigation sections found:', navSections)
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
  console.log('Scrolling to section:', sectionId)
  
  // First try to find by exact ID
  const element = document.getElementById(sectionId)
  if (element) {
    console.log('Found element by ID:', element)
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    return
  }
  
  // Fallback: try to find by page number if section ID not found
  const pageNumber = sectionId.replace('page-', '')
  const pageElement = document.querySelector(`[data-page="${pageNumber}"]`)
  if (pageElement) {
    console.log('Found element by page number:', pageElement)
    pageElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
    return
  }
  
  // Additional fallback: try to find the page wrapper with the ID
  const pageWrapper = document.querySelector(`.cma-page-wrapper#${sectionId}`)
  if (pageWrapper) {
    console.log('Found page wrapper:', pageWrapper)
    pageWrapper.scrollIntoView({ behavior: 'smooth', block: 'start' })
    return
  }
  
  console.warn('Could not find element for section:', sectionId)
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
  display: flex;
  flex-direction: column;
}

/* Fixed CMA Header */
.cma-fixed-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: white;
  z-index: 900; /* Lower z-index so navigation can appear above it */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-bottom: 1px solid #e0e0e0;
  max-height: 120px;
  overflow: hidden;
}

/* Add top padding to main content to account for fixed header */
.cma-html-container {
  padding-top: 120px; /* Adjust based on header height */
  width: 100%;
  margin: 0 auto;
  background: #f5f5f5;
  overflow: auto;
  flex: 1;
  margin-bottom: 20px;
  padding-left: 20px;
  padding-right: 20px;
  padding-bottom: 20px;
  display: flex;
  justify-content: center;
}

/* A4 sizing for large screens */
@media (min-width: 1024px) {
  .cma-html-container {
    max-width: 21cm; /* A4 width */
  }
  
  .cma-responsive-wrapper {
    width: 21cm !important;
    transform: none !important;
  }
}

/* Responsive adjustments for smaller screens */
@media (max-width: 1023px) {
  .cma-page-wrapper {
    width: 100% !important;
    min-height: auto !important;
    margin: 0 0 20px 0 !important;
  }
  
  .cma-page {
    width: 100% !important;
    min-height: auto !important;
  }
}

/* Navigation Toggle Button */
.nav-toggle-btn {
  position: fixed;
  top: 130px; /* Below the fixed header */
  right: 20px;
  background: #2196f3;
  color: white;
  border: none;
  border-radius: 50px;
  padding: 12px 16px;
  cursor: pointer;
  z-index: 1100; /* Higher z-index */
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
}

.nav-toggle-btn:hover {
  background: #1976d2;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(33, 150, 243, 0.4);
}

.nav-toggle-btn.active {
  background: #f44336;
}

.nav-toggle-btn.active:hover {
  background: #d32f2f;
}

.nav-toggle-text {
  font-size: 12px;
}

/* Navigation Menu Styles */
.cma-navigation {
  position: fixed;
  top: 130px;
  right: -300px; /* Hidden by default */
  width: 280px;
  height: calc(100vh - 150px);
  background: white;
  border-radius: 8px 0 0 8px;
  box-shadow: -4px 0 12px rgba(0, 0, 0, 0.15);
  z-index: 1050; /* Higher z-index than header */
  transition: right 0.3s ease;
  display: flex;
  flex-direction: column;
}

.cma-navigation.visible {
  right: 0;
}

.nav-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
  background: #f8f9fa;
  border-radius: 8px 0 0 0;
}

.nav-close-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  font-size: 16px;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.nav-close-btn:hover {
  background: #e9ecef;
  color: #333;
}

/* Navigation Overlay */
.nav-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 1040; /* Between header and navigation */
  transition: opacity 0.3s ease;
}

.cma-navigation h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.nav-list {
  list-style: none;
  margin: 0;
  padding: 16px;
  flex: 1;
  overflow-y: auto;
}

.nav-list li {
  margin-bottom: 4px;
}

.nav-list a {
  display: block;
  padding: 12px 16px;
  text-decoration: none;
  color: #555;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.2s ease;
  cursor: pointer;
  border-left: 3px solid transparent;
}

.nav-list a:hover {
  background-color: #f0f8ff;
  color: #2196f3;
  border-left-color: #2196f3;
  transform: translateX(4px);
}

.nav-list a:active {
  background-color: #e3f2fd;
}

/* Responsive Controls */
.responsive-controls {
  position: fixed;
  top: 130px; /* Below the fixed header */
  left: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 12px;
  z-index: 1100; /* Same as toggle button */
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

/* CMA HTML Content Container - removed duplicate, using the one above with A4 sizing */

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
  .cma-html-container {
    padding-top: 140px;
    padding-left: 8px;
    padding-right: 8px;
    padding-bottom: 10px;
  }

  .nav-toggle-btn {
    top: 140px;
    right: 10px;
    padding: 10px 14px;
    font-size: 12px;
  }

  .nav-toggle-text {
    display: none;
  }

  .cma-navigation {
    top: 140px;
    width: 100%;
    right: -100%;
    border-radius: 0;
    height: calc(100vh - 160px);
  }

  .cma-navigation.visible {
    right: 0;
  }

  .responsive-controls {
    top: 140px;
    left: 10px;
    padding: 8px;
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

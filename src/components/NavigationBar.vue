<template>
  <!-- Regular Navigation Bar -->
  <div v-if="!isPreviewMode" class="preview-navigation">
    <button class="nav-button" @click="$emit('back')">
      <i class="fas fa-arrow-left"></i>
      {{ backButtonText }}
    </button>
    <div class="preview-info">
      <span>{{ reportType }}</span>
      <span>{{ reportTitle }}</span>
    </div>
    <button
      v-if="showDownloadButton && pdfUrl"
      class="nav-button download-button"
      @click="$emit('download', pdfUrl)"
    >
      <i class="fas fa-download"></i>
      Download PDF
    </button>
  </div>

  <!-- Floating PDF Button for Preview Mode -->
  <button
    v-if="isPreviewMode && showDownloadButton && pdfUrl"
    class="floating-pdf-button"
    @click="$emit('download', pdfUrl)"
    title="Download PDF"
  >
    <i class="fas fa-download"></i>
  </button>
</template>

<script setup>
defineProps({
  backButtonText: {
    type: String,
    default: 'Back to Landing'
  },
  reportType: {
    type: String,
    default: 'CMA Report'
  },
  reportTitle: {
    type: String,
    default: ''
  },
  showDownloadButton: {
    type: Boolean,
    default: true
  },
  pdfUrl: {
    type: String,
    default: ''
  },
  isPreviewMode: {
    type: Boolean,
    default: false
  }
})

defineEmits(['back', 'download'])
</script>

<style scoped>
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

/* Floating PDF Button */
.floating-pdf-button {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 60px;
  height: 60px;
  background: #38a169;
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 20px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(56, 161, 105, 0.4);
  transition: all 0.3s ease;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.floating-pdf-button:hover {
  background: #2f855a;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(56, 161, 105, 0.5);
}

.floating-pdf-button:active {
  transform: translateY(0);
}

/* Responsive Design */
@media (max-width: 768px) {
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

  .floating-pdf-button {
    bottom: 20px;
    right: 20px;
    width: 50px;
    height: 50px;
    font-size: 18px;
  }
}
</style>

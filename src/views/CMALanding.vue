<template>
  <div class="cma-landing">
    <!-- Background Elements -->
    <div class="background-elements">
      <div class="bg-circle bg-circle-1"></div>
      <div class="bg-circle bg-circle-2"></div>
      <div class="bg-circle bg-circle-3"></div>
    </div>

    <!-- Header Section -->
    <div class="landing-header">
      <div class="header-content">
        <div class="logo-section">
          <img :src="`/content/images/main_logo_blk.svg`" alt="Relab Logo" class="relab-logo" />
        </div>
        <h1 class="main-title Beatrice-Medium">
          Digital CMA Portal
        </h1>
        <p class="subtitle">Enter your share code to view your Comparative Market Analysis report</p>
      </div>
    </div>

    <!-- Main Content -->
    <div class="main-content">
      <div class="access-card">
        <div class="card-header">
          <div class="icon-wrapper">
            <i class="fas fa-chart-line"></i>
          </div>
          <h2 class="Beatrice-Medium">Access Your CMA Report</h2>
          <p>Enter the 8-digit code provided to you</p>
        </div>

        <div class="input-section">
          <div class="input-group">
            <label for="shareCode">Share Code</label>
            <div class="input-wrapper">
              <input
                id="shareCode"
                v-model="shareCode"
                type="text"
                placeholder="Enter 8-digit code"
                maxlength="8"
                class="share-input"
                :class="{ 'error': hasError, 'valid': isValidCode && !hasError }"
                @input="handleInput"
                @keyup.enter="accessReport"
              />
              <div class="input-icon">
                <i v-if="isValidCode && !hasError" class="fas fa-check"></i>
                <i v-else-if="hasError" class="fas fa-times"></i>
                <i v-else class="fas fa-key"></i>
              </div>
            </div>
            <div v-if="hasError" class="error-message">
              <i class="fas fa-exclamation-triangle"></i>
              {{ errorMessage }}
            </div>
          </div>

          <button
            class="access-button"
            :class="{ 'loading': isLoading, 'disabled': !isValidCode }"
            :disabled="!isValidCode || isLoading"
            @click="accessReport"
          >
            <span class="button-content">
              <i v-if="isLoading" class="fas fa-spinner fa-spin"></i>
              <i v-else class="fas fa-arrow-right"></i>
              {{ isLoading ? 'Accessing Report...' : 'Access Report' }}
            </span>
          </button>
        </div>

        <div class="help-section">
          <div class="help-item">
            <div class="help-icon">
              <i class="fas fa-info-circle"></i>
            </div>
            <span>Share codes are 8 digits long</span>
          </div>
          <div class="help-item">
            <div class="help-icon">
              <i class="far fa-clock"></i>
            </div>
            <span>Codes may expire after a certain period</span>
          </div>
          <div class="help-item">
            <div class="help-icon">
              <i class="fas fa-shield-alt"></i>
            </div>
            <span>Your data is secure and encrypted</span>
          </div>
        </div>
      </div>

      <!-- Features Section -->
      <div class="features-section">
        <h3 class="Beatrice-Medium">What's included in your report:</h3>
        <div class="features-grid">
          <div class="feature-item">
            <div class="feature-icon">
              <i class="fas fa-home"></i>
            </div>
            <div class="feature-content">
              <h4>Property Analysis</h4>
              <p>Detailed property information and valuation insights</p>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">
              <i class="fas fa-chart-line"></i>
            </div>
            <div class="feature-content">
              <h4>Market Trends</h4>
              <p>Comprehensive market analysis and comparable sales</p>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">
              <i class="fas fa-download"></i>
            </div>
            <div class="feature-content">
              <h4>PDF Download</h4>
              <p>Professional report ready for sharing and printing</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="landing-footer">
      <p>Powered by <strong>Relab</strong> - Digital CMA Portal</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Reactive data
const shareCode = ref('')
const isLoading = ref(false)
const hasError = ref(false)
const errorMessage = ref('')

// Computed properties
const isValidCode = computed(() => {
  return shareCode.value.length === 8 && /^\d{8}$/.test(shareCode.value)
})

// Methods
const handleInput = () => {
  // Clear error when user starts typing
  if (hasError.value) {
    hasError.value = false
    errorMessage.value = ''
  }
  
  // Auto-format: only allow digits
  shareCode.value = shareCode.value.replace(/\D/g, '')
}

const accessReport = async () => {
  if (!isValidCode.value || isLoading.value) return

  isLoading.value = true
  hasError.value = false
  
  try {
    // Navigate to the share route
    await router.push(`/${shareCode.value}`)
  } catch (error) {
    hasError.value = true
    errorMessage.value = 'Failed to access report. Please try again.'
    isLoading.value = false
  }
}
</script>

<style scoped>
/* Relab Fonts - loaded from CDN in index.html */
.Beatrice-Medium {
  font-family: "Beatrice-Medium", "Segoe UI", sans-serif;
  font-weight: 500;
}

/* Main Container */
.cma-landing {
  min-height: 100vh;
  background: #f4f2f0;
  display: flex;
  flex-direction: column;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  position: relative;
  overflow-x: hidden;
}

/* Background Elements */
.background-elements {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.bg-circle {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(135deg, #23b5af, rgba(35, 181, 175, 0.3));
  opacity: 0.1;
}

.bg-circle-1 {
  width: 300px;
  height: 300px;
  top: -150px;
  right: -150px;
}

.bg-circle-2 {
  width: 200px;
  height: 200px;
  bottom: 20%;
  left: -100px;
}

.bg-circle-3 {
  width: 150px;
  height: 150px;
  top: 60%;
  right: 10%;
}

/* Header */
.landing-header {
  padding: 40px 20px 30px;
  text-align: center;
  color: #2d3748;
  position: relative;
  z-index: 1;
}

.header-content {
  max-width: 600px;
  margin: 0 auto;
}

.logo-section {
  margin-bottom: 24px;
}

.relab-logo {
  height: 32px;
  width: auto;
}

.main-title {
  font-size: 2.5rem;
  font-weight: 500;
  margin-bottom: 16px;
  color: #2d3748;
  line-height: 1.2;
}

.subtitle {
  font-size: 1.1rem;
  opacity: 0.8;
  margin: 0;
  font-weight: 400;
  color: #4a5568;
}

/* Main Content */
.main-content {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 20px;
  gap: 40px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  position: relative;
  z-index: 1;
}

/* Access Card */
.access-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07), 0 1px 3px rgba(0, 0, 0, 0.06);
  padding: 40px;
  width: 100%;
  max-width: 480px;
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.access-card:hover {
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1), 0 4px 10px rgba(0, 0, 0, 0.06);
  transform: translateY(-2px);
}

.card-header {
  text-align: center;
  margin-bottom: 32px;
}

.icon-wrapper {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #23b5af, #1a9d97);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  box-shadow: 0 4px 12px rgba(35, 181, 175, 0.3);
}

.icon-wrapper i {
  font-size: 24px;
  color: white;
}

.card-header h2 {
  font-size: 1.6rem;
  color: #2d3748;
  margin-bottom: 8px;
  font-weight: 500;
}

.card-header p {
  color: #718096;
  margin: 0;
  font-size: 0.95rem;
}

/* Input Section */
.input-section {
  margin-bottom: 32px;
}

.input-group {
  margin-bottom: 24px;
}

.input-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #2d3748;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.input-wrapper {
  position: relative;
  display: flex;
  justify-content: center;
}

.share-input {
  width: 100%;
  max-width: 280px;
  margin: 0 auto;
  padding: 12px 45px 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  text-align: center;
  letter-spacing: 1px;
  font-weight: 600;
  transition: all 0.3s ease;
  background: #f8fafc;
  font-family: 'Courier New', monospace;
}

.share-input:focus {
  outline: none;
  border-color: #23b5af;
  background: white;
  box-shadow: 0 0 0 3px rgba(35, 181, 175, 0.1);
}

.share-input.error {
  border-color: #e53e3e;
  background: #fed7d7;
}

.share-input.valid {
  border-color: #23b5af;
  background: #f0fffe;
}

.input-icon {
  position: absolute;
  right: calc(50% - 140px + 12px);
  top: 50%;
  transform: translateY(-50%);
  color: #a0aec0;
  transition: all 0.3s ease;
}

.share-input.valid + .input-icon {
  color: #23b5af;
}

.share-input.error + .input-icon {
  color: #e53e3e;
}

.error-message {
  margin-top: 8px;
  color: #e53e3e;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

.access-button {
  width: 100%;
  padding: 16px 24px;
  background: #23b5af;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.access-button:hover:not(.disabled) {
  background: #1a9d97;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(35, 181, 175, 0.3);
}

.access-button.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.access-button.loading {
  cursor: wait;
}

.button-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

/* Help Section */
.help-section {
  border-top: 1px solid #e2e8f0;
  padding-top: 24px;
}

.help-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 16px;
  color: #718096;
  font-size: 0.9rem;
}

.help-icon {
  width: 20px;
  height: 20px;
  background: #f7fafc;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;
}

.help-icon i {
  color: #23b5af;
  font-size: 10px;
}

/* Features Section */
.features-section {
  background: white;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07), 0 1px 3px rgba(0, 0, 0, 0.06);
  max-width: 400px;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.features-section h3 {
  color: #2d3748;
  margin-bottom: 24px;
  font-size: 1.2rem;
  font-weight: 500;
}

.features-grid {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.feature-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.feature-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #23b5af, #1a9d97);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.feature-icon i {
  color: white;
  font-size: 16px;
}

.feature-content h4 {
  margin: 0 0 4px 0;
  color: #2d3748;
  font-size: 1rem;
  font-weight: 600;
}

.feature-content p {
  margin: 0;
  color: #718096;
  font-size: 0.9rem;
  line-height: 1.4;
}

/* Footer */
.landing-footer {
  text-align: center;
  padding: 30px 20px;
  color: #718096;
  font-size: 0.9rem;
  position: relative;
  z-index: 1;
}

.landing-footer strong {
  color: #23b5af;
}

/* Responsive Design */
@media (max-width: 768px) {
  .main-title {
    font-size: 2rem;
  }

  .subtitle {
    font-size: 1rem;
  }

  .main-content {
    flex-direction: column;
    align-items: center;
    gap: 24px;
    padding: 16px;
  }

  .access-card {
    padding: 24px;
    margin: 0 16px;
    max-width: none;
    width: 100%;
  }

  .features-section {
    max-width: none;
    width: 100%;
    margin: 0 16px;
  }

  .landing-header {
    padding: 24px 16px 16px;
  }

  .bg-circle-1 {
    width: 200px;
    height: 200px;
    top: -100px;
    right: -100px;
  }

  .share-input {
    max-width: 240px;
  }

  .input-icon {
    right: calc(50% - 120px + 12px);
  }
}

@media (max-width: 480px) {
  .main-title {
    font-size: 1.6rem;
    line-height: 1.3;
  }

  .subtitle {
    font-size: 0.9rem;
    padding: 0 16px;
  }

  .access-card {
    padding: 20px 16px;
    margin: 0 12px;
  }

  .features-section {
    padding: 20px 16px;
    margin: 0 12px;
  }

  .share-input {
    max-width: 200px;
    font-size: 0.9rem;
    padding: 12px 40px 12px 12px;
  }

  .input-icon {
    right: calc(50% - 100px + 10px);
  }

  .card-header h2 {
    font-size: 1.4rem;
  }

  .features-section h3 {
    font-size: 1.1rem;
  }

  .feature-content h4 {
    font-size: 0.9rem;
  }

  .feature-content p {
    font-size: 0.8rem;
  }

  .relab-logo {
    height: 28px;
  }

  .landing-header {
    padding: 20px 12px 12px;
  }

  .main-content {
    padding: 12px;
  }
}

@media (max-width: 360px) {
  .share-input {
    max-width: 180px;
  }

  .input-icon {
    right: calc(50% - 90px + 8px);
  }

  .access-card {
    margin: 0 8px;
    padding: 16px 12px;
  }

  .features-section {
    margin: 0 8px;
    padding: 16px 12px;
  }
}
</style>

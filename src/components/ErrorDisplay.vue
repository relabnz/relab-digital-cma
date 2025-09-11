<template>
  <div class="error-container">
    <div class="error-message">
      <i class="fas fa-exclamation-triangle"></i>
      <h3>{{ title }}</h3>
      <p>{{ message }}</p>
      <button v-if="showButton" class="nav-button" @click="$emit('action')">
        <i class="fas fa-home"></i>
        {{ buttonText }}
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: 'Error'
  },
  message: {
    type: String,
    default: 'An unexpected error occurred.'
  },
  showButton: {
    type: Boolean,
    default: true
  },
  buttonText: {
    type: String,
    default: 'Go Back'
  }
})

defineEmits(['action'])
</script>

<style scoped>
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
</style>

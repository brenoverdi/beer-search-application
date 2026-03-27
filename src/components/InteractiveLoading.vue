<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const steps = [
  { text: 'Gathering malts...', emoji: '🌾' },
  { text: 'Boiling the wort...', emoji: '🔥' },
  { text: 'Adding hops...', emoji: '🌿' },
  { text: 'Pitching yeast...', emoji: '🦠' },
  { text: 'Fermenting...', emoji: '🫧' },
  { text: 'Ready to pour!', emoji: '🍻' }
]

const currentStep = ref(0)

onMounted(() => {
  const interval = setInterval(() => {
    // Loop through steps repeatedly for a continuous loading state
    currentStep.value = (currentStep.value + 1) % steps.length
  }, 800)
  
  onUnmounted(() => {
    clearInterval(interval)
  })
})
</script>

<template>
  <div class="flex flex-col items-center justify-center p-8">
    <div class="relative w-20 h-20 bg-amber-500 rounded-full flex items-center justify-center shadow-lg transform transition-transform animate-pulse">
      <div class="text-4xl animate-bounce">
        {{ steps[currentStep].emoji }}
      </div>
      
      <!-- Liquid fill animation -->
      <div 
        class="absolute bottom-0 left-0 w-full bg-amber-300 rounded-b-full transition-all duration-800 opacity-50"
        :style="{ height: `${((currentStep + 1) / steps.length) * 100}%` }"
      ></div>
    </div>
    
    <div class="mt-4 text-amber-600 font-bold tracking-wide min-h-[1.5rem] transition-colors">
      {{ steps[currentStep].text }}
    </div>
  </div>
</template>

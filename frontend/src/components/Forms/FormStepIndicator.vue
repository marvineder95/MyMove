<template>
  <div class="w-full py-6">
    <div class="flex items-center justify-between">
      <div
        v-for="(label, index) in stepLabels"
        :key="index"
        class="flex flex-1 items-center"
        :class="{ 'flex-none': index === stepLabels.length - 1 }"
      >
        <!-- Step Circle -->
        <div class="flex flex-col items-center">
          <div
            class="flex h-10 w-10 items-center justify-center rounded-full border-2 font-semibold transition-all duration-300"
            :class="{
              'border-primary-600 bg-primary-600 text-white': index + 1 === currentStep,
              'border-primary-600 bg-white text-primary-600': index + 1 < currentStep,
              'border-gray-300 bg-white text-gray-400': index + 1 > currentStep,
            }"
          >
            <template v-if="index + 1 < currentStep">
              <svg
                class="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </template>
            <template v-else>
              {{ index + 1 }}
            </template>
          </div>
          <span
            class="mt-2 text-xs font-medium transition-colors duration-300"
            :class="{
              'text-primary-600': index + 1 === currentStep,
              'text-gray-500': index + 1 !== currentStep,
            }"
          >
            {{ label }}
          </span>
        </div>

        <!-- Connector Line -->
        <div
          v-if="index < stepLabels.length - 1"
          class="mx-4 h-0.5 flex-1 transition-colors duration-300"
          :class="{
            'bg-primary-600': index + 1 < currentStep,
            'bg-gray-300': index + 1 >= currentStep,
          }"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  currentStep: number;
  totalSteps: number;
  stepLabels: string[];
}

defineProps<Props>();
</script>

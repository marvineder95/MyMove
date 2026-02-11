<template>
  <div class="mx-auto w-full max-w-2xl rounded-lg bg-white p-8 shadow-lg">
    <!-- Header -->
    <div class="mb-6 text-center">
      <h2 class="text-2xl font-bold text-gray-900">
        {{ $t('offer.form.title') }}
      </h2>
      <p class="mt-2 text-gray-600">
        {{ $t('offer.form.subtitle') }}
      </p>
    </div>

    <!-- Success Message -->
    <div
      v-if="submitSuccess"
      class="rounded-lg bg-green-50 p-6 text-center"
    >
      <div class="mb-4 flex justify-center">
        <div class="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <svg
            class="h-8 w-8 text-green-600"
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
        </div>
      </div>
      <h3 class="mb-2 text-xl font-semibold text-green-800">
        {{ $t('offer.form.success.title') }}
      </h3>
      <p class="mb-4 text-green-700">
        {{ $t('offer.form.success.message') }}
      </p>
      <button
        class="rounded-lg bg-green-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-700"
        @click="resetForm"
      >
        {{ $t('offer.form.success.newOffer') }}
      </button>
    </div>

    <!-- Error Alert -->
    <div
      v-else-if="errorMessage"
      class="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-700"
      role="alert"
    >
      <div class="flex items-center">
        <svg
          class="mr-2 h-5 w-5 flex-shrink-0"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fill-rule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
            clip-rule="evenodd"
          />
        </svg>
        {{ errorMessage }}
      </div>
    </div>

    <!-- Form -->
    <form v-else @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Addresses Section -->
      <div class="grid gap-6 md:grid-cols-2">
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">
            {{ $t('offer.form.fields.fromAddress') }}
          </label>
          <textarea
            v-model="form.fromAddress"
            rows="3"
            class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            :placeholder="$t('offer.form.placeholders.fromAddress')"
            :class="{ 'border-red-500 focus:border-red-500 focus:ring-red-500/20': errors.fromAddress }"
            @blur="validateFromAddress"
          />
          <p v-if="errors.fromAddress" class="text-sm text-red-600">
            {{ errors.fromAddress }}
          </p>
        </div>

        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">
            {{ $t('offer.form.fields.toAddress') }}
          </label>
          <textarea
            v-model="form.toAddress"
            rows="3"
            class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            :placeholder="$t('offer.form.placeholders.toAddress')"
            :class="{ 'border-red-500 focus:border-red-500 focus:ring-red-500/20': errors.toAddress }"
            @blur="validateToAddress"
          />
          <p v-if="errors.toAddress" class="text-sm text-red-600">
            {{ errors.toAddress }}
          </p>
        </div>
      </div>

      <!-- Date and Move Size -->
      <div class="grid gap-6 md:grid-cols-2">
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">
            {{ $t('offer.form.fields.moveDate') }}
          </label>
          <input
            v-model="form.moveDate"
            type="date"
            class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            :class="{ 'border-red-500 focus:border-red-500 focus:ring-red-500/20': errors.moveDate }"
            :min="minDate"
            @blur="validateMoveDate"
          />
          <p v-if="errors.moveDate" class="text-sm text-red-600">
            {{ errors.moveDate }}
          </p>
        </div>

        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">
            {{ $t('offer.form.fields.moveSize') }}
          </label>
          <select
            v-model="form.moveSize"
            class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            :class="{ 'border-red-500 focus:border-red-500 focus:ring-red-500/20': errors.moveSize }"
            @blur="validateMoveSize"
          >
            <option value="">
              {{ $t('offer.form.placeholders.moveSize') }}
            </option>
            <option
              v-for="option in moveSizeOptions"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>
          <p v-if="errors.moveSize" class="text-sm text-red-600">
            {{ errors.moveSize }}
          </p>
        </div>
      </div>

      <!-- Contact Information -->
      <div class="border-t border-gray-200 pt-6">
        <h3 class="mb-4 text-lg font-semibold text-gray-800">
          {{ $t('offer.form.contactSection') }}
        </h3>
        <div class="grid gap-6 md:grid-cols-2">
          <FormInput
            v-model="form.name"
            :label="$t('offer.form.fields.name')"
            :placeholder="$t('offer.form.placeholders.name')"
            :error="errors.name"
            required
            @blur="validateName"
          />

          <FormInput
            v-model="form.email"
            type="email"
            :label="$t('offer.form.fields.email')"
            :placeholder="$t('offer.form.placeholders.email')"
            :error="errors.email"
            required
            @blur="validateEmail"
          />

          <FormInput
            v-model="form.phone"
            type="tel"
            :label="$t('offer.form.fields.phone')"
            :placeholder="$t('offer.form.placeholders.phone')"
            :error="errors.phone"
            required
            @blur="validatePhone"
          />
        </div>
      </div>

      <!-- Notes -->
      <div class="space-y-2">
        <label class="block text-sm font-medium text-gray-700">
          {{ $t('offer.form.fields.notes') }}
        </label>
        <textarea
          v-model="form.notes"
          rows="4"
          class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          :placeholder="$t('offer.form.placeholders.notes')"
        />
      </div>

      <!-- Submit Button -->
      <button
        type="submit"
        class="flex w-full items-center justify-center rounded-lg bg-primary-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
        :disabled="isLoading"
      >
        <svg
          v-if="isLoading"
          class="mr-2 h-5 w-5 animate-spin"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          />
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        {{ isLoading ? $t('common.loading') : $t('offer.form.submit') }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useOfferStore } from '@/stores/offer';
import FormInput from '@/components/UI/FormInput.vue';

const { t } = useI18n();
const offerStore = useOfferStore();

const isLoading = ref(false);
const submitSuccess = ref(false);
const errorMessage = ref('');

interface OfferForm {
  fromAddress: string;
  toAddress: string;
  moveDate: string;
  moveSize: string;
  name: string;
  email: string;
  phone: string;
  notes: string;
}

interface OfferErrors {
  fromAddress?: string;
  toAddress?: string;
  moveDate?: string;
  moveSize?: string;
  name?: string;
  email?: string;
  phone?: string;
}

const form = reactive<OfferForm>({
  fromAddress: '',
  toAddress: '',
  moveDate: '',
  moveSize: '',
  name: '',
  email: '',
  phone: '',
  notes: '',
});

const errors = reactive<OfferErrors>({});

const minDate = computed(() => {
  const today = new Date();
  return today.toISOString().split('T')[0];
});

const moveSizeOptions = computed(() => [
  { value: 'small', label: t('offer.moveSize.small') },
  { value: 'studio', label: t('offer.moveSize.studio') },
  { value: '1room', label: t('offer.moveSize.1room') },
  { value: '2room', label: t('offer.moveSize.2room') },
  { value: '3room', label: t('offer.moveSize.3room') },
  { value: '4room', label: t('offer.moveSize.4room') },
  { value: 'house', label: t('offer.moveSize.house') },
  { value: 'office', label: t('offer.moveSize.office') },
]);

const validateFromAddress = (): boolean => {
  errors.fromAddress = '';
  if (!form.fromAddress.trim()) {
    errors.fromAddress = t('offer.form.errors.fromAddressRequired');
    return false;
  }
  return true;
};

const validateToAddress = (): boolean => {
  errors.toAddress = '';
  if (!form.toAddress.trim()) {
    errors.toAddress = t('offer.form.errors.toAddressRequired');
    return false;
  }
  return true;
};

const validateMoveDate = (): boolean => {
  errors.moveDate = '';
  if (!form.moveDate) {
    errors.moveDate = t('offer.form.errors.moveDateRequired');
    return false;
  }
  const selectedDate = new Date(form.moveDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (selectedDate < today) {
    errors.moveDate = t('offer.form.errors.moveDateInvalid');
    return false;
  }
  return true;
};

const validateMoveSize = (): boolean => {
  errors.moveSize = '';
  if (!form.moveSize) {
    errors.moveSize = t('offer.form.errors.moveSizeRequired');
    return false;
  }
  return true;
};

const validateName = (): boolean => {
  errors.name = '';
  if (!form.name.trim()) {
    errors.name = t('offer.form.errors.nameRequired');
    return false;
  }
  return true;
};

const validateEmail = (): boolean => {
  errors.email = '';
  if (!form.email.trim()) {
    errors.email = t('offer.form.errors.emailRequired');
    return false;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = t('offer.form.errors.emailInvalid');
    return false;
  }
  return true;
};

const validatePhone = (): boolean => {
  errors.phone = '';
  if (!form.phone.trim()) {
    errors.phone = t('offer.form.errors.phoneRequired');
    return false;
  }
  return true;
};

const validateForm = (): boolean => {
  const validations = [
    validateFromAddress(),
    validateToAddress(),
    validateMoveDate(),
    validateMoveSize(),
    validateName(),
    validateEmail(),
    validatePhone(),
  ];
  return validations.every(Boolean);
};

const resetForm = () => {
  form.fromAddress = '';
  form.toAddress = '';
  form.moveDate = '';
  form.moveSize = '';
  form.name = '';
  form.email = '';
  form.phone = '';
  form.notes = '';
  submitSuccess.value = false;
  errorMessage.value = '';
};

const handleSubmit = async () => {
  errorMessage.value = '';

  if (!validateForm()) return;

  isLoading.value = true;

  try {
    await offerStore.createOffer({
      fromAddress: form.fromAddress as any,  // <-- Hier
      toAddress: form.toAddress as any,      // <-- und hier
      moveDate: form.moveDate,
      moveSize: form.moveSize,
      name: form.name,
      email: form.email,
      phone: form.phone,
      notes: form.notes,
    });
    submitSuccess.value = true;
  } catch (error: any) {
    errorMessage.value = error.message || t('offer.form.errors.generic');
  } finally {
    isLoading.value = false;
  }
};
</script>

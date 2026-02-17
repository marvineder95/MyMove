<template>
  <div class="mx-auto w-full max-w-2xl rounded-lg bg-white p-8 shadow-lg">
    <!-- Header -->
    <h2 class="mb-2 text-center text-2xl font-bold text-gray-900">
      {{ $t('auth.register.title') }}
    </h2>
    <p class="mb-6 text-center text-gray-600">
      {{ $t('auth.register.subtitle') }}
    </p>

    <!-- Step Indicator -->
    <FormStepIndicator
      :current-step="currentStep"
      :total-steps="totalSteps"
      :step-labels="stepLabels"
    />

    <!-- Success Message -->
    <div
      v-if="registrationSuccess"
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
        {{ $t('auth.register.success.title') }}
      </h3>
      <p class="text-green-700">
        {{ $t('auth.register.success.message') }}
      </p>
    </div>

    <!-- Form -->
    <form v-else @submit.prevent="handleSubmit">
      <!-- Step 1: Company Data -->
      <div v-if="currentStep === 1" class="space-y-4">
        <h3 class="mb-4 text-lg font-semibold text-gray-800">
          {{ $t('auth.register.steps.company') }}
        </h3>
        <FormInput
          v-model="form.companyName"
          :label="$t('auth.register.fields.companyName')"
          :placeholder="$t('auth.register.placeholders.companyName')"
          :error="errors.companyName"
          required
          @blur="validateStep1"
        />
        <FormInput
          v-model="form.email"
          type="email"
          :label="$t('auth.register.fields.email')"
          :placeholder="$t('auth.register.placeholders.email')"
          :error="errors.email"
          required
          @blur="validateStep1"
        />
        <FormInput
          v-model="form.password"
          type="password"
          :label="$t('auth.register.fields.password')"
          :placeholder="$t('auth.register.placeholders.password')"
          :error="errors.password"
          required
          @blur="validateStep1"
        />
        <FormInput
          v-model="form.confirmPassword"
          type="password"
          :label="$t('auth.register.fields.confirmPassword')"
          :placeholder="$t('auth.register.placeholders.confirmPassword')"
          :error="errors.confirmPassword"
          required
          @blur="validateStep1"
        />
      </div>

      <!-- Step 2: Address -->
      <div v-if="currentStep === 2" class="space-y-4">
        <h3 class="mb-4 text-lg font-semibold text-gray-800">
          {{ $t('auth.register.steps.address') }}
        </h3>
        <FormInput
          v-model="form.addressLine"
          :label="$t('auth.register.fields.addressLine')"
          :placeholder="$t('auth.register.placeholders.addressLine')"
          :error="errors.addressLine"
          required
          @blur="validateStep2"
        />
        <div class="grid grid-cols-2 gap-4">
          <FormInput
            v-model="form.postalCode"
            :label="$t('auth.register.fields.postalCode')"
            :placeholder="$t('auth.register.placeholders.postalCode')"
            :error="errors.postalCode"
            required
            @blur="validateStep2"
          />
          <FormInput
            v-model="form.city"
            :label="$t('auth.register.fields.city')"
            :placeholder="$t('auth.register.placeholders.city')"
            :error="errors.city"
            required
            @blur="validateStep2"
          />
        </div>
        <FormInput
          v-model="form.country"
          :label="$t('auth.register.fields.country')"
          :placeholder="$t('auth.register.placeholders.country')"
          :error="errors.country"
          required
          @blur="validateStep2"
        />
      </div>

      <!-- Step 3: Contact -->
      <div v-if="currentStep === 3" class="space-y-4">
        <h3 class="mb-4 text-lg font-semibold text-gray-800">
          {{ $t('auth.register.steps.contact') }}
        </h3>
        <FormInput
          v-model="form.phone"
          type="tel"
          :label="$t('auth.register.fields.phone')"
          :placeholder="$t('auth.register.placeholders.phone')"
          :error="errors.phone"
          required
          @blur="validateStep3"
        />
        <FormInput
          v-model="form.website"
          type="url"
          :label="$t('auth.register.fields.website')"
          :placeholder="$t('auth.register.placeholders.website')"
          :error="errors.website"
          @blur="validateStep3"
        />
      </div>

      <!-- Step 4: Services -->
      <div v-if="currentStep === 4" class="space-y-4">
        <h3 class="mb-4 text-lg font-semibold text-gray-800">
          {{ $t('auth.register.steps.services') }}
        </h3>
        <p class="mb-4 text-sm text-gray-600">
          {{ $t('auth.register.services.description') }}
        </p>
        <div class="space-y-3">
          <label
            v-for="service in availableServices"
            :key="service.value"
            class="flex cursor-pointer items-center rounded-lg border p-4 transition-colors hover:bg-gray-50"
            :class="{
              'border-primary-500 bg-primary-50': form.services.includes(service.value),
              'border-gray-200': !form.services.includes(service.value),
            }"
          >
            <input
              v-model="form.services"
              type="checkbox"
              :value="service.value"
              class="h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span class="ml-3 text-gray-700">{{ service.label }}</span>
          </label>
        </div>
        <p v-if="errors.services" class="text-sm text-red-600">
          {{ errors.services }}
        </p>
      </div>

      <!-- Step 5: Trade License -->
      <div v-if="currentStep === 5" class="space-y-4">
        <h3 class="mb-4 text-lg font-semibold text-gray-800">
          {{ $t('auth.register.steps.license') }}
        </h3>
        <p class="mb-4 text-sm text-gray-600">
          {{ $t('auth.register.license.description') }}
        </p>
        <FileUpload
          v-model="form.tradeLicense"
          :label="$t('auth.register.fields.tradeLicense')"
          :placeholder="$t('auth.register.placeholders.tradeLicense')"
          :error="errors.tradeLicense"
          accept=".pdf,.jpg,.jpeg,.png"
          :max-size="10 * 1024 * 1024"
          @upload="handleFileUpload"
        />
      </div>

      <!-- Navigation Buttons -->
      <div class="mt-8 flex justify-between">
        <button
          v-if="currentStep > 1"
          type="button"
          class="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          @click="prevStep"
        >
          {{ $t('common.back') }}
        </button>
        <div v-else />

        <button
          v-if="currentStep < totalSteps"
          type="button"
          class="rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-700"
          @click="nextStep"
        >
          {{ $t('common.next') }}
        </button>

        <button
          v-else
          type="submit"
          class="flex items-center rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="isLoading"
        >
          <svg
            v-if="isLoading"
            class="mr-2 h-4 w-4 animate-spin"
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
          {{ isLoading ? $t('common.loading') : $t('auth.register.submit') }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/stores/auth';
import FormInput from '@/components/UI/FormInput.vue';
import FileUpload from '@/components/UI/FileUpload.vue';
import FormStepIndicator from './FormStepIndicator.vue';

const { t } = useI18n();
const authStore = useAuthStore();

const currentStep = ref(1);
const totalSteps = 5;
const isLoading = ref(false);
const registrationSuccess = ref(false);

const stepLabels = computed(() => [
  t('auth.register.steps.company'),
  t('auth.register.steps.address'),
  t('auth.register.steps.contact'),
  t('auth.register.steps.services'),
  t('auth.register.steps.license'),
]);

const availableServices = computed(() => [
  { value: 'transport', label: t('auth.register.services.transport') },
  { value: 'packing', label: t('auth.register.services.packing') },
  { value: 'storage', label: t('auth.register.services.storage') },
  { value: 'cleaning', label: t('auth.register.services.cleaning') },
]);

interface FormData {
  companyName: string;
  email: string;
  password: string;
  confirmPassword: string;
  addressLine: string;
  postalCode: string;
  city: string;
  country: string;
  phone: string;
  website: string;
  services: string[];
  tradeLicense: File | null;
}

interface FormErrors {
  companyName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  addressLine?: string;
  postalCode?: string;
  city?: string;
  country?: string;
  phone?: string;
  website?: string;
  services?: string;
  tradeLicense?: string;
}

const form = reactive<FormData>({
  companyName: '',
  email: '',
  password: '',
  confirmPassword: '',
  addressLine: '',
  postalCode: '',
  city: '',
  country: '',
  phone: '',
  website: '',
  services: [],
  tradeLicense: null,
});

const errors = reactive<FormErrors>({});

const validateStep1 = (): boolean => {
  let isValid = true;
  errors.companyName = '';
  errors.email = '';
  errors.password = '';
  errors.confirmPassword = '';

  if (!form.companyName.trim()) {
    errors.companyName = t('auth.register.errors.companyNameRequired');
    isValid = false;
  }

  if (!form.email.trim()) {
    errors.email = t('auth.register.errors.emailRequired');
    isValid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = t('auth.register.errors.emailInvalid');
    isValid = false;
  }

  if (!form.password) {
    errors.password = t('auth.register.errors.passwordRequired');
    isValid = false;
  } else if (form.password.length < 8) {
    errors.password = t('auth.register.errors.passwordMinLength');
    isValid = false;
  }

  if (form.password !== form.confirmPassword) {
    errors.confirmPassword = t('auth.register.errors.passwordsMismatch');
    isValid = false;
  }

  return isValid;
};

const validateStep2 = (): boolean => {
  let isValid = true;
  errors.addressLine = '';
  errors.postalCode = '';
  errors.city = '';
  errors.country = '';

  if (!form.addressLine.trim()) {
    errors.addressLine = t('auth.register.errors.addressLineRequired');
    isValid = false;
  }

  if (!form.postalCode.trim()) {
    errors.postalCode = t('auth.register.errors.postalCodeRequired');
    isValid = false;
  }

  if (!form.city.trim()) {
    errors.city = t('auth.register.errors.cityRequired');
    isValid = false;
  }

  if (!form.country.trim()) {
    errors.country = t('auth.register.errors.countryRequired');
    isValid = false;
  }

  return isValid;
};

const validateStep3 = (): boolean => {
  let isValid = true;
  errors.phone = '';
  errors.website = '';

  if (!form.phone.trim()) {
    errors.phone = t('auth.register.errors.phoneRequired');
    isValid = false;
  }

  if (form.website && !/^https?:\/\/.+/.test(form.website)) {
    errors.website = t('auth.register.errors.websiteInvalid');
    isValid = false;
  }

  return isValid;
};

const validateStep4 = (): boolean => {
  errors.services = '';
  if (form.services.length === 0) {
    errors.services = t('auth.register.errors.servicesRequired');
    return false;
  }
  return true;
};

const validateStep5 = (): boolean => {
  errors.tradeLicense = '';
  if (!form.tradeLicense) {
    errors.tradeLicense = t('auth.register.errors.licenseRequired');
    return false;
  }
  return true;
};

const nextStep = () => {
  let isValid = false;
  switch (currentStep.value) {
    case 1:
      isValid = validateStep1();
      break;
    case 2:
      isValid = validateStep2();
      break;
    case 3:
      isValid = validateStep3();
      break;
    case 4:
      isValid = validateStep4();
      break;
    default:
      isValid = true;
  }

  if (isValid && currentStep.value < totalSteps) {
    currentStep.value++;
  }
};

const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--;
  }
};

const handleFileUpload = (file: File) => {
  form.tradeLicense = file;
  errors.tradeLicense = '';
};

const handleSubmit = async () => {
  if (!validateStep5()) return;

  isLoading.value = true;

  try {
    const formData = new FormData();
    formData.append('companyName', form.companyName);
    formData.append('email', form.email);
    formData.append('password', form.password);
    formData.append('addressLine', form.addressLine);
    formData.append('postalCode', form.postalCode);
    formData.append('city', form.city);
    formData.append('country', form.country);
    formData.append('phone', form.phone);
    if (form.website) formData.append('website', form.website);
    formData.append('services', JSON.stringify(form.services));
    if (form.tradeLicense) {
      formData.append('tradeLicense', form.tradeLicense);
    }

    await authStore.registerCompany(formData);
    registrationSuccess.value = true;
  } catch (error) {
    console.error('Registration failed:', error);
  } finally {
    isLoading.value = false;
  }
};
</script>

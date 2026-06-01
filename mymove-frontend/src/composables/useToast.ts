import { toast } from 'vue-sonner';

export function useToast() {
  function success(message: string, description?: string) {
    toast.success(message, { description });
  }

  function error(message: string, description?: string) {
    toast.error(message, { description });
  }

  function info(message: string, description?: string) {
    toast.info(message, { description });
  }

  return { success, error, info };
}

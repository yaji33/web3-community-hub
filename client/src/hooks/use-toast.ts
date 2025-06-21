import toast, { ToastOptions } from 'react-hot-toast';

export const useToast = () => {
  const showSuccess = (message: string, options?: ToastOptions) => {
    return toast.success(message, {
      duration: 3000,
      ...options,
    });
  };

  const showError = (message: string, options?: ToastOptions) => {
    return toast.error(message, {
      duration: 4000,
      ...options,
    });
  };

  const showLoading = (message: string, options?: ToastOptions) => {
    return toast.loading(message, {
      ...options,
    });
  };

  const showInfo = (message: string, options?: ToastOptions) => {
    return toast(message, {
      icon: 'ℹ️',
      duration: 3500,
      ...options,
    });
  };

  const showWarning = (message: string, options?: ToastOptions) => {
    return toast(message, {
      icon: '⚠️',
      duration: 4000,
      style: {
        background: 'rgba(245, 158, 11, 0.1)',
        border: '1px solid rgba(245, 158, 11, 0.3)',
        color: '#f59e0b',
      },
      ...options,
    });
  };

  const showPromise = <T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: Error) => string);
    },
    options?: ToastOptions
  ) => {
    return toast.promise(promise, messages, {
      style: {
        minWidth: '250px',
      },
      success: {
        duration: 3000,
      },
      error: {
        duration: 4000,
      },
      ...options,
    });
  };

  const dismiss = (toastId?: string) => {
    if (toastId) {
      toast.dismiss(toastId);
    } else {
      toast.dismiss();
    }
  };

  const remove = (toastId: string) => {
    toast.remove(toastId);
  };

  return {
    success: showSuccess,
    error: showError,
    loading: showLoading,
    info: showInfo,
    warning: showWarning,
    promise: showPromise,
    dismiss,
    remove,
  };
};

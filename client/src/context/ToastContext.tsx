import React from 'react';
import { Toaster } from 'react-hot-toast';

export const ToastContext: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'hsl(var(--background))',
            color: 'hsl(var(--foreground))',
            border: '1px solid hsl(var(--border))',
            borderRadius: 'var(--radius)',
          },
          success: {
            style: {
              border: '1px solid hsl(142 76% 36%)',
            },
          },
          error: {
            style: {
              border: '1px solid hsl(0 84% 60%)',
            },
          },
        }}
      />
    </>
  );
};

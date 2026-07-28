'use client';

import * as React from 'react';

import {
  Toast,
  ToastClose,
  ToastProvider as ToastPrimitiveProvider,
  ToastTitle,
  ToastViewport,
} from '../components/ui/toast';

export interface ToastMessage {
  id: string;
  title: string;
  variant?: 'default' | 'success' | 'error';
}

interface ToastContextValue {
  showToast: (message: Omit<ToastMessage, 'id'>) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  const [messages, setMessages] = React.useState<ToastMessage[]>([]);

  const showToast = React.useCallback((message: Omit<ToastMessage, 'id'>) => {
    const id = crypto.randomUUID();
    setMessages((prev) => [...prev, { ...message, id }]);
  }, []);

  const removeMessage = React.useCallback((id: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      <ToastPrimitiveProvider swipeDirection="right">
        {children}
        {messages.map((message) => (
          <Toast
            key={message.id}
            variant={message.variant}
            duration={5000}
            onOpenChange={(open) => {
              if (!open) removeMessage(message.id);
            }}
          >
            <ToastTitle>{message.title}</ToastTitle>
            <ToastClose />
          </Toast>
        ))}
        <ToastViewport />
      </ToastPrimitiveProvider>
    </ToastContext.Provider>
  );
}

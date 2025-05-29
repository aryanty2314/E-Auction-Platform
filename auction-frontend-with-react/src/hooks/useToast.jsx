import { useState, useCallback } from 'react';

export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9); // More unique ID
    // console.log(`Showing toast: ${id}, msg: ${message}, type: ${type}, duration: ${duration}`);
    setToasts(prevToasts => {
      // Optional: Limit number of toasts displayed at once
      // const newToasts = [...prevToasts, { id, message, type }];
      // return newToasts.slice(-5); // Keep max 5 toasts
      return [...prevToasts, { id, message, type }];
    });

    if (duration !== null && duration > 0) {
        setTimeout(() => {
            // console.log(`Auto-removing toast: ${id}`);
            removeToast(id);
        }, duration);
    }
    return id;
  }, []); // removeToast is not a dependency here, it's defined below and stable

  const removeToast = useCallback((id) => {
    // console.log(`Attempting to remove toast: ${id}`);
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  }, []);

  return { toasts, showToast, removeToast };
};
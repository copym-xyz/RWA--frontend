import { useState, useCallback } from 'react';

// Simple standalone implementation that doesn't depend on shadcn UI
export function useToast() {
  const [toasts, setToasts] = useState([]);
  
  const toast = useCallback(({ title, description, variant = 'default' }) => {
    const id = Date.now();
    
    // Add new toast to the array
    setToasts(prev => [...prev, { id, title, description, variant }]);
    
    // Auto-remove toast after 5 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 5000);
    
    return id;
  }, []);

  // Function to manually dismiss a toast
  const dismiss = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  return {
    toast,
    dismiss,
    toasts
  };
}

export default useToast;
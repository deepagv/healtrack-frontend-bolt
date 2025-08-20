import React, { createContext, useContext, useState, useCallback } from 'react'
import { CheckCircle, AlertCircle, X } from 'lucide-react'

interface Toast {
  id: string
  type: 'success' | 'error'
  message: string
}

interface ToastContextType {
  showToast: (type: 'success' | 'error', message: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((type: 'success' | 'error', message: string) => {
    const id = Math.random().toString(36).substr(2, 9)
    const toast = { id, type, message }
    
    setToasts(prev => [...prev, toast])
    
    // Auto remove after 4 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 4000)
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`
              flex items-center gap-3 p-4 rounded-lg shadow-lg border max-w-sm
              animate-in slide-in-from-right-full duration-300
              ${toast.type === 'success' 
                ? 'bg-card border-success/20 text-foreground' 
                : 'bg-card border-danger/20 text-foreground'
              }
            `}
          >
            {toast.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-danger flex-shrink-0" />
            )}
            
            <p className="text-sm font-medium flex-1">{toast.message}</p>
            
            <button
              onClick={() => removeToast(toast.id)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
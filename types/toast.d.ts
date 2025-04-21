declare module '@/components/ui/use-toast' {
  export interface Toast {
    id?: string
    title?: string
    description?: string
    action?: React.ReactNode
    variant?: 'default' | 'destructive'
  }

  export interface ToastActionElement {
    altText: string
    onClick: () => void
    children: React.ReactNode
  }

  export interface UseToastResult {
    toast: (props: Toast) => void
    dismiss: (toastId?: string) => void
    toasts: Toast[]
  }

  export function useToast(): UseToastResult
  export function toast(props: Toast): void
} 
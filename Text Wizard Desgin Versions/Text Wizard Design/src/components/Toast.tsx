import { toast } from "sonner@2.0.3";
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastOptions {
  title: string;
  description?: string;
  duration?: number;
}

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const styles = {
  success: 'text-green-500',
  error: 'text-red-500',
  warning: 'text-yellow-500',
  info: 'text-blue-500',
};

export function showToast(type: ToastType, options: ToastOptions) {
  const Icon = icons[type];
  const iconStyle = styles[type];

  toast[type](options.title, {
    description: options.description,
    duration: options.duration || 3000,
    icon: <Icon className={`h-4 w-4 ${iconStyle}`} />,
  });
}

export const toastHelpers = {
  success: (title: string, description?: string) => 
    showToast('success', { title, description }),
  
  error: (title: string, description?: string) => 
    showToast('error', { title, description }),
  
  warning: (title: string, description?: string) => 
    showToast('warning', { title, description }),
  
  info: (title: string, description?: string) => 
    showToast('info', { title, description }),

  copySuccess: () => 
    showToast('success', { title: 'Скопировано в буфер обмена' }),
  
  copyError: () => 
    showToast('error', { title: 'Ошибка копирования', description: 'Не удалось скопировать в буфер обмена' }),
  
  regexError: (error: string) => 
    showToast('error', { title: 'Ошибка в регулярном выражении', description: error }),
  
  fileLoadSuccess: (filename: string) => 
    showToast('success', { title: 'Файл загружен', description: filename }),
  
  fileLoadError: () => 
    showToast('error', { title: 'Ошибка загрузки файла' }),
  
  presetSaved: (name: string) => 
    showToast('success', { title: 'Пресет сохранён', description: name }),
  
  presetLoaded: (name: string) => 
    showToast('success', { title: 'Пресет загружен', description: name }),
};
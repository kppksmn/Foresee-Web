import React from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'ยืนยัน',
  cancelText = 'ยกเลิก',
  type = 'danger',
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'danger':
        return <AlertCircle className="w-6 h-6 text-rose-600" />;
      case 'warning':
        return <AlertCircle className="w-6 h-6 text-amber-600" />;
      default:
        return <Info className="w-6 h-6 text-blue-600" />;
    }
  };

  const getConfirmButtonStyle = () => {
    switch (type) {
      case 'danger':
        return 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/20';
      case 'warning':
        return 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-500/20';
      default:
        return 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white w-[calc(100vw-24px)] max-w-md rounded-2xl border border-slate-200 shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
        <div className="p-4 sm:p-6">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="p-2 sm:p-3 rounded-xl bg-slate-100 shrink-0">{getIcon()}</div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm sm:text-base font-bold text-slate-900">{title}</h4>
              <p className="mt-1 text-xs sm:text-sm text-slate-600 leading-relaxed">{message}</p>
            </div>
            <button
              onClick={onCancel}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
            >
              <X size={18} />
            </button>
          </div>

          <div className="mt-5 sm:mt-6 flex items-center justify-end gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className={`px-4 sm:px-5 py-2 font-medium text-xs sm:text-sm rounded-xl transition-colors shadow-sm cursor-pointer ${getConfirmButtonStyle()}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface AlertModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
}

export const AlertModal: React.FC<AlertModalProps> = ({
  isOpen,
  title,
  message,
  type = 'error',
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white w-[calc(100vw-24px)] max-w-md rounded-2xl border border-slate-200 shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
        <div className="p-4 sm:p-6">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="p-2 sm:p-3 rounded-xl bg-slate-100 shrink-0">
              {type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
              ) : type === 'error' ? (
                <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-rose-600" />
              ) : (
                <Info className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm sm:text-base font-bold text-slate-900">
                {title || (type === 'success' ? 'สำเร็จ' : type === 'error' ? 'แจ้งเตือน' : 'ข้อมูล')}
              </h4>
              <p className="mt-1 text-xs sm:text-sm text-slate-600 leading-relaxed">{message}</p>
            </div>
          </div>

          <div className="mt-5 sm:mt-6 flex items-center justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs sm:text-sm rounded-xl transition-colors shadow-sm cursor-pointer"
            >
              ตกลง
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

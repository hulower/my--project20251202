import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';

/**
 * ConfirmDialog - 通用确认对话框组件
 * 
 * @param {boolean} open - 对话框是否打开
 * @param {function} onOpenChange - 对话框状态变化回调
 * @param {string} title - 对话框标题
 * @param {string|React.ReactNode} description - 对话框描述内容
 * @param {function} onConfirm - 确认按钮点击回调
 * @param {string} confirmText - 确认按钮文字，默认"确认"
 * @param {string} cancelText - 取消按钮文字，默认"取消"
 * @param {string} confirmVariant - 确认按钮样式变体，"default" | "destructive"，默认"default"
 */
function ConfirmDialog({
  open,
  onOpenChange,
  title = '确认操作',
  description = '确定要执行此操作吗？',
  onConfirm,
  confirmText = '确认',
  cancelText = '取消',
  confirmVariant = 'default',
}) {
  const handleCancel = () => {
    onOpenChange(false);
  };

  const handleConfirm = () => {
    onConfirm();
  };

  // 根据 variant 设置按钮样式
  const confirmButtonClassName = confirmVariant === 'destructive' 
    ? 'bg-red-600 hover:bg-red-700 text-white'
    : '';

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className={confirmButtonClassName}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default ConfirmDialog;



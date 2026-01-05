/**
 * ============================================
 * 文件名：DropdownMenu.js
 * 作用：导航栏下拉菜单组件
 * ============================================
 * 功能：
 * 1. 鼠标悬停显示下拉菜单
 * 2. 点击菜单项跳转
 * 3. 支持图标和文字
 */

import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';

function DropdownMenu({ label, icon: Icon, items, navLinkStyle }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();

  // 点击外部关闭下拉菜单
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 检查当前路径是否在下拉菜单的某个子项中
  const isActive = items.some(item => location.pathname === item.path);

  return (
    <div
      ref={dropdownRef}
      style={{ position: 'relative' }}
    >
      {/* 下拉菜单触发按钮 */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          ...navLinkStyle,
          cursor: 'pointer',
          backgroundColor: isActive || isOpen ? 'rgba(51, 65, 85, 0.08)' : 'transparent',
          color: isActive || isOpen ? '#0f172a' : '#334155',
        }}
        onMouseEnter={(e) => {
          if (!isOpen) {
            e.currentTarget.style.backgroundColor = 'rgba(51, 65, 85, 0.08)';
            e.currentTarget.style.color = '#0f172a';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isOpen && !isActive) {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#334155';
            e.currentTarget.style.transform = 'translateY(0)';
          }
        }}
      >
        {Icon && <Icon size={18} strokeWidth={2.5} />}
        <span>{label}</span>
        <ChevronDown
          size={16}
          style={{
            transition: 'transform 0.2s ease',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        />
      </div>

      {/* 下拉菜单内容 */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: '50%',
            transform: 'translateX(-50%)',
            minWidth: '160px',
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            border: '1px solid rgba(226, 232, 240, 0.8)',
            padding: '0.5rem 0',
            zIndex: 2000,
            animation: 'fadeIn 0.2s ease',
          }}
        >
          {items.map((item, index) => (
            <Link
              key={index}
              to={item.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                color: location.pathname === item.path ? '#d4988b' : '#334155',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: location.pathname === item.path ? '600' : '500',
                transition: 'all 0.2s ease',
                borderLeft: location.pathname === item.path ? '3px solid #d4988b' : '3px solid transparent',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(212, 152, 139, 0.08)';
                e.currentTarget.style.color = '#d4988b';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = location.pathname === item.path ? '#d4988b' : '#334155';
              }}
              onClick={() => setIsOpen(false)}
            >
              {item.icon && <item.icon size={16} />}
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      )}

      {/* 添加 fadeIn 动画 */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

export default DropdownMenu;


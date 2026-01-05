/**
 * ============================================
 * 文件名：SearchBar.js
 * 作用：顶部搜索框组件
 * ============================================
 * 功能：
 * 1. 实时搜索（防抖）
 * 2. 下拉结果列表
 * 3. 键盘导航（上下键）
 * 4. 快捷键支持（/ 键聚焦）
 * 5. 点击外部关闭
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2, FileText, X } from 'lucide-react';
import * as blogApi from '../api/blogApi';

function SearchBar() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const searchRef = useRef(null);
  const inputRef = useRef(null);
  const debounceTimer = useRef(null);

  // 点击外部关闭
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 快捷键监听（/ 键聚焦搜索框）
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === '/' && !isOpen) {
        e.preventDefault();
        setIsOpen(true);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
      
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        setKeyword('');
        setResults([]);
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // 防抖搜索
  useEffect(() => {
    if (!keyword.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    
    // 清除之前的定时器
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // 设置新的定时器
    debounceTimer.current = setTimeout(async () => {
      try {
        const data = await blogApi.searchPosts(keyword, 8);
        setResults(data || []);
      } catch (err) {
        console.error('搜索失败:', err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [keyword]);

  // 键盘导航
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev < results.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      handleResultClick(results[selectedIndex]);
    }
  };

  // 点击搜索结果
  const handleResultClick = (post) => {
    navigate(`/blog/post/${post.slug}`);
    setIsOpen(false);
    setKeyword('');
    setResults([]);
  };

  // 清空搜索
  const handleClear = () => {
    setKeyword('');
    setResults([]);
    inputRef.current?.focus();
  };

  // 高亮关键词
  const highlightKeyword = (text) => {
    if (!keyword.trim() || !text) return text;
    
    const regex = new RegExp(`(${keyword})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark
          key={index}
          style={{
            backgroundColor: '#fef1f1',
            color: '#d4988b',
            fontWeight: '600',
            padding: '0 2px'
          }}
        >
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div ref={searchRef} style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
      {/* 搜索框 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem 0.75rem',
          borderRadius: '8px',
          border: '1px solid #f4d3d3',
          backgroundColor: isOpen ? 'white' : 'rgba(255, 255, 255, 0.7)',
          transition: 'all 0.2s ease',
          cursor: !isOpen ? 'pointer' : 'default'
        }}
        onClick={() => !isOpen && setIsOpen(true)}
      >
        <Search size={16} style={{ color: '#d4988b', flexShrink: 0 }} />
        
        {isOpen ? (
          <>
            <input
              ref={inputRef}
              type="text"
              placeholder="搜索文章..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                fontSize: '14px',
                backgroundColor: 'transparent',
                color: '#5a4a42'
              }}
            />
            {keyword && (
              <button
                onClick={handleClear}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '2px',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  color: '#9d8b82'
                }}
              >
                <X size={14} />
              </button>
            )}
            {loading && <Loader2 size={14} className="animate-spin" style={{ color: '#d4988b' }} />}
          </>
        ) : (
          <span style={{ fontSize: '14px', color: '#9d8b82' }}>按 / 搜索</span>
        )}
      </div>

      {/* 搜索结果下拉列表 */}
      {isOpen && (keyword.trim() || loading) && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: 0,
            right: 0,
            maxHeight: '400px',
            overflowY: 'auto',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 10px 40px rgba(212, 152, 139, 0.2)',
            border: '1px solid #f4d3d3',
            zIndex: 1000
          }}
        >
          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#9d8b82' }}>
              <Loader2 className="animate-spin" style={{ margin: '0 auto', marginBottom: '0.5rem' }} />
              <p style={{ fontSize: '14px' }}>搜索中...</p>
            </div>
          ) : results.length > 0 ? (
            <div>
              {results.map((post, index) => (
                <div
                  key={post.id}
                  onClick={() => handleResultClick(post)}
                  style={{
                    padding: '0.75rem 1rem',
                    cursor: 'pointer',
                    borderBottom: index < results.length - 1 ? '1px solid #f8f4f0' : 'none',
                    backgroundColor: selectedIndex === index ? '#fef1f1' : 'transparent',
                    transition: 'background-color 0.15s ease'
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  onMouseLeave={() => setSelectedIndex(-1)}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                    <FileText size={16} style={{ color: '#d4988b', marginTop: '2px', flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: '14px',
                          fontWeight: '500',
                          color: '#5a4a42',
                          marginBottom: '4px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {highlightKeyword(post.title)}
                      </div>
                      {post.excerpt && (
                        <div
                          style={{
                            fontSize: '12px',
                            color: '#9d8b82',
                            lineHeight: '1.4',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical'
                          }}
                        >
                          {highlightKeyword(post.excerpt)}
                        </div>
                      )}
                      {post.category && (
                        <span
                          style={{
                            display: 'inline-block',
                            marginTop: '4px',
                            padding: '2px 8px',
                            fontSize: '11px',
                            borderRadius: '4px',
                            backgroundColor: '#f8f4f0',
                            color: '#9d8b82',
                            border: '1px solid #e8ddd6'
                          }}
                        >
                          {post.category}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : keyword.trim() ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#9d8b82' }}>
              <p style={{ fontSize: '14px' }}>未找到相关文章</p>
              <p style={{ fontSize: '12px', marginTop: '0.5rem' }}>试试其他关键词吧</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

export default SearchBar;


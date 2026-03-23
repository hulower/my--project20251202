import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { List } from 'lucide-react';

/**
 * ArticleToc - 文章目录组件
 * 直接从真实 DOM 中提取已渲染的标题，确保 ID 与页面一致
 */
function ArticleToc({ content }) {
  const [headings, setHeadings] = useState([]);
  const [activeId, setActiveId] = useState('');
  // 用于标记是否是点击触发的滚动，防止 scroll 事件覆盖点击高亮
  const isClickScrolling = useRef(false);

  useEffect(() => {
    if (!content) return;

    // 等待文章内容渲染完毕后再读取真实 DOM
    const timer = setTimeout(() => {
      const articleContent = document.querySelector('.article-content');
      if (!articleContent) return;

      const headingElements = articleContent.querySelectorAll('h1, h2, h3, h4, h5, h6');
      const extractedHeadings = [];

      headingElements.forEach((element, index) => {
        const level = parseInt(element.tagName.substring(1));
        const text = element.textContent.trim();

        // 统一覆盖赋值，确保 ID 一致
        element.id = `heading-${index}`;

        extractedHeadings.push({
          id: element.id,
          text,
          level,
        });
      });

      setHeadings(extractedHeadings);
    }, 100);

    return () => clearTimeout(timer);
  }, [content]);

  // 监听滚动，高亮当前阅读位置的标题
  useEffect(() => {
    const handleScroll = () => {
      // 点击滚动期间不触发高亮更新，由点击逻辑自行控制
      if (isClickScrolling.current) return;

      const scrollPosition = window.scrollY + 120;
      // 判断是否已滚动到页面底部
      const isAtBottom =
        window.innerHeight + window.scrollY >= document.body.scrollHeight - 10;

      if (isAtBottom && headings.length > 0) {
        // 已到页面底部，高亮最后一个标题
        setActiveId(headings[headings.length - 1].id);
        return;
      }

      for (let i = headings.length - 1; i >= 0; i--) {
        const element = document.getElementById(headings[i].id);
        if (element) {
          // 用 getBoundingClientRect 获取相对视口的位置，再加上 scrollY 得到绝对位置
          const rect = element.getBoundingClientRect();
          const absoluteTop = rect.top + window.scrollY;
          if (absoluteTop <= scrollPosition) {
            setActiveId(headings[i].id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [headings]);

  // 平滑滚动到目标标题
  const scrollToHeading = (id) => {
    const element = document.getElementById(id);
    if (!element) return;

    // 立即设置高亮，并标记为点击滚动
    setActiveId(id);
    isClickScrolling.current = true;

    const rect = element.getBoundingClientRect();
    const absoluteTop = rect.top + window.scrollY - 90; // 减去导航栏高度
    window.scrollTo({ top: absoluteTop, behavior: 'smooth' });

    // 滚动动画结束后（约 600ms）恢复 scroll 事件监听
    setTimeout(() => {
      isClickScrolling.current = false;
    }, 800);
  };

  if (headings.length === 0) {
    return null; // 如果没有标题，不显示目录
  }

  return (
    <Card className="sticky top-20 max-h-[calc(100vh-120px)] overflow-auto">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <List className="w-5 h-5 text-blue-500" />
          <span
            style={{
              fontWeight: '600',
              letterSpacing: '0.01em',
            }}
          >
            文章目录
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <nav className="space-y-1">
          {headings.map((heading) => (
            <button
              key={heading.id}
              onClick={() => scrollToHeading(heading.id)}
              className={`
                block w-full text-left px-3 py-2 rounded-md text-sm transition-all
                hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-400
                ${activeId === heading.id 
                  ? 'bg-blue-100 text-blue-700 font-semibold dark:bg-blue-900/30 dark:text-blue-400 border-l-2 border-blue-500' 
                  : 'text-gray-700 dark:text-gray-300 border-l-2 border-transparent'
                }
              `}
              style={{
                paddingLeft: `${(heading.level - 1) * 12 + 12}px`,
                fontWeight: activeId === heading.id ? '600' : '400',
                letterSpacing: '0.01em',
              }}
            >
              {heading.text}
            </button>
          ))}
        </nav>
      </CardContent>
    </Card>
  );
}

export default ArticleToc;


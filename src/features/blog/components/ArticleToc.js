import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { List } from 'lucide-react';

/**
 * ArticleToc - 文章目录组件
 * 自动提取文章中的标题生成目录，支持锚点跳转
 */
function ArticleToc({ content }) {
  const [headings, setHeadings] = useState([]);
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
    // 从 HTML 内容中提取标题
    if (!content) return;

    try {
      // 创建一个临时 DOM 元素来解析 HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(content, 'text/html');
      
      // 查找所有标题元素 (h1-h6)
      const headingElements = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
      const extractedHeadings = [];
      
      headingElements.forEach((element, index) => {
        const level = parseInt(element.tagName.substring(1)); // h1 -> 1, h2 -> 2
        const text = element.textContent.trim();
        const id = `heading-${index}`; // 使用索引作为 ID
        
        extractedHeadings.push({
          id,
          text,
          level,
        });
      });

      setHeadings(extractedHeadings);
    } catch (error) {
      console.error('解析文章标题失败:', error);
      setHeadings([]);
    }
  }, [content]);

  // 监听滚动，高亮当前阅读位置的标题
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100;

      for (let i = headings.length - 1; i >= 0; i--) {
        const element = document.getElementById(headings[i].id);
        if (element && element.offsetTop <= scrollPosition) {
          setActiveId(headings[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [headings]);

  // 平滑滚动到目标标题
  const scrollToHeading = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const offsetTop = element.offsetTop - 80; // 减去固定导航栏高度
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth',
      });
    }
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


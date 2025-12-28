import React, { useState, useEffect } from 'react';

/**
 * ReadingProgress - 阅读进度条组件
 * 显示文章阅读进度，固定在页面顶部
 */
function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      // 获取页面滚动信息
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

      // 计算阅读进度百分比
      const scrollableHeight = documentHeight - windowHeight;
      const scrollPercentage = (scrollTop / scrollableHeight) * 100;

      setProgress(Math.min(100, Math.max(0, scrollPercentage)));
    };

    // 监听滚动事件
    window.addEventListener('scroll', handleScroll);
    // 初始化时计算一次
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gray-200/50 dark:bg-gray-800/50">
      <div
        className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-300 ease-out"
        style={{ width: `${progress}%` }}
      >
        {/* 进度条末端的小圆点 */}
        {progress > 0 && (
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-blue-500 rounded-full shadow-lg animate-pulse" />
        )}
      </div>
    </div>
  );
}

export default ReadingProgress;


import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

function HeroSection({ onScrollToContent }) {
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const fullText = "Betsy's Blog";
  
  // 循环打字机效果
  useEffect(() => {
    let timeout;
    
    const typeWriter = () => {
      const currentLength = displayText.length;
      
      if (!isDeleting) {
        // 打字阶段
        if (currentLength < fullText.length) {
          setDisplayText(fullText.slice(0, currentLength + 1));
          timeout = setTimeout(typeWriter, 150); // 打字速度
        } else {
          // 打字完成，等待后开始删除
          timeout = setTimeout(() => {
            setIsDeleting(true);
          }, 2000); // 停留2秒
        }
      } else {
        // 删除阶段
        if (currentLength > 0) {
          setDisplayText(fullText.slice(0, currentLength - 1));
          timeout = setTimeout(typeWriter, 100); // 删除速度（比打字快）
        } else {
          // 删除完成，等待后重新开始打字
          timeout = setTimeout(() => {
            setIsDeleting(false);
          }, 500); // 停留0.5秒后重新开始
        }
      }
    };
    
    timeout = setTimeout(typeWriter, 150);
    
    return () => clearTimeout(timeout);
  }, [displayText, isDeleting]);

  return (
    <section className="relative h-screen flex flex-col items-center justify-center">
      {/* 半透明遮罩层，让文字更清晰 */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-transparent pointer-events-none" />
      
      {/* CSS 动画样式 */}
      <style>{`
        @keyframes gradient-shift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        
        @keyframes glow-pulse {
          0%, 100% {
            text-shadow: 
              0 0 10px rgba(255, 255, 255, 0.8),
              0 0 20px rgba(255, 100, 200, 0.6),
              0 0 30px rgba(100, 150, 255, 0.6),
              0 0 40px rgba(255, 100, 200, 0.4),
              0 0 70px rgba(100, 150, 255, 0.4);
          }
          50% {
            text-shadow: 
              0 0 15px rgba(255, 255, 255, 1),
              0 0 30px rgba(255, 100, 200, 0.8),
              0 0 45px rgba(100, 150, 255, 0.8),
              0 0 60px rgba(255, 100, 200, 0.6),
              0 0 90px rgba(100, 150, 255, 0.6);
          }
        }
        
        .animated-title {
          background: linear-gradient(
            90deg,
            #ff6b6b,
            #feca57,
            #48dbfb,
            #ff9ff3,
            #54a0ff,
            #ff6b6b
          );
          background-size: 300% 100%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: gradient-shift 4s ease infinite, glow-pulse 2s ease-in-out infinite;
          position: relative;
        }
        
        .animated-title::before {
          content: attr(data-text);
          position: absolute;
          left: 0;
          top: 0;
          z-index: -1;
          background: linear-gradient(
            90deg,
            #ff6b6b,
            #feca57,
            #48dbfb,
            #ff9ff3,
            #54a0ff,
            #ff6b6b
          );
          background-size: 300% 100%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          filter: blur(10px);
          opacity: 0.5;
        }
        
        @keyframes cursor-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        
        .typing-cursor {
          display: inline-block;
          width: 3px;
          height: 1em;
          background: linear-gradient(180deg, #ff6b6b, #48dbfb);
          margin-left: 4px;
          animation: cursor-blink 1s infinite;
        }
      `}</style>
      
      {/* Hero 内容 */}
      <div className="relative z-10 text-center px-4">
        <h1 
          className="text-6xl md:text-7xl font-bold mb-6 animated-title"
          data-text={displayText}
          style={{ 
            fontWeight: '700',
            letterSpacing: '0.02em',
            lineHeight: '1.1'
          }}
        >
          {displayText}
          {displayText.length < fullText.length && <span className="typing-cursor" />}
        </h1>
        <p 
          className="text-xl md:text-2xl text-white/90 mb-4 drop-shadow-lg"
          style={{ 
            fontWeight: '500',
            letterSpacing: '0.01em',
            lineHeight: '1.5'
          }}
        >
          记录学习与生活的点点滴滴
        </p>
        <p 
          className="text-lg md:text-xl text-white/80 italic drop-shadow-lg"
          style={{ 
            fontWeight: '400',
            letterSpacing: '0.01em',
            lineHeight: '1.6'
          }}
        >
          趁年轻，做自己想做的！
        </p>
        <p 
          className="text-base md:text-lg text-white/70 mt-2 drop-shadow-lg"
          style={{ 
            fontWeight: '400',
            letterSpacing: '0.05em',
            lineHeight: '1.6',
            fontStyle: 'italic'
          }}
        >
          There is no best, only better!
        </p>
      </div>

      {/* 向下滚动指示器 */}
      <button
        onClick={onScrollToContent}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-white/80 hover:text-white transition-colors group cursor-pointer bg-transparent border-none"
        aria-label="滚动到内容区"
      >
        <span className="text-sm font-medium">向下滚动</span>
        <ChevronDown 
          className="w-8 h-8 animate-bounce group-hover:animate-none" 
          strokeWidth={2.5}
        />
      </button>
    </section>
  );
}

export default HeroSection;


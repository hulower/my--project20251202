import React from 'react';
import { ChevronDown } from 'lucide-react';

function HeroSection({ onScrollToContent }) {
  return (
    <section className="relative h-screen flex flex-col items-center justify-center">
      {/* 半透明遮罩层，让文字更清晰 */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-transparent pointer-events-none" />
      
      {/* Hero 内容 */}
      <div className="relative z-10 text-center px-4">
        <h1 
          className="text-6xl md:text-7xl font-bold mb-6 text-white drop-shadow-2xl"
          style={{ 
            fontWeight: '700',
            letterSpacing: '0.02em',
            lineHeight: '1.1'
          }}
        >
          个人博客
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


/**
 * ============================================
 * 文件名：ArchivePage.js
 * 作用：归档页面 - 按年月展示所有文章
 * ============================================
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../../../components/ui/card';
import { Calendar, FileText, Loader2, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import * as blogApi from '../../../api/blogApi';
import Sidebar from '../components/Sidebar';
import TagCloud from '../components/TagCloud';
import meihuaBg from '../../../assets/images/meihua.png';

function ArchivePage() {
  const navigate = useNavigate();
  const [archives, setArchives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedMonths, setExpandedMonths] = useState({}); // 控制月份展开/折叠
  
  // 统计信息
  const [stats, setStats] = useState({
    posts: 0,
    categories: 3,
    tags: 0,
  });

  useEffect(() => {
    loadArchives();
  }, []);

  const loadArchives = async () => {
    try {
      setLoading(true);
      const data = await blogApi.fetchArchives();
      setArchives(data);
      
      // 计算统计信息
      const totalPosts = data.reduce((sum, year) => {
        return sum + year.months.reduce((monthSum, month) => monthSum + month.count, 0);
      }, 0);
      
      setStats(prev => ({
        ...prev,
        posts: totalPosts,
        tags: Math.floor(totalPosts * 2.5),
      }));
      
      setError(null);
    } catch (err) {
      console.error('加载归档数据失败:', err);
      setError('加载归档数据失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 切换月份展开/折叠
  const toggleMonth = (yearMonth) => {
    setExpandedMonths(prev => ({
      ...prev,
      [yearMonth]: !prev[yearMonth]
    }));
  };

  // 导航到文章详情页
  const handlePostClick = (slug) => {
    navigate(`/blog/post/${slug}`);
  };

  // 月份名称映射
  const monthNames = {
    1: '一月', 2: '二月', 3: '三月', 4: '四月',
    5: '五月', 6: '六月', 7: '七月', 8: '八月',
    9: '九月', 10: '十月', 11: '十一月', 12: '十二月'
  };

  return (
    <div className="min-h-screen" style={{ paddingTop: '80px' }}>
      {/* 三栏布局：左侧信息 + 中间内容 + 右侧空白 */}
      <div className="grid grid-cols-1 lg:grid-cols-5 min-h-screen">
        {/* 左侧边栏 - 个人信息展示（1列，20%） */}
        <div className="lg:col-span-1 p-8">
          <Sidebar stats={stats} />
        </div>

        {/* 中间主内容区 - 归档列表（3列，60%） */}
        <main className="lg:col-span-3 p-8">
          {/* 添加半透明白色背景容器，提高可读性同时保留背景图片 */}
          <div 
            className="rounded-xl shadow-lg p-8 min-h-screen backdrop-blur-md"
            style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.85)'
            }}
          >
          {/* 页面标题 */}
          <div className="mb-8">
            {/* 大标题卡片 - 梅花图片背景 */}
            <div 
              className="rounded-xl p-8 mb-6 relative overflow-hidden"
              style={{
                backgroundImage: `url(${meihuaBg})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
                minHeight: '200px'
              }}
            >
              {/* 半透明黑色遮罩，增强文字可读性 */}
              <div 
                className="absolute inset-0"
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.3)'
                }}
              />
              
              <div className="relative z-10">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <Calendar className="w-10 h-10 text-white" />
                  <h1 
                    className="text-4xl font-bold text-white"
                    style={{
                      fontWeight: '700',
                      letterSpacing: '0.02em',
                      textShadow: '0 2px 8px rgba(0,0,0,0.5), 0 0 20px rgba(0,0,0,0.3)'
                    }}
                  >
                    文章归档
                  </h1>
                </div>
                {!loading && !error && (
                  <p 
                    className="text-center text-lg text-white"
                    style={{
                      fontWeight: '500',
                      letterSpacing: '0.01em',
                      textShadow: '0 2px 6px rgba(0,0,0,0.5)'
                    }}
                  >
                    好！目前共计 <span className="font-bold text-yellow-300" style={{ textShadow: '0 2px 6px rgba(0,0,0,0.6)' }}>{stats.posts}</span> 篇文章，继续努力。
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* 加载状态 */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">加载中...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20">
              <AlertCircle className="w-12 h-12 text-destructive mb-4" />
              <p className="text-destructive mb-4">{error}</p>
              <button 
                onClick={loadArchives}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                重试
              </button>
            </div>
          ) : archives.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <FileText className="w-16 h-16 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">还没有文章</p>
            </div>
          ) : (
            /* 归档列表 */
            <div className="space-y-10">
              {archives.map((yearData, yearIndex) => (
                <div key={yearData.year} className="relative">
                  {/* 年份标题 - 清新淡雅风格 */}
                  <div className="flex items-center gap-4 mb-6 pb-3 border-b-2" style={{ borderColor: '#f4d3d3' }}>
                    <div 
                      className="text-3xl font-bold"
                      style={{
                        fontWeight: '700',
                        letterSpacing: '0.01em',
                        color: '#d4988b'
                      }}
                    >
                      {yearData.year}
                    </div>
                    <div 
                      className="text-sm px-4 py-1.5 rounded-full"
                      style={{
                        fontWeight: '500',
                        letterSpacing: '0.01em',
                        backgroundColor: '#fef1f1',
                        color: '#d4988b',
                        border: '1px solid #f4d3d3'
                      }}
                    >
                      {yearData.months.reduce((sum, m) => sum + m.count, 0)} 篇文章
                    </div>
                  </div>

                  {/* 月份列表 - 时间轴样式 */}
                  <div className="space-y-4 ml-6 pl-6" style={{ borderLeft: '2px solid #f4d3d3' }}>
                    {yearData.months.map((monthData, monthIndex) => {
                      const yearMonthKey = `${yearData.year}-${monthData.month}`;
                      const isExpanded = expandedMonths[yearMonthKey];
                      
                      // 清新淡雅的梅花配色
                      const colors = [
                        { bg: '#fef1f1', text: '#d4988b', border: '#e8b4a8' }, // 梅花粉
                        { bg: '#f8f4f0', text: '#c5a491', border: '#d9bca8' }, // 米杏色
                        { bg: '#f0f4f0', text: '#9db59b', border: '#b8cbb6' }, // 淡青绿
                        { bg: '#fef5f1', text: '#d9a89e', border: '#e6bcb2' }, // 粉杏色
                        { bg: '#f5f2ed', text: '#b8a091', border: '#cdb8a8' }, // 淡褐色
                        { bg: '#f2f5f5', text: '#a0b5b5', border: '#b5c9c9' }, // 淡灰青
                      ];
                      const colorScheme = colors[monthIndex % colors.length];

                      return (
                        <div key={monthData.month} className="relative -ml-[27px]">
                          <>
                            {/* 时间轴圆点 - 清新淡雅 */}
                            <div 
                              className="absolute left-0 top-4 w-4 h-4 rounded-full border-2"
                              style={{ 
                                backgroundColor: colorScheme.bg,
                                borderColor: colorScheme.border,
                                boxShadow: `0 0 0 3px white, 0 0 0 5px ${colorScheme.bg}, 0 2px 6px rgba(212, 152, 139, 0.2)`
                              }}
                            />
                            
                            <Card 
                              className="overflow-hidden ml-6 transition-all duration-300"
                              style={{
                                boxShadow: '0 2px 8px rgba(212, 152, 139, 0.15)',
                                border: `1px solid ${colorScheme.border}40`
                              }}
                            >
                            <>
                              {/* 月份头部 - 可点击展开/折叠 */}
                              <div
                                onClick={() => toggleMonth(yearMonthKey)}
                                className="flex items-center justify-between p-4 cursor-pointer transition-all duration-200"
                                style={{
                                  backgroundColor: colorScheme.bg
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                              >
                                <div className="flex items-center gap-3">
                                  <div
                                    className="px-4 py-2 rounded-lg text-sm font-semibold"
                                    style={{
                                      backgroundColor: 'white',
                                      color: colorScheme.text,
                                      fontWeight: '600',
                                      letterSpacing: '0.01em',
                                      border: `1px solid ${colorScheme.border}`
                                    }}
                                  >
                                    {yearData.year}年{String(monthData.month).padStart(2, '0')}月
                                  </div>
                                  <span 
                                    className="text-sm px-3 py-1 rounded-full font-medium"
                                    style={{
                                      fontWeight: '500',
                                      letterSpacing: '0.01em',
                                      color: colorScheme.text,
                                      backgroundColor: 'white',
                                      border: `1px solid ${colorScheme.border}`
                                    }}
                                  >
                                    {monthData.count} 篇
                                  </span>
                                </div>
                                {isExpanded ? (
                                  <ChevronUp className="w-5 h-5" style={{ color: colorScheme.text }} />
                                ) : (
                                  <ChevronDown className="w-5 h-5" style={{ color: colorScheme.text }} />
                                )}
                              </div>

                              {/* 文章列表 - 展开时显示 */}
                              {isExpanded && (
                                <CardContent className="pt-0 pb-4 px-4" style={{ backgroundColor: '#fffbf8' }}>
                                  <div className="space-y-2">
                                    {monthData.posts.map((post, postIndex) => {
                                      const postDate = new Date(post.createdAt);
                                      const day = String(postDate.getDate()).padStart(2, '0');
                                      
                                      return (
                                        <div
                                          key={post.id}
                                          onClick={() => handlePostClick(post.slug)}
                                          className="flex items-center gap-3 py-3 px-4 rounded-lg bg-white cursor-pointer transition-all duration-200 group"
                                          style={{
                                            border: `1px solid ${colorScheme.border}30`,
                                            boxShadow: '0 1px 3px rgba(212, 152, 139, 0.08)'
                                          }}
                                          onMouseEnter={(e) => {
                                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(212, 152, 139, 0.15)';
                                            e.currentTarget.style.transform = 'translateY(-1px)';
                                          }}
                                          onMouseLeave={(e) => {
                                            e.currentTarget.style.boxShadow = '0 1px 3px rgba(212, 152, 139, 0.08)';
                                            e.currentTarget.style.transform = 'translateY(0)';
                                          }}
                                        >
                                          {/* 日期 */}
                                          <div 
                                            className="text-sm font-semibold min-w-[40px] text-center px-2 py-1 rounded"
                                            style={{
                                              fontWeight: '600',
                                              letterSpacing: '0.01em',
                                              backgroundColor: colorScheme.bg,
                                              color: colorScheme.text,
                                              border: `1px solid ${colorScheme.border}40`
                                            }}
                                          >
                                            {day}
                                          </div>
                                          
                                          {/* 文章标题 */}
                                          <div className="flex-1 flex items-center gap-2">
                                            <div
                                              className="font-medium transition-colors"
                                              style={{
                                                fontWeight: '500',
                                                letterSpacing: '0.01em',
                                                color: '#5a4a42'
                                              }}
                                            >
                                              {post.title}
                                            </div>
                                            
                                            {/* 分类标签 */}
                                            {post.category && (
                                              <span 
                                                className="text-xs px-2.5 py-1 rounded-full font-medium"
                                                style={{
                                                  color: '#9d8b82',
                                                  fontWeight: '500',
                                                  letterSpacing: '0.01em',
                                                  backgroundColor: '#f8f4f0',
                                                  border: '1px solid #e8ddd6'
                                                }}
                                              >
                                                {post.category}
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </CardContent>
                              )}
                            </>
                          </Card>
                          </>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
          </div>
        </main>

        {/* 右侧边栏 - 标签云（1列，20%） */}
        <div className="hidden lg:block lg:col-span-1 p-8">
          <TagCloud />
        </div>
      </div>
    </div>
  );
}

export default ArchivePage;


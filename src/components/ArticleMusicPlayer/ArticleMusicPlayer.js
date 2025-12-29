import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Slider } from '../ui/slider';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../ui/popover';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX,
  Volume1,
  Music as MusicIcon,
  Loader2,
  Repeat,
  Repeat1
} from 'lucide-react';
import * as musicApi from '../../api/musicApi';

/**
 * ArticleMusicPlayer - 文章音乐播放器组件
 * 专门为文章详情页设计的简洁播放器
 * 
 * @param {number} musicId - 音乐ID
 */
function ArticleMusicPlayer({ musicId }) {
  const audioRef = useRef(null);
  const [music, setMusic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoop, setIsLoop] = useState(true); // 默认循环播放
  const [parsedLyrics, setParsedLyrics] = useState([]); // 解析后的歌词数组
  const [currentLyricIndex, setCurrentLyricIndex] = useState(0); // 当前歌词索引
  const [volumePopoverOpen, setVolumePopoverOpen] = useState(false); // 音量弹窗状态

  // 解析歌词 - 支持 LRC 格式和纯文本
  const parseLyrics = (lyricsText) => {
    if (!lyricsText) return [];

    const lines = lyricsText.split('\n').filter(line => line.trim());
    const lrcRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/; // LRC 格式：[00:12.50]歌词内容
    const tagRegex = /^\[(ver|ti|ar|al|by|offset):/i; // LRC 标签：[ver:], [ti:], [ar:], [al:], [by:], [offset:]
    
    const parsed = [];
    
    lines.forEach(line => {
      // 跳过标签行
      if (tagRegex.test(line.trim())) {
        return;
      }
      
      const match = line.match(lrcRegex);
      if (match) {
        // LRC 格式
        const minutes = parseInt(match[1], 10);
        const seconds = parseInt(match[2], 10);
        const milliseconds = parseInt(match[3].padEnd(3, '0'), 10);
        const time = minutes * 60 + seconds + milliseconds / 1000;
        const text = match[4].trim();
        if (text) {
          parsed.push({ time, text });
        }
      } else {
        // 纯文本格式 - 没有时间戳（但不是标签行）
        const trimmedLine = line.trim();
        if (trimmedLine && !trimmedLine.startsWith('[')) {
          parsed.push({ time: null, text: trimmedLine });
        }
      }
    });

    // 如果有时间戳，按时间排序
    if (parsed.some(item => item.time !== null)) {
      parsed.sort((a, b) => (a.time || 0) - (b.time || 0));
    }

    return parsed;
  };

  // 加载音乐信息
  useEffect(() => {
    if (!musicId) {
      setLoading(false);
      return;
    }

    const loadMusic = async () => {
      try {
        setLoading(true);
        const data = await musicApi.fetchMusicById(musicId);
        setMusic(data);
        
        // 解析歌词
        if (data.lyrics) {
          const lyrics = parseLyrics(data.lyrics);
          setParsedLyrics(lyrics);
        }
        
        setError(null);
      } catch (err) {
        console.error('加载音乐失败:', err);
        setError('音乐加载失败');
      } finally {
        setLoading(false);
      }
    };

    loadMusic();
  }, [musicId]);

  // 初始化音频
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.loop = isLoop;
    }
  }, []);

  // 同步循环状态到音频元素
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.loop = isLoop;
    }
  }, [isLoop]);

  // 播放/暂停
  const handlePlayPause = () => {
    if (isPlaying) {
      handlePause();
    } else {
      handlePlay();
    }
  };

  const handlePlay = () => {
    if (audioRef.current && music) {
      audioRef.current.play();
      setIsPlaying(true);
      // 记录播放次数
      musicApi.recordPlay(music.id).catch(err => {
        console.error('记录播放失败:', err);
      });
    }
  };

  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  // 更新播放时间和当前歌词
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const time = audioRef.current.currentTime;
      setCurrentTime(time);
      
      // 更新当前歌词索引
      if (parsedLyrics.length > 0 && parsedLyrics[0].time !== null) {
        // 找到当前时间对应的歌词索引
        let index = 0;
        for (let i = 0; i < parsedLyrics.length; i++) {
          if (parsedLyrics[i].time <= time) {
            index = i;
          } else {
            break;
          }
        }
        setCurrentLyricIndex(index);
      }
    }
  };

  // 加载元数据
  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  // 播放结束
  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    setCurrentLyricIndex(0); // 重置歌词索引
  };

  // 拖动进度条
  const handleProgressChange = (value) => {
    const newTime = value[0];
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  // 调节音量
  const handleVolumeChange = (value) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    setIsMuted(newVolume === 0);
  };

  // 静音/取消静音
  const handleToggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      setVolume(0.7);
      if (audioRef.current) {
        audioRef.current.volume = 0.7;
      }
    } else {
      setIsMuted(true);
      setVolume(0);
      if (audioRef.current) {
        audioRef.current.volume = 0;
      }
    }
  };

  // 切换循环播放
  const handleToggleLoop = () => {
    setIsLoop(!isLoop);
  };

  // 格式化时间
  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // 如果没有 musicId，不渲染
  if (!musicId) {
    return null;
  }

  // 加载中状态 - 极简
  if (loading) {
    return (
      <Card className="my-3">
        <CardContent className="py-3 text-center">
          <Loader2 className="w-5 h-5 mx-auto mb-1 text-blue-500 animate-spin" />
          <p className="text-xs text-gray-500">加载中...</p>
        </CardContent>
      </Card>
    );
  }

  // 错误状态 - 极简
  if (error || !music) {
    return (
      <Card className="my-3 border-red-200 bg-red-50">
        <CardContent className="py-3 text-center">
          <MusicIcon className="w-5 h-5 mx-auto mb-1 text-red-400" />
          <p className="text-xs text-red-600">{error || '音乐不存在'}</p>
        </CardContent>
      </Card>
    );
  }

  // 获取音量图标
  const getVolumeIcon = () => {
    if (isMuted || volume === 0) {
      return <VolumeX className="w-3.5 h-3.5" />;
    } else if (volume < 0.5) {
      return <Volume1 className="w-3.5 h-3.5" />;
    } else {
      return <Volume2 className="w-3.5 h-3.5" />;
    }
  };

  return (
    <Card className="mb-4 overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
      {/* 音频元素 */}
      <audio
        ref={audioRef}
        src={music.url}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />

      <CardContent className="p-3">
        {/* 主要内容区域：封面 + 歌曲信息和歌词 */}
        <div className="flex gap-3">
          {/* 左侧：封面 */}
          <div 
            className="relative flex-shrink-0 w-20 h-20 rounded overflow-hidden bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-sm cursor-pointer group transition-all hover:shadow-md"
            onClick={handlePlayPause}
            title={isPlaying ? "暂停" : "播放"}
          >
            {music.cover ? (
              <img 
                src={music.cover} 
                alt={music.title} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = '<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path></svg>';
                }}
              />
            ) : (
              <MusicIcon className="w-6 h-6 text-white" />
            )}
            
            {/* 播放/暂停图标叠加层 - 悬停时显示 */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                {isPlaying ? (
                  <Pause className="w-4 h-4 text-gray-900" />
                ) : (
                  <Play className="w-4 h-4 text-gray-900 ml-0.5" />
                )}
              </div>
            </div>
          </div>

          {/* 右侧：歌曲信息 + 歌词 - 居中显示 */}
          <div className="flex-1 min-w-0 flex flex-col justify-center items-center text-center">
            {/* 歌曲标题和艺术家 - 同一行显示 */}
            <div className="mb-1 w-full">
              <div className="text-xs text-gray-900 dark:text-white truncate leading-tight">
                <span className="font-bold" style={{ fontWeight: '700', letterSpacing: '0.01em' }}>
                  {music.title}
                </span>
                <span className="text-gray-600 dark:text-gray-400 mx-1.5">-</span>
                <span className="text-gray-600 dark:text-gray-400" style={{ fontWeight: '400', letterSpacing: '0.01em' }}>
                  {music.artist}
                </span>
              </div>
            </div>

            {/* 歌词显示区域 - 显示两行 */}
            {parsedLyrics.length > 0 ? (
              <div className="overflow-hidden w-full">
                {/* 当前歌词 */}
                {parsedLyrics[currentLyricIndex] && (
                  <div 
                    key={`current-${currentLyricIndex}`}
                    className="text-xs text-gray-700 dark:text-gray-300 transition-all duration-500 ease-out leading-tight truncate"
                    style={{ 
                      fontWeight: '500', 
                      letterSpacing: '0.01em'
                    }}
                  >
                    {parsedLyrics[currentLyricIndex].text}
                  </div>
                )}
                {/* 下一行歌词 */}
                {parsedLyrics[currentLyricIndex + 1] && (
                  <div 
                    key={`next-${currentLyricIndex + 1}`}
                    className="text-xs text-gray-500 dark:text-gray-500 transition-all duration-500 ease-out leading-tight mt-0.5 truncate"
                    style={{ 
                      opacity: 0.6,
                      fontWeight: '400', 
                      letterSpacing: '0.01em'
                    }}
                  >
                    {parsedLyrics[currentLyricIndex + 1].text}
                  </div>
                )}
              </div>
            ) : music.lyrics ? (
              <div className="text-xs text-gray-500 dark:text-gray-500 leading-tight line-clamp-2 w-full">
                {music.lyrics}
              </div>
            ) : (
              <div className="text-xs text-gray-400 dark:text-gray-600">
                暂无歌词
              </div>
            )}
          </div>
        </div>

        {/* 进度条和控制按钮 - 同一行 */}
        <div className="mt-2 flex items-center gap-2">
          {/* 当前时间 */}
          <span className="text-[10px] text-gray-500 dark:text-gray-400 flex-shrink-0" style={{ fontWeight: '500', letterSpacing: '0.01em' }}>
            {formatTime(currentTime)}
          </span>
          
          {/* 进度条 */}
          <div className="flex-1">
            <Slider
              value={[currentTime]}
              max={duration || 100}
              step={0.1}
              onValueChange={handleProgressChange}
              className="cursor-pointer"
            />
          </div>
          
          {/* 总时长 */}
          <span className="text-[10px] text-gray-500 dark:text-gray-400 flex-shrink-0" style={{ fontWeight: '500', letterSpacing: '0.01em' }}>
            {formatTime(duration)}
          </span>
          
          {/* 控制按钮组 */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* 音量控制 - 弹窗式 */}
            <Popover open={volumePopoverOpen} onOpenChange={setVolumePopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  title={`音量: ${Math.round(volume * 100)}%`}
                >
                  {getVolumeIcon()}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-3" side="top">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleToggleMute}
                    className="h-7 w-7 flex-shrink-0"
                  >
                    {getVolumeIcon()}
                  </Button>
                  <Slider
                    value={[volume]}
                    max={1}
                    step={0.01}
                    onValueChange={handleVolumeChange}
                    className="flex-1"
                  />
                  <span className="text-xs text-gray-500 min-w-[2.5rem] text-right">
                    {Math.round(volume * 100)}%
                  </span>
                </div>
              </PopoverContent>
            </Popover>

            {/* 循环播放按钮 - 仅图标 */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggleLoop}
              className="h-6 w-6"
              title={isLoop ? "循环播放" : "单次播放"}
            >
              {isLoop ? (
                <Repeat className="w-3.5 h-3.5 text-primary" />
              ) : (
                <Repeat1 className="w-3.5 h-3.5 text-gray-500" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default ArticleMusicPlayer;


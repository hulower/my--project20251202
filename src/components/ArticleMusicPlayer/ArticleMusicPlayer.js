import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Slider } from '../ui/slider';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX,
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
  const [showLyrics, setShowLyrics] = useState(false); // 显示歌词

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

  // 更新播放时间
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
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

  // 加载中状态
  if (loading) {
    return (
      <Card className="my-6">
        <CardContent className="py-6 text-center">
          <Loader2 className="w-8 h-8 mx-auto mb-2 text-blue-500 animate-spin" />
          <p className="text-sm text-gray-500">加载音乐...</p>
        </CardContent>
      </Card>
    );
  }

  // 错误状态
  if (error || !music) {
    return (
      <Card className="my-6 border-red-200 bg-red-50">
        <CardContent className="py-6 text-center">
          <MusicIcon className="w-8 h-8 mx-auto mb-2 text-red-400" />
          <p className="text-sm text-red-600">{error || '音乐不存在'}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-8 overflow-hidden border-2 border-primary/20 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 shadow-lg">
      {/* 音频元素 */}
      <audio
        ref={audioRef}
        src={music.url}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />

      <CardContent className="p-6">
        {/* 标题区域 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-primary">
            <MusicIcon className="w-5 h-5" />
            <span className="text-sm font-semibold">本文配乐</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            🎧 边听边读，享受沉浸式体验
          </p>
        </div>

        {/* 歌曲信息和封面 */}
        <div className="flex items-center gap-4 mb-4">
          {/* 封面 */}
          <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
            {music.cover ? (
              <img 
                src={music.cover} 
                alt={music.title} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = '<svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path></svg>';
                }}
              />
            ) : (
              <MusicIcon className="w-8 h-8 text-white" />
            )}
          </div>

          {/* 歌曲信息 */}
          <div className="flex-1 min-w-0">
            <h4 
              className="text-lg font-bold text-gray-900 dark:text-white truncate mb-1"
              style={{ fontWeight: '700', letterSpacing: '0.01em' }}
            >
              {music.title}
            </h4>
            <p 
              className="text-sm text-gray-600 dark:text-gray-400 truncate"
              style={{ fontWeight: '400', letterSpacing: '0.01em' }}
            >
              {music.artist}
              {music.album && ` · ${music.album}`}
            </p>
          </div>

          {/* 播放按钮 */}
          <Button
            variant="default"
            size="lg"
            onClick={handlePlayPause}
            className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6 ml-0.5" />
            )}
          </Button>
        </div>

        {/* 进度条 */}
        <div className="mb-4">
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={0.1}
            onValueChange={handleProgressChange}
            className="cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
            <span style={{ fontWeight: '500', letterSpacing: '0.01em' }}>
              {formatTime(currentTime)}
            </span>
            <span style={{ fontWeight: '500', letterSpacing: '0.01em' }}>
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* 控制栏 */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* 音量控制 */}
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleMute}
              className="flex-shrink-0 p-2"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </Button>
            <div className="flex-1 max-w-32">
              <Slider
                value={[volume]}
                max={1}
                step={0.01}
                onValueChange={handleVolumeChange}
              />
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 min-w-[3rem] text-right">
              {Math.round(volume * 100)}%
            </span>
          </div>

          {/* 循环播放按钮 */}
          <Button
            variant={isLoop ? "default" : "outline"}
            size="sm"
            onClick={handleToggleLoop}
            className="flex items-center gap-2"
            title={isLoop ? "循环播放" : "单次播放"}
          >
            {isLoop ? (
              <>
                <Repeat className="w-4 h-4" />
                <span className="text-xs">循环</span>
              </>
            ) : (
              <>
                <Repeat1 className="w-4 h-4" />
                <span className="text-xs">单次</span>
              </>
            )}
          </Button>

          {/* 歌词按钮 */}
          {music.lyrics && (
            <Button
              variant={showLyrics ? "default" : "outline"}
              size="sm"
              onClick={() => setShowLyrics(!showLyrics)}
              className="flex items-center gap-2"
            >
              <MusicIcon className="w-4 h-4" />
              <span className="text-xs">{showLyrics ? '隐藏歌词' : '显示歌词'}</span>
            </Button>
          )}
        </div>

        {/* 歌词显示区域 */}
        {showLyrics && music.lyrics && (
          <div className="mt-4 p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 max-h-60 overflow-y-auto">
            <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <MusicIcon className="w-4 h-4" />
              歌词
            </h5>
            <div className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line leading-relaxed">
              {music.lyrics}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ArticleMusicPlayer;


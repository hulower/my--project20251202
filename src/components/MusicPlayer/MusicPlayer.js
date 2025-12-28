import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Slider } from '../ui/slider';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX,
  Music,
  List,
  Loader2
} from 'lucide-react';
import * as musicApi from '../../api/musicApi';

/**
 * MusicPlayer - 音乐播放器组件
 * 支持播放、暂停、上一首、下一首、音量调节、进度条等功能
 * 从后端 API 动态加载音乐列表
 */
function MusicPlayer({ autoPlay = false }) {
  // 从后端加载的播放列表
  const [playlist, setPlaylist] = useState([]);
  const [loading, setLoading] = useState(true);
  const audioRef = useRef(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);

  // 当前播放的曲目
  const currentTrack = playlist[currentTrackIndex];

  // 组件挂载时加载音乐列表
  useEffect(() => {
    loadMusicList();
  }, []);

  // 加载音乐列表
  const loadMusicList = async () => {
    try {
      setLoading(true);
      const data = await musicApi.fetchMusicList();
      setPlaylist(data);
      console.log('✅ 音乐列表加载成功:', data);
    } catch (err) {
      console.error('❌ 加载音乐列表失败:', err);
      setPlaylist([]);
    } finally {
      setLoading(false);
    }
  };

  // 初始化音频
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, []);

  // 自动播放
  useEffect(() => {
    if (autoPlay && currentTrack) {
      handlePlay();
    }
  }, [currentTrack]);

  // 播放/暂停
  const handlePlayPause = () => {
    if (isPlaying) {
      handlePause();
    } else {
      handlePlay();
    }
  };

  const handlePlay = () => {
    if (audioRef.current) {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
        // 记录播放次数
        if (currentTrack && currentTrack.id) {
          musicApi.recordPlay(currentTrack.id).catch(err => {
            console.error('记录播放失败:', err);
          });
        }
      }).catch((err) => {
        console.error('播放失败:', err);
      });
    }
  };

  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  // 上一首
  const handlePrevious = () => {
    const newIndex = currentTrackIndex === 0 ? playlist.length - 1 : currentTrackIndex - 1;
    setCurrentTrackIndex(newIndex);
    setIsPlaying(true);
  };

  // 下一首
  const handleNext = () => {
    const newIndex = currentTrackIndex === playlist.length - 1 ? 0 : currentTrackIndex + 1;
    setCurrentTrackIndex(newIndex);
    setIsPlaying(true);
  };

  // 音频时间更新
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  // 音频加载完成
  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  // 音频播放结束
  const handleEnded = () => {
    handleNext();
  };

  // 进度条拖动
  const handleProgressChange = (value) => {
    const newTime = value[0];
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  // 音量调节
  const handleVolumeChange = (value) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    if (newVolume === 0) {
      setIsMuted(true);
    } else {
      setIsMuted(false);
    }
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

  // 格式化时间
  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // 加载中状态
  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Loader2 className="w-12 h-12 mx-auto mb-3 text-blue-500 animate-spin" />
          <p className="text-sm text-gray-500" style={{ fontWeight: '400', letterSpacing: '0.01em' }}>
            加载音乐列表...
          </p>
        </CardContent>
      </Card>
    );
  }

  // 如果没有播放列表，显示提示
  if (!playlist || playlist.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Music className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p className="text-sm text-gray-500 mb-2" style={{ fontWeight: '400', letterSpacing: '0.01em' }}>
            暂无音乐
          </p>
          <p className="text-xs text-gray-400" style={{ fontWeight: '400', letterSpacing: '0.01em' }}>
            请先上传音乐文件到服务器
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      {/* 音频元素 */}
      <audio
        ref={audioRef}
        src={currentTrack?.url}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />

      <CardContent className="p-4">
        {/* 歌曲信息 */}
        <div className="flex items-center gap-3 mb-4">
          {/* 封面 */}
          <div className="flex-shrink-0 w-12 h-12 rounded-md overflow-hidden bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-md">
            {currentTrack?.cover ? (
              <img 
                src={currentTrack.cover} 
                alt={currentTrack.title} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.error('封面加载失败:', currentTrack.cover);
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = '<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path></svg>';
                }}
              />
            ) : (
              <Music className="w-6 h-6 text-white" />
            )}
          </div>

          {/* 歌曲信息 */}
          <div className="flex-1 min-w-0">
            <h4 
              className="text-sm font-semibold text-gray-900 dark:text-white truncate"
              style={{ fontWeight: '600', letterSpacing: '0.01em' }}
            >
              {currentTrack?.title || '未知歌曲'}
            </h4>
            <p 
              className="text-xs text-gray-500 dark:text-gray-400 truncate"
              style={{ fontWeight: '400', letterSpacing: '0.01em' }}
            >
              {currentTrack?.artist || '未知艺术家'}
            </p>
          </div>

          {/* 播放列表按钮 */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPlaylist(!showPlaylist)}
            className="flex-shrink-0"
          >
            <List className="w-4 h-4" />
          </Button>
        </div>

        {/* 进度条 */}
        <div className="mb-3">
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={0.1}
            onValueChange={handleProgressChange}
            className="cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span style={{ fontWeight: '400', letterSpacing: '0.01em' }}>
              {formatTime(currentTime)}
            </span>
            <span style={{ fontWeight: '400', letterSpacing: '0.01em' }}>
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* 控制按钮 */}
        <div className="flex items-center justify-center gap-4 mb-3">
          {/* 左侧：音量控制 */}
          <div className="flex items-center gap-2">
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
            <div className="w-16">
              <Slider
                value={[volume]}
                max={1}
                step={0.01}
                onValueChange={handleVolumeChange}
              />
            </div>
          </div>

          {/* 中间：播放控制 */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrevious}
              disabled={playlist.length <= 1}
              className="p-2"
            >
              <SkipBack className="w-4 h-4" />
            </Button>
            
            <Button
              variant="default"
              size="sm"
              onClick={handlePlayPause}
              className="w-10 h-10 rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-shadow"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5 ml-0.5" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleNext}
              disabled={playlist.length <= 1}
              className="p-2"
            >
              <SkipForward className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* 播放列表 */}
        {showPlaylist && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
            <div className="max-h-48 overflow-y-auto space-y-1">
              {playlist.map((track, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentTrackIndex(index);
                    setIsPlaying(true);
                  }}
                  className={`
                    w-full text-left px-3 py-2 rounded-md text-sm transition-colors
                    ${index === currentTrackIndex 
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' 
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                    }
                  `}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">{index + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div 
                        className="truncate font-medium"
                        style={{ fontWeight: '500', letterSpacing: '0.01em' }}
                      >
                        {track.title}
                      </div>
                      <div 
                        className="text-xs text-gray-500 truncate"
                        style={{ fontWeight: '400', letterSpacing: '0.01em' }}
                      >
                        {track.artist}
                      </div>
                    </div>
                    {index === currentTrackIndex && isPlaying && (
                      <div className="flex gap-0.5">
                        <div className="w-0.5 h-3 bg-blue-500 animate-pulse"></div>
                        <div className="w-0.5 h-3 bg-blue-500 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-0.5 h-3 bg-blue-500 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default MusicPlayer;


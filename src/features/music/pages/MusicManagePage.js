import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { Separator } from '../../../components/ui/separator';
import {
  Upload,
  Music,
  Image as ImageIcon,
  Trash2,
  Edit,
  Play,
  Pause,
  Loader2,
  CheckCircle,
  AlertCircle,
  Plus,
  X
} from 'lucide-react';
import * as musicApi from '../../../api/musicApi';

/**
 * MusicManagePage - 音乐上传和管理页面
 */
function MusicManagePage() {
  const [musicList, setMusicList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // 上传表单
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [musicFile, setMusicFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [album, setAlbum] = useState('');
  const [lyrics, setLyrics] = useState('');

  // 编辑表单
  const [editingMusic, setEditingMusic] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editArtist, setEditArtist] = useState('');
  const [editAlbum, setEditAlbum] = useState('');
  const [editLyrics, setEditLyrics] = useState('');

  // 预览音频
  const [previewingMusicId, setPreviewingMusicId] = useState(null);
  const audioRef = useRef(null); // 使用 ref 代替 state，避免异步更新问题

  useEffect(() => {
    loadMusicList();
  }, []);

  // 组件卸载时清理音频资源
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // 加载音乐列表
  const loadMusicList = async () => {
    try {
      setLoading(true);
      const data = await musicApi.fetchMusicList();
      setMusicList(data);
    } catch (err) {
      console.error('加载音乐列表失败:', err);
      alert('加载音乐列表失败：' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 上传音乐
  const handleUploadMusic = async () => {
    if (!musicFile) {
      alert('请选择音乐文件');
      return;
    }
    if (!title) {
      alert('请输入歌曲标题');
      return;
    }

    try {
      setUploading(true);

      // 创建 FormData
      const formData = new FormData();
      formData.append('music', musicFile);
      formData.append('title', title);
      formData.append('artist', artist || '未知艺术家');
      formData.append('album', album || '');
      formData.append('lyrics', lyrics || '');

      // 上传音乐
      const newMusic = await musicApi.uploadMusic(formData);
      console.log('✅ 音乐上传成功:', newMusic);

      // 如果有封面，继续上传封面
      if (coverFile) {
        try {
          const coverFormData = new FormData();
          coverFormData.append('cover', coverFile);
          const updatedMusic = await musicApi.uploadMusicCover(newMusic.id, coverFormData);
          console.log('✅ 封面上传成功:', updatedMusic);
        } catch (coverErr) {
          console.error('❌ 封面上传失败:', coverErr);
          alert(`音乐上传成功，但封面上传失败：${coverErr.message}\n请稍后在音乐管理页面单独上传封面。`);
        }
      }

      alert(coverFile ? '上传成功！音乐和封面都已保存。' : '上传成功！');

      // 重置表单
      setMusicFile(null);
      setCoverFile(null);
      setTitle('');
      setArtist('');
      setAlbum('');
      setShowUploadForm(false);

      // 刷新列表
      loadMusicList();
    } catch (err) {
      console.error('上传失败:', err);
      alert('上传失败：' + err.message);
    } finally {
      setUploading(false);
    }
  };

  // 删除音乐
  const handleDeleteMusic = async (id, title) => {
    if (!window.confirm(`确定要删除《${title}》吗？`)) {
      return;
    }

    try {
      await musicApi.deleteMusic(id);
      alert('删除成功！');
      loadMusicList();
    } catch (err) {
      console.error('删除失败:', err);
      alert('删除失败：' + err.message);
    }
  };

  // 开始编辑
  const handleStartEdit = (music) => {
    setEditingMusic(music);
    setEditTitle(music.title);
    setEditArtist(music.artist);
    setEditAlbum(music.album || '');
    setEditLyrics(music.lyrics || '');
  };

  // 保存编辑
  const handleSaveEdit = async () => {
    if (!editTitle) {
      alert('标题不能为空');
      return;
    }

    try {
      await musicApi.updateMusic(editingMusic.id, {
        title: editTitle,
        artist: editArtist,
        album: editAlbum || null,
        lyrics: editLyrics || null,
      });
      alert('更新成功！');
      setEditingMusic(null);
      loadMusicList();
    } catch (err) {
      console.error('更新失败:', err);
      alert('更新失败：' + err.message);
    }
  };

  // 预览播放
  const handlePreview = (music) => {
    if (previewingMusicId === music.id) {
      // 停止播放
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0; // 重置播放位置
      }
      setPreviewingMusicId(null);
    } else {
      // 停止之前的播放
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      // 开始播放新音乐
      const audio = new Audio(music.url);
      audioRef.current = audio;
      
      audio.play().catch(err => {
        console.error('播放失败:', err);
        alert('播放失败，请检查音频文件是否正常');
        setPreviewingMusicId(null);
      });
      
      setPreviewingMusicId(music.id);

      // 播放结束时的回调
      audio.onended = () => {
        setPreviewingMusicId(null);
        audioRef.current = null;
      };

      // 播放出错时的回调
      audio.onerror = () => {
        console.error('音频加载失败');
        alert('音频加载失败，请检查文件格式');
        setPreviewingMusicId(null);
        audioRef.current = null;
      };
    }
  };

  // 格式化文件大小
  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  // 格式化时长
  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1
            className="text-3xl font-bold text-gray-900 dark:text-white mb-2"
            style={{ fontWeight: '800', letterSpacing: '-0.02em' }}
          >
            🎵 音乐管理
          </h1>
          <p
            className="text-gray-600 dark:text-gray-400"
            style={{ fontWeight: '400', letterSpacing: '0.01em' }}
          >
            上传、管理和预览你的音乐收藏（支持 MP3、FLAC 等格式，最大 100MB）
          </p>
        </div>

        {/* 上传按钮 */}
        {!showUploadForm && (
          <div className="mb-6">
            <Button
              onClick={() => setShowUploadForm(true)}
              className="gap-2"
              size="lg"
              style={{ fontWeight: '600', letterSpacing: '0.01em' }}
            >
              <Plus className="w-5 h-5" />
              上传新音乐
            </Button>
          </div>
        )}

        {/* 上传表单 */}
        {showUploadForm && (
          <Card className="mb-8 border-blue-200 dark:border-blue-800">
            <CardHeader className="bg-blue-50 dark:bg-blue-900/20">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5 text-blue-500" />
                  <span style={{ fontWeight: '700', letterSpacing: '0.01em' }}>
                    上传音乐
                  </span>
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowUploadForm(false)}
                  disabled={uploading}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 音乐文件 */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    音乐文件 <span className="text-red-500">*</span>
                  </label>
                  <div className="flex flex-col gap-2">
                    <Input
                      type="file"
                      accept="audio/*,.flac"
                      onChange={(e) => setMusicFile(e.target.files[0])}
                      disabled={uploading}
                    />
                    {musicFile && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Music className="w-4 h-4" />
                        <span>{musicFile.name}</span>
                        <Badge variant="secondary">
                          {formatFileSize(musicFile.size)}
                        </Badge>
                      </div>
                    )}
                    <p className="text-xs text-gray-500">
                      支持格式: MP3, WAV, OGG, M4A, AAC, FLAC (最大 100MB)
                    </p>
                  </div>
                </div>

                {/* 封面图片 */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    封面图片（可选）
                  </label>
                  <div className="flex flex-col gap-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setCoverFile(e.target.files[0])}
                      disabled={uploading}
                    />
                    {coverFile && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <ImageIcon className="w-4 h-4" />
                        <span>{coverFile.name}</span>
                        <Badge variant="secondary">
                          {formatFileSize(coverFile.size)}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>

                {/* 歌曲标题 */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    歌曲标题 <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    placeholder="输入歌曲标题"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={uploading}
                  />
                </div>

                {/* 艺术家 */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    艺术家
                  </label>
                  <Input
                    type="text"
                    placeholder="输入艺术家名称"
                    value={artist}
                    onChange={(e) => setArtist(e.target.value)}
                    disabled={uploading}
                  />
                </div>

                {/* 专辑 */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">
                    专辑
                  </label>
                  <Input
                    type="text"
                    placeholder="输入专辑名称"
                    value={album}
                    onChange={(e) => setAlbum(e.target.value)}
                    disabled={uploading}
                  />
                </div>

                {/* 歌词 */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">
                    歌词 <span className="text-gray-400 text-xs">(可选)</span>
                  </label>
                  <textarea
                    placeholder="输入歌词内容（每行一句）"
                    value={lyrics}
                    onChange={(e) => setLyrics(e.target.value)}
                    disabled={uploading}
                    rows={6}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    💡 提示：为读者提供更好的听歌体验
                  </p>
                </div>
              </div>

              {/* 上传按钮 */}
              <div className="mt-6 flex gap-3">
                <Button
                  onClick={handleUploadMusic}
                  disabled={uploading || !musicFile || !title}
                  className="gap-2"
                  style={{ fontWeight: '600', letterSpacing: '0.01em' }}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      上传中...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      开始上传
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowUploadForm(false)}
                  disabled={uploading}
                >
                  取消
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 音乐列表 */}
        <Card>
          <CardHeader>
            <CardTitle
              className="flex items-center gap-2"
              style={{ fontWeight: '700', letterSpacing: '0.01em' }}
            >
              <Music className="w-5 h-5 text-purple-500" />
              音乐列表 {musicList.length > 0 && `(${musicList.length})`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-12 text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-blue-500" />
                <p className="text-gray-500">加载中...</p>
              </div>
            ) : musicList.length === 0 ? (
              <div className="py-12 text-center">
                <Music className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500 mb-2">还没有音乐</p>
                <p className="text-sm text-gray-400">点击上方按钮上传你的第一首音乐吧！</p>
              </div>
            ) : (
              <div className="space-y-4">
                {musicList.map((music) => (
                  <div
                    key={music.id}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow"
                  >
                    {editingMusic?.id === music.id ? (
                      // 编辑模式
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-1">标题</label>
                            <Input
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">艺术家</label>
                            <Input
                              value={editArtist}
                              onChange={(e) => setEditArtist(e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">专辑</label>
                            <Input
                              value={editAlbum}
                              onChange={(e) => setEditAlbum(e.target.value)}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">歌词</label>
                          <textarea
                            value={editLyrics}
                            onChange={(e) => setEditLyrics(e.target.value)}
                            rows={4}
                            placeholder="输入歌词内容（每行一句）"
                            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={handleSaveEdit}>
                            <CheckCircle className="w-4 h-4 mr-1" />
                            保存
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingMusic(null)}
                          >
                            取消
                          </Button>
                        </div>
                      </div>
                    ) : (
                      // 显示模式
                      <div className="flex items-center gap-4">
                        {/* 封面 */}
                        <div className="flex-shrink-0 w-16 h-16 rounded-md overflow-hidden bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                          {music.cover ? (
                            <img
                              src={music.cover}
                              alt={music.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Music className="w-8 h-8 text-white" />
                          )}
                        </div>

                        {/* 信息 */}
                        <div className="flex-1 min-w-0">
                          <h3
                            className="text-lg font-semibold text-gray-900 dark:text-white truncate"
                            style={{ fontWeight: '600', letterSpacing: '0.01em' }}
                          >
                            {music.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                            {music.artist}
                            {music.album && ` · ${music.album}`}
                          </p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <Badge variant="secondary">
                              {formatDuration(music.duration)}
                            </Badge>
                            <Badge variant="secondary">
                              {formatFileSize(music.fileSize)}
                            </Badge>
                            <Badge variant="secondary">{music.format?.toUpperCase()}</Badge>
                            {music.playCount > 0 && (
                              <Badge variant="secondary">播放 {music.playCount} 次</Badge>
                            )}
                          </div>
                        </div>

                        {/* 操作按钮 */}
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePreview(music)}
                          >
                            {previewingMusicId === music.id ? (
                              <Pause className="w-4 h-4" />
                            ) : (
                              <Play className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStartEdit(music)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteMusic(music.id, music.title)}
                            className="text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default MusicManagePage;


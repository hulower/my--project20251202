import React, { useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import { Button } from '../ui/button';
import {
  Heading1,
  Heading2,
  Heading3,
  Bold,
  Italic,
  Code,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Image as ImageIcon,
  Upload,
  FileCode,
} from 'lucide-react';
import { uploadContentImage } from '../../api/uploadApi';
import { useToast } from '../../hooks/use-toast';
import './rich-text-editor.css';

// 创建 lowlight 实例并注册常用语言
const lowlight = createLowlight(common);

/**
 * RichTextEditor - 富文本编辑器组件（所见即所得）
 * 
 * @param {string} value - HTML 内容
 * @param {function} onChange - 内容变化回调
 * @param {string} placeholder - 占位符文本
 */
function RichTextEditor({ value = '', onChange, placeholder = '开始你的创作...' }) {
  const { toast } = useToast();
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = React.useState(false);

  // 处理粘贴图片
  const handlePasteImage = async (file) => {
    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      return false;
    }

    // 验证文件大小（5MB）
    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: 'destructive',
        title: '文件太大',
        description: '图片大小不能超过 5MB',
      });
      return false;
    }

    try {
      setUploading(true);

      // 显示上传提示
      toast({
        title: '⏳ 上传中...',
        description: '正在上传粘贴的图片',
      });

      // 上传图片
      const result = await uploadContentImage(file);

      // 插入图片到编辑器
      editor?.chain().focus().setImage({ src: result.url }).run();

      toast({
        title: '✓ 上传成功',
        description: '图片已插入到文章中',
      });

      return true;
    } catch (error) {
      console.error('图片上传失败:', error);
      toast({
        variant: 'destructive',
        title: '✗ 上传失败',
        description: error.message || '请稍后重试',
      });
      return false;
    } finally {
      setUploading(false);
    }
  };

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
        // 禁用默认的代码块，使用增强版
        codeBlock: false,
      }),
      // 添加增强的代码块扩展（支持语法高亮）
      CodeBlockLowlight.configure({
        lowlight,
        defaultLanguage: 'javascript',
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-500 underline',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange({ target: { value: html } });
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none min-h-[300px] max-h-[500px] overflow-y-auto p-4',
      },
      // 处理粘贴事件
      handlePaste: (view, event) => {
        const items = event.clipboardData?.items;
        if (!items) return false;

        // 遍历剪贴板项
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          
          // 检查是否是图片
          if (item.type.indexOf('image') !== -1) {
            event.preventDefault(); // 阻止默认粘贴行为
            
            const file = item.getAsFile();
            if (file) {
              // 异步上传图片
              handlePasteImage(file);
            }
            return true; // 表示已处理该粘贴事件
          }
        }

        return false; // 让其他内容正常粘贴
      },
    },
  });

  // 如果编辑器还没初始化，返回加载状态
  if (!editor) {
    return <div className="text-gray-500">加载编辑器...</div>;
  }

  // 插入链接
  const addLink = () => {
    const url = window.prompt('请输入链接地址:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  // 插入图片（URL方式）
  const addImageByUrl = () => {
    const url = window.prompt('请输入图片地址:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  // 触发文件选择
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // 处理文件上传
  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      toast({
        variant: 'destructive',
        title: '文件格式错误',
        description: '请选择图片文件（JPG、PNG、WEBP、GIF）',
      });
      return;
    }

    // 验证文件大小（5MB）
    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: 'destructive',
        title: '文件太大',
        description: '图片大小不能超过 5MB',
      });
      return;
    }

    try {
      setUploading(true);

      // 上传图片
      const result = await uploadContentImage(file);

      // 插入图片到编辑器
      editor.chain().focus().setImage({ src: result.url }).run();

      toast({
        title: '✓ 上传成功',
        description: '图片已插入到文章中',
      });
    } catch (error) {
      console.error('图片上传失败:', error);
      toast({
        variant: 'destructive',
        title: '✗ 上传失败',
        description: error.message || '请稍后重试',
      });
    } finally {
      setUploading(false);
      // 清空 input，允许重复选择同一文件
      event.target.value = '';
    }
  };

  return (
    <div className="rich-text-editor border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      {/* 工具栏 */}
      <div className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 p-2 flex flex-wrap items-center gap-1">
        {/* 标题 */}
        <div className="flex items-center gap-1 border-r border-gray-300 dark:border-gray-600 pr-2">
          <Button
            type="button"
            variant={editor.isActive('heading', { level: 1 }) ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            title="一级标题 (Ctrl+Alt+1)"
            className="h-8 w-8 p-0"
          >
            <Heading1 className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant={editor.isActive('heading', { level: 2 }) ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            title="二级标题 (Ctrl+Alt+2)"
            className="h-8 w-8 p-0"
          >
            <Heading2 className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant={editor.isActive('heading', { level: 3 }) ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            title="三级标题 (Ctrl+Alt+3)"
            className="h-8 w-8 p-0"
          >
            <Heading3 className="w-4 h-4" />
          </Button>
        </div>

        {/* 文本格式 */}
        <div className="flex items-center gap-1 border-r border-gray-300 dark:border-gray-600 pr-2">
          <Button
            type="button"
            variant={editor.isActive('bold') ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            title="粗体 (Ctrl+B)"
            className="h-8 w-8 p-0"
          >
            <Bold className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant={editor.isActive('italic') ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            title="斜体 (Ctrl+I)"
            className="h-8 w-8 p-0"
          >
            <Italic className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant={editor.isActive('code') ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleCode().run()}
            title="行内代码 (Ctrl+E)"
            className="h-8 w-8 p-0"
          >
            <Code className="w-4 h-4" />
          </Button>
        </div>

        {/* 列表 */}
        <div className="flex items-center gap-1 border-r border-gray-300 dark:border-gray-600 pr-2">
          <Button
            type="button"
            variant={editor.isActive('bulletList') ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            title="无序列表"
            className="h-8 w-8 p-0"
          >
            <List className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant={editor.isActive('orderedList') ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            title="有序列表"
            className="h-8 w-8 p-0"
          >
            <ListOrdered className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant={editor.isActive('blockquote') ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            title="引用"
            className="h-8 w-8 p-0"
          >
            <Quote className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant={editor.isActive('codeBlock') ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            title="代码块 (```)"
            className="h-8 w-8 p-0"
          >
            <FileCode className="w-4 h-4" />
          </Button>
        </div>

        {/* 代码语言选择器（仅在代码块激活时显示） */}
        {editor.isActive('codeBlock') && (
          <div className="flex items-center gap-1 border-r border-gray-300 dark:border-gray-600 pr-2">
            <select
              onChange={(e) => 
                editor.chain().focus().updateAttributes('codeBlock', { language: e.target.value }).run()
              }
              value={editor.getAttributes('codeBlock').language || 'plaintext'}
              className="h-8 px-2 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="选择代码语言"
            >
              <option value="plaintext">纯文本</option>
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="jsx">JSX</option>
              <option value="tsx">TSX</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="c">C</option>
              <option value="cpp">C++</option>
              <option value="csharp">C#</option>
              <option value="go">Go</option>
              <option value="rust">Rust</option>
              <option value="php">PHP</option>
              <option value="ruby">Ruby</option>
              <option value="html">HTML</option>
              <option value="css">CSS</option>
              <option value="scss">SCSS</option>
              <option value="less">Less</option>
              <option value="json">JSON</option>
              <option value="xml">XML</option>
              <option value="yaml">YAML</option>
              <option value="markdown">Markdown</option>
              <option value="bash">Bash</option>
              <option value="shell">Shell</option>
              <option value="sql">SQL</option>
              <option value="graphql">GraphQL</option>
            </select>
          </div>
        )}

        {/* 插入 */}
        <div className="flex items-center gap-1 border-r border-gray-300 dark:border-gray-600 pr-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={addLink}
            title="插入链接"
            className="h-8 w-8 p-0"
          >
            <LinkIcon className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={triggerFileInput}
            disabled={uploading}
            title="上传本地图片"
            className="h-8 w-8 p-0"
          >
            {uploading ? (
              <Upload className="w-4 h-4 animate-pulse" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={addImageByUrl}
            title="插入网络图片"
            className="h-8 w-8 p-0"
          >
            <ImageIcon className="w-4 h-4" />
          </Button>
        </div>

        {/* 撤销/重做 */}
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="撤销 (Ctrl+Z)"
            className="h-8 w-8 p-0"
          >
            <Undo className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="重做 (Ctrl+Shift+Z)"
            className="h-8 w-8 p-0"
          >
            <Redo className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* 编辑区域 */}
      <EditorContent editor={editor} />

      {/* 隐藏的文件输入框 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* 提示文字 */}
      <div className="bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 px-4 py-2 text-xs text-gray-500 dark:text-gray-400">
        使用工具栏格式化文本。
        <span className="ml-2 text-blue-500">📤 点击上传按钮可插入本地图片</span>
        <span className="ml-2">🖼️ 点击图片按钮可插入网络图片</span>
        <span className="ml-2 text-green-500">📋 支持直接粘贴图片 (Ctrl+V)</span>
        <span className="ml-2 text-purple-500">💻 插入代码块后可选择语言高亮</span>
      </div>
    </div>
  );
}

export default RichTextEditor;

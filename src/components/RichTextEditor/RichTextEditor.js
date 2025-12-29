import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
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
} from 'lucide-react';
import './rich-text-editor.css';

/**
 * RichTextEditor - 富文本编辑器组件（所见即所得）
 * 
 * @param {string} value - HTML 内容
 * @param {function} onChange - 内容变化回调
 * @param {string} placeholder - 占位符文本
 */
function RichTextEditor({ value = '', onChange, placeholder = '开始你的创作...' }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
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

  // 插入图片
  const addImage = () => {
    const url = window.prompt('请输入图片地址:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
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
        </div>

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
            onClick={addImage}
            title="插入图片"
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

      {/* 提示文字 */}
      <div className="bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 px-4 py-2 text-xs text-gray-500 dark:text-gray-400">
        使用工具栏格式化文本。使用 H1/H2/H3 创建标题以生成目录。
      </div>
    </div>
  );
}

export default RichTextEditor;


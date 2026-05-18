'use client';
import { useState, useEffect, useRef } from 'react';
import { useEditor, EditorContent, useEditorState } from '@tiptap/react';
import { CellSelection } from '@tiptap/pm/tables';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Code2,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  List,
  ListOrdered,
  ListTodo,
  Quote,
  Minus,
  Table as TableIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon,
  Highlighter,
  Link as LinkIcon,
  Image as ImageIcon,
  Undo,
  Redo,
  RemoveFormatting,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from '@/components/ui/dropdown-menu';

function ToolbarButton({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <Button
      variant={active ? 'outline' : 'ghost'}
      size="icon-sm"
      title={title}
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
    >
      {children}
    </Button>
  );
}

const Divider = () => <div className="bg-border mx-0.5 h-4 w-px" />;

const MAX = 8;

function TablePicker({ onPick }: { onPick: (rows: number, cols: number) => void }) {
  const [hover, setHover] = useState({ r: 0, c: 0 });
  return (
    <div className="p-2">
      <div className="text-muted-foreground mb-1.5 text-center text-xs">
        {hover.r > 0 ? `${hover.r} × ${hover.c}` : 'Chọn kích thước bảng'}
      </div>
      <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${MAX}, 1.25rem)` }}>
        {Array.from({ length: MAX * MAX }, (_, i) => {
          const r = Math.floor(i / MAX) + 1;
          const c = (i % MAX) + 1;
          const active = r <= hover.r && c <= hover.c;
          return (
            <div
              key={i}
              className={`h-5 w-5 cursor-pointer rounded-sm border ${active ? 'bg-primary/20 border-primary' : 'border-border'}`}
              onMouseEnter={() => setHover({ r, c })}
              onClick={() => onPick(r, c)}
            />
          );
        })}
      </div>
    </div>
  );
}

export default function TiptapEditor() {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Link.configure({ openOnClick: false }),
      Image,
      Subscript,
      Superscript,
      TaskList,
      TaskItem.configure({ nested: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: '',
    editorProps: {
      attributes: {
        class:
          'tiptap min-h-[400px] w-full text-sm leading-7 outline-none [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:my-3 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:my-2.5 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:my-2 [&_h4]:text-lg [&_h4]:font-semibold [&_h4]:my-1.5',
      },
      handleDOMEvents: {
        dragstart: (_view, event) => {
          if ((event.target as Element)?.closest?.('td, th')) {
            event.preventDefault();
            return true;
          }
          return false;
        },
      },
    },
  })!;

  const s = useEditorState({
    editor,
    selector: (ctx) => ({
      bold: ctx.editor?.isActive('bold'),
      italic: ctx.editor?.isActive('italic'),
      underline: ctx.editor?.isActive('underline'),
      strike: ctx.editor?.isActive('strike'),
      code: ctx.editor?.isActive('code'),
      highlight: ctx.editor?.isActive('highlight'),
      subscript: ctx.editor?.isActive('subscript'),
      superscript: ctx.editor?.isActive('superscript'),
      h1: ctx.editor?.isActive('heading', { level: 1 }),
      h2: ctx.editor?.isActive('heading', { level: 2 }),
      h3: ctx.editor?.isActive('heading', { level: 3 }),
      h4: ctx.editor?.isActive('heading', { level: 4 }),
      alignLeft: ctx.editor?.isActive({ textAlign: 'left' }),
      alignCenter: ctx.editor?.isActive({ textAlign: 'center' }),
      alignRight: ctx.editor?.isActive({ textAlign: 'right' }),
      alignJustify: ctx.editor?.isActive({ textAlign: 'justify' }),
      bulletList: ctx.editor?.isActive('bulletList'),
      orderedList: ctx.editor?.isActive('orderedList'),
      taskList: ctx.editor?.isActive('taskList'),
      blockquote: ctx.editor?.isActive('blockquote'),
      codeBlock: ctx.editor?.isActive('codeBlock'),
      link: ctx.editor?.isActive('link'),
      table: ctx.editor?.isActive('table'),
    }),
  });

  const editorRef = useRef<HTMLDivElement>(null);
  const tableToolbarRef = useRef<HTMLDivElement>(null);
  const [tableToolbarPos, setTableToolbarPos] = useState<{ top: number; left: number } | null>(
    null,
  );

  useEffect(() => {
    if (!s.table || !editorRef.current) {
      setTableToolbarPos(null);
      return;
    }
    const table = editorRef.current.querySelector('table');
    if (!table) return;
    const wrapperRect = editorRef.current.getBoundingClientRect();
    const tableRect = table.getBoundingClientRect();
    const toolbarHeight = tableToolbarRef.current?.offsetHeight ?? 40;
    setTableToolbarPos({
      top: tableRect.top - wrapperRect.top - toolbarHeight - 6,
      left: tableRect.left - wrapperRect.left,
    });
  }, [s.table]);

  // Drag-to-select table cells via CellSelection
  useEffect(() => {
    if (!editor) return;
    const view = editor.view;

    let anchorCellPos: number | null = null;

    const getCellPos = (target: EventTarget | null): number | null => {
      const cell = (target as Element)?.closest?.('td, th');
      if (!cell) return null;
      const pos = view.posAtDOM(cell, 0);
      return pos > 0 ? pos - 1 : null;
    };

    const onMouseDown = (e: MouseEvent) => {
      const pos = getCellPos(e.target);
      if (pos === null) return;
      anchorCellPos = pos;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (anchorCellPos === null || !(e.buttons & 1)) return;
      const headPos = getCellPos(e.target);
      if (headPos === null) return;
      try {
        const sel = CellSelection.create(view.state.doc, anchorCellPos, headPos);
        const tr = view.state.tr.setSelection(sel);
        view.dispatch(tr);
      } catch {}
    };

    const onMouseUp = () => {
      anchorCellPos = null;
    };

    const dom = view.dom;
    dom.addEventListener('mousedown', onMouseDown);
    dom.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      dom.removeEventListener('mousedown', onMouseDown);
      dom.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [editor]);

  const addLink = () => {
    const url = window.prompt('URL:', editor.getAttributes('link').href ?? '');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor.chain().focus().setLink({ href: url }).run();
  };

  const addImage = () => {
    const url = window.prompt('Image URL:');
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Main toolbar */}
      <div className="border-border flex flex-wrap items-center gap-0.5 rounded-md border p-1">
        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="Undo">
          <Undo />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="Redo">
          <Redo />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
          title="Clear formatting"
        >
          <RemoveFormatting />
        </ToolbarButton>
        <Divider />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={s.h1}
          title="Heading 1"
        >
          <Heading1 />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={s.h2}
          title="Heading 2"
        >
          <Heading2 />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={s.h3}
          title="Heading 3"
        >
          <Heading3 />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
          active={s.h4}
          title="Heading 4"
        >
          <Heading4 />
        </ToolbarButton>
        <Divider />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={s.bold}
          title="Bold"
        >
          <Bold />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={s.italic}
          title="Italic"
        >
          <Italic />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={s.underline}
          title="Underline"
        >
          <UnderlineIcon />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={s.strike}
          title="Strikethrough"
        >
          <Strikethrough />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          active={s.code}
          title="Inline code"
        >
          <Code />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          active={s.highlight}
          title="Highlight"
        >
          <Highlighter />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleSubscript().run()}
          active={s.subscript}
          title="Subscript"
        >
          <SubscriptIcon />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleSuperscript().run()}
          active={s.superscript}
          title="Superscript"
        >
          <SuperscriptIcon />
        </ToolbarButton>
        <Divider />
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          active={s.alignLeft}
          title="Align left"
        >
          <AlignLeft />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          active={s.alignCenter}
          title="Align center"
        >
          <AlignCenter />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          active={s.alignRight}
          title="Align right"
        >
          <AlignRight />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          active={s.alignJustify}
          title="Justify"
        >
          <AlignJustify />
        </ToolbarButton>
        <Divider />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={s.bulletList}
          title="Bullet list"
        >
          <List />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={s.orderedList}
          title="Ordered list"
        >
          <ListOrdered />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          active={s.taskList}
          title="Task list"
        >
          <ListTodo />
        </ToolbarButton>
        <Divider />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={s.blockquote}
          title="Blockquote"
        >
          <Quote />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          active={s.codeBlock}
          title="Code block"
        >
          <Code2 />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Horizontal rule"
        >
          <Minus />
        </ToolbarButton>
        <Divider />
        <ToolbarButton onClick={addLink} active={s.link} title="Insert link">
          <LinkIcon />
        </ToolbarButton>
        <ToolbarButton onClick={addImage} title="Insert image">
          <ImageIcon />
        </ToolbarButton>

        {/* Table picker dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant={s.table ? 'outline' : 'ghost'} size="icon-sm" title="Insert table">
                <TableIcon />
              </Button>
            }
          />
          <DropdownMenuContent align="start" className="w-auto p-0">
            <TablePicker
              onPick={(r, c) =>
                editor.chain().focus().insertTable({ rows: r, cols: c, withHeaderRow: true }).run()
              }
            />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div ref={editorRef} className="relative">
        {tableToolbarPos && (
          <div
            ref={tableToolbarRef}
            className="bg-popover border-border absolute z-10 flex flex-wrap items-center gap-0.5 rounded-md border p-1 shadow-md"
            style={{ top: tableToolbarPos.top, left: tableToolbarPos.left }}
          >
            <ToolbarButton
              onClick={() => editor.chain().focus().addColumnBefore().run()}
              title="Thêm cột bên trái"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="14" y="3" width="7" height="18" rx="1" />
                <path d="M10 12H3" />
                <path d="M6.5 8.5 3 12l3.5 3.5" />
              </svg>
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().addColumnAfter().run()}
              title="Thêm cột bên phải"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="7" height="18" rx="1" />
                <path d="M14 12h7" />
                <path d="M17.5 8.5 21 12l-3.5 3.5" />
              </svg>
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().deleteColumn().run()}
              title="Xóa cột"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="7" height="18" rx="1" />
                <path d="m14 8 4 4-4 4" />
                <path d="m18 8-4 4 4 4" />
              </svg>
            </ToolbarButton>
            <Divider />
            <ToolbarButton
              onClick={() => editor.chain().focus().addRowBefore().run()}
              title="Thêm hàng phía trên"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="14" width="18" height="7" rx="1" />
                <path d="M12 10V3" />
                <path d="M8.5 6.5 12 3l3.5 3.5" />
              </svg>
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().addRowAfter().run()}
              title="Thêm hàng phía dưới"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="18" height="7" rx="1" />
                <path d="M12 14v7" />
                <path d="M8.5 17.5 12 21l3.5-3.5" />
              </svg>
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().deleteRow().run()}
              title="Xóa hàng"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="18" height="7" rx="1" />
                <path d="m14 14 4 4-4 4" />
                <path d="m18 14-4 4 4 4" />
              </svg>
            </ToolbarButton>
            <Divider />
            <ToolbarButton onClick={() => editor.chain().focus().mergeCells().run()} title="Gộp ô">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="18" height="18" rx="1" />
                <path d="M9 3v18" />
                <path d="m12 9-3 3 3 3" />
                <path d="m15 9 3 3-3 3" />
              </svg>
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().splitCell().run()} title="Tách ô">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="18" height="18" rx="1" />
                <path d="M12 3v18" />
                <path d="m9 9-3 3 3 3" />
                <path d="m15 9 3 3-3 3" />
              </svg>
            </ToolbarButton>
            <Divider />
            <ToolbarButton
              onClick={() => editor.chain().focus().deleteTable().run()}
              title="Xóa bảng"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-destructive"
              >
                <path d="M3 6h18" />
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                <line x1="10" x2="10" y1="11" y2="17" />
                <line x1="14" x2="14" y1="11" y2="17" />
              </svg>
            </ToolbarButton>
          </div>
        )}
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

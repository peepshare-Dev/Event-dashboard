import { useEffect, useRef, useState } from 'react';
import { Icon } from '@iconify/react';

interface RichTextEditorProps {
  /** Initial HTML. The editor is uncontrolled after mount. */
  defaultValue?: string;
  onChange: (html: string) => void;
  placeholder?: string;
  ariaLabel?: string;
}

type Popover = 'color' | 'highlight' | 'emoji' | 'block' | 'align' | 'link' | null;

const TEXT_COLORS = ['#1A1A1A', '#6B7280', '#FF6115', '#16A34A', '#D97706', '#DC2626', '#2563EB', '#7C3AED'];
const HIGHLIGHT_COLORS = ['#FFF0E8', '#FEF3C7', '#DCFCE7', '#DBEAFE', '#FCE7F3', 'transparent'];
const EMOJIS = ['😀', '😄', '😍', '🥳', '👍', '👏', '🙏', '🎉', '🎊', '🎵', '🎤', '🎸', '📸', '📍', '⏰', '🔥', '⭐', '❤️', '✅', '📢'];
const BLOCK_FORMATS = [
  { label: 'Paragraph', tag: 'P' },
  { label: 'Heading 1', tag: 'H1' },
  { label: 'Heading 2', tag: 'H2' },
  { label: 'Quote', tag: 'BLOCKQUOTE' },
];
const ALIGNMENTS = [
  { label: 'Align left', command: 'justifyLeft' },
  { label: 'Align center', command: 'justifyCenter' },
  { label: 'Align right', command: 'justifyRight' },
  { label: 'Justify', command: 'justifyFull' },
];
const STATE_COMMANDS = ['bold', 'italic', 'underline', 'strikeThrough', 'insertOrderedList', 'insertUnorderedList'] as const;

function escapeHtml(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function normalizeUrl(raw: string): string | null {
  const value = raw.trim();
  if (!value) return null;
  const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(value) ? value : `https://${value}`;
  // Only allow web and mail links — never `javascript:` or other schemes.
  return /^(https?:|mailto:)/i.test(withScheme) ? withScheme : null;
}

// Lightweight contentEditable editor built on document.execCommand — enough for event
// descriptions without pulling in an editor dependency.
export default function RichTextEditor({ defaultValue = '', onChange, placeholder = 'Write a description…', ariaLabel }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const savedRange = useRef<Range | null>(null);
  const imageInput = useRef<HTMLInputElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const videoInput = useRef<HTMLInputElement>(null);
  const [popover, setPopover] = useState<Popover>(null);
  const [active, setActive] = useState<Record<string, boolean>>({});
  const [isEmpty, setIsEmpty] = useState(!defaultValue);
  const [linkUrl, setLinkUrl] = useState('');

  useEffect(() => {
    if (editorRef.current) editorRef.current.innerHTML = defaultValue;
    // Mount-only: the editor owns its DOM afterwards.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Remember the caret so toolbar popovers (which steal focus) can act on it later.
  useEffect(() => {
    const onSelectionChange = () => {
      const sel = window.getSelection();
      const editor = editorRef.current;
      if (!sel || sel.rangeCount === 0 || !editor || !editor.contains(sel.anchorNode)) return;
      savedRange.current = sel.getRangeAt(0).cloneRange();
      setActive(Object.fromEntries(STATE_COMMANDS.map((c) => [c, document.queryCommandState(c)])));
    };
    document.addEventListener('selectionchange', onSelectionChange);
    return () => document.removeEventListener('selectionchange', onSelectionChange);
  }, []);

  const emitChange = () => {
    const editor = editorRef.current;
    if (!editor) return;
    setIsEmpty(!editor.textContent?.trim() && !editor.querySelector('img,video'));
    onChange(editor.innerHTML);
  };

  const restoreSelection = () => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.focus();
    const sel = window.getSelection();
    if (sel && savedRange.current) {
      sel.removeAllRanges();
      sel.addRange(savedRange.current);
    }
  };

  const exec = (command: string, value?: string) => {
    restoreSelection();
    document.execCommand('styleWithCSS', false, 'true');
    document.execCommand(command, false, value);
    setPopover(null);
    emitChange();
  };

  const insertHtml = (html: string) => exec('insertHTML', html);

  const handleFile = (kind: 'image' | 'file' | 'video') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const url = URL.createObjectURL(file);
    if (kind === 'image') exec('insertImage', url);
    else if (kind === 'video') insertHtml(`<video src="${url}" controls></video><p><br></p>`);
    else insertHtml(`<a href="${url}" download="${escapeHtml(file.name)}">📎 ${escapeHtml(file.name)}</a>&nbsp;`);
  };

  const applyLink = () => {
    const url = normalizeUrl(linkUrl);
    if (!url) return;
    const collapsed = !savedRange.current || savedRange.current.collapsed;
    if (collapsed) insertHtml(`<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(url)}</a>&nbsp;`);
    else exec('createLink', url);
    setLinkUrl('');
  };

  const togglePopover = (next: Exclude<Popover, null>) => setPopover((p) => (p === next ? null : next));

  return (
    <div className="border border-[#E5E7EB] rounded-2xl overflow-visible focus-within:border-[#FF6115] focus-within:ring-2 focus-within:ring-[#FF6115]/20">
      {/* Toolbar */}
      <div
        role="toolbar"
        aria-label="Formatting"
        className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 sm:px-5 py-2.5 bg-[#F9FAFB] rounded-t-2xl border-b border-[#F0F0F0]"
      >
        <ToolGroup>
          <ToolButton label="Bold" active={active.bold} onClick={() => exec('bold')}>
            <Icon icon="solar:text-bold-linear" width={20} height={20} />
          </ToolButton>
          <ToolButton label="Italic" active={active.italic} onClick={() => exec('italic')}>
            <Icon icon="solar:text-italic-linear" width={20} height={20} />
          </ToolButton>
          <ToolButton label="Underline" active={active.underline} onClick={() => exec('underline')}>
            <Icon icon="solar:text-underline-linear" width={20} height={20} />
          </ToolButton>
          <ToolButton label="Strikethrough" active={active.strikeThrough} onClick={() => exec('strikeThrough')}>
            <Icon icon="solar:text-cross-linear" width={20} height={20} />
          </ToolButton>
          <PopoverAnchor open={popover === 'color'} onClose={() => setPopover(null)} panel={<Swatches colors={TEXT_COLORS} onPick={(c) => exec('foreColor', c)} />}>
            <ToolButton label="Text color" active={popover === 'color'} onClick={() => togglePopover('color')}>
              <TextColorIcon />
            </ToolButton>
          </PopoverAnchor>
          <PopoverAnchor open={popover === 'highlight'} onClose={() => setPopover(null)} panel={<Swatches colors={HIGHLIGHT_COLORS} onPick={(c) => exec('hiliteColor', c)} />}>
            <ToolButton label="Highlight" active={popover === 'highlight'} onClick={() => togglePopover('highlight')}>
              <Icon icon="solar:pen-linear" width={20} height={20} />
            </ToolButton>
          </PopoverAnchor>
          <PopoverAnchor
            open={popover === 'emoji'}
            onClose={() => setPopover(null)}
            panel={
              <div className="grid grid-cols-5 gap-1 w-52">
                {EMOJIS.map((emoji) => (
                  <button key={emoji} type="button" onClick={() => exec('insertText', emoji)} className="h-9 rounded-lg text-lg hover:bg-[#F9FAFB]">
                    {emoji}
                  </button>
                ))}
              </div>
            }
          >
            <ToolButton label="Emoji" active={popover === 'emoji'} onClick={() => togglePopover('emoji')}>
              <Icon icon="solar:smile-circle-linear" width={21} height={21} />
            </ToolButton>
          </PopoverAnchor>
        </ToolGroup>

        <ToolGroup>
          <PopoverAnchor
            open={popover === 'block'}
            onClose={() => setPopover(null)}
            panel={<MenuList items={BLOCK_FORMATS.map((b) => ({ label: b.label, onClick: () => exec('formatBlock', `<${b.tag}>`) }))} />}
          >
            <ToolButton label="Text style" caret active={popover === 'block'} onClick={() => togglePopover('block')}>
              <span className="text-lg font-semibold leading-none">¶</span>
            </ToolButton>
          </PopoverAnchor>
          <PopoverAnchor
            open={popover === 'align'}
            onClose={() => setPopover(null)}
            panel={<MenuList items={ALIGNMENTS.map((a) => ({ label: a.label, onClick: () => exec(a.command) }))} />}
          >
            <ToolButton label="Alignment" caret active={popover === 'align'} onClick={() => togglePopover('align')}>
              <Icon icon="solar:align-left-linear" width={20} height={20} />
            </ToolButton>
          </PopoverAnchor>
          <ToolButton label="Numbered list" active={active.insertOrderedList} onClick={() => exec('insertOrderedList')}>
            <OrderedListIcon />
          </ToolButton>
          <ToolButton label="Bulleted list" active={active.insertUnorderedList} onClick={() => exec('insertUnorderedList')}>
            <Icon icon="solar:list-linear" width={20} height={20} />
          </ToolButton>
          <ToolButton label="Increase indent" onClick={() => exec('indent')}>
            <IndentIcon />
          </ToolButton>
          <ToolButton label="Decrease indent" onClick={() => exec('outdent')}>
            <IndentIcon outdent />
          </ToolButton>
        </ToolGroup>

        <ToolGroup className="sm:ml-auto">
          <ToolButton label="Insert image" onClick={() => imageInput.current?.click()}>
            <Icon icon="solar:gallery-linear" width={20} height={20} />
          </ToolButton>
          <PopoverAnchor
            open={popover === 'link'}
            onClose={() => setPopover(null)}
            align="right"
            panel={
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  applyLink();
                }}
                className="flex items-center gap-2 w-72"
              >
                <input
                  autoFocus
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://"
                  aria-label="Link URL"
                  className="flex-1 min-w-0 h-9 px-3 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6115]/30 focus:border-[#FF6115]"
                />
                <button type="submit" disabled={!normalizeUrl(linkUrl)} className="h-9 px-3 text-sm font-medium text-white bg-[#FF6115] hover:bg-[#E5540F] rounded-lg disabled:opacity-40">
                  Apply
                </button>
              </form>
            }
          >
            <ToolButton label="Insert link" active={popover === 'link'} onClick={() => togglePopover('link')}>
              <Icon icon="solar:link-linear" width={20} height={20} />
            </ToolButton>
          </PopoverAnchor>
          <ToolButton label="Attach file" onClick={() => fileInput.current?.click()}>
            <Icon icon="solar:file-linear" width={20} height={20} />
          </ToolButton>
          <ToolButton label="Insert video" onClick={() => videoInput.current?.click()}>
            <Icon icon="solar:videocamera-linear" width={20} height={20} />
          </ToolButton>
          <ToolButton label="Undo" onClick={() => exec('undo')}>
            <Icon icon="solar:undo-left-linear" width={20} height={20} />
          </ToolButton>
          <ToolButton label="Redo" onClick={() => exec('redo')}>
            <Icon icon="solar:undo-right-linear" width={20} height={20} />
          </ToolButton>
        </ToolGroup>

        <input ref={imageInput} type="file" accept="image/*" hidden onChange={handleFile('image')} />
        <input ref={fileInput} type="file" hidden onChange={handleFile('file')} />
        <input ref={videoInput} type="file" accept="video/*" hidden onChange={handleFile('video')} />
      </div>

      {/* Editing surface */}
      <div className="relative">
        {isEmpty && <div className="absolute left-5 top-4 text-sm text-[#9CA3AF] pointer-events-none">{placeholder}</div>}
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          role="textbox"
          aria-multiline="true"
          aria-label={ariaLabel ?? placeholder}
          onInput={emitChange}
          className="rich-text min-h-40 max-h-[480px] overflow-y-auto px-5 py-4 text-sm text-[#1A1A1A] focus:outline-none"
        />
      </div>
    </div>
  );
}

// --- Toolbar primitives ---

function ToolGroup({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`flex items-center gap-1 ${className}`}>{children}</div>;
}

function ToolButton({ label, active, caret, onClick, children }: {
  label: string;
  active?: boolean;
  caret?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      // Keep the editor's selection when clicking toolbar buttons.
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`h-9 flex items-center justify-center gap-0.5 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6115]/40 ${
        caret ? 'px-1.5' : 'w-9'
      } ${active ? 'bg-[#FFF0E8] text-[#FF6115]' : 'text-[#374151] hover:bg-white'}`}
    >
      {children}
      {caret && <span className="text-[8px] leading-none">▼</span>}
    </button>
  );
}

function PopoverAnchor({ open, onClose, panel, align = 'left', children }: {
  open: boolean;
  onClose: () => void;
  panel: React.ReactNode;
  align?: 'left' | 'right';
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      {children}
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={onClose} />
          <div
            className={`absolute top-full mt-1 z-20 bg-white border border-[#E5E7EB] rounded-xl shadow-lg p-2 ${
              align === 'right' ? 'right-0' : 'left-0'
            }`}
          >
            {panel}
          </div>
        </>
      )}
    </div>
  );
}

function Swatches({ colors, onPick }: { colors: string[]; onPick: (color: string) => void }) {
  return (
    <div className="grid grid-cols-4 gap-1.5 w-36">
      {colors.map((color) => (
        <button
          key={color}
          type="button"
          onClick={() => onPick(color)}
          aria-label={color === 'transparent' ? 'No highlight' : color}
          className="w-7 h-7 rounded-md border border-[#E5E7EB] hover:scale-105 transition-transform flex items-center justify-center"
          style={{ backgroundColor: color }}
        >
          {color === 'transparent' && <Icon icon="solar:close-linear" width={14} height={14} className="text-[#9CA3AF]" />}
        </button>
      ))}
    </div>
  );
}

function MenuList({ items }: { items: { label: string; onClick: () => void }[] }) {
  return (
    <div className="w-40 -m-1">
      {items.map((item) => (
        <button
          key={item.label}
          type="button"
          onClick={item.onClick}
          className="w-full text-left px-3 py-2 text-sm text-[#4B5563] rounded-lg hover:bg-[#F9FAFB]"
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

// Solar has no glyphs for these, so they're drawn inline to match its 1.5px stroke style.
function TextColorIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 19 9.5 4h1L16 19M6.2 13.5h7.6" />
      <path d="M19 14.5c0 0 -2 2.3 -2 3.6a2 2 0 0 0 4 0c0-1.3-2-3.6-2-3.6Z" fill="currentColor" />
    </svg>
  );
}

function OrderedListIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
      <path d="M10 6h10M10 12h10M10 18h10" />
      <path d="M4 4.5 5 4v4M4 8h2M4 11.2c.3-.5 1.8-.6 1.8.4 0 .8-1.8 1.6-1.8 2.4h2M4 16.5h1.8l-1 1.2c.8 0 1.2.4 1.2.9 0 .9-1.5 1.1-2 .5" strokeWidth="1.2" />
    </svg>
  );
}

function IndentIcon({ outdent }: { outdent?: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 5h18M11 10h10M11 14h10M3 19h18" />
      <path d={outdent ? 'M7 9.5 4 12l3 2.5' : 'M4 9.5 7 12l-3 2.5'} />
    </svg>
  );
}

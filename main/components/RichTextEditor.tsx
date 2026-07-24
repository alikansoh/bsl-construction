"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ClipboardEvent,
  type FocusEvent,
  type ReactNode,
} from "react";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
  stickyOffset?: number;
  resetKey?: string | number;
}

/* =========================================================
   COLORS
========================================================= */

const SWATCHES = [
  { label: "Default", value: "" },
  { label: "Ink", value: "#1C2024" },
  { label: "Steel", value: "#4B5A63" },
  { label: "Safety Amber", value: "#D98E1F" },
  { label: "Signal Red", value: "#C1401F" },
  { label: "Depth Blue", value: "#1F4B66" },
  { label: "Working Green", value: "#2F6B4F" },
];

/* =========================================================
   BLOCKS
========================================================= */

const BLOCKS = [
  { label: "Paragraph", tag: "P" },
  { label: "Heading", tag: "H3" },
  { label: "Subheading", tag: "H4" },
  { label: "Quote", tag: "BLOCKQUOTE" },
];

const BLOCK_TAGS = BLOCKS.map((block) => block.tag);

/* =========================================================
   CONFIG
========================================================= */

const COMMIT_DEBOUNCE_MS = 250;
const EMPTY_HTML = "<p><br></p>";

/* =========================================================
   HELPERS
========================================================= */

const isHtmlEmpty = (html: string) => {
  if (!html) {
    return true;
  }

  const trimmed = html.trim();

  if (!trimmed) {
    return true;
  }

  return /^<(p|div)>(\s|<br\s*\/?>)*<\/(p|div)>$/i.test(trimmed);
};

/* =========================================================
   TOOLBAR
========================================================= */

function ToolbarButton({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onMouseDown={(event) => {
        /*
          Keep the editor's selection when a toolbar button
          is clicked instead of moving focus to the button.
        */
        event.preventDefault();
      }}
      onClick={onClick}
      title={title}
      aria-label={title}
      aria-pressed={active}
      className={`
        flex
        h-7
        min-w-7
        items-center
        justify-center
        rounded-md
        px-1.5
        text-xs
        font-semibold
        transition-colors
        ${
          active
            ? "bg-[#1C2024] text-white"
            : "text-slate-600 hover:bg-slate-200"
        }
      `}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return (
    <span
      className="mx-1 h-5 w-px shrink-0 bg-slate-300"
      aria-hidden="true"
    />
  );
}

/* =========================================================
   RICH TEXT EDITOR
========================================================= */

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Start typing...",
  minHeight = 96,
  stickyOffset = 0,
  resetKey,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const styleSelectRef = useRef<HTMLSelectElement>(null);

  const initializedRef = useRef(false);
  const previousResetKeyRef = useRef(resetKey);
  const onChangeRef = useRef(onChange);

  const pendingHtmlRef = useRef<string | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  /*
    This is set only when the user explicitly interacts with
    the text-style dropdown. It lets us distinguish a legitimate
    select focus from the unexpected focus transfer in your logs.
  */
  const styleSelectInteractionRef = useRef(false);
  const styleSelectInteractionTimerRef = useRef<
    ReturnType<typeof setTimeout> | null
  >(null);

  const [active, setActive] = useState<Record<string, boolean>>({});
  const [blockTag, setBlockTag] = useState("P");
  const [customColor, setCustomColor] = useState("#D98E1F");
  const [focused, setFocused] = useState(false);
  const [isEmpty, setIsEmpty] = useState(() => isHtmlEmpty(value));

  /* =========================================================
     KEEP THE LATEST CALLBACK
  ========================================================= */

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  /* =========================================================
     INITIALIZE ONCE
  ========================================================= */

  useLayoutEffect(() => {
    const editor = editorRef.current;

    if (!editor || initializedRef.current) {
      return;
    }

    const initialHtml = value || EMPTY_HTML;

    if (editor.innerHTML !== initialHtml) {
      editor.innerHTML = initialHtml;
    }

    setIsEmpty(isHtmlEmpty(initialHtml));

    initializedRef.current = true;
    previousResetKeyRef.current = resetKey;
  }, []);

  /* =========================================================
     RESET ONLY WHEN resetKey CHANGES
  ========================================================= */

  useEffect(() => {
    const editor = editorRef.current;

    if (!editor || !initializedRef.current) {
      return;
    }

    if (previousResetKeyRef.current === resetKey) {
      return;
    }

    const nextHtml = value || EMPTY_HTML;

    editor.innerHTML = nextHtml;
    setIsEmpty(isHtmlEmpty(nextHtml));

    previousResetKeyRef.current = resetKey;
  }, [resetKey, value]);

  /* =========================================================
     CLEANUP
  ========================================================= */

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      if (styleSelectInteractionTimerRef.current) {
        clearTimeout(styleSelectInteractionTimerRef.current);
      }

      if (pendingHtmlRef.current !== null) {
        onChangeRef.current(pendingHtmlRef.current);
      }
    };
  }, []);

  /* =========================================================
     COMMIT HELPERS
  ========================================================= */

  const commitNow = () => {
    const editor = editorRef.current;

    if (!editor) {
      return;
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    pendingHtmlRef.current = null;
    onChangeRef.current(editor.innerHTML);
  };

  const scheduleCommit = () => {
    const editor = editorRef.current;

    if (!editor) {
      return;
    }

    pendingHtmlRef.current = editor.innerHTML;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      debounceTimerRef.current = null;

      if (pendingHtmlRef.current !== null) {
        const html = pendingHtmlRef.current;

        pendingHtmlRef.current = null;
        onChangeRef.current(html);
      }
    }, COMMIT_DEBOUNCE_MS);
  };

  /* =========================================================
     ACTIVE TOOLBAR STATE
  ========================================================= */

  const updateActiveState = () => {
    const editor = editorRef.current;

    /*
      Never query command state while focus is on a toolbar
      control or elsewhere in the page.
    */
    if (!editor || document.activeElement !== editor) {
      return;
    }

    try {
      setActive({
        bold: document.queryCommandState("bold"),
        italic: document.queryCommandState("italic"),
        underline: document.queryCommandState("underline"),
        insertUnorderedList: document.queryCommandState(
          "insertUnorderedList",
        ),
        insertOrderedList: document.queryCommandState("insertOrderedList"),
        justifyLeft: document.queryCommandState("justifyLeft"),
        justifyCenter: document.queryCommandState("justifyCenter"),
        justifyRight: document.queryCommandState("justifyRight"),
      });

      const currentBlock = document
        .queryCommandValue("formatBlock")
        .replace(/[<>]/g, "")
        .toUpperCase();

      setBlockTag(BLOCK_TAGS.includes(currentBlock) ? currentBlock : "P");
    } catch {
      // The browser selection can be unavailable briefly.
    }
  };

  /* =========================================================
     EDITOR COMMANDS
  ========================================================= */

  const runCommand = (command: string, arg?: string) => {
    const editor = editorRef.current;

    if (!editor) {
      return;
    }

    editor.focus();

    document.execCommand(command, false, arg);

    updateActiveState();
    setIsEmpty(isHtmlEmpty(editor.innerHTML));
    commitNow();
  };

  const insertLink = () => {
    const url = window.prompt("Link URL (e.g. /contact or https://...)");

    if (!url?.trim()) {
      return;
    }

    runCommand("createLink", url.trim());
  };

  /* =========================================================
     EDITOR EVENTS
  ========================================================= */

  const handleInput = () => {
    const editor = editorRef.current;

    if (editor) {
      setIsEmpty(isHtmlEmpty(editor.innerHTML));
    }

    scheduleCommit();
  };

  const handlePaste = (event: ClipboardEvent<HTMLDivElement>) => {
    event.preventDefault();

    const text = event.clipboardData.getData("text/plain");

    document.execCommand("insertText", false, text);
    handleInput();
  };

  const handleEditorBlur = (event: FocusEvent<HTMLDivElement>) => {
    const nextFocusedElement = event.relatedTarget;

    /*
      Your logs showed:
        editor -> select

      If the select was not clicked by the user, it should not
      receive focus. Refocus the editor in the next frame.

      We use requestAnimationFrame so the browser finishes its
      current focus operation before we restore editor focus.
    */
    if (
      nextFocusedElement === styleSelectRef.current &&
      !styleSelectInteractionRef.current
    ) {
      requestAnimationFrame(() => {
        editorRef.current?.focus();
      });

      return;
    }

    setFocused(false);
    commitNow();
  };

  const markStyleSelectInteraction = () => {
    styleSelectInteractionRef.current = true;

    if (styleSelectInteractionTimerRef.current) {
      clearTimeout(styleSelectInteractionTimerRef.current);
    }

    /*
      Keep the flag only long enough for the related blur/focus
      browser events to finish.
    */
    styleSelectInteractionTimerRef.current = setTimeout(() => {
      styleSelectInteractionRef.current = false;
      styleSelectInteractionTimerRef.current = null;
    }, 500);
  };

  return (
    <div
      className={`
        rounded-lg
        border
        bg-white
        transition-colors
        ${
          focused
            ? "border-[#1F4B66] ring-2 ring-[#1F4B66]/15"
            : "border-slate-300"
        }
      `}
    >
      {/* =====================================================
          TOOLBAR
      ===================================================== */}

      <div
        className="
          sticky
          z-10
          flex
          flex-wrap
          items-center
          gap-1
          rounded-t-lg
          border-b
          border-slate-200
          bg-slate-50/95
          px-2
          py-1.5
          backdrop-blur
          supports-[backdrop-filter]:bg-slate-50/80
        "
        style={{ top: stickyOffset }}
      >
        <select
          ref={styleSelectRef}
          value={blockTag}
          onPointerDown={markStyleSelectInteraction}
          onKeyDown={markStyleSelectInteraction}
          onChange={(event) => {
            runCommand(
              "formatBlock",
              `<${event.target.value.toLowerCase()}>`,
            );
          }}
          className="
            h-7
            rounded-md
            border
            border-slate-300
            bg-white
            px-1.5
            text-xs
            text-slate-600
            outline-none
          "
          title="Text style"
          aria-label="Text style"
        >
          {BLOCKS.map((block) => (
            <option key={block.tag} value={block.tag}>
              {block.label}
            </option>
          ))}
        </select>

        <ToolbarDivider />

        <ToolbarButton
          onClick={() => runCommand("bold")}
          active={active.bold}
          title="Bold"
        >
          B
        </ToolbarButton>

        <ToolbarButton
          onClick={() => runCommand("italic")}
          active={active.italic}
          title="Italic"
        >
          <span className="italic">I</span>
        </ToolbarButton>

        <ToolbarButton
          onClick={() => runCommand("underline")}
          active={active.underline}
          title="Underline"
        >
          <span className="underline">U</span>
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton
          onClick={() => runCommand("insertUnorderedList")}
          active={active.insertUnorderedList}
          title="Bullet list"
        >
          •≡
        </ToolbarButton>

        <ToolbarButton
          onClick={() => runCommand("insertOrderedList")}
          active={active.insertOrderedList}
          title="Numbered list"
        >
          1≡
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton
          onClick={() => runCommand("justifyLeft")}
          active={active.justifyLeft}
          title="Align left"
        >
          ⯇≡
        </ToolbarButton>

        <ToolbarButton
          onClick={() => runCommand("justifyCenter")}
          active={active.justifyCenter}
          title="Align center"
        >
          ≡
        </ToolbarButton>

        <ToolbarButton
          onClick={() => runCommand("justifyRight")}
          active={active.justifyRight}
          title="Align right"
        >
          ≡⯈
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton onClick={insertLink} title="Insert link">
          🔗
        </ToolbarButton>

        <ToolbarDivider />

        <div className="flex items-center gap-1">
          {SWATCHES.map((swatch) => (
            <button
              key={swatch.label}
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                runCommand(
                  swatch.value ? "foreColor" : "removeFormat",
                  swatch.value || undefined,
                );
              }}
              title={swatch.label}
              aria-label={`Text color: ${swatch.label}`}
              className="
                h-6
                w-6
                rounded-full
                border
                border-black/10
                shadow-sm
                transition-transform
                hover:scale-110
              "
              style={{
                background:
                  swatch.value ||
                  "repeating-conic-gradient(#e2e8f0 0% 25%, #fff 0% 50%) 50% / 8px 8px",
              }}
            />
          ))}

          <label
            title="Custom color"
            className="
              relative
              flex
              h-6
              w-6
              cursor-pointer
              items-center
              justify-center
              rounded-full
              border
              border-dashed
              border-slate-400
              text-[10px]
              text-slate-500
              hover:border-slate-600
            "
          >
            +
            <input
              type="color"
              value={customColor}
              onChange={(event) => {
                const color = event.target.value;

                setCustomColor(color);
                runCommand("foreColor", color);
              }}
              aria-label="Custom text color"
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            />
          </label>
        </div>

        <ToolbarDivider />

        <ToolbarButton onClick={() => runCommand("undo")} title="Undo">
          ↺
        </ToolbarButton>

        <ToolbarButton onClick={() => runCommand("redo")} title="Redo">
          ↻
        </ToolbarButton>

        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => runCommand("removeFormat")}
          title="Clear formatting"
          className="
            ml-auto
            rounded-md
            px-2
            text-xs
            font-medium
            text-slate-500
            hover:bg-slate-200
            hover:text-slate-700
          "
        >
          Clear
        </button>
      </div>

      {/* =====================================================
          EDITOR
      ===================================================== */}

      <div className="relative overflow-hidden rounded-b-lg">
        <span
          className={`
            pointer-events-none
            absolute
            left-3
            top-2.5
            text-sm
            text-slate-400
            ${isEmpty ? "opacity-100" : "opacity-0"}
          `}
          aria-hidden={!isEmpty}
        >
          {placeholder}
        </span>

        <div
          ref={editorRef}
          contentEditable
          tabIndex={0}
          suppressContentEditableWarning
          role="textbox"
          aria-multiline="true"
          aria-label={placeholder}
          onInput={handleInput}
          onPaste={handlePaste}
          onFocus={() => {
            setFocused(true);

            /*
              Do not call updateActiveState here. The browser is
              still completing the contentEditable focus transition.
            */
          }}
          onBlur={handleEditorBlur}
          onKeyUp={updateActiveState}
          onMouseUp={() => {
            /*
              Read selection state only after the browser has placed
              the caret at the clicked location.
            */
            requestAnimationFrame(updateActiveState);
          }}
          style={{
            minHeight,
            WebkitUserSelect: "text",
            userSelect: "text",
            caretColor: "#1e293b",
          }}
          className="
            relative
            z-[1]
            w-full
            cursor-text
            px-3
            py-2.5
            text-sm
            leading-relaxed
            text-slate-800
            outline-none

            [&_a]:text-[#1F4B66]
            [&_a]:underline

            [&_blockquote]:border-l-2
            [&_blockquote]:border-slate-300
            [&_blockquote]:pl-3
            [&_blockquote]:italic
            [&_blockquote]:text-slate-500

            [&_h3]:text-lg
            [&_h3]:font-semibold

            [&_h4]:text-base
            [&_h4]:font-semibold

            [&_li]:ml-4

            [&_ol]:list-decimal

            [&_strong]:font-bold

            [&_ul]:list-disc
          "
        />
      </div>
    </div>
  );
}
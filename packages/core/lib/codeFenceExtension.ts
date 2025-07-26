import {
  Decoration,
  EditorView,
  ViewPlugin,
  type ViewUpdate,
} from '@codemirror/view';
import { syntaxTree } from '@codemirror/language';
import { RangeSetBuilder } from '@codemirror/state';
import type { DecorationSet } from '@codemirror/view';
import { WidgetType } from '@codemirror/view';
import { type Extension } from '@codemirror/state';

const codeBlockDecorations = (view: EditorView) => {
  const builder = new RangeSetBuilder<Decoration>();

  for (const { from, to } of view.visibleRanges) {
    syntaxTree(view.state).iterate({
      from,
      to,
      enter: (node) => {
        if (node.name === 'FencedCode') {
          let lang = '';
          const codeInfoNode = node.node.getChild('CodeInfo');
          if (codeInfoNode) {
            lang = view.state.doc
              .sliceString(codeInfoNode.from, codeInfoNode.to)
              .toUpperCase();
          }

          for (let pos = node.from; pos <= node.to; ) {
            const line = view.state.doc.lineAt(pos);
            const isFirstLine = pos === node.from;
            const isLastLine = line.to >= node.to;

            builder.add(
              line.from,
              line.from,
              Decoration.line({
                class: `cm-fenced-code-line ${
                  isFirstLine ? 'cm-fenced-code-line-first' : ''
                } ${isLastLine ? 'cm-fenced-code-line-last' : ''}`,
              }),
            );

            if (isFirstLine) {
              builder.add(
                line.from,
                line.from,
                Decoration.widget({
                  widget: new CodeBlockInfoWidget(
                    lang,
                    view.state.doc.sliceString(line.to + 1, node.to - 4),
                  ),
                }),
              );
            }

            pos = line.to + 1;
          }
        }
      },
    });
  }

  return builder.finish();
};

class CodeBlockInfoWidget extends WidgetType {
  constructor(
    readonly lang: string,
    readonly code: string,
  ) {
    super();
  }

  eq(other: CodeBlockInfoWidget) {
    return other.lang === this.lang && other.code === this.code;
  }

  toDOM() {
    const container = document.createElement('div');
    container.className = 'cm-code-block-info';

    const langContainer = document.createElement('span');
    langContainer.className = 'cm-code-block-lang-container';
    langContainer.innerText = this.lang;
    container.appendChild(langContainer);

    const copyButton = document.createElement('button');
    copyButton.className = 'cm-code-block-copy-button';
    // Copy icon from Lucide
    copyButton.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg"
        width="16" height="16" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
        class="lucide lucide-copy-icon lucide-copy">
          <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
          <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
      </svg>`;
    copyButton.onclick = () => {
      void navigator.clipboard.writeText(this.code);
    };
    container.appendChild(copyButton);

    return container;
  }
}

export const codeBlockDecorationsExtension: Extension = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;

    constructor(view: EditorView) {
      this.decorations = codeBlockDecorations(view);
    }

    update(update: ViewUpdate) {
      if (update.docChanged || update.viewportChanged) {
        this.decorations = codeBlockDecorations(update.view);
      }
    }
  },
  {
    decorations: (v) => v.decorations,
  },
);

export const codeFenceTheme = EditorView.theme({
  '.cm-fenced-code-line': {
    backgroundColor: '#f0f0f0',
    display: 'block',
    marginLeft: '6px',
  },
  '.cm-activeLine.cm-fenced-code-line': {
    backgroundColor: '#f0f0f0',
  },
  '.cm-fenced-code-line-first': {
    borderTopLeftRadius: '0.4rem',
    borderTopRightRadius: '0.4rem',
  },
  '.cm-fenced-code-line-last': {
    borderBottomLeftRadius: '0.4rem',
    borderBottomRightRadius: '0.4rem',
  },
  '.cm-code-block-info': {
    float: 'right',
    padding: '0.2rem',
    display: 'flex',
    gap: '0.3rem',
    alignItems: 'center',
  },
  '.cm-code-block-lang-container': {
    fontSize: '0.8rem',
    color: 'grey',
  },
  '.cm-code-block-copy-button': {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ddd',
    border: 'none',
    padding: '0.2rem',
    borderRadius: '0.2rem',
    cursor: 'pointer',
    color: '#666',
  },
  '.cm-code-block-copy-button:hover': {
    backgroundColor: '#d0d0d0',
  },
  '.cm-code-block-copy-button svg': {
    width: '16px',
    height: '16px',
  },
});

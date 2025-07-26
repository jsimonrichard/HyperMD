import { Decoration, EditorView, WidgetType } from '@codemirror/view';
import { foldableSyntaxFacet, selectAllDecorationsOnSelectExtension } from './core';

class HorizontalRuleWidget extends WidgetType {
  toDOM() {
    const div = document.createElement('div');
    div.className = 'cm-horizontal-rule-container';
    const hr = document.createElement('hr');
    div.appendChild(hr);
    return div;
  }

  // allows clicks to pass through to the editor
  ignoreEvent(_event: Event) {
    return false;
  }

  destroy(dom: HTMLElement): void {
    dom.remove();
  }
}

const horizontalRuleTheme = EditorView.theme({
  '.cm-horizontal-rule-container': {
    height: '1.4em',
    display: 'flow-root',
    'align-items': 'center',
    padding: '0 2px 0 6px',
  }
});

export const horizonalRuleExtension = [
  foldableSyntaxFacet.of({
    nodePath: 'HorizontalRule',
    onFold: (_state, node) => {
      return Decoration.replace({
        widget: new HorizontalRuleWidget(),
        block: true,
        inclusiveStart: true,
      }).range(node.from, node.to);
    },
  }),
  horizontalRuleTheme,
  selectAllDecorationsOnSelectExtension('cm-horizontal-rule-container'),
];

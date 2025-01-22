import {
  CharCategory,
  EditorSelection,
  type EditorState,
  type SelectionRange,
  findClusterBreak,
} from '@codemirror/state';
import {
  type DOMEventHandlers,
  type DOMEventMap,
  type PluginSpec,
  ViewPlugin,
  type PluginValue,
} from '@codemirror/view';
import type { TreeCursor } from '@lezer/common';
import { EditorView } from 'codemirror';

/* This is a reference to vim's WORD: a "word" including any non-whitespace character */
export function stateWORDAt(
  state: EditorState,
  pos: number,
): SelectionRange | null {
  const { text, from, length } = state.doc.lineAt(pos);
  const cat = state.charCategorizer(pos);
  let start = pos - from,
    end = pos - from;
  while (start > 0) {
    const prev = findClusterBreak(text, start, false);
    if (cat(text.slice(prev, start)) === CharCategory.Space) break;
    start = prev;
  }
  while (end < length) {
    const next = findClusterBreak(text, end);
    if (cat(text.slice(end, next)) === CharCategory.Space) break;
    end = next;
  }
  return start == end ? null : EditorSelection.range(start + from, end + from);
}

export interface RangeLike {
  from: number;
  to: number;
}

export function rangeTouchesRange(a: RangeLike, b: RangeLike): boolean {
  return a.from <= b.to && b.from <= a.to;
}

export function selectionTouchesRange(
  selection: readonly SelectionRange[],
  b: RangeLike,
): boolean {
  return selection.some((range) => rangeTouchesRange(range, b));
}

// function rangeSetIncludes<V extends RangeValue>(
//   from: number,
//   to: number,
//   set: RangeSet<V>,
// ) {
//   let touches = false;
//   set.between(from, to, () => {
//     touches = true;
//     return false;
//   });
//   return touches;
// }

export function iterChildren(
  cursor: TreeCursor,
  enter: (cursor: TreeCursor) => undefined | boolean,
): void {
  if (!cursor.firstChild()) return;
  do {
    if (enter(cursor)) break;
  } while (cursor.nextSibling());
  console.assert(cursor.parent());
}

export function justPluginSpec(
  spec: PluginSpec<PluginValue>,
): ViewPlugin<PluginValue> {
  return ViewPlugin.define(() => ({}), spec);
}

export type ClassBasedEventHandlers<This> = {
  [event in keyof DOMEventMap]?: Record<string, DOMEventHandlers<This>[event]>;
};

export function eventHandlersWithClass<This>(
  handlers: ClassBasedEventHandlers<This>,
): DOMEventHandlers<This> {
  return Object.fromEntries(
    Object.entries(handlers)
      .filter(([_event, handlers]) => !!handlers)
      .map(([event, handlers]) => [
        event,
        function (this: This, ev: Event, view: EditorView) {
          const res = [];
          for (const className in handlers) {
            if (
              ev
                .composedPath()
                .some((el) => (el as HTMLElement).classList.contains(className))
            ) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              res.push(handlers[className]?.call(this, ev as any, view));
            }
          }
          return res.some((res) => !!res);
        },
      ]),
  );
}

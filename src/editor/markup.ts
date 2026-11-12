// Adapted from @codemirror/lang-markdown (MIT, Marijn Haverbeke and others), so the editor needn't import it:
// lang-markdown imports lang-html, which put the HTML, CSS and JavaScript grammars in the up-front bundle.
// Differs for Obsidian: a task takes any character in its box, and Enter on an empty item always ends the list.
import { syntaxTree, indentUnit } from '@codemirror/language';
import { EditorSelection, countColumn } from '@codemirror/state';
import type { ChangeSpec, EditorState, StateCommand, Text } from '@codemirror/state';
import type { SyntaxNode, Tree } from '@lezer/common';

/** One level of block markup on a line: a quote's `>`, or a list item's marker. */
class Context {
  readonly node: SyntaxNode;
  readonly from: number;
  readonly to: number;
  readonly spaceBefore: string;
  readonly spaceAfter: string;
  readonly type: string;
  readonly item: SyntaxNode | null;
  constructor(node: SyntaxNode, from: number, to: number, spaceBefore: string, spaceAfter: string, type: string, item: SyntaxNode | null) {
    this.node = node;
    this.from = from;
    this.to = to;
    this.spaceBefore = spaceBefore;
    this.spaceAfter = spaceAfter;
    this.type = type;
    this.item = item;
  }

  blank(maxWidth: number | null, trailing = true) {
    let result = this.spaceBefore + (this.node.name === 'Blockquote' ? '>' : '');
    if (maxWidth !== null) {
      while (result.length < maxWidth) result += ' ';
      return result;
    }
    for (let i = this.to - this.from - result.length - this.spaceAfter.length; i > 0; i--) result += ' ';
    return result + (trailing ? this.spaceAfter : '');
  }

  marker(doc: Text, add: number) {
    const number = this.node.name === 'OrderedList' ? String(+itemNumber(this.item!, doc)![2] + add) : '';
    return this.spaceBefore + number + this.type + this.spaceAfter;
  }
}

const getContext = (node: SyntaxNode, doc: Text) => {
  const nodes: SyntaxNode[] = [];
  const context: Context[] = [];
  for (let cur: SyntaxNode | null = node; cur; cur = cur.parent) {
    if (cur.name === 'FencedCode') return context;
    if (cur.name === 'ListItem' || cur.name === 'Blockquote') nodes.push(cur);
  }
  for (let i = nodes.length - 1; i >= 0; i--) {
    const node = nodes[i];
    const line = doc.lineAt(node.from);
    const startPos = node.from - line.from;
    const text = line.text.slice(startPos);
    let match: RegExpExecArray | null;
    if (node.name === 'Blockquote' && (match = /^ *>( ?)/.exec(text))) {
      context.push(new Context(node, startPos, startPos + match[0].length, '', match[1], '>', null));
    } else if (node.name === 'ListItem' && node.parent!.name === 'OrderedList' && (match = /^( *)\d+([.)])( *)/.exec(text))) {
      let after = match[3];
      let len = match[0].length;
      if (after.length >= 4) {
        after = after.slice(0, after.length - 4);
        len -= 4;
      }
      context.push(new Context(node.parent!, startPos, startPos + len, match[1], after, match[2], node));
    } else if (node.name === 'ListItem' && node.parent!.name === 'BulletList'
      && (match = /^( *)([-+*])( {1,4}\[[^\]\n]\])?( +)/u.exec(text))) {
      let after = match[4];
      let len = match[0].length;
      if (after.length > 4) {
        after = after.slice(0, after.length - 4);
        len -= 4;
      }
      // A new task starts unchecked, whatever the one before had in its box.
      const type = match[2] + (match[3] ? match[3].replace(/\[[^\]]\]/u, '[ ]') : '');
      context.push(new Context(node.parent!, startPos, startPos + len, match[1], after, type, node));
    }
  }
  return context;
};

const itemNumber = (item: SyntaxNode, doc: Text) => /^(\s*)(\d+)(?=[.)])/.exec(doc.sliceString(item.from, item.from + 10));

const renumberList = (after: SyntaxNode, doc: Text, changes: ChangeSpec[], offset = 0) => {
  for (let prev = -1, node: SyntaxNode | null = after; node; node = node.nextSibling) {
    if (node.name !== 'ListItem') continue;
    const match = itemNumber(node, doc);
    if (!match) return;
    const number = +match[2];
    if (prev >= 0) {
      if (number !== prev + 1) return;
      changes.push({ from: node.from + match[1].length, to: node.from + match[0].length, insert: String(prev + 2 + offset) });
    }
    prev = number;
  }
};

/** With tab indentation, leading spaces become tabs. */
const normalizeIndent = (content: string, state: EditorState) => {
  const blank = /^[ \t]*/.exec(content)![0].length;
  if (!blank || state.facet(indentUnit) !== '\t') return content;
  let space = '';
  for (let i = countColumn(content, 4, blank); i > 0;) {
    if (i >= 4) {
      space += '\t';
      i -= 4;
    } else {
      space += ' ';
      i--;
    }
  }
  return space + content.slice(blank);
};

const nonTightList = (node: SyntaxNode, doc: Text) => {
  if (node.name !== 'OrderedList' && node.name !== 'BulletList') return false;
  const first = node.firstChild!;
  const second = node.getChild('ListItem', 'ListItem');
  if (!second) return false;
  const line1 = doc.lineAt(first.to);
  const line2 = doc.lineAt(second.from);
  return line1.number + (/^[\s>]*$/.test(line1.text) ? 0 : 1) < line2.number;
};

const blankLine = (context: Context[], state: EditorState, line: { text: string }) => {
  let insert = '';
  for (let i = 0, e = context.length - 2; i <= e; i++) {
    insert += context[i].blank(i < e ? countColumn(line.text, 4, context[i + 1].from) - insert.length : null, i < e);
  }
  return normalizeIndent(insert, state);
};

/**
 * Enter continues lists, tasks, quotes and callouts with the markup of the line before.
 * On an empty item it ends the list, as in Obsidian. Returns false where there's no markup to continue.
 */
export const continueMarkup: StateCommand = ({ state, dispatch }) => {
  const tree = syntaxTree(state);
  const { doc } = state;
  let dont = false;
  const changes = state.changeByRange((range) => {
    if (!range.empty) return (dont = true, { range });
    const pos = range.from;
    const line = doc.lineAt(pos);
    const context = getContext(tree.resolveInner(pos, -1), doc);
    while (context.length && context[context.length - 1].from > pos - line.from) context.pop();
    if (!context.length) return (dont = true, { range });
    const inner = context[context.length - 1];
    if (inner.to - inner.spaceAfter.length > pos - line.from) return (dont = true, { range });
    const emptyLine = pos >= inner.to - inner.spaceAfter.length && !/\S/.test(line.text.slice(inner.to));

    // An empty list item: remove one level of markup.
    if (inner.item && emptyLine) {
      if (inner.item.from < line.from && !/^[\s>]*$/.test(line.text.slice(0, inner.to))) return (dont = true, { range });
      const next = context.length > 1 ? context[context.length - 2] : null;
      let delTo: number;
      let insert = '';
      if (next?.item) {
        delTo = line.from + next.from;
        insert = next.marker(doc, 1);
      } else {
        delTo = line.from + (next ? next.to : 0);
      }
      const changes: ChangeSpec[] = [{ from: delTo, to: pos, insert }];
      if (inner.node.name === 'OrderedList') renumberList(inner.item, doc, changes, -2);
      if (next?.node.name === 'OrderedList') renumberList(next.item!, doc, changes);
      return { range: EditorSelection.cursor(delTo + insert.length), changes };
    }

    // Two empty quoted lines in a row end the quote.
    if (inner.node.name === 'Blockquote' && emptyLine && line.from) {
      const prevLine = doc.lineAt(line.from - 1);
      const quoted = />\s*$/.exec(prevLine.text);
      if (quoted && quoted.index === inner.from) {
        const changes = state.changes([
          { from: prevLine.from + quoted.index, to: prevLine.to },
          { from: line.from + inner.from, to: line.to },
        ]);
        return { range: range.map(changes), changes };
      }
    }

    const changes: ChangeSpec[] = [];
    if (inner.node.name === 'OrderedList') renumberList(inner.item!, doc, changes);
    const continued = inner.item && inner.item.from < line.from;
    let insert = '';
    if (!continued || /^[\s\d.)\-+*>]*/.exec(line.text)![0].length >= inner.to) {
      for (let i = 0, e = context.length - 1; i <= e; i++) {
        insert += i === e && !continued
          ? context[i].marker(doc, 1)
          : context[i].blank(i < e ? countColumn(line.text, 4, context[i + 1].from) - insert.length : null);
      }
    }
    let from = pos;
    while (from > line.from && /\s/.test(line.text.charAt(from - line.from - 1))) from--;
    insert = normalizeIndent(insert, state);
    if (nonTightList(inner.node, doc)) insert = blankLine(context, state, line) + state.lineBreak + insert;
    changes.push({ from, to: pos, insert: state.lineBreak + insert });
    return { range: EditorSelection.cursor(from + insert.length + 1), changes };
  });
  if (dont) return false;
  dispatch(state.update(changes, { scrollIntoView: true, userEvent: 'input' }));
  return true;
};

const isMark = (node: SyntaxNode) => node.name === 'QuoteMark' || node.name === 'ListMark';

const contextNodeForDelete = (tree: Tree, pos: number) => {
  let node = tree.resolveInner(pos, -1);
  let scan = pos;
  if (isMark(node)) {
    scan = node.from;
    node = node.parent!;
  }
  for (let prev; (prev = node.childBefore(scan));) {
    if (isMark(prev)) {
      scan = prev.from;
    } else if (prev.name === 'OrderedList' || prev.name === 'BulletList') {
      node = prev.lastChild!;
      scan = node.to;
    } else {
      break;
    }
  }
  return node;
};

/** Backspace right after list or quote markup deletes one level of it. A list marker becomes spaces first. */
export const deleteMarkupBackward: StateCommand = ({ state, dispatch }) => {
  const tree = syntaxTree(state);
  let dont = false;
  const changes = state.changeByRange((range) => {
    const pos = range.from;
    const { doc } = state;
    if (range.empty) {
      const line = doc.lineAt(pos);
      const context = getContext(contextNodeForDelete(tree, pos), doc);
      if (context.length) {
        const inner = context[context.length - 1];
        const spaceEnd = inner.to - inner.spaceAfter.length + (inner.spaceAfter ? 1 : 0);
        // Extra trailing space after the markup.
        if (pos - line.from > spaceEnd && !/\S/.test(line.text.slice(spaceEnd, pos - line.from))) {
          return { range: EditorSelection.cursor(line.from + spaceEnd), changes: { from: line.from + spaceEnd, to: pos } };
        }
        if (pos - line.from === spaceEnd
          && ((inner.item && line.from <= inner.item.from) || /^[\s>]*$/.test(line.text.slice(0, inner.to)))) {
          const start = line.from + inner.from;
          if (inner.item && inner.node.from < inner.item.from && /\S/.test(line.text.slice(inner.from, inner.to))) {
            let insert = inner.blank(countColumn(line.text, 4, inner.to) - countColumn(line.text, 4, inner.from));
            if (start === line.from) insert = normalizeIndent(insert, state);
            return { range: EditorSelection.cursor(start + insert.length), changes: { from: start, to: line.from + inner.to, insert } };
          }
          if (start < pos) return { range: EditorSelection.cursor(start), changes: { from: start, to: pos } };
        }
      }
    }
    return (dont = true, { range });
  });
  if (dont) return false;
  dispatch(state.update(changes, { scrollIntoView: true, userEvent: 'delete' }));
  return true;
};

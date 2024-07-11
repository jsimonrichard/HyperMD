import { Tag } from '@lezer/highlight';

export const markdownTags = {
  headerMark: Tag.define(),
  inlineCode: Tag.define(),
  linkURL: Tag.define(),
  escapeMark: Tag.define(),
  emoji: Tag.define(),
  emojiMark: Tag.define(),
};

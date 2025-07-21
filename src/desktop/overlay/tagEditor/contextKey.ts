import { RawContextKey } from 'vscf/platform/contextkey/common';

export const TagEditorFocus = new RawContextKey<boolean>('tagEditorFocus', false);
export const TagEditorHasSearchText = new RawContextKey<boolean>('tagEditorHasSearchText', false);
export const TagEditorHasSelectedTags = new RawContextKey<boolean>('tagEditorHasSelectedTags', false);
export const TagEditorHasSuggestions = new RawContextKey<boolean>('tagEditorHasSuggestions', false);

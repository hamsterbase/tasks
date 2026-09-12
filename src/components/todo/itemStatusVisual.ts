import { ItemStatus } from '@/core/type';

export type ItemShape = 'task' | 'project';
export type ItemVisualContext = 'default' | 'completedPage';
export type ItemTone = 't1' | 't2' | 't3';
export type ItemStatusAnimationPhase = 'idle' | 'completing' | 'canceling' | 'holding' | 'reverting' | 'settling';

export interface ItemStatusVisual {
  closed: boolean;
  titleTone: ItemTone;
  metadataTone: ItemTone;
}

export function getItemStatusVisual(status: ItemStatus, context: ItemVisualContext = 'default'): ItemStatusVisual {
  if (status === 'created') {
    return {
      closed: false,
      titleTone: 't1',
      metadataTone: 't2',
    };
  }

  return {
    closed: true,
    titleTone: context === 'completedPage' ? 't2' : 't3',
    metadataTone: 't3',
  };
}

export function itemToneClass(tone: ItemTone): string {
  switch (tone) {
    case 't1':
      return 'text-t1';
    case 't2':
      return 'text-t2';
    case 't3':
      return 'text-t3';
  }
}

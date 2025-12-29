import { BlockType } from '@/lib/constants/block-types';

export interface Block {
  id: string;
  type: BlockType;
  label: string;
  content: string;
  order: number;
  targetCharCount: number;
}

export interface BlockTemplate {
  type: BlockType;
  label: string;
  ratio: number;
}


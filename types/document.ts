import { Block } from './block';

export type WritingMode = 'casual' | 'formal';

export interface Document {
  id: string;
  title: string;
  targetCharCount: number;
  blocks: Block[];
  writingMode: WritingMode;
  folderId?: string;
  createdAt: Date;
  updatedAt: Date;
}


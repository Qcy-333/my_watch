import { ReactNode } from 'react';

// --- Domain Types ---

export type PlatformType = 'Bilibili' | 'XiaoHongShu' | 'YouTube' | 'Article' | 'Web';

export type RecordStatus = 'ToWatch' | 'Done' | 'Trash';

export interface ContentRecord {
  id: string;
  title: string;
  url: string;
  platform: PlatformType;
  status: RecordStatus;
  tags: string[];
  createdAt: string; // ISO Date string
  notes?: string;
  summary?: string; // Short description of content
}

// --- Platform Adapter Types ---

export interface PlatformConfig {
  /** The display name of the platform */
  name: string;
  /** The Lucide icon component or similar */
  icon: any; 
  /** Brand color for UI accents */
  primaryColor: string;
  /** Background color for labels */
  bgColor: string;
  /** 
   * The core logic: transforms a raw URL into a deep link 
   * or a cleanup URL for the specific app.
   */
  generateLink: (originalUrl: string) => string;
}
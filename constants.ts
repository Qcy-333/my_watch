import { PlatformConfig, PlatformType, ContentRecord } from './types';
import { Youtube, FileText, Smartphone, Globe, Tv } from 'lucide-react';

// --- F2. Platform Adapter Strategy ---
// This is the core extensible configuration. To add a new platform, 
// just add a key here.

export const PLATFORM_REGISTRY: Record<PlatformType, PlatformConfig> = {
  Bilibili: {
    name: 'Bilibili',
    icon: Tv,
    primaryColor: '#FB7299',
    bgColor: 'bg-pink-50',
    generateLink: (url) => {
      // Mock logic: Extract BV ID and create deep link
      // In prod: const match = url.match(/(BV\w+)/);
      // return match ? `bilibili://video/${match[1]}` : url;
      return url; // Fallback for web demo
    }
  },
  XiaoHongShu: {
    name: 'RedNote',
    icon: Smartphone, // Approximating XHS icon
    primaryColor: '#FF2442',
    bgColor: 'bg-red-50',
    generateLink: (url) => {
      // Logic to trigger XHS app scheme
      return url; 
    }
  },
  YouTube: {
    name: 'YouTube',
    icon: Youtube,
    primaryColor: '#FF0000',
    bgColor: 'bg-red-50',
    generateLink: (url) => {
      // Logic to trigger YouTube app scheme
      return url; 
    }
  },
  Article: {
    name: 'Article',
    icon: FileText,
    primaryColor: '#374151',
    bgColor: 'bg-gray-100',
    generateLink: (url) => url // Articles usually open in browser
  },
  Web: {
    name: 'Web',
    icon: Globe,
    primaryColor: '#2563EB',
    bgColor: 'bg-blue-50',
    generateLink: (url) => url
  }
};

// --- Mock Database (Lark Base) ---

export const MOCK_RECORDS: ContentRecord[] = [
  {
    id: '1',
    title: 'Understanding React Server Components in 2025',
    summary: 'A comprehensive guide to how RSCs change the data fetching paradigm, including examples with Next.js 15 and server actions.',
    url: 'https://youtube.com/watch?v=12345',
    platform: 'YouTube',
    status: 'ToWatch',
    tags: ['React', 'Frontend', 'Architecture'],
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'The Future of AI Agents: A Deep Dive into Autonomous Systems and their implications',
    summary: 'Analyzing the shift from chat-based interfaces to agentic workflows. Covers key frameworks like LangChain and AutoGPT.',
    url: 'https://bilibili.com/video/BV12345',
    platform: 'Bilibili',
    status: 'ToWatch',
    tags: ['AI', 'TechTrends', 'LLM'],
    createdAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
  },
  {
    id: '3',
    title: 'Minimalist Desk Setup Tour for Developers',
    summary: 'Reviewing the latest ergonomic chairs, mechanical keyboards, and cable management solutions for a clean workspace.',
    url: 'https://xhs.com/explore/12345',
    platform: 'XiaoHongShu',
    status: 'ToWatch',
    tags: ['Lifestyle', 'Setup', 'Productivity'],
    createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
  },
  {
    id: '4',
    title: 'Why TypeScript is winning the enterprise',
    summary: 'A statistical analysis of type safety reducing production bugs by 15% in large scale applications.',
    url: 'https://medium.com/stories/ts-winning',
    platform: 'Article',
    status: 'ToWatch',
    tags: ['TypeScript', 'Coding'],
    createdAt: new Date(Date.now() - 200000).toISOString(),
  },
  {
    id: '5',
    title: 'Advanced Tailwind CSS Techniques',
    summary: 'Mastering arbitrary values, complex variants, and plugin creation to speed up your styling workflow.',
    url: 'https://bilibili.com/video/BV67890',
    platform: 'Bilibili',
    status: 'ToWatch',
    tags: ['CSS', 'Frontend'],
    createdAt: new Date().toISOString(),
  }
];
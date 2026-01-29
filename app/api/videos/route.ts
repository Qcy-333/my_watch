import { NextResponse } from 'next/server';
import { fetchToWatchVideos } from '@/lib/lark';

export async function GET() {
  try {
    const records = await fetchToWatchVideos();
    
    // Transform to ContentRecord format with Chinese keys
    const formatted = records.map((r: any) => ({
      id: r.record_id,
      title: getTextValue(r.fields["标题"]),
      // Handle Link object or string and ensure absolute URL
      url: ensureAbsoluteUrl(extractUrl(r.fields["链接"])), 
      // Platform mapping
      platform: mapPlatform(r.fields["来源"]),
      status: 'ToWatch', // We only fetch ToWatch ('待看')
      tags: r.fields["主要标签"] || [],
      summary: getTextValue(r.fields["内容"]), 
      // created_time is in seconds
      createdAt: r.created_time ? new Date(r.created_time * 1000).toISOString() : new Date().toISOString()
    }));

    return NextResponse.json(formatted);
  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function ensureAbsoluteUrl(url: string): string {
  if (!url) return '';
  // Clean whitespace
  let cleanUrl = url.trim();
  // Add protocol if missing
  if (!cleanUrl.match(/^https?:\/\//i)) {
    cleanUrl = `https://${cleanUrl}`;
  }
  return cleanUrl;
}

function extractUrl(field: any): string {
  if (!field) return '';
  // Case 1: Direct string
  if (typeof field === 'string') return field;
  // Case 2: Link object (Url type field)
  if (field.link) return field.link;
  // Case 3: Array of segments (Text type field with mixed content)
  if (Array.isArray(field)) {
    // Find the first segment that looks like a URL or has a link property
    for (const item of field) {
      if (item.link) return item.link;
      if (item.type === 'url' && item.text) return item.text;
      // If it's a text segment but looks like a URL
      if (item.text && item.text.match(/^https?:\/\//i)) return item.text;
    }
    // Fallback: join all text and try to find a URL
    const fullText = field.map((item: any) => item.text || '').join('').trim();
    return fullText;
  }
  return '';
}

function getTextValue(field: any): string {
  if (!field) return '';
  if (typeof field === 'string') return field;
  if (Array.isArray(field)) {
    return field.map((item: any) => item.text || '').join('');
  }
  return '';
}

function mapPlatform(source: any): string {
  if (Array.isArray(source)) source = source[0];
  if (!source) return 'Web';
  
  const s = source.toLowerCase();
  if (s.includes('bilibili') || s.includes('b23')) return 'Bilibili';
  if (s.includes('xhs') || s.includes('小红书')) return 'XiaoHongShu';
  if (s.includes('youtube')) return 'YouTube';
  if (s.includes('article') || s.includes('公众号')) return 'Article';
  
  return 'Web';
}

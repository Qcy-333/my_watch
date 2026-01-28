import { NextResponse } from 'next/server';
import { updateVideoStatus } from '@/lib/lark';

export async function PATCH(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const { status, note } = await request.json();
    const updated = await updateVideoStatus(params.id, status, note);
    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

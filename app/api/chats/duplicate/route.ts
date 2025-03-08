import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { duplicateChat } from '@/app/(chat)/actions';

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { chatId } = body;

    if (!chatId) {
      return NextResponse.json({ error: 'Chat ID is required' }, { status: 400 });
    }

    const result = await duplicateChat(chatId);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error duplicating chat:', error);
    return NextResponse.json(
      { error: 'Failed to duplicate chat' },
      { status: 500 }
    );
  }
} 
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role for server-side
);

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('saved_items')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ items: data });
  } catch (error: any) {
    console.error('Supabase Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch saved items', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      user_id,
      external_id,
      vague_title,
      real_identify,
      listing_price,
      estimated_value,
      confidence_score,
      image_url,
      item_url,
      marketplace = 'eBay',
    } = body;

    // Validate required fields
    if (!user_id || !external_id || !vague_title || !real_identify) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('saved_items')
      .insert([
        {
          user_id,
          external_id,
          vague_title,
          real_identify,
          listing_price,
          estimated_value,
          confidence_score,
          image_url,
          item_url,
          marketplace,
        },
      ])
      .select();

    if (error) throw error;

    return NextResponse.json({ item: data[0] }, { status: 201 });
  } catch (error: any) {
    console.error('Supabase Error:', error);
    return NextResponse.json(
      { error: 'Failed to save item', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const itemId = searchParams.get('id');
    const userId = searchParams.get('userId');

    if (!itemId || !userId) {
      return NextResponse.json(
        { error: 'id and userId are required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('saved_items')
      .delete()
      .eq('id', itemId)
      .eq('user_id', userId);

    if (error) throw error;

    return NextResponse.json({ message: 'Item deleted successfully' });
  } catch (error: any) {
    console.error('Supabase Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete item', details: error.message },
      { status: 500 }
    );
  }
}

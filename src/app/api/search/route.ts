import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const EBAY_FINDING_API = 'https://svcs.ebay.com/services/search/FindingService/v1';

interface EbayItem {
  itemId: string;
  title: string;
  price: number;
  imageUrl: string;
  itemUrl: string;
  condition: string;
}

function isVagueTitle(title: string): boolean {
  const vagueKeywords = ['old', 'vintage', 'antique', 'used', 'chair', 'watch', 'camera', 'lamp', 'table', 'desk'];
  const lowerTitle = title.toLowerCase();
  return vagueKeywords.some(keyword => lowerTitle.includes(keyword)) && 
         lowerTitle.split(' ').length < 6;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query');
    const maxPrice = searchParams.get('maxPrice') || '200';

    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    const response = await axios.get(EBAY_FINDING_API, {
      params: {
        'OPERATION-NAME': 'findItemsByKeywords',
        'SERVICE-VERSION': '1.0.0',
        'SECURITY-APPNAME': process.env.EBAY_APP_ID,
        'RESPONSE-DATA-FORMAT': 'JSON',
        'REST-PAYLOAD': '',
        'keywords': query,
        'paginationInput.entriesPerPage': '20',
        'itemFilter(0).name': 'MaxPrice',
        'itemFilter(0).value': maxPrice,
        'itemFilter(1).name': 'Condition',
        'itemFilter(1).value': 'Used',
      },
    });

    const searchResult = response.data.findItemsByKeywordsResponse?.[0]?.searchResult?.[0];
    const items = searchResult?.item || [];

    if (items.length === 0) {
      return NextResponse.json({ items: [], message: 'No items found' });
    }

    const formattedItems: EbayItem[] = items
      .filter((item: any) => isVagueTitle(item.title?.[0] || ''))
      .slice(0, 10) // Limit to 10 items
      .map((item: any) => ({
        itemId: item.itemId?.[0] || '',
        title: item.title?.[0] || '',
        price: parseFloat(item.sellingStatus?.[0]?.currentPrice?.[0]?.__value__ || '0'),
        imageUrl: item.galleryURL?.[0] || item.pictureURLLarge?.[0] || '',
        itemUrl: item.viewItemURL?.[0] || '',
        condition: item.condition?.[0]?.conditionDisplayName?.[0] || 'Used',
      }));

    return NextResponse.json({ items: formattedItems });
  } catch (error: any) {
    console.error('eBay API Error:', error.response?.data || error.message);
    return NextResponse.json(
      { error: 'Failed to search eBay', details: error.message },
      { status: 500 }
    );
  }
}

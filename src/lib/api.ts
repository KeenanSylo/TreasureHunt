/**
 * API Client for TreasureHunt Backend
 * Handles all communication with FastAPI backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface SearchParams {
  q: string;
  max_price?: number;
}

interface SearchResponse {
  query: string;
  max_price: number;
  cached: boolean;
  results: Array<{
    external_id: string;
    title_vague: string;
    title_real: string;
    price_listed: number;
    price_estimated: number;
    profit_potential: number;
    image_url: string;
    market_url: string;
    marketplace: string;
    confidence: string;
    reasoning: string;
  }>;
}

interface SaveItemRequest {
  external_id: string;
  title_vague: string;
  title_real: string | null;
  price_listed: number | null;
  price_estimated: number | null;
  image_url: string | null;
  market_url: string | null;
  marketplace: string;
}

/**
 * Get authorization header with Supabase token
 */
function getAuthHeaders(token?: string): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
}

/**
 * Search for items via backend
 */
export async function searchItems(params: SearchParams, token?: string): Promise<SearchResponse> {
  const url = new URL(`${API_BASE_URL}/api/search`);
  url.searchParams.append('q', params.q);
  if (params.max_price) {
    url.searchParams.append('max_price', params.max_price.toString());
  }

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: getAuthHeaders(token),
  });

  if (!response.ok) {
    throw new Error(`Search failed: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Save an item to user's watchlist
 */
export async function saveItem(item: SaveItemRequest, token: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/api/items`, {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify(item),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to save item' }));
    throw new Error(error.detail || 'Failed to save item');
  }

  return response.json();
}

/**
 * Get all saved items for authenticated user
 */
export async function getSavedItems(token: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/api/items`, {
    method: 'GET',
    headers: getAuthHeaders(token),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch saved items');
  }

  return response.json();
}

/**
 * Delete a saved item
 */
export async function deleteItem(itemId: string, token: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/api/items/${itemId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(token),
  });

  if (!response.ok) {
    throw new Error('Failed to delete item');
  }

  return response.json();
}

/**
 * Check if an item is saved
 */
export async function checkItemSaved(externalId: string, token: string): Promise<boolean> {
  const response = await fetch(`${API_BASE_URL}/api/items/check/${externalId}`, {
    method: 'GET',
    headers: getAuthHeaders(token),
  });

  if (!response.ok) {
    return false;
  }

  const data = await response.json();
  return data.is_saved;
}

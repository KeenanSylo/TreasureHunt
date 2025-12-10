"""
Vinted Service - API Integration
Handles item search using direct HTTP requests to Vinted API
"""

import os
from typing import List, Dict, Optional
import httpx
import time


class VintedService:
    def __init__(self):
        # Get Vinted domain from environment (default to US)
        # Supported: pl, fr, at, be, cz, de, dk, es, fi, gr, hr, hu, it, lt, lu, nl, pt, ro, se, sk, co.uk, com
        self.domain = os.getenv("VINTED_DOMAIN", "com")
        self.base_url = f"https://www.vinted.{self.domain}"
        self.session_cookie = None
    
    async def _get_session(self) -> str:
        """Get session cookie from Vinted"""
        if self.session_cookie:
            return self.session_cookie
            
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(self.base_url, timeout=10.0)
                if response.status_code == 200:
                    # Extract session cookie
                    cookies = response.cookies
                    self.session_cookie = "; ".join([f"{k}={v}" for k, v in cookies.items()])
                    return self.session_cookie
        except Exception as e:
            print(f"Failed to get Vinted session: {e}")
            return ""
    
    async def search_items(
        self,
        query: str,
        max_price: int = 100,
        limit: int = 10
    ) -> List[Dict]:
        """
        Search for used items on Vinted
        
        Args:
            query: Search query string
            max_price: Maximum price filter
            limit: Number of results to return
        
        Returns:
            List of item dictionaries with relevant fields
        """
        try:
            # Get session cookie
            await self._get_session()
            
            # Build search URL
            timestamp = time.time()
            params = {
                "page": "1",
                "per_page": str(limit),
                "time": str(timestamp),
                "search_text": query,
                "price_to": str(max_price),
                "order": "newest_first"
            }
            
            headers = {
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
                "Accept": "application/json",
            }
            
            if self.session_cookie:
                headers["Cookie"] = self.session_cookie
            
            # Make search request
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/api/v2/catalog/items",
                    params=params,
                    headers=headers,
                    timeout=10.0
                )
                
                if response.status_code != 200:
                    print(f"Vinted API returned status {response.status_code}")
                    return []
                
                data = response.json()
                items = data.get("items", [])
                
                if not items:
                    return []
                
                # Format items
                filtered_items = []
                for item in items:
                    formatted = self._format_item_dict(item)
                    if formatted:
                        filtered_items.append(formatted)
                
                return filtered_items[:limit]
        
        except Exception as e:
            print(f"Vinted search error: {str(e)}")
            import traceback
            traceback.print_exc()
            return []
    
    def _format_item_dict(self, item: dict) -> Optional[Dict]:
        """
        Format Vinted item dictionary to standardized structure
        """
        try:
            # Get price - Vinted returns it as {'amount': '4.05', 'currency_code': 'USD'}
            price = None
            if "price" in item and item["price"]:
                price_data = item["price"]
                if isinstance(price_data, dict) and "amount" in price_data:
                    try:
                        price = float(price_data["amount"])
                    except (ValueError, TypeError):
                        return None
                elif isinstance(price_data, (int, float, str)):
                    try:
                        price = float(price_data)
                    except (ValueError, TypeError):
                        return None
            
            if not price or price == 0:
                return None
            
            # Extract image URL
            image_url = None
            if "photo" in item and item["photo"]:
                photo = item["photo"]
                if isinstance(photo, dict):
                    image_url = photo.get("url") or photo.get("full_size_url")
            
            # Get item ID and URL
            item_id = item.get("id")
            item_url = item.get("url")
            if not item_url and item_id:
                item_url = f"https://www.vinted.{self.domain}/items/{item_id}"
            
            # Get title
            title = item.get("title", "Unknown Item")
            
            # Filter out brand new items
            if title:
                title_lower = title.lower()
                if "brand new" in title_lower or "sealed" in title_lower or "nwt" in title_lower:
                    return None
            
            # Get brand
            brand = None
            if "brand_title" in item:
                brand = item["brand_title"]
            
            # Get seller
            seller = None
            if "user" in item and isinstance(item["user"], dict):
                seller = item["user"].get("login")
            
            return {
                "external_id": str(item_id) if item_id else None,
                "title_vague": title,
                "price_listed": price,
                "image_url": image_url,
                "market_url": item_url,
                "marketplace": "vinted",
                "condition": "Used",
                "brand": brand,
                "seller": seller
            }
        
        except Exception as e:
            print(f"Error formatting Vinted item: {str(e)}")
            return None


# Singleton instance
vinted_service = VintedService()

"""
eBay Service - Browse API Integration
Handles OAuth authentication and item search
"""

import os
import httpx
from typing import List, Dict, Optional
from datetime import datetime, timedelta
import base64


class EbayService:
    def __init__(self):
        self.app_id = os.getenv("EBAY_APP_ID")
        self.cert_id = os.getenv("EBAY_CERT_ID")
        self.base_url = "https://api.ebay.com"
        self.token = None
        self.token_expiry = None
    
    async def get_oauth_token(self) -> str:
        """
        Get OAuth 2.0 token using Client Credentials flow
        Caches token until expiry
        """
        # Return cached token if still valid
        if self.token and self.token_expiry and datetime.now() < self.token_expiry:
            return self.token
        
        # Generate credentials
        credentials = f"{self.app_id}:{self.cert_id}"
        b64_credentials = base64.b64encode(credentials.encode()).decode()
        
        headers = {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": f"Basic {b64_credentials}"
        }
        
        data = {
            "grant_type": "client_credentials",
            "scope": "https://api.ebay.com/oauth/api_scope"
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/identity/v1/oauth2/token",
                headers=headers,
                data=data
            )
            response.raise_for_status()
            
            token_data = response.json()
            self.token = token_data["access_token"]
            
            # Set expiry to 5 minutes before actual expiry for safety
            expires_in = token_data.get("expires_in", 7200)
            self.token_expiry = datetime.now() + timedelta(seconds=expires_in - 300)
            
            return self.token
    
    async def search_items(
        self,
        query: str,
        max_price: int = 100,
        limit: int = 10
    ) -> List[Dict]:
        """
        Search for used items on eBay
        
        Args:
            query: Search query string
            max_price: Maximum price filter
            limit: Number of results to return
        
        Returns:
            List of item dictionaries with relevant fields
        """
        token = await self.get_oauth_token()
        
        headers = {
            "Authorization": f"Bearer {token}",
            "X-EBAY-C-MARKETPLACE-ID": "EBAY_US"
        }
        
        # Build search parameters
        params = {
            "q": query,
            "limit": limit,
            "filter": f"price:[..{max_price}],priceCurrency:USD,conditions:{{USED}}",
            "sort": "price"  # Sort by price ascending (best deals first)
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/buy/browse/v1/item_summary/search",
                headers=headers,
                params=params,
                timeout=10.0
            )
            response.raise_for_status()
            
            data = response.json()
            items = data.get("itemSummaries", [])
            
            # Filter out "Brand New" or "Sealed" items
            filtered_items = []
            for item in items:
                title = item.get("title", "").lower()
                if "brand new" not in title and "sealed" not in title:
                    filtered_items.append(self._format_item(item))
            
            return filtered_items
    
    def _format_item(self, item: Dict) -> Dict:
        """
        Format eBay item to standardized structure
        """
        # Extract image URL (prefer first image)
        image_url = None
        if item.get("image"):
            image_url = item["image"].get("imageUrl")
        elif item.get("thumbnailImages"):
            image_url = item["thumbnailImages"][0].get("imageUrl")
        
        # Extract price
        price = None
        if item.get("price"):
            price = float(item["price"].get("value", 0))
        
        return {
            "external_id": item.get("itemId"),
            "title_vague": item.get("title"),
            "price_listed": price,
            "image_url": image_url,
            "market_url": item.get("itemWebUrl"),
            "marketplace": "ebay",
            "condition": item.get("condition"),
            "seller": item.get("seller", {}).get("username")
        }


# Singleton instance
ebay_service = EbayService()

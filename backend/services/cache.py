"""
Cache Service - Upstash Redis Integration
Handles caching for search results and other data
"""

import os
import json
from typing import Optional, Any
import httpx


class CacheService:
    def __init__(self):
        self.redis_url = os.getenv("UPSTASH_REDIS_REST_URL")
        self.redis_token = os.getenv("UPSTASH_REDIS_REST_TOKEN")
        self.enabled = bool(self.redis_url and self.redis_token)
    
    async def get(self, key: str) -> Optional[Any]:
        """
        Get value from cache
        
        Args:
            key: Cache key
        
        Returns:
            Cached value (parsed from JSON) or None if not found
        """
        if not self.enabled:
            return None
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.redis_url}/get/{key}",
                    headers={"Authorization": f"Bearer {self.redis_token}"},
                    timeout=2.0
                )
                
                if response.status_code == 200:
                    data = response.json()
                    result = data.get("result")
                    
                    if result:
                        # Parse JSON string back to object
                        return json.loads(result)
                
                return None
        
        except Exception as e:
            print(f"Cache GET error: {str(e)}")
            return None
    
    async def set(
        self,
        key: str,
        value: Any,
        ttl: int = 86400
    ) -> bool:
        """
        Set value in cache with TTL
        
        Args:
            key: Cache key
            value: Value to cache (will be JSON serialized)
            ttl: Time to live in seconds (default: 24 hours)
        
        Returns:
            True if successful, False otherwise
        """
        if not self.enabled:
            return False
        
        try:
            # Serialize value to JSON
            json_value = json.dumps(value)
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.redis_url}/set/{key}",
                    headers={
                        "Authorization": f"Bearer {self.redis_token}",
                        "Content-Type": "application/json"
                    },
                    json={"value": json_value, "ex": ttl},
                    timeout=2.0
                )
                
                return response.status_code == 200
        
        except Exception as e:
            print(f"Cache SET error: {str(e)}")
            return False
    
    async def delete(self, key: str) -> bool:
        """
        Delete key from cache
        
        Args:
            key: Cache key
        
        Returns:
            True if successful, False otherwise
        """
        if not self.enabled:
            return False
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.redis_url}/del/{key}",
                    headers={"Authorization": f"Bearer {self.redis_token}"},
                    timeout=2.0
                )
                
                return response.status_code == 200
        
        except Exception as e:
            print(f"Cache DELETE error: {str(e)}")
            return False
    
    def build_search_key(self, query: str, max_price: int) -> str:
        """
        Build consistent cache key for search results
        
        Args:
            query: Search query
            max_price: Maximum price filter
        
        Returns:
            Cache key string
        """
        # Normalize query to lowercase and strip whitespace
        normalized_query = query.lower().strip()
        return f"search:{normalized_query}:{max_price}"


# Singleton instance
cache_service = CacheService()

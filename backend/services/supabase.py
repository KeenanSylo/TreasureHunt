"""
Supabase Service - Database Operations
Handles authentication and data persistence
"""

import os
from supabase import create_client, Client
from typing import Dict, List, Optional


class SupabaseService:
    def __init__(self):
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        self.client: Client = create_client(url, key)
    
    def verify_user(self, token: str) -> Optional[str]:
        """
        Verify JWT token and return user ID
        
        Args:
            token: JWT token from Authorization header
        
        Returns:
            User ID if valid, None otherwise
        """
        try:
            user = self.client.auth.get_user(token)
            return user.user.id if user else None
        except Exception as e:
            print(f"Auth error: {str(e)}")
            return None
    
    async def save_item(self, user_id: str, item_data: Dict) -> Dict:
        """
        Save item to saved_items table
        
        Args:
            user_id: Authenticated user ID
            item_data: Item data to save
        
        Returns:
            Saved item record
        """
        try:
            # Prepare data for insertion
            data = {
                "user_id": user_id,
                "external_id": item_data.get("external_id"),
                "title_vague": item_data.get("title_vague"),
                "title_real": item_data.get("title_real"),
                "price_listed": item_data.get("price_listed"),
                "price_estimated": item_data.get("price_estimated"),
                "image_url": item_data.get("image_url"),
                "market_url": item_data.get("market_url"),
                "marketplace": item_data.get("marketplace", "ebay")
            }
            
            # Insert into database
            result = self.client.table("saved_items").insert(data).execute()
            
            return result.data[0] if result.data else {}
        
        except Exception as e:
            print(f"Database save error: {str(e)}")
            raise Exception(f"Failed to save item: {str(e)}")
    
    async def get_user_items(self, user_id: str) -> List[Dict]:
        """
        Get all saved items for a user
        
        Args:
            user_id: Authenticated user ID
        
        Returns:
            List of saved items
        """
        try:
            result = self.client.table("saved_items")\
                .select("*")\
                .eq("user_id", user_id)\
                .order("created_at", desc=True)\
                .execute()
            
            return result.data if result.data else []
        
        except Exception as e:
            print(f"Database fetch error: {str(e)}")
            return []
    
    async def delete_item(self, user_id: str, item_id: str) -> bool:
        """
        Delete a saved item
        
        Args:
            user_id: Authenticated user ID
            item_id: Item ID to delete
        
        Returns:
            True if successful, False otherwise
        """
        try:
            result = self.client.table("saved_items")\
                .delete()\
                .eq("id", item_id)\
                .eq("user_id", user_id)\
                .execute()
            
            return bool(result.data)
        
        except Exception as e:
            print(f"Database delete error: {str(e)}")
            return False
    
    async def check_item_exists(self, user_id: str, external_id: str) -> bool:
        """
        Check if item is already saved by user
        
        Args:
            user_id: Authenticated user ID
            external_id: eBay/Vinted item ID
        
        Returns:
            True if item exists, False otherwise
        """
        try:
            result = self.client.table("saved_items")\
                .select("id")\
                .eq("user_id", user_id)\
                .eq("external_id", external_id)\
                .execute()
            
            return len(result.data) > 0 if result.data else False
        
        except Exception as e:
            print(f"Database check error: {str(e)}")
            return False


def get_supabase_client() -> SupabaseService:
    """Get Supabase service instance"""
    return SupabaseService()

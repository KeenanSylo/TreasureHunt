"""
Search Router - Handle search requests with caching
"""

from fastapi import APIRouter, Query, HTTPException
from typing import List, Dict
import asyncio

from services.ebay import ebay_service
from services.vinted import vinted_service
from services.ai import ai_service
from services.cache import cache_service

router = APIRouter()


@router.get("/search")
async def search_items(
    q: str = Query(..., description="Search query"),
    max_price: int = Query(100, description="Maximum price filter")
) -> Dict:
    """
    Search for undervalued items using eBay, Vinted, and AI analysis
    
    Flow:
    1. Check cache for existing results
    2. If cache miss, search eBay AND Vinted in parallel
    3. Merge and sort results by potential profit
    4. Analyze top items with AI
    5. Cache results for 24 hours
    6. Return merged data
    """
    try:
        # 1. Check cache (TEMPORARILY DISABLED FOR TESTING)
        cache_key = cache_service.build_search_key(q, max_price)
        cached_result = None  # await cache_service.get(cache_key)
        
        if cached_result:
            return {
                "query": q,
                "max_price": max_price,
                "cached": True,
                "results": cached_result
            }
        
        # 2. Search both marketplaces in parallel
        ebay_task = ebay_service.search_items(query=q, max_price=max_price, limit=10)
        vinted_task = vinted_service.search_items(query=q, max_price=max_price, limit=10)
        
        ebay_items, vinted_items = await asyncio.gather(ebay_task, vinted_task, return_exceptions=True)
        
        # Handle errors from marketplace searches
        if isinstance(ebay_items, Exception):
            print(f"eBay search failed: {ebay_items}")
            ebay_items = []
        if isinstance(vinted_items, Exception):
            print(f"Vinted search failed: {vinted_items}")
            vinted_items = []
        
        # Combine results from both marketplaces
        all_items = (ebay_items or []) + (vinted_items or [])
        
        if not all_items:
            return {
                "query": q,
                "max_price": max_price,
                "cached": False,
                "results": []
            }
        
        # Sort by price (lowest first for best deals)
        all_items.sort(key=lambda x: x.get("price_listed", 999999))
        
        # 3. AI Analysis on top 5 items with images (mix of both marketplaces)
        analyzed_items = []
        
        # Create analysis tasks for items with images
        analysis_tasks = []
        for item in all_items[:5]:
            if item.get("image_url"):
                task = analyze_item_async(item)
                analysis_tasks.append(task)
            else:
                # Skip items without images
                analyzed_items.append({
                    **item,
                    "title_real": item["title_vague"],
                    "price_estimated": 0.0,
                    "profit_potential": 0.0,
                    "confidence": "low",
                    "reasoning": "No image available for analysis"
                })
        
        # Run AI analysis in parallel
        if analysis_tasks:
            analyzed_results = await asyncio.gather(*analysis_tasks, return_exceptions=True)
            
            for result in analyzed_results:
                if isinstance(result, Exception):
                    print(f"Analysis error: {result}")
                elif result:
                    analyzed_items.append(result)
        
        # Add remaining items without AI analysis
        for item in all_items[len(analyzed_items):]:
            analyzed_items.append({
                **item,
                "title_real": item["title_vague"],
                "price_estimated": 0.0,
                "profit_potential": 0.0,
                "confidence": "low",
                "reasoning": "Not analyzed"
            })
        
        # 4. Cache results
        await cache_service.set(cache_key, analyzed_items, ttl=86400)
        
        # 5. Return results
        return {
            "query": q,
            "max_price": max_price,
            "cached": False,
            "results": analyzed_items
        }
    
    except Exception as e:
        print(f"Search error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")


async def analyze_item_async(item: Dict) -> Dict:
    """
    Analyze a single item with AI
    
    Args:
        item: eBay item data
    
    Returns:
        Item with AI analysis merged in
    """
    try:
        # Get AI analysis
        image_urls = [item["image_url"]] if item.get("image_url") else []
        
        analysis = await ai_service.analyze_item_with_images(
            image_urls=image_urls,
            vague_title=item["title_vague"]
        )
        
        # Calculate profit potential
        price_listed = item.get("price_listed", 0) or 0
        price_estimated = analysis.get("price_estimated", 0) or 0
        profit_potential = price_estimated - price_listed
        
        # Merge item and analysis
        return {
            **item,
            "title_real": analysis.get("title_real"),
            "price_estimated": price_estimated,
            "profit_potential": profit_potential,
            "confidence": analysis.get("confidence"),
            "reasoning": analysis.get("reasoning")
        }
    
    except Exception as e:
        print(f"Item analysis error: {str(e)}")
        # Return item with no analysis on error
        return {
            **item,
            "title_real": item["title_vague"],
            "price_estimated": 0.0,
            "profit_potential": 0.0,
            "confidence": "low",
            "reasoning": f"Analysis failed: {str(e)}"
        }

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
        
        # 2. BUNDLE BREAKER: Inject bundle keywords into search query
        bundle_keywords = "(job lot OR bundle OR lot OR estate OR collection OR junk drawer OR spares repairs OR bulk OR mixed)"
        enhanced_query = f"{q} {bundle_keywords}"
        
        print(f"[BUNDLE BREAKER] Original query: '{q}' -> Enhanced: '{enhanced_query}'")
        
        # 3. Search both marketplaces in parallel with BUNDLE query
        ebay_task = ebay_service.search_items(query=enhanced_query, max_price=max_price, limit=10)
        vinted_task = vinted_service.search_items(query=enhanced_query, max_price=max_price, limit=10)
        
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
        
        # Sort by price (lowest first for best bundle deals)
        all_items.sort(key=lambda x: x.get("price_listed", 999999))
        
        # 4. BUNDLE BREAKER: AI Analysis on top 5 bundles with images
        analyzed_items = []
        
        # Create analysis tasks for bundles with images
        analysis_tasks = []
        for item in all_items[:5]:
            if item.get("image_url"):
                task = analyze_bundle_async(item, q)
                analysis_tasks.append(task)
            else:
                # Skip bundles without images
                analyzed_items.append({
                    **item,
                    "title_real": item["title_vague"],
                    "hidden_gems": [],
                    "price_estimated": 0.0,
                    "profit_potential": 0.0,
                    "confidence": "low",
                    "reasoning": "No image available for bundle analysis",
                    "is_bundle": True
                })
        
        # Run AI bundle analysis in parallel
        if analysis_tasks:
            analyzed_results = await asyncio.gather(*analysis_tasks, return_exceptions=True)
            
            for result in analyzed_results:
                if isinstance(result, Exception):
                    print(f"Bundle analysis error: {result}")
                elif result:
                    analyzed_items.append(result)
        
        # Add remaining bundles without AI analysis
        for item in all_items[len(analyzed_items):]:
            analyzed_items.append({
                **item,
                "title_real": item["title_vague"],
                "hidden_gems": [],
                "price_estimated": 0.0,
                "profit_potential": 0.0,
                "confidence": "low",
                "reasoning": "Not analyzed",
                "is_bundle": True
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


async def analyze_bundle_async(item: Dict, original_query: str) -> Dict:
    """
    BUNDLE BREAKER: Analyze a bundle/job lot with AI to find hidden gems
    
    Args:
        item: Bundle item data from marketplace
        original_query: Original search query (e.g., "Camera")
    
    Returns:
        Bundle with AI analysis including hidden gems and breakup value
    """
    try:
        # Get AI bundle analysis
        image_urls = [item["image_url"]] if item.get("image_url") else []
        
        analysis = await ai_service.analyze_bundle(
            image_urls=image_urls,
            bundle_title=item["title_vague"],
            listed_price=item.get("price_listed", 0),
            search_category=original_query
        )
        
        # Calculate profit potential (breakup value vs listing price)
        price_listed = item.get("price_listed", 0) or 0
        price_estimated = analysis.get("estimated_breakup_value", 0) or 0
        profit_potential = price_estimated - price_listed
        
        # Merge item and bundle analysis
        return {
            **item,
            "title_real": analysis.get("main_item", item["title_vague"]),
            "hidden_gems": analysis.get("hidden_gems", []),
            "price_estimated": round(price_estimated, 2),
            "profit_potential": round(profit_potential, 2),
            "confidence": analysis.get("confidence", "low"),
            "reasoning": analysis.get("reasoning", ""),
            "lot_size": item.get("lot_size"),
            "is_bundle": True
        }
    
    except Exception as e:
        print(f"Bundle analysis error: {str(e)}")
        # Return bundle with no analysis on error
        return {
            **item,
            "title_real": item["title_vague"],
            "hidden_gems": [],
            "price_estimated": 0.0,
            "profit_potential": 0.0,
            "confidence": "low",
            "reasoning": f"Bundle analysis failed: {str(e)}",
            "is_bundle": True
        }

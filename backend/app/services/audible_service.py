import httpx
from fastapi import HTTPException


async def get_book_chapters_from_audible(*, title: str, author: str = ""):
    """
    Search for Audible books using the Audnex API.
    """
    url = "https://api.audible.com/1.0/catalog/products"
    params = {"title": title, "author": author,
              "products_sort_by": "AvgRating"}

    ASIN = ""

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params)
            response.raise_for_status()
            # get first ASIN
            data = response.json()
            products = data.get("products", [])
            if products:
                ASIN = products[0].get("asin", "")
            else:
                raise HTTPException(
                    status_code=404, detail="No Audible books found matching the query.")
    except httpx.HTTPError as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching Audible data: {str(e)}")

    url = f"https://api.audnex.us/books/{ASIN}/chapters"

    result_chapters = []

    async with httpx.AsyncClient() as client:
        response = await client.get(url)

        data = response.json()
        chapters = data.get("chapters", [])
        for chapter in chapters:
            result_chapters.append(chapter.get("title", ""))

    return result_chapters

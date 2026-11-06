
export async function onRequestGet(context: {
  request: Request;
}) {
  const url = new URL(context.request.url);
  const title = url.searchParams.get("title");

  if (!title || title.length > 100) {
    return Response.json(
      { error: "A valid anime title is required." },
      { status: 400 }
    );
  }

  try {
    const apiUrl =
      `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(title)}&limit=1&sfw=true`;

    const response = await fetch(apiUrl);

    if (!response.ok) {
      return Response.json(
        { error: "Anime poster service is temporarily unavailable." },
        { status: response.status }
      );
    }

    const data = await response.json();
    const anime = data?.data?.[0];

    const image =
      anime?.images?.webp?.large_image_url ||
      anime?.images?.jpg?.large_image_url ||
      null;

    return Response.json(
      { image },
      {
        headers: {
          "Cache-Control": "public, max-age=86400"
        }
      }
    );
  } catch {
    return Response.json(
      { error: "Could not fetch anime poster." },
      { status: 502 }
    );
  }
}

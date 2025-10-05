// src/api/jamendo.js
const BASE = "https://api.jamendo.com/v3.0";
const cid = import.meta.env.VITE_JAMENDO_CLIENT_ID;

function requireCid() {
  if (!cid) throw new Error("Missing VITE_JAMENDO_CLIENT_ID in .env.local");
}

// Search Jamendo tracks and return items with a playable MP3 in `audio`
export async function searchTracks({ query, limit = 10 }) {
  requireCid();
  const params = new URLSearchParams({
    client_id: cid,
    format: "json",
    limit: String(limit),
    include: "musicinfo",
    audioformat: "mp32", // decent quality MP3
    search: query, // free text: country/artist/track
    groupby: "artist_id", // mix of artists
    boost: "popularity_month", // nicer results
  });

  const res = await fetch(`${BASE}/tracks/?${params.toString()}`);
  if (!res.ok) throw new Error(`Jamendo HTTP ${res.status}`);
  const json = await res.json();
  return json.results || [];
}

// Convenience: pick one track for a given country name
export async function getOneTrackForCountry(countryName) {
  // try free text first
  let items = await searchTracks({ query: countryName, limit: 10 });
  if (!items.length) {
    // fall back to tag search (less exact but sometimes helpful)
    items = await searchTracks({ query: `tag:${countryName}`, limit: 10 });
  }
  return items.find((t) => !!t.audio) || null; // ensure we have a streamable mp3
}

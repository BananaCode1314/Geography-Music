import React, { useState, useEffect } from "react";
import WorldMap from "./components/WorldMap.jsx";
import { songsByCountry } from "./data/songsByCountry.js";
import ReactPlayer from "react-player"; // if not installed: npm i react-player
import { getOneTrackForCountry } from "./api/jamendo.js";
import "./styles.css";

import { searchTracks } from "./api/jamendo.js";

export default function App() {
  const [selected, setSelected] = useState(null); // { code, name }
  const [position, setPosition] = useState({ coordinates: [0, 0], zoom: 1 });

  // Jamendo state
  const [jamendoTrack, setJamendoTrack] = useState(null); // { name, artist_name, audio, album_image, ... }
  const [loadingTrack, setLoadingTrack] = useState(false);
  const [trackError, setTrackError] = useState("");

  const staticSong = selected ? songsByCountry[selected.code] : null;

  // What to play: prefer your own mapping; else Jamendo
  const current = staticSong?.url
    ? {
        title: staticSong.title,
        artist: staticSong.artist,
        url: staticSong.url,
      }
    : jamendoTrack
    ? {
        title: jamendoTrack.name,
        artist: jamendoTrack.artist_name,
        url: jamendoTrack.audio,
        cover: jamendoTrack.album_image,
      }
    : null;

  // Clear Jamendo result when changing country
  useEffect(() => {
    setJamendoTrack(null);
    setTrackError("");
  }, [selected?.code]);

  async function fetchJamendo() {
    if (!selected?.name) return;
    setLoadingTrack(true);
    setTrackError("");
    setJamendoTrack(null);
    try {
      const t = await getOneTrackForCountry(selected.name);
      if (t) setJamendoTrack(t);
      else
        setTrackError(
          "No Jamendo track found. Try another country or search term."
        );
    } catch (e) {
      setTrackError(e.message || "Jamendo error");
    } finally {
      setLoadingTrack(false);
    }
  }

  // Zoom controls (unchanged)
  const zoomIn = () =>
    setPosition((p) => ({ ...p, zoom: Math.min(p.zoom * 1.5, 8) }));
  const zoomOut = () =>
    setPosition((p) => ({ ...p, zoom: Math.max(p.zoom / 1.5, 1) }));
  const reset = () => setPosition({ coordinates: [0, 0], zoom: 1 });

  return (
    <div className="app">
      <header className="header">
        <h1>World Music Map</h1>
        <p>Click a country to see/play a song.</p>
      </header>

      <div className="layout">
        <div className="mapCard" style={{ position: "relative" }}>
          <div className="zoomControls">
            <button onClick={zoomIn}>＋</button>
            <button onClick={zoomOut}>－</button>
            <button onClick={reset}>⟲</button>
          </div>

          <WorldMap
            onSelectCountry={setSelected}
            selectedCode={selected?.code}
            position={position}
            setPosition={setPosition}
          />
        </div>

        <aside className="infoCard">
          <h2>{selected ? selected.name : "Pick a country"}</h2>

          {/* Show static mapping title/artist if present */}
          {staticSong?.title && (
            <p>
              <strong>Song:</strong> {staticSong.title}
            </p>
          )}
          {staticSong?.artist && (
            <p>
              <strong>Artist:</strong> {staticSong.artist}
            </p>
          )}

          {/* Jamendo fetch button appears if no static URL */}
          {selected && !staticSong?.url && (
            <div
              style={{
                display: "flex",
                gap: 8,
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <button
                className="listen-btn"
                onClick={fetchJamendo}
                disabled={loadingTrack}
              >
                {loadingTrack
                  ? "Finding Jamendo track..."
                  : `Find a song for ${selected.name}`}
              </button>
              {trackError && (
                <span style={{ color: "#fca5a5" }}>{trackError}</span>
              )}
            </div>
          )}

          {/* Player: plays your URL (YouTube/MP3) or Jamendo MP3 */}
          {current?.url &&
            (/\.mp3($|\?)/i.test(current.url) ? (
              <audio controls src={current.url} style={{ width: "100%" }} />
            ) : (
              <ReactPlayer
                url={current.url}
                controls
                width="100%"
                height="240px"
              />
            ))}

          {/* Attribution for Jamendo results */}
          {!staticSong?.url && jamendoTrack && (
            <div style={{ marginTop: 8, fontSize: 12, color: "#cbd5e1" }}>
              Source: Jamendo — {jamendoTrack.artist_name} — “
              {jamendoTrack.name}”
            </div>
          )}

          {/* If nothing playable yet */}
          {selected && !current?.url && !loadingTrack && !trackError && (
            <p>
              Add a URL in <code>songsByCountry.js</code> or click the Jamendo
              button.
            </p>
          )}
        </aside>
      </div>

      <button
        className="listen-btn"
        onClick={async () => {
          const songs = await searchTracks({ query: "China", limit: 3 });
          console.log(songs); // check results in browser console
          alert(`Found ${songs.length} tracks. Check console!`);
        }}
      >
        Test Jamendo Search
      </button>

      <footer className="footer">Built with React + react-simple-maps</footer>
    </div>
  );
}

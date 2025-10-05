import React, { useMemo, useState } from "react";
import WorldMap from "./components/WorldMap.jsx";
import { songsByCountry } from "./data/songsByCountry.js";

export default function App() {
  const [selected, setSelected] = useState(null);
  const [position, setPosition] = useState({ coordinates: [0, 0], zoom: 1 });

  // quiz state
  const [geoList, setGeoList] = useState([]); // [{code,name}, ...] from map
  const [quizMode, setQuizMode] = useState(false);
  const [target, setTarget] = useState(null); // {code,name}
  const [reveal, setReveal] = useState(false);
  const [feedback, setFeedback] = useState("");

  const song = selected ? songsByCountry[selected.code] : null;

  // zoom controls
  const zoomIn = () =>
    setPosition((p) => ({ ...p, zoom: Math.min(p.zoom * 1.5, 8) }));
  const zoomOut = () =>
    setPosition((p) => ({ ...p, zoom: Math.max(p.zoom / 1.5, 1) }));
  const reset = () => setPosition({ coordinates: [0, 0], zoom: 1 });

  // quiz helpers
  const startQuiz = () => {
    if (!geoList.length) return; // map not ready yet
    const next = geoList[Math.floor(Math.random() * geoList.length)];
    setQuizMode(true);
    setTarget(next);
    setReveal(false);
    setSelected(null);
    setFeedback(`Find: ${next.name}`);
  };
  const nextQuestion = () => startQuiz();
  const revealAnswer = () => setReveal(true);

  const onSelectCountry = ({ code, name }) => {
    setSelected({ code, name });

    if (quizMode && target) {
      const correct = code === target.code;
      setFeedback(correct ? "✅ Correct!" : `❌ Not that one. Try again…`);
      if (correct) setReveal(true);
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1>World Music Map</h1>
        <p>Click a country to see a song.</p>

        {/* Quiz controls (right side) */}
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          {!quizMode ? (
            <button onClick={startQuiz}>Start Quiz</button>
          ) : (
            <>
              <button onClick={revealAnswer}>Reveal</button>
              <button onClick={nextQuestion}>Next</button>
              <button
                onClick={() => {
                  setQuizMode(false);
                  setTarget(null);
                  setReveal(false);
                  setFeedback("");
                }}
              >
                End Quiz
              </button>
            </>
          )}
        </div>
      </header>

      {/* Status / prompt line for quiz */}
      {quizMode && (
        <div style={{ padding: "8px 16px", fontWeight: 600 }}>
          {feedback || (target ? `Find: ${target.name}` : "")}
        </div>
      )}

      {/* Main layout */}
      <div className="layout">
        <div className="mapCard" style={{ position: "relative" }}>
          {/* Zoom buttons */}
          <div className="zoomControls">
            <button onClick={zoomIn}>＋</button>
            <button onClick={zoomOut}>－</button>
            <button onClick={reset}>⟲</button>
          </div>

          <WorldMap
            onSelectCountry={onSelectCountry}
            selectedCode={selected?.code}
            position={position}
            setPosition={setPosition}
            // quiz props
            quizCorrectCode={target?.code}
            quizReveal={reveal}
            // NEW: receive country list once
            onGeographyList={setGeoList}
          />
        </div>

        {/* Right panel */}
        <aside className="infoCard">
          <h2>{selected ? selected.name : "Pick a country"}</h2>
          {selected && (
            <div className="songBox">
              {song ? (
                <>
                  <p>
                    <strong>Song:</strong> {song.title}
                  </p>
                  <p>
                    <strong>Artist:</strong> {song.artist}
                  </p>
                  {song.url && (
                    <p>
                      <a
                        href={song.url}
                        target="_blank"
                        rel="noreferrer"
                        className="listen-btn"
                      >
                        🎵 Listen Now
                      </a>
                    </p>
                  )}
                </>
              ) : (
                <p>
                  Coming soon — add one in <code>songsByCountry.js</code>.
                </p>
              )}
            </div>
          )}
        </aside>
      </div>

      <footer className="footer">Built with React + react-simple-maps</footer>
    </div>
  );
}

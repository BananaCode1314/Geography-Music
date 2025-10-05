import React, { useMemo, useState } from "react";
import WorldMap from "./components/WorldMap.jsx";
import { songsByCountry } from "./data/songsByCountry.js";
import ReactPlayer from "react-player";
import "./styles.css";

export default function App() {
  const [selected, setSelected] = useState(null); // { code, name }
  const [position, setPosition] = useState({ coordinates: [0, 0], zoom: 1 });

  // quiz state
  const [geoList, setGeoList] = useState([]); // [{code,name}, ...] (sent once by WorldMap)
  const [quizMode, setQuizMode] = useState(false);
  const [target, setTarget] = useState(null); // {code,name}
  const [reveal, setReveal] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [score, setScore] = useState(0);
  const [qNum, setQNum] = useState(0);

  // derive the song for the currently selected country (normal mode)
  const song = selected ? songsByCountry[selected.code] : null;

  // zoom controls
  const zoomIn = () =>
    setPosition((p) => ({ ...p, zoom: Math.min(p.zoom * 1.5, 8) }));
  const zoomOut = () =>
    setPosition((p) => ({ ...p, zoom: Math.max(p.zoom / 1.5, 1) }));
  const reset = () => setPosition({ coordinates: [0, 0], zoom: 1 });

  // quiz: only countries that actually have a playable URL
  const quizPool = useMemo(
    () =>
      geoList.filter((g) => {
        const info = songsByCountry[g.code];
        return info?.url; // require a URL so the song can play
      }),
    [geoList]
  );

  function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function startQuiz() {
    if (!quizPool.length) {
      setFeedback("Add a few songs with URLs first.");
      return;
    }
    const next = pickRandom(quizPool);
    setQuizMode(true);
    setTarget(next);
    setReveal(false);
    setSelected(null);
    setScore(0);
    setQNum(1);
  }

  function nextQuestion() {
    if (!quizPool.length) return;
    const next = pickRandom(quizPool);
    setTarget(next);
    setReveal(false);
    setSelected(null);
    setQNum((n) => n + 1);
  }

  function endQuiz() {
    setQuizMode(false);
    setTarget(null);
    setReveal(false);
    setFeedback("");
    setQNum(0);
    setScore(0);
  }

  function revealAnswer() {
    if (target) setReveal(true);
  }

  function onSelectCountry({ code, name }) {
    setSelected({ code, name });
    if (quizMode && target) {
      const correct = code === target.code;
      setFeedback(correct ? "✅ Correct!" : "❌ Not that one. Try again…");
      if (correct) {
        setReveal(true);
        setScore((s) => s + 1);
      }
    }
  }

  // What to play: normal mode uses selected, quiz mode uses target
  const currentSong = quizMode
    ? target
      ? songsByCountry[target.code]
      : null
    : song;

  // Helper: some YouTube videos block embeds → show a button fallback
  const showPlayer =
    !!currentSong?.url &&
    (/\.mp3($|\?)/i.test(currentSong.url) ||
      ReactPlayer.canPlay(currentSong.url));

  return (
    <div className="app">
      <header className="header">
        <h1>World Music Map</h1>
        <p>
          {quizMode
            ? "Listen and click the country on the map."
            : "Click a country to see a song."}
        </p>

        {/* Quiz controls (right side) */}
        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            gap: 8,
            alignItems: "center",
          }}
        >
          {!quizMode ? (
            <button className="listen-btn" onClick={startQuiz}>
              Start Quiz
            </button>
          ) : (
            <>
              <span style={{ color: "#cbd5e1", fontWeight: 600 }}>
                Q{qNum} · Score: {score}
              </span>
              <button className="listen-btn ghost" onClick={revealAnswer}>
                Reveal
              </button>
              <button className="listen-btn ghost" onClick={nextQuestion}>
                Next
              </button>
              <button className="listen-btn" onClick={endQuiz}>
                End Quiz
              </button>
            </>
          )}
        </div>
      </header>

      {quizMode && (
        <div style={{ padding: "8px 16px", fontWeight: 600, color: "#cbd5e1" }}>
          {feedback || `Which country is this song from?`}
        </div>
      )}

      {/* Main layout */}
      <div className="layout">
        <div className="mapCard" style={{ position: "relative" }}>
          <div className="zoomControls">
            <button onClick={zoomIn}>＋</button>
            <button onClick={zoomOut}>－</button>
            <button onClick={reset}>⟲</button>
          </div>

          <WorldMap
            onSelectCountry={onSelectCountry}
            selectedCode={
              quizMode
                ? reveal
                  ? target?.code
                  : selected?.code
                : selected?.code
            }
            position={position}
            setPosition={setPosition}
            // quiz props (for highlighting)
            quizCorrectCode={target?.code}
            quizReveal={reveal}
            // receive country list once
            onGeographyList={setGeoList}
          />
        </div>

        {/* Right panel */}
        <aside className="infoCard">
          <h2>
            {quizMode
              ? reveal
                ? `Answer: ${target?.name || "—"}`
                : "Which country is this song from?"
              : selected
              ? selected.name
              : "Pick a country"}
          </h2>

          {/* Player + details */}
          {currentSong ? (
            <>
              {!quizMode && (
                <>
                  <p>
                    <strong>Song:</strong> {currentSong.title}
                  </p>
                  <p>
                    <strong>Artist:</strong> {currentSong.artist}
                  </p>
                </>
              )}

              {showPlayer ? (
                /\.mp3($|\?)/i.test(currentSong.url) ? (
                  <audio
                    controls
                    src={currentSong.url}
                    style={{ width: "100%" }}
                  />
                ) : (
                  <ReactPlayer
                    url={currentSong.url}
                    controls
                    width="100%"
                    height="240px"
                    config={{ youtube: { playerVars: { modestbranding: 1 } } }}
                  />
                )
              ) : currentSong.url ? (
                <p>
                  This source disables embeds.{" "}
                  <a
                    href={currentSong.url}
                    target="_blank"
                    rel="noreferrer"
                    className="listen-btn"
                  >
                    🎵 Open to listen
                  </a>
                </p>
              ) : null}
            </>
          ) : (
            !quizMode &&
            selected && (
              <p>
                Coming soon — add one in <code>songsByCountry.js</code>.
              </p>
            )
          )}
        </aside>
      </div>

      <footer className="footer">Built with React + react-simple-maps</footer>
    </div>
  );
}

import { useEffect, useRef, useState } from "react";
import WordRow from "./WordRow";

export default function LetterGrid() {
  
  const [secret, setSecret] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [guesses, setGuesses] = useState<string[]>([]); // array of 5-char strings
  const [input, setInput] = useState("");
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    fetch("https://darkermango.github.io/5-Letter-words/words.json")
      .then((r) => r.json())
      .then((data) => {
        const idx = Math.trunc(new Date().getTime() / (1000*60*60*24)); // day index
        const dailyWord = data["words"][idx % data["words"].length];
        
        setSecret(dailyWord);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load secret word. Please refresh.");
        setLoading(false);
      });
  }, []);

  function handleSubmit(e: { preventDefault: () => void; } ) {
    e.preventDefault();
    if (input?.length !== 5 || gameOver || !secret) return;

    const guess = input.toUpperCase();
    const newGuesses = [...guesses, guess];
    setGuesses(newGuesses);
    setInput("");
    if (guess === secret.toUpperCase()) {
      setWon(true);
      setGameOver(true);
    } else if (newGuesses.length >= 5) {
      setGameOver(true);
    }
  }

  const rows = Array.from({ length: 5 }).map((_, i) => ({
    word: guesses[i] || null,
    isGuessed: i < guesses.length,
  }));

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#121213",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: 40,
        fontFamily: "'Courier New', monospace",
      }}
    >
      <h1
        style={{
          color: "#ffffff",
          fontSize: 36,
          letterSpacing: 8,
          textTransform: "uppercase",
          marginBottom: 8,
          fontWeight: 700,
        }}
      >
        Letter Grid
      </h1>
      <div
        style={{
          width: 330,
          borderBottom: "1px solid #3a3a3c",
          marginBottom: 32,
        }}
      />

      {loading && (
        <p style={{ color: "#818384", fontSize: 20, letterSpacing: 2 }}>
          Loading…
        </p>
      )}

      {error && (
        <p style={{ color: "#ff6b6b", fontSize: 16 }}>{error}</p>
      )}

      {!loading && !error && secret && (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {rows.map((row, i) => (
              <WordRow
                key={i}
                word={row.word}
                secret={secret}
                isGuessed={row.isGuessed}
              />
            ))}
          </div>

          {gameOver ? (
            <div style={{ marginTop: 32, textAlign: "center" }}>
              <p
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: won ? "#538d4e" : "#e74c3c",
                  letterSpacing: 2,
                  textTransform: "uppercase",
                }}
              >
                {won ? "You've won!" : "You've lost!"}
              </p>
              {!won && (
                <p style={{ color: "#818384", marginTop: 8, fontSize: 14 }}>
                  The word was:{" "}
                  <span style={{ color: "#ffffff", fontWeight: 700 }}>
                    {secret}
                  </span>
                </p>
              )}
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              style={{ marginTop: 32, display: "flex", gap: 8 }}
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) =>
                  setInput(e.target.value.toUpperCase().slice(0, 5))
                }
                maxLength={5}
                placeholder="GUESS"
                autoFocus
                style={{
                  background: "#1a1a1b",
                  border: "2px solid #565758",
                  color: "#ffffff",
                  fontSize: 22,
                  fontFamily: "'Courier New', monospace",
                  fontWeight: 700,
                  letterSpacing: 6,
                  padding: "10px 16px",
                  width: 180,
                  textAlign: "center",
                  textTransform: "uppercase",
                  outline: "none",
                }}
              />
              <button
                type="submit"
                disabled={input.length !== 5}
                style={{
                  background: input.length === 5 ? "#538d4e" : "#3a3a3c",
                  color: "#ffffff",
                  border: "none",
                  fontSize: 16,
                  fontWeight: 700,
                  fontFamily: "'Courier New', monospace",
                  letterSpacing: 2,
                  padding: "10px 20px",
                  cursor: input.length === 5 ? "pointer" : "not-allowed",
                  textTransform: "uppercase",
                  transition: "background 0.2s",
                }}
              >
                Enter
              </button>
            </form>
          )}

          <p style={{ color: "#818384", marginTop: 16, fontSize: 13 }}>
            Guesses: {guesses.length} / 5
          </p>
        </>
      )}
    </div>
  )
}
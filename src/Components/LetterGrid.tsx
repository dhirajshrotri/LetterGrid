import { useEffect, useRef, useState } from "react";
import WordRow from "./WordRow";
import { getTodayStats, recordResult } from "../Services/statsService";
import StatsModal from "./StatsModal";

const STORAGE_KEY = "letter-grid-session";

function encodeSecret(secret: string) {
  return btoa(
    secret
      .split("")
      .map((char, index) =>
        String.fromCodePoint((char.codePointAt(0) ?? 0) ^ (0x5a + index))
      )
      .join("")
  );
}

function getEndGameMessage(guessCount: number, won: boolean) {
  if (!won) {
    return "Better luck next time — try again tomorrow.";
  }

  switch (guessCount) {
    case 1:
      return "One guess? That feels suspiciously fast... are you sure you didn't peek?";
    case 2:
      return "Two guesses? Maybe you got lucky. Nice work.";
    case 3:
      return "Three guesses is a strong show. Well played.";
    case 4:
      return "Four guesses is solid. That was a good solve.";
    case 5:
      return "Five guesses means you earned it. Great job.";
    default:
      return "You solved it! Nice finish.";
  }
}

export default function LetterGrid() {
  
  const [secret, setSecret] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [guessError, setGuessError] = useState<string | null>(null);  const [wordSet, setWordSet] = useState<Set<string> | null>(null);
  const [guesses, setGuesses] = useState<string[]>([]); // array of 5-char strings
  const [input, setInput] = useState("");
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const inputRef = useRef(null);
  const [stats, setStats] = useState<{ plays: number; guessDistribution: { [key: string]: number } } | null>(null);
  const [showStats, setShowStats] = useState(false);
  const [playerGuesses, setPlayerGuesses] = useState(0);

  useEffect(() => {
    fetch("https://raw.githubusercontent.com/charlesreid1/five-letter-words/refs/heads/main/sgb-words.txt")
      .then((r) => r.text())
      .then((data) => {
        const dataArr = data
          .split("\n")
          .map((word) => word.trim().toUpperCase())
          .filter(Boolean);

        if (!dataArr.length) {
          throw new Error("Word list is empty");
        }

        const idx = Math.trunc(Date.now() / (1000 * 60 * 60 * 24)); // day index
        const dailyWord = dataArr[idx % dataArr.length];
        const encodedDailyWord = encodeSecret(dailyWord);

        setSecret(dailyWord);
        setWordSet(new Set(dataArr));
        setLoading(false);

        try {
          const saved = localStorage.getItem(STORAGE_KEY);
          if (saved) {
            const session = JSON.parse(saved) as {
              secret: string;
              guesses: string[];
              input: string;
              gameOver: boolean;
              won: boolean;
            };

            if (session.secret === encodedDailyWord) {
              setGuesses(session.guesses || []);
              setInput(session.input || "");
              setGameOver(session.gameOver || false);
              setWon(session.won || false);
            } else {
              localStorage.removeItem(STORAGE_KEY);
            }
          }
        } catch {
          // ignore parse errors
        }
      })
      .catch(() => {
        setError("Failed to load secret word. Please refresh.");
        setLoading(false);
      });
  }, []);

  async function handleSubmit(e: { preventDefault: () => void }) {
    e.preventDefault();
    if (input?.length !== 5 || gameOver || !secret || !wordSet) return;

    const guess = input.toUpperCase();

    if (!wordSet.has(guess)) {
      setGuessError("We got shakespeare in the house? That's not a valid word.");
      return;
    }

    if (guesses.includes(guess)) {
      setGuessError("You've already guessed that word.");
      return;
    }

    setGuessError(null);
    const newGuesses = [...guesses, guess];
    setGuesses(newGuesses);
    setInput("");

    if (guess === secret.toUpperCase()) {
      await recordResult(guesses.length + 1);
      const stats = await getTodayStats();
      setStats(stats as { plays: number; guessDistribution: { [key: string]: number } });          // trigger your stats modal
      setPlayerGuesses(guesses.length);
      setShowStats(true);
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

  useEffect(() => {
    if (!secret) return;

    const session = {
      secret: encodeSecret(secret),
      guesses,
      input,
      gameOver,
      won,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  }, [secret, guesses, input, gameOver, won]);

  return (
    <>
      <style>{`@keyframes shake {
        0% { transform: translateX(0); }
        20% { transform: translateX(-8px); }
        40% { transform: translateX(8px); }
        60% { transform: translateX(-6px); }
        80% { transform: translateX(6px); }
        100% { transform: translateX(0); }
      }`}</style>
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
                key={row.word || i}
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
              <div
                style={{
                  marginTop: 24,
                  padding: 20,
                  border: "1px solid #3a3a3c",
                  borderRadius: 12,
                  background: "#181819",
                  maxWidth: 320,
                  marginLeft: "auto",
                  marginRight: "auto",
                }}
              >
                <p
                  style={{
                    color: "#ffffff",
                    fontSize: 16,
                    fontWeight: 700,
                    marginBottom: 10,
                  }}
                >
                  Game stats
                </p>
                <p style={{ color: "#818384", fontSize: 14, marginBottom: 8 }}>
                  Total guesses: <span style={{ color: "#ffffff" }}>{guesses.length}</span>
                </p>
                <p style={{ color: "#abb0b6", fontSize: 14 }}>
                  {getEndGameMessage(guesses.length, won)}
                </p>
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              style={{ marginTop: 32, display: "flex", gap: 8 }}
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => {
                  setGuessError(null);
                  setInput(e.target.value.toUpperCase().slice(0, 5));
                }}
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
                  animation: guessError?.length ? "shake 0.35s ease" : undefined,
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

          {guessError && (
            <p style={{ color: "#ff6b6b", marginTop: 12, fontSize: 14 }}>
              {guessError}
            </p>
          )}

          <p style={{ color: "#818384", marginTop: 16, fontSize: 13 }}>
            Guesses: {guesses.length} / 5
          </p>
        </>
      )}

      {showStats && stats && (
        <StatsModal stats={stats} playerGuesses={playerGuesses} />
      )}
    </div>
    </>
  )
}
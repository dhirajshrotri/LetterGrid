import { useEffect, useState } from "react";
import WordRow from "./WordRow";

const Timer = ({ timeLeft }: { timeLeft: number }) => {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  return (
    <div style={{ fontSize: 24, marginBottom: 20 }}>
      Time Left: {minutes}:{seconds.toString().padStart(2, "0")}
    </div>
  );
};

const TimedMode = () => {

  const [currentWord, setCurrentWord] = useState("");
  const [guesses, setGuesses] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(300);
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState("");
  const [wordSet, setWordSet] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Fetch a random word from the list
    fetch("https://raw.githubusercontent.com/charlesreid1/five-letter-words/refs/heads/main/sgb-words.txt")
      .then((response) => response.text())
      .then((text) => {
        const words = text.split("\n").filter((word) => word.length === 5);
        const randomWord = words[Math.floor(Math.random() * words.length)].toUpperCase();
        setCurrentWord(randomWord);
        setWordSet(new Set(words.map((w) => w.toUpperCase())));
      });
  }, []);

  useEffect(() => {
    if (timeLeft === 0) {
      setGameOver(true);
      setMessage(`Time's up! The word was ${currentWord}`);
    }
    if (gameOver) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, gameOver, currentWord]);

  const handleGuess = (guess: string) => {
    if (gameOver) return;
    const upperGuess = guess.toUpperCase();

    if (!wordSet.has(upperGuess)) {
      setMessage("We got shakespeare in the house? That's not a valid word.");
      return;
    }
    setGuesses((prev) => [...prev, upperGuess]);
    if (upperGuess === currentWord) {
      setGameOver(true);
      setMessage("Congratulations! You've guessed the word!");
    }
  };

  return (
    <div>
      <Timer timeLeft={timeLeft} />
      <h5>It's a timed game! New word every time. Guess the word before time runs out!</h5>
      <input
              maxLength={5}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleGuess((e.target as HTMLInputElement).value);
                  (e.target as HTMLInputElement).value = "";
                }
              }}
              disabled={gameOver}
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
      <div>
        {guesses.map((guess, index) => (
          <WordRow word={guess} key={guess} secret={currentWord} isGuessed={true} />
        ))}
      </div>
      {message && <p>{message}</p>}
    </div>
  );
}

export default TimedMode;
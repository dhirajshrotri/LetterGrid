function getWordColors(guess: string, secret:string) {
  const g = guess.toUpperCase().split("");
  const s = secret.toUpperCase().split("");
  const colors = Array(5).fill("#3a3a3c");
  const secretPool = [...s];

  // First pass: mark greens and remove them from the pool
  for (let i = 0; i < 5; i++) {
    if (g[i] === s[i]) {
      colors[i] = "#538d4e";
      secretPool[i] = ""; // claimed
    }
  }

  // Second pass: mark yellows only if an unclaimed copy exists in the pool
  for (let i = 0; i < 5; i++) {
    if (colors[i] !== "#538d4e") {
      const poolIndex = secretPool.indexOf(g[i]);
      if (poolIndex !== -1) {
        colors[i] = "#b59f3b";
        secretPool[poolIndex] = ""; // claim it so it can't be used again
      }
    }
  }

  return colors;                      // red/dark
}

interface WordRowProps {
  word: string | null
  secret: string
  isGuessed: boolean
}

export default function WordRow({ word, secret, isGuessed }: Readonly<WordRowProps>) {
 const colors = isGuessed && word ? getWordColors(word, secret) : null;

  return (
    <div style={{ display: "flex", gap: 6 }}>
      {Array.from({ length: 5 }).map((_, i) => {
        const char = word ? word[i] : "";
        const bg = colors ? colors[i] : "#121213";
        const border = isGuessed
          ? "2px solid transparent"
          : char
          ? "2px solid #565758"
          : "2px solid #3a3a3c";

        return (
          <div
            key={i}
            style={{
              width: 62,
              height: 62,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 32,
              fontWeight: 700,
              fontFamily: "'Courier New', monospace",
              color: "#ffffff",
              background: bg,
              border,
              textTransform: "uppercase",
              letterSpacing: 1,
              transition: "background 0.3s",
            }}
          >
            {char}
          </div>
        );
      })}
    </div>
  );
}
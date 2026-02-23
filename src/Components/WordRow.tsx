function getCharColor(guess: string, secret:string, index:number) {
  const g = guess[index].toUpperCase();
  const s = secret.toUpperCase();
  if (g === s[index]) return "#538d4e"; // green
  if (s.includes(g)) return "#b59f3b";  // yellow
  return "#3a3a3c";                      // red/dark
}

interface WordRowProps {
  word: string | null
  secret: string
  isGuessed: boolean
}

export default function WordRow({ word, secret, isGuessed }: Readonly<WordRowProps>) {
  return (
    <div style={{ display: "flex", gap: 6 }}>
      {Array.from({ length: 5 }).map((_, i) => {
        const char = word ? word[i] : "";
        const bg = isGuessed && word
          ? getCharColor(word, secret, i)
          : "#121213";
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
            {char || ""}
          </div>
        );
      })}
    </div>
  );
}
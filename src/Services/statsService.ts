import { db } from "../firebase";
import { doc, runTransaction, getDoc } from "firebase/firestore";

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

export async function recordResult(guessCount: number) {
  const today = getTodayKey();

  // prevent duplicate submissions
  if (localStorage.getItem(`submitted_${today}`)) return;

  const ref = doc(db, "daily_stats", today);

  await runTransaction(db, async (txn) => {
    const snap = await txn.get(ref);
    if (!snap.exists()) {
      txn.set(ref, {
        plays: 1,
        guessDistribution: { [guessCount]: 1 },
      });
    } else {
      const data = snap.data();
      txn.update(ref, {
        plays: data.plays + 1,
        [`guessDistribution.${guessCount}`]:
          (data.guessDistribution[guessCount] || 0) + 1,
      });
    }
  });

  localStorage.setItem(`submitted_${today}`, "true");
}

export async function getTodayStats() {
  const ref = doc(db, "daily_stats", getTodayKey());
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return snap.data();
}
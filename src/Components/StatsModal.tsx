function getPercentile(guessDistribution, totalPlays, playerGuesses) {
  // Count how many players did WORSE (more guesses) than you
    let worseCount = 0;
    for (let g = playerGuesses + 1; g <= 6; g++) {
      worseCount += guessDistribution[g] || 0;
    }

    // Add players who didn't solve it at all if you track failures
    // worseCount += (guessDistribution["fail"] || 0);

    const percentile = Math.round((worseCount / totalPlays) * 100);
    return percentile; // "top 20%" means percentile >= 80
  }

function StatsModal({ stats, playerGuesses }) {
  
  const percentile = getPercentile(
    stats.guessDistribution,
    stats.plays,
    playerGuesses
  );

  const avgGuesses =
    Object.entries(stats.guessDistribution).reduce(
      (sum, [g, count]) => sum + g * count, 0
    ) / stats.plays;

  return (
    <div className="stats-modal">
      <p>{stats.plays} players today</p>
      <p>Average: {avgGuesses.toFixed(1)} guesses</p>
      <p>You're in the top {100 - percentile}% today!</p>
    </div>
  );
}

export default StatsModal;
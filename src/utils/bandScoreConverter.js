// src/utils/bandScoreConverter.js

// These tables are based on common IELTS score conversions.
// Note: Official IELTS conversion tables can vary slightly between tests.

const listeningReadingConversion = {
  40: 9.0, 39: 9.0,
  38: 8.5, 37: 8.5,
  36: 8.0, 35: 8.0,
  34: 7.5, 33: 7.5, 32: 7.5,
  31: 7.0, 30: 7.0,
  29: 6.5, 28: 6.5, 27: 6.5, 26: 6.5,
  25: 6.0, 24: 6.0, 23: 6.0,
  22: 5.5, 21: 5.5, 20: 5.5, 19: 5.5,
  18: 5.0, 17: 5.0, 16: 5.0, 15: 5.0,
  14: 4.5, 13: 4.5, 12: 4.5,
  11: 4.0, 10: 4.0,
  9: 3.5, 8: 3.5,
  7: 3.0, 6: 3.0,
  5: 2.5, 4: 2.5,
};

function getBandScore(section, rawScore) {
  if (section === "LISTENING" || section === "READING") {
    return listeningReadingConversion[rawScore] || 0;
  }
  // For Writing, the score is typically assigned directly by the marker.
  // We will assume the raw score is the band score.
  if (section === "WRITING") {
    return rawScore;
  }
  return 0;
}

function getOverallBandScore(scores) {
  const { listening, reading, writing, speaking } = scores;
  const total = listening + reading + writing + (speaking || 0);
  const count = speaking ? 4 : 3;
  
  const mean = total / count;
  
  // Round to the nearest 0.5
  const rounded = Math.round(mean * 2) / 2;
  return rounded;
}

module.exports = { getBandScore, getOverallBandScore };

// Text Analysis Web Worker
// Handles heavy text processing tasks in the background

self.onmessage = function(event) {
  const { data, options } = event.data;
  const { text, analysisType } = data;

  try {
    let result;
    
    switch (analysisType) {
      case 'comprehensive':
        result = performComprehensiveAnalysis(text);
        break;
      case 'readability':
        result = calculateReadabilityScores(text);
        break;
      case 'keywords':
        result = extractKeywords(text);
        break;
      case 'sentiment':
        result = analyzeSentiment(text);
        break;
      default:
        result = performBasicAnalysis(text);
    }

    self.postMessage({
      type: 'success',
      data: result
    });
  } catch (error) {
    self.postMessage({
      type: 'error',
      error: error.message
    });
  }
};

function performBasicAnalysis(text) {
  const words = text.trim().split(/\s+/).filter(word => word.length > 0);
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  
  return {
    characters: text.length,
    charactersNoSpaces: text.replace(/\s/g, '').length,
    words: words.length,
    sentences: sentences.length,
    paragraphs: paragraphs.length,
    averageWordsPerSentence: sentences.length > 0 ? Math.round(words.length / sentences.length * 100) / 100 : 0,
    readingTime: Math.ceil(words.length / 200) // Assuming 200 WPM reading speed
  };
}

function performComprehensiveAnalysis(text) {
  const basic = performBasicAnalysis(text);
  const readability = calculateReadabilityScores(text);
  const keywords = extractKeywords(text);
  
  // Report progress
  self.postMessage({
    type: 'progress',
    progress: 50
  });
  
  const sentiment = analyzeSentiment(text);
  
  // Report progress
  self.postMessage({
    type: 'progress',
    progress: 80
  });
  
  const wordFrequency = calculateWordFrequency(text);
  
  return {
    ...basic,
    readability,
    keywords: keywords.slice(0, 10), // Top 10 keywords
    sentiment,
    wordFrequency: wordFrequency.slice(0, 20), // Top 20 most frequent words
    textComplexity: calculateTextComplexity(text)
  };
}

function calculateReadabilityScores(text) {
  const words = text.trim().split(/\s+/).filter(word => word.length > 0);
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const syllables = words.reduce((total, word) => total + countSyllables(word), 0);
  
  if (sentences.length === 0 || words.length === 0) {
    return { fleschKincaid: 0, fleschReadingEase: 0 };
  }
  
  const avgWordsPerSentence = words.length / sentences.length;
  const avgSyllablesPerWord = syllables / words.length;
  
  // Flesch-Kincaid Grade Level
  const fleschKincaid = 0.39 * avgWordsPerSentence + 11.8 * avgSyllablesPerWord - 15.59;
  
  // Flesch Reading Ease
  const fleschReadingEase = 206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord;
  
  return {
    fleschKincaid: Math.max(0, Math.round(fleschKincaid * 10) / 10),
    fleschReadingEase: Math.max(0, Math.min(100, Math.round(fleschReadingEase * 10) / 10))
  };
}

function countSyllables(word) {
  word = word.toLowerCase();
  if (word.length <= 3) return 1;
  
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  word = word.replace(/^y/, '');
  const matches = word.match(/[aeiouy]{1,2}/g);
  return matches ? matches.length : 1;
}

function extractKeywords(text) {
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3);
  
  // Common stop words
  const stopWords = new Set([
    'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'its', 'may', 'new', 'now', 'old', 'see', 'two', 'who', 'boy', 'did', 'she', 'use', 'way', 'will', 'with', 'have', 'this', 'that', 'they', 'from', 'been', 'said', 'each', 'which', 'their', 'time', 'would', 'there', 'could', 'other', 'after', 'first', 'never', 'these', 'think', 'where', 'being', 'every', 'great', 'might', 'shall', 'still', 'those', 'under', 'while'
  ]);
  
  const wordCount = {};
  words.forEach(word => {
    if (!stopWords.has(word)) {
      wordCount[word] = (wordCount[word] || 0) + 1;
    }
  });
  
  return Object.entries(wordCount)
    .sort(([,a], [,b]) => b - a)
    .map(([word, count]) => ({ word, count, frequency: count / words.length }));
}

function analyzeSentiment(text) {
  // Simple sentiment analysis based on word lists
  const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'awesome', 'brilliant', 'outstanding', 'perfect', 'love', 'like', 'enjoy', 'happy', 'pleased', 'satisfied', 'delighted', 'thrilled'];
  const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'disgusting', 'hate', 'dislike', 'angry', 'frustrated', 'disappointed', 'sad', 'upset', 'annoyed', 'irritated', 'furious'];
  
  const words = text.toLowerCase().replace(/[^\w\s]/g, ' ').split(/\s+/);
  
  let positiveScore = 0;
  let negativeScore = 0;
  
  words.forEach(word => {
    if (positiveWords.includes(word)) positiveScore++;
    if (negativeWords.includes(word)) negativeScore++;
  });
  
  const totalSentimentWords = positiveScore + negativeScore;
  
  if (totalSentimentWords === 0) {
    return { sentiment: 'neutral', confidence: 0, positive: 0, negative: 0 };
  }
  
  const positiveRatio = positiveScore / totalSentimentWords;
  const negativeRatio = negativeScore / totalSentimentWords;
  
  let sentiment = 'neutral';
  let confidence = 0;
  
  if (positiveRatio > negativeRatio) {
    sentiment = 'positive';
    confidence = positiveRatio;
  } else if (negativeRatio > positiveRatio) {
    sentiment = 'negative';
    confidence = negativeRatio;
  }
  
  return {
    sentiment,
    confidence: Math.round(confidence * 100) / 100,
    positive: positiveScore,
    negative: negativeScore
  };
}

function calculateWordFrequency(text) {
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 0);
  
  const frequency = {};
  words.forEach(word => {
    frequency[word] = (frequency[word] || 0) + 1;
  });
  
  return Object.entries(frequency)
    .sort(([,a], [,b]) => b - a)
    .map(([word, count]) => ({ word, count, percentage: Math.round((count / words.length) * 10000) / 100 }));
}

function calculateTextComplexity(text) {
  const words = text.trim().split(/\s+/).filter(word => word.length > 0);
  const uniqueWords = new Set(words.map(w => w.toLowerCase())).size;
  const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
  
  const complexity = {
    lexicalDiversity: Math.round((uniqueWords / words.length) * 100) / 100,
    averageWordLength: Math.round(avgWordLength * 100) / 100,
    longWords: words.filter(word => word.length > 6).length,
    veryLongWords: words.filter(word => word.length > 12).length
  };
  
  // Calculate overall complexity score (0-100)
  const complexityScore = Math.min(100, Math.round(
    (complexity.lexicalDiversity * 30) +
    (Math.min(complexity.averageWordLength / 10, 1) * 30) +
    ((complexity.longWords / words.length) * 40)
  ));
  
  return {
    ...complexity,
    complexityScore
  };
}
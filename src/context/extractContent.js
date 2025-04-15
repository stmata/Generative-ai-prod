export function extractContent(text) {
  let answer = "";
  let sources = "";

  const fullMatch = text.match(
    /"answer"\s*:\s*"([\s\S]*?)"\s*,\s*"sources"\s*:\s*"([\s\S]*?)"/
  );
  if (fullMatch) {
    answer = fullMatch[1].replace(/\\n/g, "\n");
    sources = fullMatch[2].replace(/\\n/g, "\n");
    return { answer, sources };
  }

  const answerMatch = text.match(/"answer"\s*:\s*"([\s\S]*)/);
  if (answerMatch) {
    answer = answerMatch[1].replace(/\\n/g, "\n");
    const indexOfQuote = answer.indexOf('"');
    if (indexOfQuote !== -1) {
      answer = answer.substring(0, indexOfQuote);
    }
  }

  return { answer, sources };
}

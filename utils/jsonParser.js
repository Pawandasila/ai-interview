/**
 * Attempts to extract and parse JSON from various formats including:
 * - Direct JSON
 * - JSON within markdown code blocks
 * - JSON within text
 * 
 * @param {string} content - The content to parse
 * @returns {Object|null} - The parsed JSON object or null if parsing fails
 */
export function extractAndParseJSON(content) {
  if (!content) return null;
  
  let jsonData = null;
  let contentToProcess = content;
  
  // Step 1: Check if content contains a code block and extract it
  if (content.includes("```")) {
    const jsonBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonBlockMatch && jsonBlockMatch[1]) {
      contentToProcess = jsonBlockMatch[1].trim();
      console.log("Extracted content from code block");
    }
  }
  
  // Step 2: Try to parse the content directly
  try {
    jsonData = JSON.parse(contentToProcess);
    console.log("Successfully parsed JSON directly");
    return jsonData;
  } catch (directParseError) {
    console.log("Direct parsing failed, trying alternative methods");
  }
  
  // Step 3: If direct parsing fails, try to extract JSON from the text
  try {
    const jsonMatch = contentToProcess.match(/(\{[\s\S]*\})/);
    if (jsonMatch && jsonMatch[1]) {
      jsonData = JSON.parse(jsonMatch[1]);
      console.log("Successfully parsed JSON from regex match");
      return jsonData;
    }
  } catch (matchError) {
    console.log("Regex match parsing failed");
  }
  
  // Step 4: Try to find and parse any JSON object in the text
  try {
    const possibleJson = contentToProcess.match(/(\{[^{}]*(\{[^{}]*\})[^{}]*\})/g);
    if (possibleJson && possibleJson.length > 0) {
      for (const jsonStr of possibleJson) {
        try {
          jsonData = JSON.parse(jsonStr);
          console.log("Found and parsed JSON object in text");
          return jsonData;
        } catch (e) {
          // Continue to the next match
        }
      }
    }
  } catch (objectError) {
    console.log("Object extraction failed");
  }
  
  // No valid JSON found
  return null;
}
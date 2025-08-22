// helpers/googleText.js
export function getGoogleText(resp) {
  // Preferred path on @google/genai
  if (typeof resp?.text === "string") return resp.text;

  // Fallback to first candidate/part if needed
  const parts = resp?.candidates?.[0]?.content?.parts || [];
  const firstText = parts.find((p) => typeof p.text === "string")?.text;
  return firstText ?? "";
}

export function stripFences(s) {
  return s.replace(/```json|```/g, "").trim(); // get rid of any extra json related strings or unwanted characters
}

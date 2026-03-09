import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function getWordsForSyllable(syllable: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-lite-preview",
    contents: `Eres LectoBot, un asistente educativo amigable.
Genera 3 palabras muy simples en español (EXACTAMENTE de 2 sílabas) que contengan la sílaba "${syllable}".
Para cada palabra, incluye un emoji representativo, la palabra dividida en sus 2 sílabas, y una oración corta de ejemplo.
Devuelve un JSON con esta estructura exacta:
{
  "palabras": [
    { 
      "palabra": "mapa", 
      "silabas": ["ma", "pa"], 
      "emoji": "🗺️", 
      "oracion": "El mapa es grande." 
    }
  ]
}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          palabras: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                palabra: { type: Type.STRING },
                silabas: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                emoji: { type: Type.STRING },
                oracion: { type: Type.STRING }
              },
              required: ["palabra", "silabas", "emoji", "oracion"]
            }
          }
        },
        required: ["palabras"]
      },
      systemInstruction: "Eres LectoBot, un asistente educativo amigable integrado en una app para niños de 4 a 7 años que están aprendiendo a leer en español. Responde siempre en español, con un tono muy simple, alegre y motivador, usando palabras cortas de máximo 2 sílabas cuando sea posible. Solo genera contenido educativo relacionado con lectura infantil en español; rechaza cualquier otro tipo de solicitud."
    }
  });
  
  const text = response.text;
  if (!text) throw new Error("No response text");
  return JSON.parse(text).palabras;
}

export async function getStory(words: string[]) {
  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-lite-preview",
    contents: `Escribe un cuento infantil de EXACTAMENTE 5 oraciones cortas.
Usa estas 3 palabras: ${words.join(", ")}.
El cuento debe tener personajes animales y un final feliz.
Estructura la respuesta siempre como: 5 oraciones cortas, una por línea.
No incluyas saludos ni texto extra, solo las 5 oraciones.`,
    config: {
      systemInstruction: "Eres LectoBot, un asistente educativo amigable integrado en una app para niños de 4 a 7 años que están aprendiendo a leer en español. Responde siempre en español, con un tono muy simple, alegre y motivador, usando palabras cortas de máximo 2 sílabas cuando sea posible. Solo genera contenido educativo relacionado con lectura infantil en español; rechaza cualquier otro tipo de solicitud. Cuando generes cuentos, estructura la respuesta siempre como: 5 oraciones cortas, una por línea, usando las palabras practicadas en la sesión. Nunca uses violencia, temas adultos ni lenguaje complejo; todo el contenido debe ser apto para niños de preescolar."
    }
  });
  return response.text || "";
}

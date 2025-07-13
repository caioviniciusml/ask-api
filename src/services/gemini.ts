import { GoogleGenAI } from '@google/genai'
import { env } from '../env.ts'

const gemini = new GoogleGenAI({
  apiKey: env.GEMINI_API_KEY,
})
const model = 'gemini-2.5-flash'

export async function transcribeAudio(audioBase64: string, mimeType: string) {
  const prompt =
    'Transcribe the following audio to a text, and at end if is needed translate it to English. Be precise and natural as a native American speaker keeping it grammatically correct. Only return a text with the transcription in english'

  const response = await gemini.models.generateContent({
    model,
    contents: [
      {
        text: prompt,
      },
      {
        inlineData: {
          mimeType,
          data: audioBase64,
        },
      },
    ],
  })

  if (!response.text) {
    throw new Error('Failed to Transcribe Audio')
  }

  return response.text
}

export async function generateEmbeddings(text: string) {
  const response = await gemini.models.embedContent({
    model: 'text-embedding-004',
    contents: [{ text }],
    config: {
      taskType: 'RETRIEVAL_DOCUMENT',
    },
  })

  if (!response.embeddings?.[0].values) {
    throw new Error(`It wasn't possible to generate audio embeddings.`)
  }

  return response.embeddings[0].values
}

export async function generateAnswer(
  question: string,
  transcriptions: string[]
) {
  const context = transcriptions.join('\n\n')

  const prompt = `Based on the following context below, answer the question in English being precise and natural as a native American speaker keeping the answer grammatically correct. Only return a text with the answer of the following question.

  CONTEXT:
  ${context}

  QUESTION:
  ${question}

  INSTRUCTIONS:
  - Use only informations present on the context sent;
  - If the answer can't be found on the following context, just answer that you don't have sufficient context and informations to answer the question;
  - Be objeticve;
  - Keep a educative & professional tone;    
  `

  const response = await gemini.models.generateContent({
    model,
    contents: [
      {
        text: prompt,
      },
    ],
  })

  if (!response.text) {
    throw new Error('Failed to Generate Answer')
  }

  return response.text
}

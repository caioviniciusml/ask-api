import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { z } from 'zod/v4'
import { db } from '../db/connection.ts'
import { schema } from '../db/schema/schema.ts'
import { generateEmbeddings, transcribeAudio } from '../services/gemini.ts'

export const uploadAudioRoute: FastifyPluginCallbackZod = (app) => {
  app.post(
    '/rooms/:roomId/audio',
    {
      schema: {
        params: z.object({
          roomId: z.string(),
        }),
      },
    },
    async (request, response) => {
      const { roomId } = request.params
      const audio = await request.file()

      if (!audio) {
        throw new Error('Audio File is Required')
      }

      const audioBuffer = await audio.toBuffer()
      const audioBase64 = audioBuffer.toString('base64')

      const transcription = await transcribeAudio(audioBase64, audio.mimetype)
      const embeddings = await generateEmbeddings(transcription)

      const result = await db
        .insert(schema.audioChunks)
        .values({
          roomId,
          transcription,
          embeddings,
        })
        .returning()

      const chunk = result[0]

      if (!chunk) {
        throw new Error('Error saving Audio Chunk.')
      }

      return response.status(201).send({ chunkId: chunk.id })
    }
  )
}

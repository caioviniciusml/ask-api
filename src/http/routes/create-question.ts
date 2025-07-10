import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { z } from 'zod/v4'
import { db } from '../../db/connection.ts'
import { schema } from '../../db/schema/schema.ts'

export const createQuestionRoute: FastifyPluginCallbackZod = (app) => {
  app.post(
    '/rooms/:roomId/questions',
    {
      schema: {
        params: z.object({
          roomId: z.string(),
        }),
        body: z.object({
          question: z.string().min(1),
        }),
      },
    },
    async (request, response) => {
      const { roomId } = request.params
      const { question } = request.body

      const result = await db
        .insert(schema.questions)
        .values({ roomId, question })
        .returning()

      const createdQuestion = result[0]

      if (!createdQuestion) {
        throw new Error('Failed to create new room.')
      }

      return response.status(201).send({ questionId: createdQuestion.id })
    }
  )
}

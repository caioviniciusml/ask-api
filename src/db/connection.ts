import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { env } from '../env.ts'
import { schema } from './schema/index.ts'

export const postgresClient = postgres(env.DB_URL)
export const db = drizzle(postgresClient, {
  schema,
  casing: 'snake_case',
})

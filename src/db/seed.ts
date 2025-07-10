import { reset, seed } from 'drizzle-seed'
import { db, postgresClient } from './connection.ts'
import { schema } from './schema/schema.ts'

await reset(db, schema)

await seed(db, schema).refine((f) => {
  return {
    rooms: {
      count: 5,
      columns: {
        name: f.companyName(),
        description: f.loremIpsum(),
      },
    },
    questions: {
      count: 10,
    },
  }
})

await postgresClient.end()

import 'reflect-metadata';
import 'dotenv/config';
import { GraphQLServer } from 'graphql-yoga';

import { createTypeormConn } from './utils/createTypeormConn';
import { confirmEmail } from './routes/confirmEmail';
import { redis } from './redis';
import { generateSchema } from './utils/generateSchema';

export const startServer = async () => {
  const server = new GraphQLServer({
    schema: generateSchema(),
    context: ({ request }) => ({
      redis,
      url: request.protocol + '://' + request.get('host')
    })
  });
  server.express.get('/confirm/:id', confirmEmail);
  await createTypeormConn();
  const port = process.env.NODE_ENV === 'test' ? 0 : 4000;
  const app = await server.start({ port });
  console.log(`Server is running on localhost:${port}`);
  return app;
};

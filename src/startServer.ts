import 'reflect-metadata';
import 'dotenv/config';
import { GraphQLServer } from 'graphql-yoga';
import * as session from 'express-session';
import * as connectRedis from 'connect-redis';

import { createTypeormConn } from './utils/createTypeormConn';
import { confirmEmail } from './routes/confirmEmail';
import { redis } from './redis';
import { generateSchema } from './utils/generateSchema';
import { redisSessionPrefix } from './constants';

const SESSION_SECRET = 'kasjdfklsjkdfjs';
const RedisStore = connectRedis(session);
export const startServer = async () => {
  const server = new GraphQLServer({
    schema: generateSchema(),
    context: ({ request }) => ({
      redis,
      url: request.protocol + '://' + request.get('host'),
      session: request.session,
      request
    })
  });

  server.express.use(
    session({
      store: new RedisStore({
        client: redis as any,
        prefix: redisSessionPrefix
      }),
      name: 'sid',
      secret: SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
      }
    })
  );

  const cors = {
    credentials: true,
    origin:
      process.env.NODE_ENV === 'test'
        ? '*'
        : (process.env.FRONTEND_HOST as string)
  };
  server.express.get('/confirm/:id', confirmEmail);
  await createTypeormConn();
  const port = process.env.NODE_ENV === 'test' ? 0 : 4000;
  const app = await server.start({ port, cors });
  console.log(`Server is running on localhost:${port}`);
  return app;
};

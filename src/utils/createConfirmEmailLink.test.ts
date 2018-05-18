import * as Redis from 'ioredis';
import fetch from 'node-fetch';

import { createTypeormConn } from './createTypeormConn';
import { User } from '../entity/User';
import { createConfirmEmailLink } from './createConfirmEmailLink';
import { Connection } from 'typeorm';

let userId = '';
const redis = new Redis();
let connection: Connection;

beforeAll(async () => {
  connection = await createTypeormConn();
  const user = await User.create({
    email: 'bob2@bob.com',
    password: 'akjsdflkasjdf'
  }).save();
  userId = user.id;
});

// close connection at the end
afterAll(async () => {
  connection.close();
});

test('createConfirmEmailLink and clears key in redis', async () => {
  const url = await createConfirmEmailLink(
    process.env.TEST_HOST as string,
    userId,
    redis
  );

  const response = await fetch(url);
  const text = await response.text();
  expect(text).toEqual('ok');
  const user = await User.findOne(userId);
  expect((user as User).confirmed).toBeTruthy();
  // clear key in redis
  const chunks = url.split('/');
  const key = chunks[chunks.length - 1];
  const value = await redis.get(key);
  expect(value).toBeNull();
});

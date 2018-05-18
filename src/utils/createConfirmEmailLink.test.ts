import * as Redis from 'ioredis';
import fetch from 'node-fetch';

import { createTypeormConn } from './createTypeormConn';
import { User } from '../entity/User';
import { createConfirmEmailLink } from './createConfirmEmailLink';

let userId = '';
const redis = new Redis();

beforeAll(async () => {
  await createTypeormConn();
  const user = await User.create({
    email: 'bob2@bob.com',
    password: 'akjsdflkasjdf'
  }).save();
  userId = user.id;
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
});

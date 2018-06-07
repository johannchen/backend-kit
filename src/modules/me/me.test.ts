import * as faker from 'faker';
import { Connection } from 'typeorm';

import { User } from '../../entity/User';
import { TestClient } from '../../test-helpers/TestClient';
import { createTestConn } from '../../test-utils/createTestConn';

let userId: string;
let connection: Connection;
const email = faker.internet.email();
const password = faker.internet.password();

beforeAll(async () => {
  connection = await createTestConn();
  const user = await User.create({
    email,
    password,
    confirmed: true
  }).save();
  userId = user.id;
});

afterAll(async () => {
  connection.close();
});

describe('me', () => {
  it('return null when no cookie', async () => {
    const client = new TestClient(process.env.TEST_HOST as string);
    const response = await client.me();
    expect(response.data.me).toBeNull();
  });

  it('get current user', async () => {
    const client = new TestClient(process.env.TEST_HOST as string);
    await client.login(email, password);

    const response = await client.me();
    expect(response.data).toEqual({
      me: {
        id: userId,
        email
      }
    });
  });
});

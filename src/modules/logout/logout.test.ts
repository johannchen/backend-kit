import * as faker from 'faker';
import { Connection } from 'typeorm';

import { User } from '../../entity/User';
import { TestClient } from '../../test-helpers/TestClient';
import { createTestConn } from '../../test-utils/createTestConn';

let conn: Connection;
const email = faker.internet.email();
const password = faker.internet.password();

let userId: string;
beforeAll(async () => {
  conn = await createTestConn();
  const user = await User.create({
    email,
    password,
    confirmed: true
  }).save();
  userId = user.id;
});

afterAll(async () => {
  conn.close();
});

describe('logout', () => {
  it('log out multiple sessions', async () => {
    const device1 = new TestClient(process.env.TEST_HOST as string);
    await device1.login(email, password);
    const device2 = new TestClient(process.env.TEST_HOST as string);
    await device2.login(email, password);
    expect(await device1.me()).toEqual(await device2.me());
    await device1.logout();
    expect(await device1.me()).toEqual(await device2.me());
  });

  it('log out single session', async () => {
    const client = new TestClient(process.env.TEST_HOST as string);
    await client.login(email, password);
    const response = await client.me();
    expect(response.data).toEqual({
      me: {
        id: userId,
        email
      }
    });

    await client.logout();
    const response2 = await client.me();
    expect(response2.data.me).toBeNull();
  });
});

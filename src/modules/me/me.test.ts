import { Connection } from 'typeorm';
import { createTypeormConn } from '../../utils/createTypeormConn';
import { User } from '../../entity/User';
import { TestClient } from '../../test-helpers/TestClient';

let userId: string;
let connection: Connection;
const email = 'bob3@bob.com';
const password = 'kasdfjls';

beforeAll(async () => {
  connection = await createTypeormConn();
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

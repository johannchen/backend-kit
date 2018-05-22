import { createTypeormConn } from '../../utils/createTypeormConn';
import { Connection } from 'typeorm';

import { invalidLogin, confirmEmailError } from './errorMessages';
import { User } from '../../entity/User';
import { TestClient } from '../../test-helpers/TestClient';

let connection: Connection;

const email = 'bob@bob.com';
const password = 'skjdfldskjf';

beforeAll(async () => {
  connection = await createTypeormConn();
});

afterAll(async () => {
  connection.close();
});

const loginExpectError = async (
  client: TestClient,
  e: string,
  p: string,
  errMsg: string
) => {
  const response = await client.login(e, p);
  expect(response.data).toEqual({
    login: [{ path: 'login', message: errMsg }]
  });
};

describe('login', () => {
  it('send back error when email not found', async () => {
    const client = new TestClient(process.env.TEST_HOST as string);
    await loginExpectError(client, email, password, invalidLogin);
  });

  it('login with confirmed email', async () => {
    const client = new TestClient(process.env.TEST_HOST as string);
    await client.register(email, password);
    await loginExpectError(client, email, password, confirmEmailError);
    await User.update({ email }, { confirmed: true });
    await loginExpectError(client, email, 'aslkdfjaksdljf', invalidLogin);
    const response = await client.login(email, password);
    expect(response.data).toEqual({ login: null });
  });

  // @todo lock account when user try to login more than 10 times (rate limit)
});

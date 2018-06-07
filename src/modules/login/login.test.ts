import { Connection } from 'typeorm';
import * as faker from 'faker';

import { invalidLogin, confirmEmailError } from './errorMessages';
import { User } from '../../entity/User';
import { TestClient } from '../../test-helpers/TestClient';
import { createTestConn } from '../../test-utils/createTestConn';

let connection: Connection;

const email = faker.internet.email();
const password = faker.internet.password();
const client = new TestClient(process.env.TEST_HOST as string);

beforeAll(async () => {
  connection = await createTestConn();
});

afterAll(async () => {
  connection.close();
});

const loginExpectError = async (e: string, p: string, errMsg: string) => {
  const response = await client.login(e, p);
  expect(response.data).toEqual({
    login: [{ path: 'login', message: errMsg }]
  });
};

describe('login', () => {
  it('send back error when email not found', async () => {
    await loginExpectError(
      faker.internet.email(),
      faker.internet.password(),
      invalidLogin
    );
  });

  it('login with confirmed email', async () => {
    await client.register(email, password);
    await loginExpectError(email, password, confirmEmailError);
    await User.update({ email }, { confirmed: true });
    await loginExpectError(email, faker.internet.password(), invalidLogin);
    const response = await client.login(email, password);
    expect(response.data).toEqual({ login: null });
  });

  // @todo lock account when user try to login more than 10 times (rate limit)
});

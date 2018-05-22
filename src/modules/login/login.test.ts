import { createTypeormConn } from '../../utils/createTypeormConn';
import { request } from 'graphql-request';
import { Connection } from 'typeorm';

import { invalidLogin, confirmEmailError } from './errorMessages';
import { User } from '../../entity/User';
import { loginMutation } from '../../test-helpers/mutations';

let connection: Connection;

const email = 'bob@bob.com';
const password = 'skjdfldskjf';

const registerMutation = (e: string, p: string) => `
mutation {
  register(email: "${e}", password: "${p}") {
    path
    message
  }
}
`;

beforeAll(async () => {
  connection = await createTypeormConn();
});

afterAll(async () => {
  connection.close();
});

const loginExpectError = async (e: string, p: string, errMsg: string) => {
  const response = await request(
    process.env.TEST_HOST as string,
    loginMutation(e, p)
  );

  expect(response).toEqual({
    login: [{ path: 'login', message: errMsg }]
  });
};

describe('login', () => {
  it('send back error when email not found', async () => {
    await loginExpectError(email, password, invalidLogin);
  });
  it('login with confirmed email', async () => {
    await request(
      process.env.TEST_HOST as string,
      registerMutation(email, password)
    );

    await loginExpectError(email, password, confirmEmailError);

    await User.update({ email }, { confirmed: true });

    await loginExpectError(email, 'aslkdfjaksdljf', invalidLogin);

    const response = await request(
      process.env.TEST_HOST as string,
      loginMutation(email, password)
    );

    expect(response).toEqual({ login: null });
  });
});

import { createTypeormConn } from '../../utils/createTypeormConn';
import { request } from 'graphql-request';
import { Connection } from 'typeorm';

import { invalidLogin } from './errorMessages';

let connection: Connection;

const email = 'bob@bob.com';
const password = 'skjdfldskjf';

const loginMutation = (e: string, p: string) => `
mutation {
  login(email: "${e}", password: "${p}") {
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
});

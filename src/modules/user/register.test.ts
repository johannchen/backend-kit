import { request } from 'graphql-request';
import { startServer } from '../../startServer';
import { User } from '../../entity/User';

let host = '';
beforeAll(async () => {
  const app = await startServer();
  const { port } = app.address();
  host = `http://127.0.0.1:${port}`;
});

const email = 'bob@bob.com';
const password = 'bob@bob.com';

const mutation = `
mutation {
  register(email: "${email}", password: "${password}") {
    path
    message
  }
}
`;

test('Register unique user', async () => {
  const response = await request(host, mutation);
  expect(response).toEqual({ register: null });
  const users = await User.find({ where: { email } });
  expect(users).toHaveLength(1);
  const user = users[0];
  expect(user.email).toEqual(email);
  expect(user.password).not.toEqual(password);
  const response2: any = await request(host, mutation);
  expect(response2.register).toHaveLength(1);
  expect(response2.register[0].path).toEqual('email');
});

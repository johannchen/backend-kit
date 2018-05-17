import { request } from 'graphql-request';

// import { host } from './constants';
import { User } from '../entity/User';
import { startServer } from '../startServer';

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
  register(email: "${email}", password: "${password}")
}
`;

test('Register user', async () => {
  const response = await request(host, mutation);
  expect(response).toEqual({ register: true });
  const users = await User.find({ where: { email } });
  expect(users).toHaveLength(1);
  const user = users[0];
  expect(user.email).toEqual(email);
  expect(user.password).not.toEqual(password);
});

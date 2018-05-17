import { request } from 'graphql-request';
import { startServer } from '../../startServer';
import { User } from '../../entity/User';
import {
  duplicateEmail,
  emailNotLongEnough,
  invalidEmail,
  passwordNotLongEnough
} from './errorMessages';

let host = '';
beforeAll(async () => {
  const app = await startServer();
  const { port }: any = app.address();
  host = `http://127.0.0.1:${port}`;
});

const email = 'bob@bob.com';
const password = 'bob@bob.com';

const mutation = (e: string, p: string) => `
mutation {
  register(email: "${e}", password: "${p}") {
    path
    message
  }
}
`;

describe('register mutation', async () => {
  it('should register a valid user', async () => {
    const response = await request(host, mutation(email, password));
    expect(response).toEqual({ register: null });
    const users = await User.find({ where: { email } });
    expect(users).toHaveLength(1);
    const user = users[0];
    expect(user.email).toEqual(email);
    expect(user.password).not.toEqual(password);
  });

  it('should not register a duplicate user', async () => {
    const response: any = await request(host, mutation(email, password));
    expect(response.register).toHaveLength(1);
    expect(response.register[0]).toEqual({
      path: 'email',
      message: duplicateEmail
    });
  });

  it('should not register a user with an invalid email', async () => {
    const response: any = await request(host, mutation('a', password));
    expect(response.register).toHaveLength(2);

    expect(response.register).toEqual([
      {
        message: emailNotLongEnough,
        path: 'email'
      },
      {
        message: invalidEmail,
        path: 'email'
      }
    ]);
  });

  it('should not register a user with an invalid password', async () => {
    const response: any = await request(host, mutation(email, 'a'));
    expect(response.register).toHaveLength(1);

    expect(response.register).toEqual([
      {
        message: passwordNotLongEnough,
        path: 'password'
      }
    ]);
  });

  it('should not register a user with an invalid password and invalid email', async () => {
    const response: any = await request(host, mutation('a', 'a'));
    expect(response.register).toHaveLength(3);

    expect(response.register).toEqual([
      {
        message: emailNotLongEnough,
        path: 'email'
      },
      {
        message: invalidEmail,
        path: 'email'
      },
      {
        message: passwordNotLongEnough,
        path: 'password'
      }
    ]);
  });
});

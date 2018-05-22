import { User } from '../../entity/User';
import {
  duplicateEmail,
  emailNotLongEnough,
  invalidEmail,
  passwordNotLongEnough
} from './errorMessages';
import { createTypeormConn } from '../../utils/createTypeormConn';
import { Connection } from 'typeorm';
import { TestClient } from '../../test-helpers/TestClient';

let connection: Connection;

const email = 'bob@bob.com';
const password = 'bob@bob.com';

beforeAll(async () => {
  connection = await createTypeormConn();
});

afterAll(async () => {
  connection.close();
});

describe('register mutation', async () => {
  it('should register a valid user', async () => {
    const client = new TestClient(process.env.TEST_HOST as string);
    const response = await client.register(email, password);

    expect(response.data).toEqual({ register: null });
    const users = await User.find({ where: { email } });
    expect(users).toHaveLength(1);
    const user = users[0];
    expect(user.email).toEqual(email);
    expect(user.password).not.toEqual(password);
  });

  it('should not register a duplicate user', async () => {
    const client = new TestClient(process.env.TEST_HOST as string);
    const response = await client.register(email, password);
    expect(response.data.register).toHaveLength(1);
    expect(response.data.register[0]).toEqual({
      path: 'email',
      message: duplicateEmail
    });
  });

  it('should not register a user with an invalid email', async () => {
    const client = new TestClient(process.env.TEST_HOST as string);
    const response = await client.register('a', password);
    expect(response.data.register).toHaveLength(2);

    expect(response.data.register).toEqual([
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
    const client = new TestClient(process.env.TEST_HOST as string);
    const response = await client.register(email, 'a');
    expect(response.data.register).toHaveLength(1);

    expect(response.data.register).toEqual([
      {
        message: passwordNotLongEnough,
        path: 'password'
      }
    ]);
  });

  it('should not register a user with an invalid password and invalid email', async () => {
    const client = new TestClient(process.env.TEST_HOST as string);
    const response = await client.register('a', 'a');
    expect(response.data.register).toHaveLength(3);

    expect(response.data.register).toEqual([
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

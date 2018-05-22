import * as Redis from 'ioredis';

import { createTypeormConn } from '../../utils/createTypeormConn';
import { User } from '../../entity/User';
import { Connection } from 'typeorm';
import { TestClient } from '../../test-helpers/TestClient';
import { createForgotPasswordLink } from '../../utils/createForgotPasswordLink';
import { passwordNotLongEnough } from '../register/errorMessages';
import { expiredKeyError } from './errorMessages';

let conn: Connection;
const redis = new Redis();
const email = 'bob5@bob.com';
const password = 'jlkajoioiqwe';
const newPassword = 'newpass';

let userId: string;
beforeAll(async () => {
  conn = await createTypeormConn();
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

describe('forgot password', () => {
  it('create forgot password link and change password', async () => {
    const client = new TestClient(process.env.TEST_HOST as string);
    const url = await createForgotPasswordLink('', userId, redis);
    const parts = url.split('/');
    const key = parts[parts.length - 1];

    // try changing to a password that's too short
    expect(await client.forgotPasswordChange('a', key)).toEqual({
      data: {
        forgotPasswordChange: [
          {
            path: 'newPassword',
            message: passwordNotLongEnough
          }
        ]
      }
    });

    const response = await client.forgotPasswordChange(newPassword, key);
    expect(response.data).toEqual({
      forgotPasswordChange: null
    });

    // make sure redis key expires after password change
    expect(await client.forgotPasswordChange('alksdjfalksdjfl', key)).toEqual({
      data: {
        forgotPasswordChange: [
          {
            path: 'key',
            message: expiredKeyError
          }
        ]
      }
    });

    expect(await client.login(email, newPassword)).toEqual({
      data: {
        login: null
      }
    });
  });
});

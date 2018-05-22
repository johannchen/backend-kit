import { Connection } from 'typeorm';
import axios from 'axios';
import { createTypeormConn } from '../../utils/createTypeormConn';
import { User } from '../../entity/User';
import { loginMutation } from '../../test-helpers/mutations';

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

const meQuery = `{ 
  me {
    id
    email
  }
}`;

describe('me', () => {
  it('return null when no cookie', async () => {
    const response = await axios.post(
      process.env.TEST_HOST as string,
      {
        query: meQuery
      },
      { withCredentials: false }
    );
    expect(response.data.data.me).toBeNull();
  });
  it('get current user', async () => {
    await axios.post(
      process.env.TEST_HOST as string,
      {
        query: loginMutation(email, password)
      },
      { withCredentials: true }
    );

    const response = await axios.post(
      process.env.TEST_HOST as string,
      { query: meQuery },
      { withCredentials: true }
    );

    expect(response.data.data).toEqual({
      me: {
        id: userId,
        email
      }
    });
  });
});

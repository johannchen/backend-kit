import * as bcrypt from 'bcryptjs';

import { ResolverMap } from '../../types/graphql-utils';
import { invalidLogin, confirmEmailError } from './errorMessages';
import { User } from '../../entity/User';
import { userSessionIdPrefix } from '../../constants';

const errorResponse = [{ path: 'login', message: invalidLogin }];

export const resolvers: ResolverMap = {
  Query: {
    hello1: () => 'hello'
  },
  Mutation: {
    login: async (
      _,
      { email, password }: GQL.ILoginOnMutationArguments,
      { session, redis, request }
    ) => {
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return errorResponse;
      }

      if (!user.confirmed) {
        return [{ path: 'login', message: confirmEmailError }];
      }
      const valid = await bcrypt.compare(password, user.password);

      if (!valid) {
        return errorResponse;
      }

      // login successful, store sessionID at redis
      session.userId = user.id;
      if (request.sessionID) {
        await redis.lpush(
          `${userSessionIdPrefix}${user.id}`,
          request.sessionID
        );
      }
      return null;
    }
  }
};

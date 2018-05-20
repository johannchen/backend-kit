import * as bcrypt from 'bcryptjs';

import { ResolverMap } from '../../types/graphql-utils';
import { invalidLogin } from './errorMessages';
import { User } from '../../entity/User';

const errorResponse = [{ path: 'login', message: invalidLogin }];

export const resolvers: ResolverMap = {
  Query: {
    hello1: () => 'hello'
  },
  Mutation: {
    login: async (_, { email, password }: GQL.ILoginOnMutationArguments) => {
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return errorResponse;
      }

      const valid = await bcrypt.compare(password, user.password);

      if (!valid) {
        return errorResponse;
      }
      return null;
    }
  }
};

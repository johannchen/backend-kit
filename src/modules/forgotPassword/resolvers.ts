import * as bcrypt from 'bcryptjs';
import * as yup from 'yup';

import { ResolverMap } from '../../types/graphql-utils';
import { User } from '../../entity/User';
import { userNotFoundError, expiredKeyError } from './errorMessages';
import { createForgotPasswordLink } from '../../utils/createForgotPasswordLink';
import { forgotPasswordPrefix } from '../../constants';
import { passwordValidation } from '../../yupSchemas';
import { formatYupError } from '../../utils/formatYupError';

const schema = yup.object().shape({
  newPassword: passwordValidation
});
export const resolvers: ResolverMap = {
  Query: {
    dummy: () => 'dummy'
  },
  Mutation: {
    sendForgotPasswordEmail: async (_, { email }, { redis }) => {
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return [{ path: 'email', message: userNotFoundError }];
      }
      // @todo add frontend url
      await createForgotPasswordLink('', user.id, redis);
      // @todo sen email
      return null;
    },
    forgotPasswordChange: async (_, { newPassword, key }, { redis }) => {
      const redisKey = `${forgotPasswordPrefix}${key}`;
      const userId = await redis.get(redisKey);
      if (!userId) {
        return [{ path: 'key', message: expiredKeyError }];
      }

      try {
        await schema.validate({ newPassword }, { abortEarly: false });
      } catch (err) {
        return formatYupError(err);
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      const updatePromise = User.update(
        { id: userId },
        {
          password: hashedPassword
        }
      );

      const deleteKeyPromise = redis.del(redisKey);

      await Promise.all([updatePromise, deleteKeyPromise]);

      return null;
    }
  }
};

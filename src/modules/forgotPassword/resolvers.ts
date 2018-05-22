import * as bcrypt from 'bcryptjs';
import * as yup from 'yup';

import { ResolverMap } from '../../types/graphql-utils';
import { User } from '../../entity/User';
import { userNotFoundError, expiredKeyError } from './errorMessages';
import { createForgotPasswordLink } from '../../utils/createForgotPasswordLink';
import { forgotPasswordPrefix } from '../../constants';
import { passwordValidation } from '../../yupSchemas';
import { formatYupError } from '../../utils/formatYupError';
import { sendEmail } from '../../utils/sendEmail';

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
      // @todo set front end url
      if (process.env.NODE_ENV !== 'test') {
        sendEmail(
          email,
          await createForgotPasswordLink('', user.id, redis),
          'reset password'
        );
      }
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

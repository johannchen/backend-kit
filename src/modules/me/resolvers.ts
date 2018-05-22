import { ResolverMap } from '../../types/graphql-utils';
import { createMiddleware } from '../../utils/createMiddleware';
import middleware from './middleware';
import { User } from '../../entity/User';

export const resolvers: ResolverMap = {
  Query: {
    me: createMiddleware(middleware, (_, __, { session }) => {
      // console.log(session.userId);
      return User.findOne({ where: { id: session.userId } });
    })
  }
};

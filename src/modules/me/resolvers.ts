import { ResolverMap } from '../../types/graphql-utils';
import { createMiddleware } from '../../utils/createMiddleware';
import middleware from './middleware';
import { User } from '../../entity/User';

export const resolvers: ResolverMap = {
  Query: {
    me: createMiddleware(middleware, (_, __, { session }) => {
      return User.findOne(session.userId);
    })
  }
};

import { ResolverMap } from '../../types/graphql-utils';

export const resolvers: ResolverMap = {
  Query: {
    dummy: () => 'dummy'
  },
  Mutation: {
    logout: () => false
  }
};

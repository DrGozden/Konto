import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

const httpLink = createHttpLink({
  uri: 'http://localhost:8080/query',
});

const authLink = setContext((_operation, _prevContext) => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

export const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

export function clearApolloCache() {
  return client.clearStore();
}

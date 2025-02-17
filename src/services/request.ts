import axios from 'axios';

const parseBody = <T>(body: string): T => {
  const dateParser = (_key: string, value: unknown) => {
    const iso =
      /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*))(?:Z|(\+|-)([\d|:]*))?$/;
    if (typeof value === 'string') {
      if (iso.exec(value)) {
        return new Date(value);
      }
      return value;
    }
    return value;
  };

  return JSON.parse(body, dateParser);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function graphQLRequest<O>(query: any, variables = {}) {
  const queryString = typeof query === 'string' ? query : query.value;

  const response = await axios.post<{ data: O; errors: Error[] }>(
    '',
    {
      query: queryString,
      variables,
    },
    {
      transformResponse: [(d) => parseBody<O>(d)],
    },
  );

  if (response.data.errors) {
    throw new Error(
      response.data.errors[0]?.message || 'Error fetching GraphQL data',
    );
  }

  return response.data.data;
}

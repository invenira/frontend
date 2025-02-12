import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { IapService } from '@/services';
import { server } from '../../e2e/util/graphql-server.ts';
import axios from 'axios';
import { baseUrl } from '../../e2e/util/graphql-mocks.ts';

describe('iapService', () => {
  const iapService = new IapService();

  beforeAll(() => {
    server.listen();
    axios.defaults.baseURL = baseUrl;
  });

  afterEach(() => server.resetHandlers());

  afterAll(() => {
    server.close();
  });

  it('getAll', async () => {
    const response = await iapService.getAll();

    expect(response).toBeDefined();
  });

  it('getOne', async () => {
    const response = await iapService.getOne('123');

    expect(response).toBeDefined();
  });
});

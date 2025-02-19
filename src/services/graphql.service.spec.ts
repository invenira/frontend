// GraphQLService.spec.ts
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import axios from 'axios';
import { GraphQLService } from '@/services';
import { server } from '../../e2e/util/graphql-server.ts';
import { baseUrl } from '../../e2e/util/graphql-mocks.ts';
import { graphql, HttpResponse } from 'msw';

const iapService = new GraphQLService();

beforeAll(() => {
  server.listen();
  axios.defaults.baseURL = baseUrl;
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});

describe('GraphQLService', () => {
  it('getAll returns a list of IAPs', async () => {
    const response = await iapService.getAll();
    expect(response).toBeDefined();
    expect(Array.isArray(response)).toBe(true);
    expect(response.length).toBeGreaterThan(0);
  });

  it('getOne returns an IAP for a given id', async () => {
    const response = await iapService.getOne('123');
    expect(response).toBeDefined();
    expect(response._id).toBe('123');
  });

  it('getAllActivityProviders returns a list of activity providers', async () => {
    const providers = await iapService.getAllActivityProviders();
    expect(providers).toBeDefined();
    expect(Array.isArray(providers)).toBe(true);
    expect(providers.length).toBeGreaterThan(0);
  });

  it('createIap creates a new IAP with given name and description', async () => {
    const newIap = await iapService.createIap('Test IAP', 'Test Description');
    expect(newIap).toBeDefined();
    expect(newIap.name).toBe('Test IAP');
    expect(newIap.description).toBe('Test Description');
    expect(newIap._id).toBeDefined();
  });

  it('createActivityProvider creates a new activity provider', async () => {
    const providerInput = {
      name: 'New Provider',
      description: 'New Provider Desc',
      url: 'http://newprovider.com',
    };
    const newProvider = await iapService.createActivityProvider(
      'iap-123',
      providerInput,
    );
    expect(newProvider).toBeDefined();
    expect(newProvider.name).toBe(providerInput.name);
    expect(newProvider._id).toBeDefined();
  });

  it('createActivity creates a new activity', async () => {
    const activityInput = {
      name: 'New Activity',
      description: 'Activity Desc',
      parameters: { key: 'value' },
    };
    const newActivity = await iapService.createActivity(
      'provider-1',
      activityInput,
    );
    expect(newActivity).toBeDefined();
    expect(newActivity.name).toBe(activityInput.name);
    expect(newActivity.parameters).toEqual(activityInput.parameters);
    expect(newActivity._id).toBeDefined();
  });

  it('createGoal creates a new goal', async () => {
    const goalInput = {
      name: 'Goal Name',
      description: 'Goal Desc',
      formula: 'SUM(A)',
      targetValue: 100,
    };
    const newGoal = await iapService.createGoal('iap-123', goalInput);
    expect(newGoal).toBeDefined();
    expect(newGoal.name).toBe(goalInput.name);
    expect(newGoal.formula).toBe(goalInput.formula);
    expect(newGoal.targetValue).toBe(goalInput.targetValue);
    expect(newGoal._id).toBeDefined();
  });

  it('getAll throws an error when the server returns an error', async () => {
    server.use(
      graphql.link(baseUrl).query('getIAPs', () =>
        HttpResponse.json({
          errors: [{ message: 'Error fetching IAPs' }],
        }),
      ),
    );
    await expect(iapService.getAll()).rejects.toThrow(/Error fetching IAPs/);
  });

  it('getOne throws an error when the server returns an error', async () => {
    server.use(
      graphql.link(baseUrl).query('getIAP', () =>
        HttpResponse.json({
          errors: [{ message: 'IAP not found' }],
        }),
      ),
    );
    await expect(iapService.getOne('non-existent')).rejects.toThrow(
      /IAP not found/,
    );
  });

  it('createIap throws an error when creation fails', async () => {
    server.use(
      graphql.link(baseUrl).mutation('createIap', () =>
        HttpResponse.json({
          errors: [{ message: 'Failed to create IAP' }],
        }),
      ),
    );
    await expect(iapService.createIap('Name', 'Desc')).rejects.toThrow(
      /Failed to create IAP/,
    );
  });

  it('createActivityProvider throws an error when creation fails', async () => {
    server.use(
      graphql.link(baseUrl).mutation('createActivityProvider', () =>
        HttpResponse.json({
          errors: [{ message: 'Failed to create provider' }],
        }),
      ),
    );
    await expect(
      iapService.createActivityProvider('iap-123', {
        name: 'Provider',
        description: 'Desc',
        url: 'http://url.com',
      }),
    ).rejects.toThrow(/Failed to create provider/);
  });

  it('createActivity throws an error when creation fails', async () => {
    server.use(
      graphql.link(baseUrl).mutation('createActivity', () =>
        HttpResponse.json({
          errors: [{ message: 'Failed to create activity' }],
        }),
      ),
    );
    await expect(
      iapService.createActivity('provider-1', {
        name: 'Activity',
        description: 'Desc',
        parameters: {},
      }),
    ).rejects.toThrow(/Failed to create activity/);
  });

  it('createGoal throws an error when creation fails', async () => {
    server.use(
      graphql.link(baseUrl).mutation('createGoal', () =>
        HttpResponse.json({
          errors: [{ message: 'Failed to create goal' }],
        }),
      ),
    );
    await expect(
      iapService.createGoal('iap-123', {
        name: 'Goal',
        description: 'Desc',
        formula: 'SUM(A)',
        targetValue: 100,
      }),
    ).rejects.toThrow(/Failed to create goal/);
  });
});

import { graphql, HttpResponse } from 'msw';

const fakeMongoId = (): string => Math.random().toString(36).substring(2, 10);
const now: string = new Date().toISOString();

export const baseUrl = 'http://localhost:3000/graphql';

export const handlers = [
  graphql.link(baseUrl).query('getActivities', () => {
    return HttpResponse.json({
      data: {
        getActivities: [
          {
            _id: fakeMongoId(),
            createdAt: now,
            createdBy: 'user1',
            description: 'Sample Activity Description',
            name: 'SampleActivity',
            parameters: { key: 'value' },
            updatedAt: now,
            updatedBy: 'user2',
          },
        ],
      },
    });
  }),

  graphql.link(baseUrl).query('getActivity', (req) => {
    const { activityId } = req.variables as { activityId: string };
    return HttpResponse.json({
      data: {
        getActivity: {
          _id: activityId,
          createdAt: now,
          createdBy: 'user1',
          description: 'Sample Activity Description',
          name: 'SampleActivity',
          parameters: { key: 'value' },
          updatedAt: now,
          updatedBy: 'user2',
        },
      },
    });
  }),

  graphql.link(baseUrl).query('getActivityProvider', (req) => {
    const { apId } = req.variables as { apId: string };
    return HttpResponse.json({
      data: {
        getActivityProvider: {
          _id: apId,
          activities: [
            {
              _id: fakeMongoId(),
              createdAt: now,
              createdBy: 'user1',
              description: 'Sample Activity Description',
              name: 'SampleActivity',
              parameters: { key: 'value' },
              updatedAt: now,
              updatedBy: 'user2',
            },
          ],
          createdAt: now,
          createdBy: 'user1',
          description: 'Sample Activity Provider Description',
          name: 'SampleActivityProvider',
          updatedAt: now,
          updatedBy: 'user2',
          url: 'https://example.com/provider',
        },
      },
    });
  }),

  graphql.link(baseUrl).query('getActivityProviderActivities', () => {
    return HttpResponse.json({
      data: {
        getActivityProviderActivities: [
          {
            _id: fakeMongoId(),
            createdAt: now,
            createdBy: 'user1',
            description: 'Activity from Provider',
            name: 'ProviderActivity',
            parameters: { key: 'value' },
            updatedAt: now,
            updatedBy: 'user2',
          },
        ],
      },
    });
  }),

  graphql.link(baseUrl).query('getActivityProviders', () => {
    return HttpResponse.json({
      data: {
        getActivityProviders: [
          {
            _id: fakeMongoId(),
            activities: [
              {
                _id: fakeMongoId(),
                createdAt: now,
                createdBy: 'user1',
                description: 'Activity Description',
                name: 'ActivityName',
                parameters: { key: 'value' },
                updatedAt: now,
                updatedBy: 'user2',
              },
            ],
            createdAt: now,
            createdBy: 'user1',
            description: 'Activity Provider Description',
            name: 'ActivityProviderName',
            updatedAt: now,
            updatedBy: 'user2',
            url: 'https://example.com/provider',
          },
        ],
      },
    });
  }),

  graphql.link(baseUrl).query('getConfigurationInterfaceUrl', (req) => {
    const { apId } = req.variables as { apId: string };
    return HttpResponse.json({
      data: {
        getConfigurationInterfaceUrl: {
          url: `https://config.example.com/${apId}`,
        },
      },
    });
  }),

  graphql.link(baseUrl).query('getConfigurationParameters', () => {
    return HttpResponse.json({
      data: {
        getConfigurationParameters: ['param1', 'param2', 'param3'],
      },
    });
  }),

  graphql.link(baseUrl).query('getIAP', (req) => {
    const { iapId } = req.variables as { iapId: string };
    return HttpResponse.json({
      data: {
        getIAP: {
          _id: iapId,
          activityProviders: [
            {
              _id: fakeMongoId(),
              activities: [],
              createdAt: now,
              createdBy: 'user1',
              description: 'Activity Provider Description',
              name: 'ActivityProviderName',
              updatedAt: now,
              updatedBy: 'user2',
              url: 'https://example.com/provider',
            },
          ],
          createdAt: now,
          createdBy: 'user1',
          deployUrls: { deployKey: 'https://deploy.example.com' },
          description: 'IAP Description',
          goals: [
            {
              _id: fakeMongoId(),
              createdAt: now,
              createdBy: 'user1',
              description: 'Goal Description',
              formula: 'x + y',
              name: 'GoalName',
              targetValue: 100,
              updatedAt: now,
              updatedBy: 'user2',
            },
          ],
          isDeployed: false,
          name: 'IAPName',
          updatedAt: now,
          updatedBy: 'user2',
        },
      },
    });
  }),

  graphql.link(baseUrl).query('getIAPs', () => {
    return HttpResponse.json({
      data: {
        getIAPs: [
          {
            _id: fakeMongoId(),
            activityProviders: [
              {
                _id: fakeMongoId(),
                activities: [],
                createdAt: now,
                createdBy: 'user1',
                description: 'Activity Provider Description',
                name: 'ActivityProviderName',
                updatedAt: now,
                updatedBy: 'user2',
                url: 'https://example.com/provider',
              },
            ],
            createdAt: now,
            createdBy: 'user1',
            deployUrls: { deployKey: 'https://deploy.example.com' },
            description: 'IAP Description',
            goals: [
              {
                _id: fakeMongoId(),
                createdAt: now,
                createdBy: 'user1',
                description: 'Goal Description',
                formula: 'x + y',
                name: 'GoalName',
                targetValue: 100,
                updatedAt: now,
                updatedBy: 'user2',
              },
            ],
            isDeployed: false,
            name: 'IAPName',
            updatedAt: now,
            updatedBy: 'user2',
          },
        ],
      },
    });
  }),

  graphql.link(baseUrl).mutation('createActivity', (req) => {
    const { createActivityInput } = req.variables as {
      apId: string;
      createActivityInput: {
        description: string;
        name: string;
        parameters: Record<string, unknown>;
      };
    };
    return HttpResponse.json({
      data: {
        createActivity: {
          _id: fakeMongoId(),
          createdAt: now,
          createdBy: 'creator',
          description: createActivityInput.description,
          name: createActivityInput.name,
          parameters: createActivityInput.parameters,
          updatedAt: now,
          updatedBy: 'creator',
        },
      },
    });
  }),

  graphql.link(baseUrl).mutation('createActivityProvider', (req) => {
    const { createActivityProviderInput } = req.variables as {
      createActivityProviderInput: {
        description: string;
        name: string;
        url: string;
      };
      iapId: string;
    };
    return HttpResponse.json({
      data: {
        createActivityProvider: {
          _id: fakeMongoId(),
          activities: [],
          createdAt: now,
          createdBy: 'creator',
          description: createActivityProviderInput.description,
          name: createActivityProviderInput.name,
          updatedAt: now,
          updatedBy: 'creator',
          url: createActivityProviderInput.url,
        },
      },
    });
  }),

  graphql.link(baseUrl).mutation('createGoal', (req) => {
    const { createGoalInput } = req.variables as {
      createGoalInput: {
        description: string;
        formula: string;
        name: string;
        targetValue: number;
      };
      iapId: string;
    };
    return HttpResponse.json({
      data: {
        createGoal: {
          _id: fakeMongoId(),
          createdAt: now,
          createdBy: 'creator',
          description: createGoalInput.description,
          formula: createGoalInput.formula,
          name: createGoalInput.name,
          targetValue: createGoalInput.targetValue,
          updatedAt: now,
          updatedBy: 'creator',
        },
      },
    });
  }),

  graphql.link(baseUrl).mutation('createIap', (req) => {
    const { createIapInput } = req.variables as {
      createIapInput: {
        description: string;
        name: string;
      };
    };
    return HttpResponse.json({
      data: {
        createIap: {
          _id: fakeMongoId(),
          activityProviders: [],
          createdAt: now,
          createdBy: 'creator',
          deployUrls: {},
          description: createIapInput.description,
          goals: [],
          isDeployed: false,
          name: createIapInput.name,
          updatedAt: now,
          updatedBy: 'creator',
        },
      },
    });
  }),

  graphql.link(baseUrl).mutation('deployIap', () => {
    return HttpResponse.json({
      data: {
        deployIap: null,
      },
    });
  }),

  graphql.link(baseUrl).mutation('removeActivity', () => {
    return HttpResponse.json({
      data: {
        removeActivity: null,
      },
    });
  }),

  graphql.link(baseUrl).mutation('removeActivityProvider', () => {
    return HttpResponse.json({
      data: {
        removeActivityProvider: null,
      },
    });
  }),

  graphql.link(baseUrl).mutation('removeGoal', () => {
    return HttpResponse.json({
      data: {
        removeGoal: null,
      },
    });
  }),

  // Mutation: removeIap
  graphql.link(baseUrl).mutation('removeIap', () => {
    return HttpResponse.json({
      data: {
        removeIap: null,
      },
    });
  }),
];

import { graphql } from '@/graphql';
import {
  ActivityGqlSchema,
  ActivityProviderGqlSchema,
  CreateActivityInput,
  CreateActivityProviderInput,
  CreateGoalInput,
  GoalGqlSchema,
  IapgqlSchema,
} from '@/graphql/graphql.ts';
import { graphQLRequest } from './request.ts';

const getIAPsQuery = graphql(`
  query getIAPs {
    getIAPs {
      _id
      name
      description
      activityProviders {
        _id
        name
        description
        url
        activities {
          _id
          name
        }
      }
      isDeployed
      goals {
        _id
        name
      }
      createdAt
      createdBy
      updatedAt
      updatedBy
    }
  }
`);

const getIAPQuery = graphql(`
  query getIAP($iapId: MongoIdScalar!) {
    getIAP(iapId: $iapId) {
      _id
      name
      description
      activityProviders {
        _id
        name
        description
        url
        activities {
          _id
          name
          description
          createdAt
          createdBy
          updatedAt
          updatedBy
        }
        createdAt
        createdBy
        updatedAt
        updatedBy
      }
      isDeployed
      goals {
        _id
        name
        description
        formula
        targetValue
        createdAt
        createdBy
        updatedAt
        updatedBy
      }
      createdAt
      createdBy
      updatedAt
      updatedBy
    }
  }
`);

const getActivityProvidersQuery = graphql(`
  query getActivityProviders {
    getActivityProviders {
      _id
      name
      description
      url
      createdAt
      createdBy
      updatedAt
      updatedBy
    }
  }
`);

const createIAPMutation = graphql(`
  mutation createIap($createIapInput: CreateIAPInput!) {
    createIap(createIapInput: $createIapInput) {
      _id
      name
      description
      isDeployed
      createdAt
      createdBy
      updatedAt
      updatedBy
    }
  }
`);

const deployIAPMutation = graphql(`
  mutation deployIap($iapId: MongoIdScalar!) {
    deployIap(iapId: $iapId)
  }
`);

const createActivityProviderMutation = graphql(`
  mutation createActivityProvider(
    $createActivityProviderInput: CreateActivityProviderInput!
  ) {
    createActivityProvider(
      createActivityProviderInput: $createActivityProviderInput
    ) {
      _id
      activities {
        updatedAt
        parameters
        name
      }
      createdAt
      createdBy
      description
      name
      updatedAt
      updatedBy
      url
    }
  }
`);

const createActivityMutation = graphql(`
  mutation createActivity(
    $iapId: MongoIdScalar!
    $createActivityInput: CreateActivityInput!
  ) {
    createActivity(iapId: $iapId, createActivityInput: $createActivityInput) {
      _id
      createdAt
      createdBy
      description
      name
      parameters
      updatedAt
      updatedBy
    }
  }
`);

const createGoalMutation = graphql(`
  mutation createGoal(
    $iapId: MongoIdScalar!
    $createGoalInput: CreateGoalInput!
  ) {
    createGoal(iapId: $iapId, createGoalInput: $createGoalInput) {
      _id
      createdAt
      createdBy
      description
      formula
      name
      targetValue
      updatedAt
      updatedBy
    }
  }
`);

const getConfigurationInterfaceUrlQuery = graphql(`
  query getConfigurationInterfaceUrl($apId: MongoIdScalar!) {
    getConfigurationInterfaceUrl(apId: $apId) {
      url
    }
  }
`);

const getActivityProviderRequiredFieldsQuery = graphql(`
  query getActivityProviderRequiredFields($apId: MongoIdScalar!) {
    getActivityProviderRequiredFields(apId: $apId)
  }
`);

export class GraphQLService {
  async getAll(): Promise<Partial<IapgqlSchema>[]> {
    return graphQLRequest<{ getIAPs: Partial<IapgqlSchema>[] }>(
      getIAPsQuery,
    ).then((d) => d.getIAPs);
  }

  async getOne(iapId: string): Promise<Partial<IapgqlSchema>> {
    return graphQLRequest<{ getIAP: Partial<IapgqlSchema> }>(getIAPQuery, {
      iapId,
    }).then((d) => d.getIAP);
  }

  async getAllActivityProviders(): Promise<
    Partial<ActivityProviderGqlSchema>[]
  > {
    return graphQLRequest<{
      getActivityProviders: Partial<ActivityProviderGqlSchema>[];
    }>(getActivityProvidersQuery).then((d) => d.getActivityProviders);
  }

  async createIap(
    name: string,
    description: string,
  ): Promise<Partial<IapgqlSchema>> {
    return graphQLRequest<{ createIap: Partial<IapgqlSchema> }>(
      createIAPMutation,
      {
        createIapInput: {
          name,
          description,
        },
      },
    ).then((d) => {
      return d.createIap;
    });
  }

  async deployIap(iapId: string): Promise<void> {
    await graphQLRequest(deployIAPMutation, {
      iapId,
    });
  }

  async createActivityProvider(
    createActivityProviderInput: CreateActivityProviderInput,
  ): Promise<Partial<ActivityProviderGqlSchema>> {
    return graphQLRequest<{
      createActivityProvider: Partial<ActivityProviderGqlSchema>;
    }>(createActivityProviderMutation, {
      createActivityProviderInput,
    }).then((d) => d.createActivityProvider);
  }

  async createActivity(
    iapId: string,
    createActivityInput: CreateActivityInput,
  ): Promise<Partial<ActivityGqlSchema>> {
    return graphQLRequest<{ createActivity: Partial<ActivityGqlSchema> }>(
      createActivityMutation,
      {
        iapId,
        createActivityInput,
      },
    ).then((d) => d.createActivity);
  }

  async createGoal(
    iapId: string,
    createGoalInput: CreateGoalInput,
  ): Promise<Partial<GoalGqlSchema>> {
    return graphQLRequest<{ createGoal: Partial<GoalGqlSchema> }>(
      createGoalMutation,
      {
        iapId,
        createGoalInput,
      },
    ).then((d) => d.createGoal);
  }

  async getConfigurationInterfaceUrl(apId: string): Promise<string> {
    return graphQLRequest<{
      getConfigurationInterfaceUrl: { url: string };
    }>(getConfigurationInterfaceUrlQuery, {
      apId,
    }).then((d) => d.getConfigurationInterfaceUrl.url);
  }

  async getActivityProviderRequiredFields(apId: string): Promise<string[]> {
    return graphQLRequest<{
      getActivityProviderRequiredFields: string[];
    }>(getActivityProviderRequiredFieldsQuery, {
      apId,
    }).then((d) => d.getActivityProviderRequiredFields);
  }
}

export const graphQLService = new GraphQLService();

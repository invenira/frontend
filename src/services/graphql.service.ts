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
      #deployUrls
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
      isDeployed
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

const createActivityProviderMutation = graphql(`
  mutation createActivityProvider(
    $iapId: MongoIdScalar!
    $createActivityProviderInput: CreateActivityProviderInput!
  ) {
    createActivityProvider(
      iapId: $iapId
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
    $apId: MongoIdScalar!
    $createActivityInput: CreateActivityInput!
  ) {
    createActivity(apId: $apId, createActivityInput: $createActivityInput) {
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

  async createActivityProvider(
    iapId: string,
    createActivityProviderInput: CreateActivityProviderInput,
  ): Promise<Partial<ActivityProviderGqlSchema>> {
    return graphQLRequest<{
      createActivityProvider: Partial<ActivityProviderGqlSchema>;
    }>(createActivityProviderMutation, {
      iapId,
      createActivityProviderInput,
    }).then((d) => d.createActivityProvider);
  }

  async createActivity(
    apId: string,
    createActivityInput: CreateActivityInput,
  ): Promise<Partial<ActivityGqlSchema>> {
    return graphQLRequest<{ createActivity: Partial<ActivityGqlSchema> }>(
      createActivityMutation,
      {
        apId,
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
}

export const graphQLService = new GraphQLService();

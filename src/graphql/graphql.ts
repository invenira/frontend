/* eslint-disable */
import { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  Date: { input: any; output: any; }
  MetricType: { input: any; output: any; }
  MongoIdScalar: { input: any; output: any; }
  Record: { input: any; output: any; }
  Void: { input: any; output: any; }
};

/** An Activity provided by an Activity Provider. */
export type ActivityGqlSchema = {
  __typename?: 'ActivityGQLSchema';
  /** The internal unique Activity ID. */
  _id: Scalars['MongoIdScalar']['output'];
  /** The timestamp when the Activity was created. */
  createdAt: Scalars['Date']['output'];
  /** The system user which created the Activity. */
  createdBy: Scalars['String']['output'];
  /** The Activity Description. */
  description: Scalars['String']['output'];
  /** The unique Activity Name. */
  name: Scalars['String']['output'];
  /** The Activity Configuration Parameters. */
  parameters: Scalars['Record']['output'];
  /** Then timestamp when the Activity was last modified. */
  updatedAt: Scalars['Date']['output'];
  /** The system user which last modified the Activity. */
  updatedBy: Scalars['String']['output'];
};

/** An Activity Provider. */
export type ActivityProviderGqlSchema = {
  __typename?: 'ActivityProviderGQLSchema';
  /** The internal unique Activity Provider ID. */
  _id: Scalars['MongoIdScalar']['output'];
  /** The list of activities provided by this Activity Provider */
  activities: Array<ActivityGqlSchema>;
  /** The timestamp when the Activity Provider was created. */
  createdAt: Scalars['Date']['output'];
  /** The system user which created the Activity Provider. */
  createdBy: Scalars['String']['output'];
  /** The Activity Provider Description. */
  description: Scalars['String']['output'];
  /** The unique Activity Provider Name. */
  name: Scalars['String']['output'];
  /** Then timestamp when the Activity Provider was last modified. */
  updatedAt: Scalars['Date']['output'];
  /** The system user which last modified the Activity Provider. */
  updatedBy: Scalars['String']['output'];
  /** The Activity Provider base URl. */
  url: Scalars['String']['output'];
};

/** The request payload to add an activity to an IAP. */
export type AddActivityToIapInput = {
  /** The Activity ID to add to the IAP */
  activityId: Scalars['String']['input'];
};

/** The Configuration Interface URL. */
export type ConfigInterfaceGqlSchema = {
  __typename?: 'ConfigInterfaceGQLSchema';
  /** The Configuration Interface URL. */
  url: Scalars['String']['output'];
};

/** The request payload to create a new Activity. */
export type CreateActivityInput = {
  /** The Activity Provider id that provides this Activity */
  activityProviderId: Scalars['MongoIdScalar']['input'];
  /** The Activity Description. */
  description: Scalars['String']['input'];
  /** The unique Activity Name. */
  name: Scalars['String']['input'];
  /** The Activity Configuration Parameters. */
  parameters: Scalars['Record']['input'];
};

/** The request payload to create a new Activity Provider. */
export type CreateActivityProviderInput = {
  /** The Activity Provider Description. */
  description: Scalars['String']['input'];
  /** The unique Activity Provider Name. */
  name: Scalars['String']['input'];
  /** The Activity Provider base URl. */
  url: Scalars['String']['input'];
};

/** The request payload to create a new Goal. */
export type CreateGoalInput = {
  /** The Goal Description. */
  description: Scalars['String']['input'];
  /** The Goal mathematical formula. */
  formula: Scalars['String']['input'];
  /** The unique Goal Name. */
  name: Scalars['String']['input'];
  /** The 100% completion target value. */
  targetValue: Scalars['Float']['input'];
};

/** The request payload to create a new IAP. */
export type CreateIapInput = {
  /** The IAP Description. */
  description: Scalars['String']['input'];
  /** The unique IAP Name. */
  name: Scalars['String']['input'];
};

/**
 * An Inventive Activity Plan Goal. A Goal is a value calculated based on a user provider mathematical formula.
 * Valid formulas are any formula accepted by mathjs.
 */
export type GoalGqlSchema = {
  __typename?: 'GoalGQLSchema';
  /** The internal unique Goal ID. */
  _id: Scalars['MongoIdScalar']['output'];
  /** The timestamp when the Goal was created. */
  createdAt: Scalars['Date']['output'];
  /** The system user which created the Goal. */
  createdBy: Scalars['String']['output'];
  /** The Goal Description. */
  description: Scalars['String']['output'];
  /** The Goal mathematical formula. */
  formula: Scalars['String']['output'];
  /** The unique Goal Name. */
  name: Scalars['String']['output'];
  /** The 100% completion target value. */
  targetValue: Scalars['Float']['output'];
  /** Then timestamp when the Goal was last modified. */
  updatedAt: Scalars['Date']['output'];
  /** The system user which last modified the Goal. */
  updatedBy: Scalars['String']['output'];
};

/**
 * An Inventive Activity Plan (IAP). An IAP is a group of Activities that the end-user can execute.
 * The IAP contains Goals that are calculated out of Metrics provided by the Activity Providers for each Activity.
 */
export type IapgqlSchema = {
  __typename?: 'IAPGQLSchema';
  /** The internal unique IAP ID. */
  _id: Scalars['MongoIdScalar']['output'];
  /** The list of Activity Providers used by the IAP */
  activityProviders: Array<ActivityProviderGqlSchema>;
  /** The timestamp when the IAP was created. */
  createdAt: Scalars['Date']['output'];
  /** The system user which created the IAP. */
  createdBy: Scalars['String']['output'];
  /** The deploy URL for each activity */
  deployUrls: Scalars['Record']['output'];
  /** The IAP Description. */
  description: Scalars['String']['output'];
  /** The list of Goal included in the IAP */
  goals: Array<GoalGqlSchema>;
  /**
   * Weather this IAP is deployed or not. Being deployed means that the system has engaged with all Activity Providers to
   * deploy the activities.
   */
  isDeployed: Scalars['Boolean']['output'];
  /** The unique IAP Name. */
  name: Scalars['String']['output'];
  /** Then timestamp when the IAP was last modified. */
  updatedAt: Scalars['Date']['output'];
  /** The system user which last modified the IAP. */
  updatedBy: Scalars['String']['output'];
};

/** A metric that an Activity Provider reports for a specific activity, per user. */
export type MetricGqlSchema = {
  __typename?: 'MetricGQLSchema';
  /** The Metric Description. */
  description: Scalars['String']['output'];
  /** The Metric Name. */
  name: Scalars['String']['output'];
  /** The Metric Type, should be a Zod type: ['string', 'number', 'boolean', 'bigint', 'date', 'arrayAny', 'arrayNumber', 'arrayString', 'objectAny', 'recordAny'] */
  type: Scalars['MetricType']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  /** Create a new Activity within an Inventive Activity Plan */
  createActivity: ActivityGqlSchema;
  /** Create a new Activity Provider within an Inventive Activity Plan */
  createActivityProvider: ActivityProviderGqlSchema;
  /** Create a Goal within an Inventive Activity Plan */
  createGoal: GoalGqlSchema;
  /** Create an Inventive Activity Plan */
  createIap: IapgqlSchema;
  /** Deploys the Inventive Activity Plan. All Activities are deployed in their Activity providers. */
  deployIap?: Maybe<Scalars['Void']['output']>;
  /** Find and remove the Activity with the given Id. Activities which their metrics are used in any goal, can't be deleted. */
  removeActivity?: Maybe<Scalars['Void']['output']>;
  /** Find and remove the Activity Provider with the given Id. Activity Providers with active Activities can't be deleted. */
  removeActivityProvider?: Maybe<Scalars['Void']['output']>;
  /** Remove a Goal from an Inventive Activity Plan */
  removeGoal?: Maybe<Scalars['Void']['output']>;
  /** Remove an Inventive Activity Plan */
  removeIap?: Maybe<Scalars['Void']['output']>;
};


export type MutationCreateActivityArgs = {
  createActivityInput: CreateActivityInput;
  iapId: Scalars['MongoIdScalar']['input'];
};


export type MutationCreateActivityProviderArgs = {
  createActivityProviderInput: CreateActivityProviderInput;
};


export type MutationCreateGoalArgs = {
  createGoalInput: CreateGoalInput;
  iapId: Scalars['MongoIdScalar']['input'];
};


export type MutationCreateIapArgs = {
  createIapInput: CreateIapInput;
};


export type MutationDeployIapArgs = {
  iapId: Scalars['MongoIdScalar']['input'];
};


export type MutationRemoveActivityArgs = {
  activityId: Scalars['MongoIdScalar']['input'];
};


export type MutationRemoveActivityProviderArgs = {
  apId: Scalars['MongoIdScalar']['input'];
};


export type MutationRemoveGoalArgs = {
  goalId: Scalars['MongoIdScalar']['input'];
};


export type MutationRemoveIapArgs = {
  iapId: Scalars['MongoIdScalar']['input'];
};

export type Query = {
  __typename?: 'Query';
  /** Get a list of all Activities */
  getActivities: Array<ActivityGqlSchema>;
  /** Find an Activity for the given Id */
  getActivity: ActivityGqlSchema;
  /** Find an Activity Provider for the given Id */
  getActivityProvider: ActivityProviderGqlSchema;
  /** Find a list of Activities in an Activity Provider */
  getActivityProviderActivities: Array<ActivityGqlSchema>;
  /** Find a list of mandatory fields to scrape from the configuration interface */
  getActivityProviderRequiredFields: Array<Scalars['String']['output']>;
  /** Get a list of all Activity Providers */
  getActivityProviders: Array<ActivityProviderGqlSchema>;
  /** Find the Activity Configuration Interface URL for the given Activity Provider Id */
  getConfigurationInterfaceUrl: ConfigInterfaceGqlSchema;
  /** Find the Activity Parameters for the given Id */
  getConfigurationParameters: Array<Scalars['String']['output']>;
  /** Find an Inventive Activity Plan for the given Id */
  getIAP: IapgqlSchema;
  /** Find all available metrics for the given IAP id */
  getIAPAvailableMetrics: Array<MetricGqlSchema>;
  /** Get a list of all Inventive Activity Plans */
  getIAPs: Array<IapgqlSchema>;
};


export type QueryGetActivityArgs = {
  activityId: Scalars['MongoIdScalar']['input'];
};


export type QueryGetActivityProviderArgs = {
  apId: Scalars['MongoIdScalar']['input'];
};


export type QueryGetActivityProviderActivitiesArgs = {
  apId: Scalars['MongoIdScalar']['input'];
};


export type QueryGetActivityProviderRequiredFieldsArgs = {
  apId: Scalars['MongoIdScalar']['input'];
};


export type QueryGetConfigurationInterfaceUrlArgs = {
  apId: Scalars['MongoIdScalar']['input'];
};


export type QueryGetConfigurationParametersArgs = {
  apId: Scalars['MongoIdScalar']['input'];
};


export type QueryGetIapArgs = {
  iapId: Scalars['MongoIdScalar']['input'];
};


export type QueryGetIapAvailableMetricsArgs = {
  iapId: Scalars['MongoIdScalar']['input'];
};

export type GetIaPsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetIaPsQuery = { __typename?: 'Query', getIAPs: Array<{ __typename?: 'IAPGQLSchema', _id: any, name: string, description: string, isDeployed: boolean, createdAt: any, createdBy: string, updatedAt: any, updatedBy: string, activityProviders: Array<{ __typename?: 'ActivityProviderGQLSchema', _id: any, name: string, description: string, url: string, activities: Array<{ __typename?: 'ActivityGQLSchema', _id: any, name: string }> }>, goals: Array<{ __typename?: 'GoalGQLSchema', _id: any, name: string }> }> };

export type GetIapQueryVariables = Exact<{
  iapId: Scalars['MongoIdScalar']['input'];
}>;


export type GetIapQuery = { __typename?: 'Query', getIAP: { __typename?: 'IAPGQLSchema', _id: any, name: string, description: string, isDeployed: boolean, createdAt: any, createdBy: string, updatedAt: any, updatedBy: string, activityProviders: Array<{ __typename?: 'ActivityProviderGQLSchema', _id: any, name: string, description: string, url: string, createdAt: any, createdBy: string, updatedAt: any, updatedBy: string, activities: Array<{ __typename?: 'ActivityGQLSchema', _id: any, name: string, description: string, createdAt: any, createdBy: string, updatedAt: any, updatedBy: string }> }>, goals: Array<{ __typename?: 'GoalGQLSchema', _id: any, name: string, description: string, formula: string, targetValue: number, createdAt: any, createdBy: string, updatedAt: any, updatedBy: string }> } };

export type GetActivityProvidersQueryVariables = Exact<{ [key: string]: never; }>;


export type GetActivityProvidersQuery = { __typename?: 'Query', getActivityProviders: Array<{ __typename?: 'ActivityProviderGQLSchema', _id: any, name: string, description: string, url: string, createdAt: any, createdBy: string, updatedAt: any, updatedBy: string }> };

export type CreateIapMutationVariables = Exact<{
  createIapInput: CreateIapInput;
}>;


export type CreateIapMutation = { __typename?: 'Mutation', createIap: { __typename?: 'IAPGQLSchema', _id: any, name: string, description: string, isDeployed: boolean, createdAt: any, createdBy: string, updatedAt: any, updatedBy: string } };

export type DeployIapMutationVariables = Exact<{
  iapId: Scalars['MongoIdScalar']['input'];
}>;


export type DeployIapMutation = { __typename?: 'Mutation', deployIap?: any | null };

export type CreateActivityProviderMutationVariables = Exact<{
  createActivityProviderInput: CreateActivityProviderInput;
}>;


export type CreateActivityProviderMutation = { __typename?: 'Mutation', createActivityProvider: { __typename?: 'ActivityProviderGQLSchema', _id: any, createdAt: any, createdBy: string, description: string, name: string, updatedAt: any, updatedBy: string, url: string, activities: Array<{ __typename?: 'ActivityGQLSchema', updatedAt: any, parameters: any, name: string }> } };

export type CreateActivityMutationVariables = Exact<{
  iapId: Scalars['MongoIdScalar']['input'];
  createActivityInput: CreateActivityInput;
}>;


export type CreateActivityMutation = { __typename?: 'Mutation', createActivity: { __typename?: 'ActivityGQLSchema', _id: any, createdAt: any, createdBy: string, description: string, name: string, parameters: any, updatedAt: any, updatedBy: string } };

export type CreateGoalMutationVariables = Exact<{
  iapId: Scalars['MongoIdScalar']['input'];
  createGoalInput: CreateGoalInput;
}>;


export type CreateGoalMutation = { __typename?: 'Mutation', createGoal: { __typename?: 'GoalGQLSchema', _id: any, createdAt: any, createdBy: string, description: string, formula: string, name: string, targetValue: number, updatedAt: any, updatedBy: string } };

export type GetConfigurationInterfaceUrlQueryVariables = Exact<{
  apId: Scalars['MongoIdScalar']['input'];
}>;


export type GetConfigurationInterfaceUrlQuery = { __typename?: 'Query', getConfigurationInterfaceUrl: { __typename?: 'ConfigInterfaceGQLSchema', url: string } };

export type GetActivityProviderRequiredFieldsQueryVariables = Exact<{
  apId: Scalars['MongoIdScalar']['input'];
}>;


export type GetActivityProviderRequiredFieldsQuery = { __typename?: 'Query', getActivityProviderRequiredFields: Array<string> };

export class TypedDocumentString<TResult, TVariables>
  extends String
  implements DocumentTypeDecoration<TResult, TVariables>
{
  __apiType?: DocumentTypeDecoration<TResult, TVariables>['__apiType'];

  constructor(private value: string, public __meta__?: Record<string, any> | undefined) {
    super(value);
  }

  toString(): string & DocumentTypeDecoration<TResult, TVariables> {
    return this.value;
  }
}

export const GetIaPsDocument = new TypedDocumentString(`
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
    `) as unknown as TypedDocumentString<GetIaPsQuery, GetIaPsQueryVariables>;
export const GetIapDocument = new TypedDocumentString(`
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
    `) as unknown as TypedDocumentString<GetIapQuery, GetIapQueryVariables>;
export const GetActivityProvidersDocument = new TypedDocumentString(`
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
    `) as unknown as TypedDocumentString<GetActivityProvidersQuery, GetActivityProvidersQueryVariables>;
export const CreateIapDocument = new TypedDocumentString(`
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
    `) as unknown as TypedDocumentString<CreateIapMutation, CreateIapMutationVariables>;
export const DeployIapDocument = new TypedDocumentString(`
    mutation deployIap($iapId: MongoIdScalar!) {
  deployIap(iapId: $iapId)
}
    `) as unknown as TypedDocumentString<DeployIapMutation, DeployIapMutationVariables>;
export const CreateActivityProviderDocument = new TypedDocumentString(`
    mutation createActivityProvider($createActivityProviderInput: CreateActivityProviderInput!) {
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
    `) as unknown as TypedDocumentString<CreateActivityProviderMutation, CreateActivityProviderMutationVariables>;
export const CreateActivityDocument = new TypedDocumentString(`
    mutation createActivity($iapId: MongoIdScalar!, $createActivityInput: CreateActivityInput!) {
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
    `) as unknown as TypedDocumentString<CreateActivityMutation, CreateActivityMutationVariables>;
export const CreateGoalDocument = new TypedDocumentString(`
    mutation createGoal($iapId: MongoIdScalar!, $createGoalInput: CreateGoalInput!) {
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
    `) as unknown as TypedDocumentString<CreateGoalMutation, CreateGoalMutationVariables>;
export const GetConfigurationInterfaceUrlDocument = new TypedDocumentString(`
    query getConfigurationInterfaceUrl($apId: MongoIdScalar!) {
  getConfigurationInterfaceUrl(apId: $apId) {
    url
  }
}
    `) as unknown as TypedDocumentString<GetConfigurationInterfaceUrlQuery, GetConfigurationInterfaceUrlQueryVariables>;
export const GetActivityProviderRequiredFieldsDocument = new TypedDocumentString(`
    query getActivityProviderRequiredFields($apId: MongoIdScalar!) {
  getActivityProviderRequiredFields(apId: $apId)
}
    `) as unknown as TypedDocumentString<GetActivityProviderRequiredFieldsQuery, GetActivityProviderRequiredFieldsQueryVariables>;
/* eslint-disable */
import * as types from './graphql';



/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n  query getIAPs {\n    getIAPs {\n      _id\n      name\n      description\n      activityProviders {\n        _id\n        name\n        description\n        url\n        activities {\n          _id\n          name\n        }\n      }\n      isDeployed\n      #deployUrls\n      goals {\n        _id\n        name\n      }\n      createdAt\n      createdBy\n      updatedAt\n      updatedBy\n    }\n  }\n": typeof types.GetIaPsDocument,
    "\n  query getIAP($iapId: MongoIdScalar!) {\n    getIAP(iapId: $iapId) {\n      _id\n      name\n      description\n      isDeployed\n      createdAt\n      createdBy\n      updatedAt\n      updatedBy\n    }\n  }\n": typeof types.GetIapDocument,
    "\n  query getActivityProviders {\n    getActivityProviders {\n      _id\n      name\n      description\n      url\n      createdAt\n      createdBy\n      updatedAt\n      updatedBy\n    }\n  }\n": typeof types.GetActivityProvidersDocument,
    "\n  mutation createIap($createIapInput: CreateIAPInput!) {\n    createIap(createIapInput: $createIapInput) {\n      _id\n      name\n      description\n      isDeployed\n      createdAt\n      createdBy\n      updatedAt\n      updatedBy\n    }\n  }\n": typeof types.CreateIapDocument,
    "\n  mutation createActivityProvider(\n    $createActivityProviderInput: CreateActivityProviderInput!\n  ) {\n    createActivityProvider(\n      createActivityProviderInput: $createActivityProviderInput\n    ) {\n      _id\n      activities {\n        updatedAt\n        parameters\n        name\n      }\n      createdAt\n      createdBy\n      description\n      name\n      updatedAt\n      updatedBy\n      url\n    }\n  }\n": typeof types.CreateActivityProviderDocument,
    "\n  mutation createActivity(\n    $iapId: MongoIdScalar!\n    $createActivityInput: CreateActivityInput!\n  ) {\n    createActivity(iapId: $iapId, createActivityInput: $createActivityInput) {\n      _id\n      createdAt\n      createdBy\n      description\n      name\n      parameters\n      updatedAt\n      updatedBy\n    }\n  }\n": typeof types.CreateActivityDocument,
    "\n  mutation createGoal(\n    $iapId: MongoIdScalar!\n    $createGoalInput: CreateGoalInput!\n  ) {\n    createGoal(iapId: $iapId, createGoalInput: $createGoalInput) {\n      _id\n      createdAt\n      createdBy\n      description\n      formula\n      name\n      targetValue\n      updatedAt\n      updatedBy\n    }\n  }\n": typeof types.CreateGoalDocument,
    "\n  query getConfigurationInterfaceUrl($apId: MongoIdScalar!) {\n    getConfigurationInterfaceUrl(apId: $apId) {\n      url\n    }\n  }\n": typeof types.GetConfigurationInterfaceUrlDocument,
    "\n  query getActivityProviderRequiredFields($apId: MongoIdScalar!) {\n    getActivityProviderRequiredFields(apId: $apId)\n  }\n": typeof types.GetActivityProviderRequiredFieldsDocument,
};
const documents: Documents = {
    "\n  query getIAPs {\n    getIAPs {\n      _id\n      name\n      description\n      activityProviders {\n        _id\n        name\n        description\n        url\n        activities {\n          _id\n          name\n        }\n      }\n      isDeployed\n      #deployUrls\n      goals {\n        _id\n        name\n      }\n      createdAt\n      createdBy\n      updatedAt\n      updatedBy\n    }\n  }\n": types.GetIaPsDocument,
    "\n  query getIAP($iapId: MongoIdScalar!) {\n    getIAP(iapId: $iapId) {\n      _id\n      name\n      description\n      isDeployed\n      createdAt\n      createdBy\n      updatedAt\n      updatedBy\n    }\n  }\n": types.GetIapDocument,
    "\n  query getActivityProviders {\n    getActivityProviders {\n      _id\n      name\n      description\n      url\n      createdAt\n      createdBy\n      updatedAt\n      updatedBy\n    }\n  }\n": types.GetActivityProvidersDocument,
    "\n  mutation createIap($createIapInput: CreateIAPInput!) {\n    createIap(createIapInput: $createIapInput) {\n      _id\n      name\n      description\n      isDeployed\n      createdAt\n      createdBy\n      updatedAt\n      updatedBy\n    }\n  }\n": types.CreateIapDocument,
    "\n  mutation createActivityProvider(\n    $createActivityProviderInput: CreateActivityProviderInput!\n  ) {\n    createActivityProvider(\n      createActivityProviderInput: $createActivityProviderInput\n    ) {\n      _id\n      activities {\n        updatedAt\n        parameters\n        name\n      }\n      createdAt\n      createdBy\n      description\n      name\n      updatedAt\n      updatedBy\n      url\n    }\n  }\n": types.CreateActivityProviderDocument,
    "\n  mutation createActivity(\n    $iapId: MongoIdScalar!\n    $createActivityInput: CreateActivityInput!\n  ) {\n    createActivity(iapId: $iapId, createActivityInput: $createActivityInput) {\n      _id\n      createdAt\n      createdBy\n      description\n      name\n      parameters\n      updatedAt\n      updatedBy\n    }\n  }\n": types.CreateActivityDocument,
    "\n  mutation createGoal(\n    $iapId: MongoIdScalar!\n    $createGoalInput: CreateGoalInput!\n  ) {\n    createGoal(iapId: $iapId, createGoalInput: $createGoalInput) {\n      _id\n      createdAt\n      createdBy\n      description\n      formula\n      name\n      targetValue\n      updatedAt\n      updatedBy\n    }\n  }\n": types.CreateGoalDocument,
    "\n  query getConfigurationInterfaceUrl($apId: MongoIdScalar!) {\n    getConfigurationInterfaceUrl(apId: $apId) {\n      url\n    }\n  }\n": types.GetConfigurationInterfaceUrlDocument,
    "\n  query getActivityProviderRequiredFields($apId: MongoIdScalar!) {\n    getActivityProviderRequiredFields(apId: $apId)\n  }\n": types.GetActivityProviderRequiredFieldsDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query getIAPs {\n    getIAPs {\n      _id\n      name\n      description\n      activityProviders {\n        _id\n        name\n        description\n        url\n        activities {\n          _id\n          name\n        }\n      }\n      isDeployed\n      #deployUrls\n      goals {\n        _id\n        name\n      }\n      createdAt\n      createdBy\n      updatedAt\n      updatedBy\n    }\n  }\n"): typeof import('./graphql').GetIaPsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query getIAP($iapId: MongoIdScalar!) {\n    getIAP(iapId: $iapId) {\n      _id\n      name\n      description\n      isDeployed\n      createdAt\n      createdBy\n      updatedAt\n      updatedBy\n    }\n  }\n"): typeof import('./graphql').GetIapDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query getActivityProviders {\n    getActivityProviders {\n      _id\n      name\n      description\n      url\n      createdAt\n      createdBy\n      updatedAt\n      updatedBy\n    }\n  }\n"): typeof import('./graphql').GetActivityProvidersDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation createIap($createIapInput: CreateIAPInput!) {\n    createIap(createIapInput: $createIapInput) {\n      _id\n      name\n      description\n      isDeployed\n      createdAt\n      createdBy\n      updatedAt\n      updatedBy\n    }\n  }\n"): typeof import('./graphql').CreateIapDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation createActivityProvider(\n    $createActivityProviderInput: CreateActivityProviderInput!\n  ) {\n    createActivityProvider(\n      createActivityProviderInput: $createActivityProviderInput\n    ) {\n      _id\n      activities {\n        updatedAt\n        parameters\n        name\n      }\n      createdAt\n      createdBy\n      description\n      name\n      updatedAt\n      updatedBy\n      url\n    }\n  }\n"): typeof import('./graphql').CreateActivityProviderDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation createActivity(\n    $iapId: MongoIdScalar!\n    $createActivityInput: CreateActivityInput!\n  ) {\n    createActivity(iapId: $iapId, createActivityInput: $createActivityInput) {\n      _id\n      createdAt\n      createdBy\n      description\n      name\n      parameters\n      updatedAt\n      updatedBy\n    }\n  }\n"): typeof import('./graphql').CreateActivityDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation createGoal(\n    $iapId: MongoIdScalar!\n    $createGoalInput: CreateGoalInput!\n  ) {\n    createGoal(iapId: $iapId, createGoalInput: $createGoalInput) {\n      _id\n      createdAt\n      createdBy\n      description\n      formula\n      name\n      targetValue\n      updatedAt\n      updatedBy\n    }\n  }\n"): typeof import('./graphql').CreateGoalDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query getConfigurationInterfaceUrl($apId: MongoIdScalar!) {\n    getConfigurationInterfaceUrl(apId: $apId) {\n      url\n    }\n  }\n"): typeof import('./graphql').GetConfigurationInterfaceUrlDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query getActivityProviderRequiredFields($apId: MongoIdScalar!) {\n    getActivityProviderRequiredFields(apId: $apId)\n  }\n"): typeof import('./graphql').GetActivityProviderRequiredFieldsDocument;


export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

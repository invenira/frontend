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
    "\n  query getIAPs {\n    getIAPs {\n      _id\n      name\n      description\n      isDeployed\n      createdAt\n      createdBy\n      updatedAt\n      updatedBy\n    }\n  }\n": typeof types.GetIaPsDocument,
    "\n  query getIAP($iapId: MongoIdScalar!) {\n    getIAP(iapId: $iapId) {\n      _id\n      name\n      description\n      isDeployed\n      createdAt\n      createdBy\n      updatedAt\n      updatedBy\n    }\n  }\n": typeof types.GetIapDocument,
};
const documents: Documents = {
    "\n  query getIAPs {\n    getIAPs {\n      _id\n      name\n      description\n      isDeployed\n      createdAt\n      createdBy\n      updatedAt\n      updatedBy\n    }\n  }\n": types.GetIaPsDocument,
    "\n  query getIAP($iapId: MongoIdScalar!) {\n    getIAP(iapId: $iapId) {\n      _id\n      name\n      description\n      isDeployed\n      createdAt\n      createdBy\n      updatedAt\n      updatedBy\n    }\n  }\n": types.GetIapDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query getIAPs {\n    getIAPs {\n      _id\n      name\n      description\n      isDeployed\n      createdAt\n      createdBy\n      updatedAt\n      updatedBy\n    }\n  }\n"): typeof import('./graphql').GetIaPsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query getIAP($iapId: MongoIdScalar!) {\n    getIAP(iapId: $iapId) {\n      _id\n      name\n      description\n      isDeployed\n      createdAt\n      createdBy\n      updatedAt\n      updatedBy\n    }\n  }\n"): typeof import('./graphql').GetIapDocument;


export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

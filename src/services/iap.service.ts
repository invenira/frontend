import { graphql } from '@/graphql';
import { IapgqlSchema } from '@/graphql/graphql.ts';
import { graphQLRequest } from './request.ts';

const getIAPsQuery = graphql(`
  query getIAPs {
    getIAPs {
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

export class IapService {
  async getAll(): Promise<Partial<IapgqlSchema>[]> {
    return graphQLRequest(getIAPsQuery);
  }

  async getOne(iapId: string): Promise<IapgqlSchema> {
    return graphQLRequest(getIAPQuery, { iapId });
  }
}

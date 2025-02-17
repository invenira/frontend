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
    return graphQLRequest<{ getIAPs: Partial<IapgqlSchema>[] }>(
      getIAPsQuery,
    ).then((d) => d.getIAPs);
  }

  async getOne(iapId: string): Promise<Partial<IapgqlSchema>> {
    return graphQLRequest<{ getIAP: Partial<IapgqlSchema> }>(getIAPQuery, {
      iapId,
    }).then((d) => d.getIAP);
  }
}

import { useIotaClient } from '@iota/dapp-kit';
import { useQuery } from '@tanstack/react-query';
import { PACKAGE_ID, MODULE_NAME } from '../constants';
import { parseOrderObject } from '../utils/parseOrder';
import type { PurchaseOrder } from '../types';

export function useOrders() {
  const client = useIotaClient();

  return useQuery<PurchaseOrder[]>({
    queryKey: ['orders', PACKAGE_ID],
    queryFn: async () => {
      const txResult = await client.queryTransactionBlocks({
        filter: {
          MoveFunction: {
            package: PACKAGE_ID,
            module: MODULE_NAME,
            function: 'create_order',
          },
        },
        options: { showObjectChanges: true },
        limit: 50,
        order: 'descending',
      });

      const orderIds = txResult.data
        .flatMap(tx => tx.objectChanges ?? [])
        .filter(
          (c): c is Extract<typeof c, { type: 'created' }> =>
            c.type === 'created' &&
            'objectType' in c &&
            (c.objectType as string).includes('PurchaseOrder'),
        )
        .map(c => c.objectId);

      if (orderIds.length === 0) return [];

      const objects = await client.multiGetObjects({
        ids: orderIds,
        options: { showContent: true },
      });

      return objects
        .map(parseOrderObject)
        .filter((o): o is PurchaseOrder => o !== null);
    },
    staleTime: 15_000,
    refetchInterval: 30_000,
  });
}

import { useSignAndExecuteTransaction } from '@iota/dapp-kit';
import { Transaction } from '@iota/iota-sdk/transactions';
import { useQueryClient } from '@tanstack/react-query';
import { PACKAGE_ID, MODULE_NAME } from '../constants';
import type { PurchaseOrder } from '../types';

function useInvalidateOrders() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: ['orders'] });
}

export function useCreateOrder() {
  const { mutateAsync } = useSignAndExecuteTransaction();
  const invalidate = useInvalidateOrders();

  return async (params: {
    buyer: string;
    validators: string[];
    product_name: string;
    product_description: string;
    price: bigint;
    quantity: bigint;
  }) => {
    const tx = new Transaction();
    tx.moveCall({
      target: `${PACKAGE_ID}::${MODULE_NAME}::create_order`,
      arguments: [
        tx.pure.address(params.buyer),
        tx.pure.vector('address', params.validators),
        tx.pure.string(params.product_name),
        tx.pure.string(params.product_description),
        tx.pure.u64(params.price),
        tx.pure.u64(params.quantity),
      ],
    });
    const result = await mutateAsync({ transaction: tx });
    await invalidate();
    return result;
  };
}

export function useAcceptOrder() {
  const { mutateAsync } = useSignAndExecuteTransaction();
  const invalidate = useInvalidateOrders();

  return async (orderId: string) => {
    const tx = new Transaction();
    tx.moveCall({
      target: `${PACKAGE_ID}::${MODULE_NAME}::accept_order`,
      arguments: [tx.object(orderId)],
    });
    const result = await mutateAsync({ transaction: tx });
    await invalidate();
    return result;
  };
}

export function useRejectOrder() {
  const { mutateAsync } = useSignAndExecuteTransaction();
  const invalidate = useInvalidateOrders();

  return async (orderId: string) => {
    const tx = new Transaction();
    tx.moveCall({
      target: `${PACKAGE_ID}::${MODULE_NAME}::reject_order`,
      arguments: [tx.object(orderId)],
    });
    const result = await mutateAsync({ transaction: tx });
    await invalidate();
    return result;
  };
}

export function useStoreNotarization() {
  const { mutateAsync } = useSignAndExecuteTransaction();
  const invalidate = useInvalidateOrders();

  return async (orderId: string, notarizationHash: string, timestampHash: string) => {
    const tx = new Transaction();
    tx.moveCall({
      target: `${PACKAGE_ID}::${MODULE_NAME}::store_notarization`,
      arguments: [
        tx.object(orderId),
        tx.pure.string(notarizationHash),
        tx.pure.string(timestampHash),
      ],
    });
    const result = await mutateAsync({ transaction: tx });
    await invalidate();
    return result;
  };
}

export function usePayOrder() {
  const { mutateAsync } = useSignAndExecuteTransaction();
  const invalidate = useInvalidateOrders();

  return async (order: PurchaseOrder) => {
    const tx = new Transaction();
    const required = order.price * order.quantity;
    const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(required)]);
    tx.moveCall({
      target: `${PACKAGE_ID}::${MODULE_NAME}::pay_order`,
      arguments: [tx.object(order.id), coin],
    });
    const result = await mutateAsync({ transaction: tx });
    await invalidate();
    return result;
  };
}

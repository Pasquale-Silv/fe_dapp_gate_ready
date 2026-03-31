import type { IotaObjectResponse } from '@iota/iota-sdk/client';
import type { PurchaseOrder } from '../types';
import type { OrderState } from '../constants';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseOption(opt: any): string | null {
  if (!opt) return null;
  const vec = opt.fields?.vec ?? opt.vec ?? opt;
  if (Array.isArray(vec) && vec.length > 0) return String(vec[0]);
  return null;
}

export function parseOrderObject(obj: IotaObjectResponse): PurchaseOrder | null {
  const content = obj.data?.content;
  if (!content || content.dataType !== 'moveObject') return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const f = (content as any).fields as Record<string, any>;
  return {
    id: (f.id as { id: string })?.id ?? obj.data?.objectId ?? '',
    seller: String(f.seller),
    buyer: String(f.buyer),
    validators: Array.isArray(f.validators) ? (f.validators as string[]) : [],
    product_name: String(f.product_name),
    product_description: String(f.product_description),
    price: BigInt(f.price as string),
    quantity: BigInt(f.quantity as string),
    order_state: (f.order_state as OrderState),
    notarization_hash: parseOption(f.notarization_hash),
    timestamp_hash: parseOption(f.timestamp_hash),
    buyer_approved: Boolean(f.buyer_approved),
    any_validator_approved: Boolean(f.any_validator_approved),
  };
}

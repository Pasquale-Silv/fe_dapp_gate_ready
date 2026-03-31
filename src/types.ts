import type { OrderState } from './constants';

export interface PurchaseOrder {
  id: string;
  seller: string;
  buyer: string;
  validators: string[];
  product_name: string;
  product_description: string;
  /** Unit price in MIST */
  price: bigint;
  quantity: bigint;
  order_state: OrderState;
  notarization_hash: string | null;
  timestamp_hash: string | null;
  buyer_approved: boolean;
  any_validator_approved: boolean;
}

export const PACKAGE_ID =
  '0x54ea5a6939e911ee036cdc3a07f96954f6bad4409505153c80ddd773b8854feb';
export const MODULE_NAME = 'sc_gate_ready';
export const ORDER_TYPE = `${PACKAGE_ID}::${MODULE_NAME}::PurchaseOrder`;

export const ORDER_STATES = {
  0: 'Created',
  1: 'Confirmed',
  2: 'Rejected',
  3: 'Paid',
} as const;

export type OrderState = 0 | 1 | 2 | 3;

export const MIST_PER_IOTA = 1_000_000_000n;

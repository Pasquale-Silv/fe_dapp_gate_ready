import type { PurchaseOrder } from '../types';
import { MIST_PER_IOTA } from '../constants';

export function mistToIota(mist: bigint): string {
  const whole = mist / MIST_PER_IOTA;
  const frac = mist % MIST_PER_IOTA;
  if (frac === 0n) return whole.toString();
  return `${whole}.${frac.toString().padStart(9, '0').replace(/0+$/, '')}`;
}

export function iotaToMist(iota: string): bigint {
  const [wholePart, fracPart = ''] = iota.split('.');
  const whole = BigInt(wholePart || '0');
  const frac = BigInt(fracPart.padEnd(9, '0').slice(0, 9));
  return whole * MIST_PER_IOTA + frac;
}

export function buildDocumentContent(order: PurchaseOrder): string {
  const priceIota = mistToIota(order.price);
  const totalIota = mistToIota(order.price * order.quantity);
  return [
    'PURCHASE ORDER — GATEREADY NOTARIZATION',
    '==========================================',
    `Order ID:            ${order.id}`,
    `Seller:              ${order.seller}`,
    `Buyer:               ${order.buyer}`,
    order.validators.length > 0
      ? `Validators:          ${order.validators.join(', ')}`
      : 'Validators:          (none)',
    '',
    `Product Name:        ${order.product_name}`,
    `Product Description: ${order.product_description}`,
    `Unit Price:          ${priceIota} IOTA`,
    `Quantity:            ${order.quantity.toString()}`,
    `Total:               ${totalIota} IOTA`,
    '==========================================',
  ].join('\n');
}

export async function hashDocument(content: string): Promise<string> {
  const data = new TextEncoder().encode(content);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export function getCurrentTimestamp(): string {
  return new Date().toISOString();
}

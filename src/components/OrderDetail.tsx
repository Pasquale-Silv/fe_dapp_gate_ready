import { useState } from 'react';
import {
  Box, Flex, Text, Heading, Button, Separator, Badge, ScrollArea, Callout,
} from '@radix-ui/themes';
import { StatusBadge } from './StatusBadge';
import { mistToIota } from '../utils/notarization';
import {
  buildDocumentContent,
  hashDocument,
  getCurrentTimestamp,
} from '../utils/notarization';
import {
  useAcceptOrder,
  useRejectOrder,
  useStoreNotarization,
  usePayOrder,
} from '../hooks/useOrderActions';
import type { PurchaseOrder } from '../types';

function AddressRow({ label, value }: { label: string; value: string }) {
  return (
    <Flex justify="between" align="center" py="1">
      <Text size="2" color="gray" style={{ minWidth: 160 }}>{label}</Text>
      <Text size="2" style={{ fontFamily: 'monospace', wordBreak: 'break-all', textAlign: 'right' }}>
        {value}
      </Text>
    </Flex>
  );
}

interface Props {
  order: PurchaseOrder;
  currentAddress?: string;
}

export function OrderDetail({ order, currentAddress }: Props) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notarizationPreview, setNotarizationPreview] = useState<{
    content: string;
    hash: string;
    timestamp: string;
  } | null>(null);

  const acceptOrder = useAcceptOrder();
  const rejectOrder = useRejectOrder();
  const storeNotarization = useStoreNotarization();
  const payOrder = usePayOrder();

  const isSeller = currentAddress === order.seller;
  const isBuyer = currentAddress === order.buyer;
  const isValidator = order.validators.includes(currentAddress ?? '');

  const priceIota = mistToIota(order.price);
  const totalIota = mistToIota(order.price * order.quantity);

  async function handle(label: string, fn: () => Promise<unknown>) {
    setLoading(label);
    setError(null);
    try {
      await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(null);
    }
  }

  async function prepareNotarization() {
    const content = buildDocumentContent(order);
    const hash = await hashDocument(content);
    const timestamp = getCurrentTimestamp();
    setNotarizationPreview({ content, hash, timestamp });
  }

  async function confirmNotarization() {
    if (!notarizationPreview) return;
    await handle('Notarize', () =>
      storeNotarization(order.id, notarizationPreview.hash, notarizationPreview.timestamp),
    );
    setNotarizationPreview(null);
  }

  return (
    <ScrollArea style={{ maxHeight: '70vh' }}>
      <Box p="4">
        {/* Header */}
        <Flex align="center" gap="3" mb="4">
          <Heading size="4">{order.product_name}</Heading>
          <StatusBadge state={order.order_state} />
          {isSeller && <Badge color="cyan" variant="outline">Seller</Badge>}
          {isBuyer && <Badge color="violet" variant="outline">Buyer</Badge>}
          {isValidator && <Badge color="orange" variant="outline">Validator</Badge>}
        </Flex>

        {/* Fields */}
        <Box mb="4">
          <AddressRow label="Order ID" value={order.id} />
          <Separator size="4" />
          <AddressRow label="Seller" value={order.seller} />
          <AddressRow label="Buyer" value={order.buyer} />
          {order.validators.length > 0 && (
            <>
              {order.validators.map((v, i) => (
                <AddressRow key={v} label={`Validator ${i + 1}`} value={v} />
              ))}
            </>
          )}
          <Separator size="4" />
          <Flex justify="between" py="1">
            <Text size="2" color="gray">Description</Text>
            <Text size="2" style={{ maxWidth: '60%', textAlign: 'right' }}>
              {order.product_description}
            </Text>
          </Flex>
          <Flex justify="between" py="1">
            <Text size="2" color="gray">Unit Price</Text>
            <Text size="2">{priceIota} IOTA</Text>
          </Flex>
          <Flex justify="between" py="1">
            <Text size="2" color="gray">Quantity</Text>
            <Text size="2">{order.quantity.toString()}</Text>
          </Flex>
          <Flex justify="between" py="1">
            <Text size="2" color="gray" weight="bold">Total</Text>
            <Text size="2" weight="bold">{totalIota} IOTA</Text>
          </Flex>
          <Separator size="4" />
          <Flex justify="between" py="1">
            <Text size="2" color="gray">Buyer approved</Text>
            <Text size="2">{order.buyer_approved ? '✓' : '—'}</Text>
          </Flex>
          <Flex justify="between" py="1">
            <Text size="2" color="gray">Validator approved</Text>
            <Text size="2">{order.any_validator_approved ? '✓' : '—'}</Text>
          </Flex>
          {order.notarization_hash && (
            <>
              <Separator size="4" />
              <Flex justify="between" py="1" align="start">
                <Text size="2" color="gray">Document Hash</Text>
                <Text size="1" style={{ fontFamily: 'monospace', maxWidth: '60%', wordBreak: 'break-all', textAlign: 'right' }}>
                  {order.notarization_hash}
                </Text>
              </Flex>
              <Flex justify="between" py="1">
                <Text size="2" color="gray">Timestamp</Text>
                <Text size="2">{order.timestamp_hash}</Text>
              </Flex>
            </>
          )}
        </Box>

        {/* Error */}
        {error && (
          <Callout.Root color="red" mb="3">
            <Callout.Text>{error}</Callout.Text>
          </Callout.Root>
        )}

        {/* Actions — State: Created */}
        {order.order_state === 0 && (isBuyer || isValidator) && (
          <Flex gap="3">
            <Button
              color="green"
              disabled={!!loading}
              onClick={() => handle('Accept', () => acceptOrder(order.id))}
            >
              {loading === 'Accept' ? 'Accepting…' : 'Accept Order'}
            </Button>
            <Button
              color="red"
              variant="soft"
              disabled={!!loading}
              onClick={() => handle('Reject', () => rejectOrder(order.id))}
            >
              {loading === 'Reject' ? 'Rejecting…' : 'Reject Order'}
            </Button>
          </Flex>
        )}

        {/* Actions — State: Confirmed, Seller */}
        {order.order_state === 1 && isSeller && !order.notarization_hash && (
          <>
            {!notarizationPreview ? (
              <Button onClick={prepareNotarization}>Notarize Document</Button>
            ) : (
              <Box>
                <Text size="2" color="gray" mb="2" style={{ display: 'block' }}>
                  Document to be hashed and stored on-chain:
                </Text>
                <Box
                  p="3"
                  mb="3"
                  style={{
                    background: 'var(--gray-a2)',
                    borderRadius: 8,
                    fontFamily: 'monospace',
                    fontSize: 12,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  {notarizationPreview.content}
                </Box>
                <Flex direction="column" gap="1" mb="3">
                  <Text size="1" color="gray">SHA-256 Hash:</Text>
                  <Text size="1" style={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                    {notarizationPreview.hash}
                  </Text>
                  <Text size="1" color="gray">Timestamp: {notarizationPreview.timestamp}</Text>
                </Flex>
                <Flex gap="3">
                  <Button
                    disabled={!!loading}
                    onClick={confirmNotarization}
                  >
                    {loading === 'Notarize' ? 'Storing…' : 'Confirm & Store Hash'}
                  </Button>
                  <Button variant="soft" onClick={() => setNotarizationPreview(null)}>
                    Cancel
                  </Button>
                </Flex>
              </Box>
            )}
          </>
        )}

        {/* Actions — State: Confirmed, Buyer pays */}
        {order.order_state === 1 && isBuyer && (
          <Button
            color="violet"
            disabled={!!loading}
            onClick={() => handle('Pay', () => payOrder(order))}
          >
            {loading === 'Pay' ? 'Processing…' : `Pay ${totalIota} IOTA`}
          </Button>
        )}
      </Box>
    </ScrollArea>
  );
}

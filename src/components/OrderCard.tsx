import { Card, Flex, Text, Box, Badge } from '@radix-ui/themes';
import { StatusBadge } from './StatusBadge';
import { mistToIota } from '../utils/notarization';
import type { PurchaseOrder } from '../types';

function truncate(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

interface Props {
  order: PurchaseOrder;
  currentAddress?: string;
  onClick: () => void;
}

export function OrderCard({ order, currentAddress, onClick }: Props) {
  const isSeller = currentAddress === order.seller;
  const isBuyer = currentAddress === order.buyer;
  const isValidator = order.validators.includes(currentAddress ?? '');

  const totalIota = mistToIota(order.price * order.quantity);
  const priceIota = mistToIota(order.price);

  return (
    <Card
      onClick={onClick}
      style={{ cursor: 'pointer' }}
      variant="surface"
    >
      <Flex justify="between" align="start" gap="3">
        <Box style={{ flex: 1, minWidth: 0 }}>
          <Flex align="center" gap="2" mb="1">
            <Text size="3" weight="bold" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {order.product_name}
            </Text>
            <StatusBadge state={order.order_state} />
          </Flex>
          <Text size="1" color="gray" style={{ display: 'block', marginBottom: 4 }}>
            {order.product_description.length > 80
              ? order.product_description.slice(0, 80) + '…'
              : order.product_description}
          </Text>
          <Flex gap="4" mt="2">
            <Flex direction="column" gap="0">
              <Text size="1" color="gray">Price × Qty</Text>
              <Text size="2">{priceIota} × {order.quantity.toString()} = {totalIota} IOTA</Text>
            </Flex>
            <Flex direction="column" gap="0">
              <Text size="1" color="gray">Seller</Text>
              <Text size="2" style={{ fontFamily: 'monospace' }}>{truncate(order.seller)}</Text>
            </Flex>
            <Flex direction="column" gap="0">
              <Text size="1" color="gray">Buyer</Text>
              <Text size="2" style={{ fontFamily: 'monospace' }}>{truncate(order.buyer)}</Text>
            </Flex>
          </Flex>
        </Box>
        <Flex direction="column" align="end" gap="2" style={{ flexShrink: 0 }}>
          {isSeller && <Badge color="cyan" variant="outline" size="1">Seller</Badge>}
          {isBuyer && <Badge color="violet" variant="outline" size="1">Buyer</Badge>}
          {isValidator && <Badge color="orange" variant="outline" size="1">Validator</Badge>}
          <Text size="1" color="gray" style={{ fontFamily: 'monospace' }}>
            {truncate(order.id)}
          </Text>
        </Flex>
      </Flex>
    </Card>
  );
}

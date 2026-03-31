import { useState } from 'react';
import { useCurrentAccount } from '@iota/dapp-kit';
import {
  Box, Container, Flex, Text, Tabs, Dialog, Spinner, Callout, Button,
} from '@radix-ui/themes';
import { Header } from './components/Header';
import { OrderCard } from './components/OrderCard';
import { OrderDetail } from './components/OrderDetail';
import { CreateOrderForm } from './components/CreateOrderForm';
import { useOrders } from './hooks/useOrders';
import type { PurchaseOrder } from './types';

function EmptyState({ message }: { message: string }) {
  return (
    <Flex align="center" justify="center" py="8">
      <Text color="gray">{message}</Text>
    </Flex>
  );
}

function OrderList({
  orders,
  currentAddress,
  onSelect,
}: {
  orders: PurchaseOrder[];
  currentAddress?: string;
  onSelect: (o: PurchaseOrder) => void;
}) {
  return (
    <Flex direction="column" gap="3">
      {orders.map(order => (
        <OrderCard
          key={order.id}
          order={order}
          currentAddress={currentAddress}
          onClick={() => onSelect(order)}
        />
      ))}
    </Flex>
  );
}

export default function App() {
  const account = useCurrentAccount();
  const currentAddress = account?.address;
  const { data: orders, isLoading, error, refetch } = useOrders();
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
  const [activeTab, setActiveTab] = useState('my-orders');

  const myOrders = (orders ?? []).filter(
    o =>
      o.seller === currentAddress ||
      o.buyer === currentAddress ||
      o.validators.includes(currentAddress ?? ''),
  );
  const allOrders = orders ?? [];

  function handleCreateSuccess() {
    setActiveTab('my-orders');
  }

  return (
    <>
      <Header />

      <Container size="3" px="4" py="5">
        {!account ? (
          <Callout.Root color="blue" mt="4" style={{ maxWidth: 480, margin: '40px auto' }}>
            <Callout.Text>
              Connect your IOTA wallet to create or manage purchase orders.
            </Callout.Text>
          </Callout.Root>
        ) : (
          <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
            <Tabs.List mb="4">
              <Tabs.Trigger value="my-orders">My Orders</Tabs.Trigger>
              <Tabs.Trigger value="all-orders">All Orders</Tabs.Trigger>
              <Tabs.Trigger value="create">Create Order</Tabs.Trigger>
            </Tabs.List>

            <Tabs.Content value="my-orders">
              {isLoading ? (
                <Flex justify="center" py="8"><Spinner /></Flex>
              ) : error ? (
                <Box>
                  <Callout.Root color="red" mb="3">
                    <Callout.Text>Failed to load orders.</Callout.Text>
                  </Callout.Root>
                  <Button variant="soft" onClick={() => refetch()}>Retry</Button>
                </Box>
              ) : myOrders.length === 0 ? (
                <EmptyState message="No orders found where you are seller, buyer, or validator." />
              ) : (
                <OrderList orders={myOrders} currentAddress={currentAddress} onSelect={setSelectedOrder} />
              )}
            </Tabs.Content>

            <Tabs.Content value="all-orders">
              {isLoading ? (
                <Flex justify="center" py="8"><Spinner /></Flex>
              ) : error ? (
                <Box>
                  <Callout.Root color="red" mb="3">
                    <Callout.Text>Failed to load orders.</Callout.Text>
                  </Callout.Root>
                  <Button variant="soft" onClick={() => refetch()}>Retry</Button>
                </Box>
              ) : allOrders.length === 0 ? (
                <EmptyState message="No orders found on-chain yet." />
              ) : (
                <OrderList orders={allOrders} currentAddress={currentAddress} onSelect={setSelectedOrder} />
              )}
            </Tabs.Content>

            <Tabs.Content value="create">
              <CreateOrderForm onSuccess={handleCreateSuccess} />
            </Tabs.Content>
          </Tabs.Root>
        )}
      </Container>

      {/* Order Detail Dialog */}
      <Dialog.Root open={!!selectedOrder} onOpenChange={open => { if (!open) setSelectedOrder(null); }}>
        <Dialog.Content style={{ maxWidth: 640 }}>
          <Dialog.Title>Order Details</Dialog.Title>
          {selectedOrder && (
            <OrderDetail
              order={selectedOrder}
              currentAddress={currentAddress}
            />
          )}
          <Dialog.Close>
            <Button variant="soft" mt="3">Close</Button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Root>
    </>
  );
}

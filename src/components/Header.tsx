import { ConnectButton } from '@iota/dapp-kit';
import { Flex, Heading, Text } from '@radix-ui/themes';
import logoUrl from '../../assets/GateReady.jpeg';

export function Header() {
  return (
    <Flex
      position="sticky"
      px="5"
      py="3"
      justify="between"
      align="center"
      style={{ borderBottom: '1px solid var(--gray-a3)', background: 'var(--color-background)' }}
    >
      <Flex align="center" gap="3">
        <img
          src={logoUrl}
          alt="GateReady"
          style={{ height: 40, width: 40, objectFit: 'cover', borderRadius: 8 }}
        />
        <Flex direction="column" gap="0">
          <Heading size="4" style={{ color: 'var(--accent-9)' }}>
            GateReady
          </Heading>
          <Text size="1" color="gray">
            Purchase Order Notarization
          </Text>
        </Flex>
      </Flex>
      <ConnectButton />
    </Flex>
  );
}

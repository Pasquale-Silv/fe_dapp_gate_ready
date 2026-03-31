import { useState } from 'react';
import {
  Box, Flex, Text, Heading, Button, TextField, TextArea, Callout, Separator,
} from '@radix-ui/themes';
import { useCreateOrder } from '../hooks/useOrderActions';
import { iotaToMist } from '../utils/notarization';

interface Props {
  onSuccess: () => void;
}

export function CreateOrderForm({ onSuccess }: Props) {
  const createOrder = useCreateOrder();

  const [buyer, setBuyer] = useState('');
  const [validators, setValidators] = useState<string[]>(['']);
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [priceIota, setPriceIota] = useState('');
  const [quantity, setQuantity] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function addValidator() {
    setValidators(v => [...v, '']);
  }

  function updateValidator(index: number, value: string) {
    setValidators(v => v.map((x, i) => (i === index ? value : x)));
  }

  function removeValidator(index: number) {
    setValidators(v => v.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!buyer.trim()) { setError('Buyer address is required.'); return; }
    if (!productName.trim()) { setError('Product name is required.'); return; }
    if (!priceIota || isNaN(parseFloat(priceIota)) || parseFloat(priceIota) <= 0) {
      setError('Enter a valid price greater than 0.');
      return;
    }
    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) { setError('Enter a valid quantity greater than 0.'); return; }

    const validatorList = validators.map(v => v.trim()).filter(Boolean);

    setLoading(true);
    try {
      await createOrder({
        buyer: buyer.trim(),
        validators: validatorList,
        product_name: productName.trim(),
        product_description: productDescription.trim(),
        price: iotaToMist(priceIota),
        quantity: BigInt(qty),
      });
      onSuccess();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box style={{ maxWidth: 600, margin: '0 auto' }} p="4">
      <Heading size="4" mb="4">Create Purchase Order</Heading>

      <form onSubmit={handleSubmit}>
        <Flex direction="column" gap="4">

          <Flex direction="column" gap="1">
            <Text size="2" weight="bold">Buyer Address *</Text>
            <TextField.Root
              placeholder="0x..."
              value={buyer}
              onChange={e => setBuyer(e.target.value)}
            />
          </Flex>

          <Separator size="4" />

          <Flex direction="column" gap="2">
            <Flex justify="between" align="center">
              <Text size="2" weight="bold">Validators</Text>
              <Button type="button" variant="soft" size="1" onClick={addValidator}>
                + Add Validator
              </Button>
            </Flex>
            {validators.length === 0 && (
              <Text size="1" color="gray">No validators — only buyer approval needed.</Text>
            )}
            {validators.map((v, i) => (
              <Flex key={i} gap="2" align="center">
                <Box style={{ flex: 1 }}>
                  <TextField.Root
                    placeholder={`Validator ${i + 1} address (0x...)`}
                    value={v}
                    onChange={e => updateValidator(i, e.target.value)}
                  />
                </Box>
                <Button
                  type="button"
                  variant="soft"
                  color="red"
                  size="1"
                  onClick={() => removeValidator(i)}
                >
                  Remove
                </Button>
              </Flex>
            ))}
          </Flex>

          <Separator size="4" />

          <Flex direction="column" gap="1">
            <Text size="2" weight="bold">Product Name *</Text>
            <TextField.Root
              placeholder="e.g. Industrial Hydraulic Pump"
              value={productName}
              onChange={e => setProductName(e.target.value)}
            />
          </Flex>

          <Flex direction="column" gap="1">
            <Text size="2" weight="bold">Product Description</Text>
            <TextArea
              placeholder="Detailed description of the product..."
              value={productDescription}
              onChange={e => setProductDescription(e.target.value)}
              rows={3}
            />
          </Flex>

          <Flex gap="4">
            <Flex direction="column" gap="1" style={{ flex: 1 }}>
              <Text size="2" weight="bold">Unit Price (IOTA) *</Text>
              <TextField.Root
                type="number"
                placeholder="e.g. 10.5"
                min="0"
                step="any"
                value={priceIota}
                onChange={e => setPriceIota(e.target.value)}
              />
            </Flex>
            <Flex direction="column" gap="1" style={{ flex: 1 }}>
              <Text size="2" weight="bold">Quantity *</Text>
              <TextField.Root
                type="number"
                placeholder="e.g. 5"
                min="1"
                step="1"
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
              />
            </Flex>
          </Flex>

          {priceIota && quantity && !isNaN(parseFloat(priceIota)) && !isNaN(parseInt(quantity)) && (
            <Text size="2" color="gray">
              Total: {(parseFloat(priceIota) * parseInt(quantity)).toFixed(4)} IOTA
            </Text>
          )}

          {error && (
            <Callout.Root color="red">
              <Callout.Text>{error}</Callout.Text>
            </Callout.Root>
          )}

          <Button type="submit" disabled={loading} size="3">
            {loading ? 'Creating Order…' : 'Create Order'}
          </Button>
        </Flex>
      </form>
    </Box>
  );
}

import { Badge } from '@radix-ui/themes';
import { ORDER_STATES, type OrderState } from '../constants';

const COLOR_MAP: Record<OrderState, 'blue' | 'green' | 'red' | 'gold'> = {
  0: 'blue',
  1: 'green',
  2: 'red',
  3: 'gold',
};

interface Props {
  state: OrderState;
}

export function StatusBadge({ state }: Props) {
  return (
    <Badge color={COLOR_MAP[state]} variant="soft" radius="full">
      {ORDER_STATES[state]}
    </Badge>
  );
}

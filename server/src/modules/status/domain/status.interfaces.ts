import type { StatusType } from '@/status/dtos/status.dto.js';

export interface StatusProps {
  id: number;
  title: string;
  storeId: number | null;
  type: StatusType;
  order: number;
}

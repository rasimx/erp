import type { StatusType } from '@/status/dtos/status.dto.js';

export interface CreateStatusProps {
  id: number;
  title: string;
  storeId: number | null;
  type: StatusType;
  order: number;
}

export interface StatusProps {
  id: number;
  title: string;
  storeId: number | null;
  type: StatusType;
  order: number;

  revision?: number;
}

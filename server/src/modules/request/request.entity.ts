import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'request' })
export class RequestEntity {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({
    type: 'integer',
    default: () => "(current_setting('rls.user_id'))",
  })
  userId: number;

  @CreateDateColumn()
  createdAt: Date;
}

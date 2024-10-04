import { Column, CreateDateColumn, PrimaryGeneratedColumn } from 'typeorm';

// @Entity({ name: 'event' })
export class BaseEvent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid' })
  eventId: string;

  @Column({
    type: 'integer',
    default: () => "(current_setting('rls.user_id'))",
  })
  userId: number;

  @Column()
  revision: number;

  @Column()
  aggregateId: number;

  @CreateDateColumn()
  createdAt: Date;
}

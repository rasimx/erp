import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

export enum StatusType {
  custom = 'custom',
  ozon = 'ozon',
  wb = 'wb',
}

@Entity({ name: 'status' })
@Unique(['accountId', 'type'])
export class StatusEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({
    type: 'enum',
    enum: StatusType,
    default: StatusType.custom,
  })
  type: StatusType;

  @Column('int', { nullable: true })
  accountId: number | null;

  @Column({
    type: 'int',
    default: () => "current_setting('rls.user_id')::int",
  })
  userId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedDate: Date | null;
}

export type StateInsertEntity = Pick<StatusEntity, 'title'>;

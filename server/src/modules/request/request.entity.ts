import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
  type Relation,
  RelationId,
} from 'typeorm';

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

  @OneToOne(() => RequestEntity, entity => entity.rollbackTarget)
  rollback: Relation<RequestEntity> | null;

  @OneToOne(() => RequestEntity)
  @JoinColumn()
  rollbackTarget: RequestEntity | null;

  @RelationId((entity: RequestEntity) => entity.rollbackTarget)
  @Column({ type: 'uuid', nullable: true })
  rollbackTargetId: string | null;
}

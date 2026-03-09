import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('balance_records')
@Index(['datetime', 'category', 'type'], { unique: true })
export class BalanceRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'timestamptz' })
  datetime: Date;

  @Column()
  category: string;

  @Column()
  type: string;

  @Column({ type: 'decimal', precision: 18, scale: 4 })
  value: number;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  percentage: number | null;

  @Column({ nullable: true })
  color: string | null;

  @CreateDateColumn()
  createdAt: Date;
}

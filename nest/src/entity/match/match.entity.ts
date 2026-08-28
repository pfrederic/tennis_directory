import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { Player } from '../player/player.entity'

@Entity()
export class Match {
  @PrimaryGeneratedColumn()
  id!: number

  @ManyToOne(() => Player, player => player.id, {
    nullable: false,
    onDelete: 'NO ACTION',
  })
  @JoinColumn({ name: 'player_id' })
  player_id!: number

  @Column()
  is_winning!: boolean

  @Column()
  date!: Date
}

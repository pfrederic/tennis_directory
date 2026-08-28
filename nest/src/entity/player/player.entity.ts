import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { Sex } from '@/types/common'
import { Country } from '@/entity/country/country.entity'

@Entity()
export class Player {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  birthday: Date

  @ManyToOne(() => Country, country => country.id, {
    nullable: false,
    onDelete: 'NO ACTION',
  })
  @JoinColumn({ name: 'country_id' })
  country: Country

  @Column()
  firstname: string

  @Column()
  height: number

  @Column()
  lastname: string

  @Column({ type: 'varchar', nullable: true })
  picture: string | null

  @Column()
  points: number

  @Column({
    type: 'enum',
    enum: Sex,
    default: Sex.O,
  })
  sex: Sex

  @Column()
  shortname: string

  @Column()
  weight: number
}

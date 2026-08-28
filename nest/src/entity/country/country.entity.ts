import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
export class Country {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({
    type: 'varchar',
    nullable: true,
  })
  picture!: string | null

  @Column()
  code!: string
}

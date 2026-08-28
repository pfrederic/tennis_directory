import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm'

export class InitDb1786045103101 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'country',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          { name: 'picture', type: 'varchar', isNullable: true },
          { name: 'code', type: 'varchar' },
        ],
      }),
    )

    await queryRunner.createTable(
      new Table({
        name: 'player',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          { name: 'firstname', type: 'varchar' },
          { name: 'lastname', type: 'varchar' },
          { name: 'shortname', type: 'varchar' },
          { name: 'sex', type: 'enum', enum: ['M', 'F', 'O'], default: "'O'" },
          { name: 'picture', type: 'varchar', isNullable: true },
          { name: 'birthday', type: 'date' },
          { name: 'weight', type: 'int' },
          { name: 'height', type: 'int' },
          { name: 'country_id', type: 'int' },
          { name: 'points', type: 'int' },
        ],
      }),
    )

    await queryRunner.createForeignKey(
      'player',
      new TableForeignKey({
        columnNames: ['country_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'country',
      }),
    )

    await queryRunner.createTable(
      new Table({
        name: 'match',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          { name: 'player_id', type: 'int' },
          { name: 'is_winning', type: 'boolean' },
          { name: 'date', type: 'date' },
        ],
      }),
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('player')
    await queryRunner.dropTable('country')
    await queryRunner.dropTable('match')
  }
}

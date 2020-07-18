import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export default class AlterValueColumnTypeFromNumericToReal1595098406091
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      'transactions',
      'value',
      new TableColumn({ name: 'value', type: 'real' }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      'transactions',
      'value',
      new TableColumn({ name: 'value', type: 'numeric' }),
    );
  }
}

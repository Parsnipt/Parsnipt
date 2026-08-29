import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('extractions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable();
    table.foreign('user_id').references('users.id').onDelete('CASCADE');
    table.string('file_name', 255).notNullable();
    table.integer('file_size_bytes').notNullable();
    table.enum('status', ['pending', 'processing', 'completed', 'failed']).notNullable().defaultTo('pending');
    table.jsonb('extraction_results').nullable();
    table.text('error').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.index('user_id');
    table.index('status');
    table.index('created_at');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('extractions');
}
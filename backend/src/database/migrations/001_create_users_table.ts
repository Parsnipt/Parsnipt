import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('users', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('email', 255).unique().notNullable();
    table.string('password_hash', 255).notNullable();
    table.string('name', 255).notNullable();
    table.enum('tier', ['free', 'pro', 'enterprise']).notNullable().defaultTo('free');
    
    // Email Verification Columns
    table.boolean('is_verified').notNullable().defaultTo(false);
    table.string('verification_token', 255).nullable();
    
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.index('email');
    table.index('tier');
    table.index('created_at');
    table.index('verification_token'); // Indexed for fast token lookups
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('users');
}
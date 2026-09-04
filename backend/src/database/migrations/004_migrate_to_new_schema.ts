/**
 * Database migration to update extractions table schema
 */

import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Add new columns to extractions table
  await knex.schema.alterTable('extractions', (table) => {
    // Basic fields
    table.string('kind', 50).defaultTo('function');
    table.string('role', 100).defaultTo('utility');
    table.string('fingerprint', 64).unique();

    // Documentation
    table.json('documentation').nullable();

    // Hierarchy
    table.uuid('parent_id').nullable().references('id').inTable('extractions');
    table.integer('scope_depth').defaultTo(0);

    // Syntax
    table.boolean('syntax_is_async').defaultTo(false);
    table.boolean('syntax_is_arrow').defaultTo(false);
    table.boolean('syntax_is_generator').defaultTo(false);
    table.string('syntax_visibility', 50).defaultTo('public');
    table.string('syntax_export_type', 50).defaultTo('none');

    // Interface
    table.json('parameters').defaultTo('[]');
    table.json('returns').nullable();

    // Analysis
    table.string('analysis_complexity', 50).defaultTo('simple');
    table.integer('analysis_cyclomatic').defaultTo(1);
    table.integer('analysis_nesting_depth').defaultTo(0);
    table.integer('analysis_branch_count').defaultTo(0);
    table.integer('analysis_loop_count').defaultTo(0);
    table.integer('analysis_call_count').defaultTo(0);

    // Relationships
    table.json('relationships').nullable();

    // Confidence
    table.json('confidence').nullable();

    // Source metadata
    table.integer('source_start_column').nullable();
    table.integer('source_end_column').nullable();

    // Add indexes
    table.index(['kind']);
    table.index(['role']);
    table.index(['parent_id']);
    table.index(['scope_depth']);
    table.index(['analysis_complexity']);
    table.index(['fingerprint']);
  });

  // Create new table for child relationships
  await knex.schema.createTable('artifact_relationships', (table) => {
    table.uuid('id').primary();
    table.uuid('parent_id').notNullable().references('id').inTable('extractions').onDelete('CASCADE');
    table.uuid('child_id').notNullable().references('id').inTable('extractions').onDelete('CASCADE');
    table.string('relationship_type', 50); // 'contains', 'calls', 'references', etc.
    table.timestamps(true, true);

    table.index(['parent_id']);
    table.index(['child_id']);
    table.unique(['parent_id', 'child_id', 'relationship_type']);
  });

  // Create table for scope tracking
  await knex.schema.createTable('artifact_scopes', (table) => {
    table.uuid('id').primary();
    table.uuid('artifact_id').notNullable().references('id').inTable('extractions').onDelete('CASCADE');
    table.integer('depth').notNullable();
    table.uuid('parent_id').nullable().references('id').inTable('extractions').onDelete('SET NULL');
    table.string('scope_type', 50); // 'function', 'class', 'block', etc.
    table.timestamps(true, true);

    table.index(['artifact_id']);
    table.index(['parent_id']);
    table.index(['depth']);
  });
}

export async function down(knex: Knex): Promise<void> {
  // Drop new tables
  await knex.schema.dropTableIfExists('artifact_scopes');
  await knex.schema.dropTableIfExists('artifact_relationships');

  // Remove new columns
  await knex.schema.alterTable('extractions', (table) => {
    table.dropColumn('kind');
    table.dropColumn('role');
    table.dropColumn('fingerprint');
    table.dropColumn('documentation');
    table.dropColumn('parent_id');
    table.dropColumn('scope_depth');
    table.dropColumn('syntax_is_async');
    table.dropColumn('syntax_is_arrow');
    table.dropColumn('syntax_is_generator');
    table.dropColumn('syntax_visibility');
    table.dropColumn('syntax_export_type');
    table.dropColumn('parameters');
    table.dropColumn('returns');
    table.dropColumn('analysis_complexity');
    table.dropColumn('analysis_cyclomatic');
    table.dropColumn('analysis_nesting_depth');
    table.dropColumn('analysis_branch_count');
    table.dropColumn('analysis_loop_count');
    table.dropColumn('analysis_call_count');
    table.dropColumn('relationships');
    table.dropColumn('confidence');
    table.dropColumn('source_start_column');
    table.dropColumn('source_end_column');
  });
}
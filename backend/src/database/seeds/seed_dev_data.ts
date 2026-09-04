/**
 * Development seed data
 */

import type { Knex } from 'knex';
import bcryptjs from 'bcryptjs';

export async function seed(knex: Knex): Promise<void> {
  // Delete existing data
  await knex('audit_logs').del();
  await knex('extractions').del();
  await knex('users').del();

  // Hash password
  const passwordHash = await bcryptjs.hash('Password123!', 10);

  // Insert test users
  await knex('users').insert([ 
    {
      id: '00000000-0000-0000-0000-000000000001',
      email: 'dev@example.com',
      password_hash: passwordHash,
      name: 'Development User',
      tier: 'pro',      
    },
    {
      id: '00000000-0000-0000-0000-000000000002',
      email: 'free@example.com',
      password_hash: passwordHash,
      name: 'Free Tier User',
      tier: 'free',      
    },
    {
      id: '00000000-0000-0000-0000-000000000003',
      email: 'enterprise@example.com',
      password_hash: passwordHash,
      name: 'Enterprise User',
      tier: 'enterprise',
    },
  ]);

  // Insert test extractions
  await knex('extractions').insert([
    {
      id: '10000000-0000-0000-0000-000000000001',
      user_id: '00000000-0000-0000-0000-000000000001',
      file_name: 'example.js',
      file_size_bytes: 1024,
      status: 'completed',
      extraction_results: JSON.stringify({ 
        functions: [
          {
            id: 'func-1',
            name: 'greet',
            type: 'function',
            code: 'function greet(name) { return `Hello, ${name}!`; }',
            startLine: 1,
            endLine: 3,
            lineCount: 3,
            complexity: 'simple',
            confidence: 0.95,
            metadata: {
              parameters: [{ name: 'name', hasDefault: false }],
              returnType: 'string',
              isAsync: false,
              isArrow: false,
              isExported: false,
            },
          },
        ],
        components: [],
        utilities: [],
        constants: [],
        summary: {
          totalItems: 1,
          processingTimeMs: 150,
        },
      }),
    },
  ]);

  // Insert audit logs
  await knex('audit_logs').insert([
    {
      id: '20000000-0000-0000-0000-000000000001',
      user_id: '00000000-0000-0000-0000-000000000001',
      action: 'login',
      resource_type: 'user',
      resource_id: '00000000-0000-0000-0000-000000000001',
      ip_address: '127.0.0.1',
      user_agent: 'Mozilla/5.0...',
      details: JSON.stringify({ timestamp: new Date().toISOString() }),
    },
  ]);

  console.log('✓ Seed data inserted');
}
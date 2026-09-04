/**
 * Script to migrate existing extraction data from old format to new format
 * 
 * Usage: npm run migrate:extractions
 */

import db from '../src/config/database.js';
import crypto from 'crypto';

interface OldExtraction {
  id: string;
  name: string;
  type: string;
  code: string;
  startLine: number;
  endLine: number;
  lineCount: number;
  complexity: string;
  confidence: number;
  parameters?: string;
  isArrow?: boolean;
  isExported?: boolean;
}

async function migrateExtractions() {
  console.log('Starting extraction migration...');

  try {
    // Get all existing extractions
    const extractions = await db('extractions').select('*');
    console.log(`Found ${extractions.length} extractions to migrate`);

    let migrated = 0;
    let failed = 0;

    for (const extraction of extractions) {
      try {
        // Parse old parameters if present
        let parameters = [];
        if (extraction.parameters) {
          try {
            parameters = JSON.parse(extraction.parameters);
          } catch (e) {
            parameters = [];
          }
        }

        // Determine kind from type
        const kind = mapOldTypeToKind(extraction.type, extraction.isArrow);
        
        // Infer role
        const role = inferRole(extraction.name, extraction.type);

        // Calculate fingerprint natively
        const fingerprint = crypto.createHash('sha256').update(extraction.code || '').digest('hex');

        // Prepare update data
        const updateData = {
          kind,
          role,
          fingerprint,
          documentation: JSON.stringify({ leading: [], inline: [], trailing: [] }),
          parent_id: null,
          scope_depth: 0,
          syntax_is_async: false,
          syntax_is_arrow: extraction.isArrow || false,
          syntax_is_generator: false,
          syntax_visibility: 'public',
          syntax_export_type: extraction.isExported ? 'named' : 'none',
          parameters: JSON.stringify(parameters),
          returns: JSON.stringify({ present: false, count: 0, expressions: [], isAsync: false, isGenerator: false }),
          analysis_complexity: extraction.complexity,
          analysis_cyclomatic: 1,
          analysis_nesting_depth: 0,
          analysis_branch_count: 0,
          analysis_loop_count: 0,
          analysis_call_count: 0,
          relationships: JSON.stringify({ calls: [], calledBy: [], references: [], referencedBy: [], imports: [], exports: [], children: [] }),
          confidence: JSON.stringify({
            overall: extraction.confidence,
            classification: extraction.confidence,
            location: 1.0,
            parameters: 0.9,
            returns: 0.8,
            analysis: 0.85
          })
        };

        // Update extraction
        await db('extractions').where('id', extraction.id).update(updateData);
        migrated++;
        
      } catch (error) {
        failed++;
        console.error(`  Failed to migrate extraction ${extraction.id}:`, error);
      }
    }

    console.log(`\nMigration complete!`);
    console.log(`  Migrated: ${migrated}`);
    console.log(`  Failed: ${failed}`);

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

function mapOldTypeToKind(type: string, isArrow?: boolean): string {
  const lowerType = type?.toLowerCase() || '';
  if (lowerType === 'constant') return 'constant';
  if (lowerType === 'component') return 'component';
  if (lowerType === 'class') return 'class';
  if (lowerType === 'method') return 'method';
  if (lowerType === 'utility' || lowerType === 'function') {
    return isArrow ? 'arrow-function' : 'function';
  }
  return 'variable';
}

function inferRole(name: string, type: string): string {
  const lowerName = name?.toLowerCase() || '';
  const lowerType = type?.toLowerCase() || '';

  if (lowerType === 'component') return 'rendering';
  if (lowerType === 'constant') return 'configuration';
  if (lowerName.includes('validate') || lowerName.includes('check')) return 'validation';
  if (lowerName.includes('config')) return 'configuration';
  if (lowerName.includes('render') || lowerName.includes('display')) return 'rendering';
  if (lowerName.includes('fetch') || lowerName.includes('request')) return 'networking';
  if (lowerName.includes('encrypt') || lowerName.includes('hash')) return 'security';
  if (lowerName.includes('format') || lowerName.includes('parse')) return 'data-processing';
  if (lowerName.includes('init') || lowerName.includes('setup')) return 'initialization';

  return 'utility';
}

migrateExtractions().catch(console.error);
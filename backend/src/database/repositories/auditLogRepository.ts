/**
 * Audit log repository for database operations
 */

import knex from '../../config/database.js';
import logger from '../../utils/logger.js';

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, unknown>;
  createdAt: string;
}

export class AuditLogRepository {
  /**
   * Create audit log entry
   */
  static async create(auditLog: Omit<AuditLog, 'id' | 'createdAt'>): Promise<AuditLog> {
    try {
      const result = await knex('audit_logs')
        .insert({
          user_id: auditLog.userId,
          action: auditLog.action,
          resource_type: auditLog.resourceType,
          resource_id: auditLog.resourceId || null,
          ip_address: auditLog.ipAddress || null,
          user_agent: auditLog.userAgent || null,
          details: auditLog.details || null,
        })
        .returning('*');

      const dbLog = result[0];

      return this.mapDbToAuditLog(dbLog);
    } catch (error) {
      logger.error(`Failed to create audit log: ${error}`);
      throw error;
    }
  }

  /**
   * Find logs for user
   */
  static async findByUserId(
    userId: string,
    limit: number = 100
  ): Promise<AuditLog[]> {
    try {
      const logs = await knex('audit_logs')
        .where('user_id', userId)
        .orderBy('created_at', 'desc')
        .limit(limit);

      return logs.map(this.mapDbToAuditLog);
    } catch (error) {
      logger.error(`Failed to find audit logs: ${error}`);
      throw error;
    }
  }

  /**
   * Find logs by action
   */
  static async findByAction(action: string, limit: number = 100): Promise<AuditLog[]> {
    try {
      const logs = await knex('audit_logs')
        .where('action', action)
        .orderBy('created_at', 'desc')
        .limit(limit);

      return logs.map(this.mapDbToAuditLog);
    } catch (error) {
      logger.error(`Failed to find logs by action: ${error}`);
      throw error;
    }
  }

  /**
   * Map database record to AuditLog type
   */
  private static mapDbToAuditLog(dbRecord: any): AuditLog {
    return {
      id: dbRecord.id,
      userId: dbRecord.user_id,
      action: dbRecord.action,
      resourceType: dbRecord.resource_type,
      resourceId: dbRecord.resource_id,
      ipAddress: dbRecord.ip_address,
      userAgent: dbRecord.user_agent,
      details: dbRecord.details,
      createdAt: dbRecord.created_at.toISOString(),
    };
  }
}

export default AuditLogRepository;
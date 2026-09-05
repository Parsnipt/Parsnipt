/**
 * Extraction service
 * Handles all extraction-related API calls
 */

import { AxiosProgressEvent } from 'axios';
import apiClient from './api';
import {
  DbExtraction,
  ExtractionListResponse,
  ExtractionUploadResponse,
  FileAnalysis
} from '../types/extraction';

export interface ExtractionDetailResponse {
  success: boolean;
  data: DbExtraction;
  timestamp?: string;
}

export const extractionService = {
  /**
   * Upload a file for extraction
   * POST /api/v1/extractions
   */
  async uploadFile(
    file: File,
    onUploadProgress?: (progressEvent: AxiosProgressEvent) => void
  ): Promise<FileAnalysis> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiClient.post<ExtractionUploadResponse>(
        '/extractions',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress,
        }
      );

      if (response.data.success) {
        return response.data.data; 
      }

      throw new Error('Upload response was not successful');
    } catch (error) {
      if (error instanceof Error) {
        const axiosError = error as any;
        if (axiosError.response?.data?.error?.message) {
          throw new Error(axiosError.response.data.error.message);
        }
        throw error;
      }
      throw new Error('File upload failed');
    }
  },

  /**
   * Get all extractions for the current user
   * GET /api/v1/extractions
   */
  async getExtractions(): Promise<DbExtraction[]> {
    try {
      const response = await apiClient.get<ExtractionListResponse>('/extractions');

      if (response.data.success) {
        return response.data.data;
      }

      throw new Error('Failed to fetch extractions');
    } catch (error) {
      if (error instanceof Error) {
        const axiosError = error as any;
        if (axiosError.response?.data?.error?.message) {
          throw new Error(axiosError.response.data.error.message);
        }
        throw error;
      }
      throw new Error('Failed to fetch extractions');
    }
  },

  /**
   * Get a specific extraction by ID
   * GET /api/v1/extractions/:id
   */
  async getExtraction(extractionId: string): Promise<DbExtraction> {
    try {
      const response = await apiClient.get<ExtractionDetailResponse>(
        `/extractions/${extractionId}`
      );

      if (response.data.success) {
        return response.data.data;
      }

      throw new Error('Failed to fetch extraction details');
    } catch (error) {
      if (error instanceof Error) {
        const axiosError = error as any;
        if (axiosError.response?.data?.error?.message) {
          throw new Error(axiosError.response.data.error.message);
        }
        throw error;
      }
      throw new Error('Failed to fetch extraction details');
    }
  },

  /**
   * Delete an extraction
   * DELETE /api/v1/extractions/:id
   */
  async deleteExtraction(extractionId: string): Promise<void> {
    try {
      const response = await apiClient.delete(`/extractions/${extractionId}`);

      if (!response.data.success) {
        throw new Error('Failed to delete extraction');
      }
    } catch (error) {
      if (error instanceof Error) {
        const axiosError = error as any;
        if (axiosError.response?.data?.error?.message) {
          throw new Error(axiosError.response.data.error.message);
        }
        throw error;
      }
      throw new Error('Failed to delete extraction');
    }
  },

  /**
   * Poll an extraction to check its status (Legacy fallback)
   */
  async pollExtractionStatus(
    extractionId: string,
  ): Promise<DbExtraction> {    
    return this.getExtraction(extractionId);
  }
};

export default extractionService;
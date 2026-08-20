/**
 * Extraction service
 * Handles all extraction-related API calls
 */

import { AxiosProgressEvent } from 'axios';
import apiClient from './api';
import {
  Extraction,
  ExtractionListResponse,
  ExtractionDetailResponse,
} from '../types/extraction';

export const extractionService = {
  /**
   * Upload a file for extraction
   * POST /api/v1/extractions
   */
  async uploadFile(
    file: File,
    onUploadProgress?: (progressEvent: AxiosProgressEvent) => void
  ): Promise<Extraction> {
    try {
      // Create FormData for multipart file upload
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiClient.post<{ success: boolean; data: Extraction }>(
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
      // Extract error message from API response or use generic message
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
  async getExtractions(): Promise<Extraction[]> {
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
  async getExtraction(extractionId: string): Promise<Extraction> {
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
   * Poll an extraction to check its status
   * GET /api/v1/extractions/:id
   */
  async pollExtractionStatus(
    extractionId: string,
    maxAttempts: number = 30,
    intervalMs: number = 1000
  ): Promise<Extraction> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const extraction = await this.getExtraction(extractionId);

      // If processing is complete, return
      if (extraction.status === 'completed' || extraction.status === 'failed') {
        return extraction;
      }

      // Wait before next attempt
      if (attempt < maxAttempts - 1) {
        await new Promise((resolve) => setTimeout(resolve, intervalMs));
      }
    }

    throw new Error('Extraction processing timed out');
  },
};

export default extractionService;
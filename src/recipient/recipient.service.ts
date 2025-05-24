import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosInstance, AxiosResponse } from 'axios';
import { RecipientDto } from '../common/dtos/recipient.dto';
import { createConfiguredAxiosInstance } from '../common/utils/axios-config.util';

@Injectable()
export class RecipientService {
  private readonly logger = new Logger(RecipientService.name);
  private readonly axios: AxiosInstance;

  constructor(private readonly configService: ConfigService) {
    const baseURL = this.configService.get<string>('RECIPIENT_API_URL');

    if (!baseURL) {
      throw new Error('RECIPIENT_API_URL is not defined in configuration.');
    }
    this.axios = createConfiguredAxiosInstance(
      RecipientService.name,
      baseURL,
      this.logger,
    );
  }

  async getRecipients(): Promise<RecipientDto[]> {
    try {
      const response: AxiosResponse<RecipientDto[]> =
        await this.axios.get('/notifications');
      return response.data;
    } catch (e) {
      this.logger.error(
        `Fetching recipients failed after retries`,
        e.stack || e.message,
      );
      throw e;
    }
  }
  async getRecipientById(id: string): Promise<RecipientDto> {
    try {
      const response: AxiosResponse<RecipientDto> = await this.axios.get(
        `/notifications/${id}`,
      );
      return response.data;
    } catch (e) {
      this.logger.error(
        `Fetching recipients by ${id} failed after retries`,
        e.stack || e.message,
      );
      throw e;
    }
  }
}

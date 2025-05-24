import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosInstance, AxiosResponse } from 'axios';
import { DomainDto } from '../common/dtos/domain.dto';
import { createConfiguredAxiosInstance } from '../common/utils/axios-config.util';

@Injectable()
export class DomainService {
  private readonly logger = new Logger(DomainService.name);
  private readonly axios: AxiosInstance;
  constructor(private readonly configService: ConfigService) {
    const baseURL = this.configService.get<string>('DOMAIN_API_URL');

    if (!baseURL) {
      throw new Error('DOMAIN_API_URL is not defined in configuration.');
    }
    this.axios = createConfiguredAxiosInstance(
      DomainService.name,
      baseURL,
      this.logger,
    );
  }

  async getDomainById(id: string): Promise<DomainDto> {
    try {
      const response: AxiosResponse<DomainDto> = await this.axios.get(
        `/domains/${id}`,
      );
      return response.data;
    } catch (e) {
      this.logger.error(
        `Fetching domains by ${id} failed after retries`,
        e.stack || e.message,
      );
      throw e;
    }
  }
}

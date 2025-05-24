import { IsString, IsUUID } from 'class-validator';

export class DomainDto {
  @IsUUID()
  id: string;

  @IsString()
  name: string; // e.g., 'example.com'

  @IsString()
  description: string; // Optional metadata
}

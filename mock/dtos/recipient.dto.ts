import {
  IsEmail,
  IsIn,
  IsString,
  ArrayMinSize,
  IsUUID,
  IsOptional,
} from 'class-validator';

export type PreferredChannel = 'email' | 'webhook';

export class RecipientDto {
  @IsUUID()
  id: string;

  @IsEmail()
  email: string;

  @IsString()
  timezone: string; // e.g., 'America/New_York', 'Europe/Paris'

  @IsIn(['email', 'webhook'])
  preferredChannel: PreferredChannel;

  @IsString()
  @IsOptional()
  callbackUrl?: string;

  @IsString({ each: true })
  @ArrayMinSize(1)
  associatedDomains: string[]; // List of domain IDs
}

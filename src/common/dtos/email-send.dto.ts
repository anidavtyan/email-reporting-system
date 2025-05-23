import {
  IsEmail,
  IsString,
  IsOptional,
  IsNotEmpty,
  IsBase64,
} from 'class-validator';

export class EmailSendRequestDto {
  @IsEmail()
  to: string;

  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsString()
  @IsNotEmpty()
  bodyText: string;

  @IsOptional()
  attachmentPdfBuffer?: Buffer;

  @IsOptional()
  @IsString() // If sending via URL (future consideration)
  attachmentPdfUrl?: string;

  @IsString()
  @IsOptional()
  bodyHtml?: string;
}

import { IsArray, IsString, ValidateIf } from 'class-validator';

export class AdminAllowedProvidersDto {
  // null allows the organization to connect every provider
  @ValidateIf((o) => o.providers !== null)
  @IsArray()
  @IsString({ each: true })
  providers: string[] | null;
}

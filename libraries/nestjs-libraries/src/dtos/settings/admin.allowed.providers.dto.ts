import { IsArray, IsOptional, IsString } from 'class-validator';

export class AdminAllowedProvidersDto {
  // null allows the organization to connect every provider
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  providers: string[] | null;
}

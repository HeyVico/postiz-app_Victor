import { IsDefined, IsString, MaxLength, MinLength } from 'class-validator';

export class AdminCreateOrganizationDto {
  @IsDefined()
  @IsString()
  @MinLength(3)
  @MaxLength(128)
  name: string;
}

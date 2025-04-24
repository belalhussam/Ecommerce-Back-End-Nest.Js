import { PartialType } from '@nestjs/mapped-types';
import { SignInDto } from './create-auth.dto';

export class UpdateUserhDto extends PartialType(SignInDto) {}

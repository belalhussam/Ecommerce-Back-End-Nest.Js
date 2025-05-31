import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ValidationPipe,
  UseGuards,
  Req,
  Query,
  UseFilters,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from './guard/Auth.guard';
import { Roles } from './decorator/role-decorator';
import { I18n, I18nContext, I18nValidationExceptionFilter } from 'nestjs-i18n';

@Controller('user')
@UseGuards(AuthGuard)
@UseFilters(new I18nValidationExceptionFilter())
export class UserController {
  constructor(private readonly userService: UserService) {}
  // @dec Admin Can Create User
  // @Route Post api/v1/user
  // @access Private[admin]
  @Post()
  @Roles(['admin'])
  create(
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    createUserDto: CreateUserDto,
    @I18n() i18n: I18nContext,
  ) {
    return this.userService.createUser(createUserDto, i18n);
  }
  // @dec Admin Can get User
  // @Route get api/v1/user
  // @access Private[admin]
  @Get()
  @Roles(['admin'])
  getAllUser(@Query() query, @I18n() i18n: I18nContext) {
    return this.userService.findAllUsers(query, i18n);
  }
  // @dec Admin Can get User
  // @Route get api/v1/user
  // @access Private[admin]
  @Get(':id')
  @Roles(['admin'])
  getSpecificUser(@Param('id') id: string, @I18n() i18n: I18nContext) {
    return this.userService.findOne(id, i18n);
  }
  // @dec Admin Can Create User
  // @Route update api/v1/user
  // @access Private[admin]
  @Patch(':id')
  @Roles(['admin'])
  updateUser(
    @Param('id') id: string,
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    updateUserDto: UpdateUserDto,
    @I18n() i18n: I18nContext,
  ) {
    return this.userService.update(id, updateUserDto, i18n);
  }
  // @dec Admin Can delete User
  // @Route Delete api/v1/user
  // @access Private[admin]
  @Delete(':id')
  @Roles(['admin'])
  deleteUser(@Param('id') id: string, @I18n() i18n: I18nContext) {
    return this.userService.delete(id, i18n);
  }
}
@Controller('userMe')
@UseGuards(AuthGuard)
export class UserMeController {
  constructor(private userService: UserService) {}
  // @dec user and user Can find User
  // @Route find api/v1/user
  // @access public[user,admin]
  @Get()
  @Roles(['user', 'admin'])
  getUserMe(@Req() req, @I18n() i18n: I18nContext) {
    return this.userService.getUserMe(req.user, i18n);
  }
  // @dec user and user Can find User
  // @Route update api/v1/user
  // @access public[user,admin]
  @Patch()
  @Roles(['user', 'admin'])
  updayeUserMe(
    @Req() req,
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    UpdateUserDto: UpdateUserDto,
    @I18n() i18n: I18nContext,
  ) {
    return this.userService.updayeUserMe(req.user, UpdateUserDto, i18n);
  }
  // @dec user and user Can find User
  // @Route delete api/v1/user
  // @access public[user,admin]
  @Delete()
  @Roles(['user', 'admin'])
  deleteUserMe(@Req() req, @I18n() i18n: I18nContext) {
    return this.userService.deleteUserMe(req.user, i18n);
  }
}

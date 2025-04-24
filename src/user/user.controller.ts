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
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from './guard/Auth.guard';
import { Roles } from './decorator/role-decorator';
import path from 'path';

@Controller('user')
@UseGuards(AuthGuard)
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
  ) {
    return this.userService.createUser(createUserDto);
  }
  // @dec Admin Can get User
  // @Route get api/v1/user
  // @access Private[admin]
  @Get()
  @Roles(['admin'])
  getAllUser(@Query() query) {
    return this.userService.findAllUsers(query);
  }
  // @dec Admin Can get User
  // @Route get api/v1/user
  // @access Private[admin]
  @Get(':id')
  @Roles(['admin'])
  getSpecificUser(@Param('id') id: string) {
    return this.userService.findOne(id);
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
  ) {
    return this.userService.update(id, updateUserDto);
  }
  // @dec Admin Can delete User
  // @Route Delete api/v1/user
  // @access Private[admin]
  @Delete(':id')
  @Roles(['admin'])
  deleteUser(@Param('id') id: string) {
    return this.userService.delete(id);
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
  getUserMe(@Req() req) {
    return this.userService.getUserMe(req.user);
  }
  @Patch()
  @Roles(['user', 'admin'])
  updayeUserMe(
    @Req() req,
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    UpdateUserDto: UpdateUserDto,
  ) {
    return this.userService.updayeUserMe(req.user, UpdateUserDto);
  }
  @Delete()
  @Roles(['user', 'admin'])
  deleteUserMe(@Req() req) {
    return this.userService.deleteUserMe(req.user);
  }
}

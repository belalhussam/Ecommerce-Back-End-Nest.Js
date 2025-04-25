import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './user-schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import * as bcrypt from 'bcrypt';
@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}
  async createUser(createUserDto: CreateUserDto) {
    const ifUserExist = await this.userModel.findOne({
      email: createUserDto.email,
    });
    if (ifUserExist) {
      throw new HttpException('User already exist', 400);
    }
    const hashPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = {
      email: createUserDto.email,
      password: hashPassword,
      role: createUserDto.role ?? 'user',
      active: true,
    };
    return {
      status: 200,
      message: 'User Created successfully',
      data: await this.userModel.create({
        ...createUserDto,
        ...user,
      }),
    };
  }
  async findAllUsers(query) {
    const {
      limit = 1000_1000_100,
      skip = 0,
      sort = 'asc',
      name,
      email,
    } = query;
    if (Number.isNaN(Number(+limit))) {
      throw new HttpException('invalid limit', 400);
    }
    if (Number.isNaN(Number(+skip))) {
      throw new HttpException('invalid skip', 400);
    }
    if (!['asc', 'des'].includes(sort)) {
      throw new HttpException('invalid sort', 400);
    }
    const user = await this.userModel
      .find()
      .skip(skip)
      .limit(limit)
      .sort({ name: sort })
      .where({ name: new RegExp(name, 'i') })
      .where({ email: new RegExp(email, 'i') })
      .select('-password -__v')
      .exec();
    return {
      status: 200,
      count: user.length,
      data: user,
    };
  }
  async findOne(id: string) {
    const user = await this.userModel.findById(id).select('-password -__v');
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return { data: user };
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const userExist = await this.userModel.findById(id);
    if (!userExist) {
      throw new NotFoundException('User not found');
    }
    let user = {
      ...updateUserDto,
    };
    if (updateUserDto.password) {
      const password = await bcrypt.hash(updateUserDto.password, 10);
      user = {
        ...updateUserDto,
        password,
      };
    }
    return {
      status: 200,
      message: 'User updated successfully',
      data: await this.userModel
        .findByIdAndUpdate(id, user, {
          new: true,
        })
        .select('-password -__v'),
    };
  }
  async delete(id: string) {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.userModel.findByIdAndDelete(id);
    return {
      status: 200,
      message: 'User deleted successfully',
    };
  }
  async getUserMe(payload) {
    if (!payload._id) {
      throw new NotFoundException(400, 'User not found');
    }
    const user = await this.userModel
      .findById(payload._id)
      .select('-password -__v');
    if (!user) {
      throw new NotFoundException(400, 'User not found');
    }
    return {
      status: 200,
      message: 'User found',
      data: user,
    };
  }
  async updayeUserMe(payload, updateUserDto) {
    if (!payload._id) {
      throw new NotFoundException(400, 'User not found');
    }
    let user = {
      ...updateUserDto,
    };
    const password = await bcrypt.hash(updateUserDto.password, 10);
    const updateUser = await this.userModel
      .findByIdAndUpdate(payload._id, (user = { ...updateUserDto, password }), {
        new: true,
      })
      .select('-password -__v');
    if (!user) {
      throw new NotFoundException(400, 'User not found');
    }
    return {
      status: 200,
      message: 'User found',
      data: updateUser,
    };
  }
  async deleteUserMe(payload): Promise<void> {
    if (!payload._id) {
      throw new NotFoundException(400, 'User not found');
    }
    const user = await this.userModel.findById(payload._id, {
      active: false,
    });
    if (!user) {
      throw new NotFoundException(400, 'User not found');
    }
    await this.userModel.findByIdAndUpdate(payload._id, { active: false });
  }
}

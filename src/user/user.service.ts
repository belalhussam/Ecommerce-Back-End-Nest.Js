import { I18n, I18nContext } from 'nestjs-i18n';
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
  async createUser(createUserDto: CreateUserDto, i18n: I18nContext) {
    const ifUserExist = await this.userModel.findOne({
      email: createUserDto.email,
    });
    if (ifUserExist) {
      throw new HttpException(
        await i18n.t('service.ALREADY_EXIST', {
          args: { module_name: i18n.lang === 'en' ? 'User' : 'المستخدم' },
        }),
        400,
      );
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
      message: await i18n.t('service.CREATED_SUCCESS', {
        args: { module_name: i18n.lang === 'en' ? 'User' : 'المستخدم' },
      }),
      data: await this.userModel.create({
        ...createUserDto,
        ...user,
      }),
    };
  }
  async findAllUsers(query, i18n: I18nContext) {
    const {
      limit = 1000_1000_100,
      skip = 0,
      sort = 'asc',
      name,
      email,
    } = query;
    if (Number.isNaN(Number(+limit))) {
      throw new HttpException(
        await i18n.t('service.INVALID', { args: { invalid_name: 'limit' } }),
        400,
      );
    }

    if (Number.isNaN(Number(+skip))) {
      throw new HttpException(
        await i18n.t('service.INVALID', { args: { invalid_name: 'skip' } }),
        400,
      );
    }

    if (!['asc', 'desc'].includes(sort)) {
      throw new HttpException(
        await i18n.t('service.INVALID', { args: { invalid_name: 'sort' } }),
        400,
      );
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
      message: await i18n.t('service.FOUND_SUCCESS', {
        args: { found_name: i18n.lang === 'en' ? 'Users' : 'المستخدمين' },
      }),
      count: user.length,
      data: user,
    };
  }
  async findOne(id: string, i18n: I18nContext) {
    const user = await this.userModel.findById(id).select('-password -__v');
    if (!user) {
      throw new NotFoundException(
        await i18n.t('service.NOT_FOUND', {
          args: { not_found_name: i18n.lang === 'en' ? 'User' : 'المستخدم' },
        }),
      );
    }
    return { data: user };
  }

  async update(id: string, updateUserDto: UpdateUserDto, i18n: I18nContext) {
    const userExist = await this.userModel.findById(id);
    if (!userExist) {
      throw new NotFoundException(
        await i18n.t('service.NOT_FOUND', {
          args: { not_found_name: i18n.lang === 'en' ? 'User' : 'المستخدم' },
        }),
      );
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
      message: await i18n.t('service.UPDATED_SUCCESS', {
        args: { updated_name: i18n.lang === 'en' ? 'User' : 'المستخدم' },
      }),
      data: await this.userModel
        .findByIdAndUpdate(id, user, {
          new: true,
        })
        .select('-password -__v'),
    };
  }
  async delete(id: string, i18n: I18nContext) {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException(
        await i18n.t('service.NOT_FOUND', {
          args: { not_found_name: i18n.lang === 'en' ? 'User' : 'المستخدم' },
        }),
      );
    }
    await this.userModel.findByIdAndDelete(id);
    return {
      status: 200,
      message: await i18n.t('service.DELETED_SUCCESS', {
        args: { deleted_name: i18n.lang === 'en' ? 'User' : 'المستخدم' },
      }),
    };
  }
  async getUserMe(payload, i18n: I18nContext) {
    if (!payload._id) {
      throw new NotFoundException(
        await i18n.t('service.NOT_FOUND', {
          args: { not_found_name: i18n.lang === 'en' ? 'User' : 'المستخدم' },
        }),
      );
    }
    const user = await this.userModel
      .findById(payload._id)
      .select('-password -__v');
    if (!user) {
      throw new NotFoundException(
        await i18n.t('service.NOT_FOUND', {
          args: { not_found_name: i18n.lang === 'en' ? 'User' : 'المستخدم' },
        }),
      );
    }
    return {
      status: 200,
      message: await i18n.t('service.FOUND_SUCCESS', {
        args: { found_name: i18n.lang === 'en' ? 'User' : 'المستخدم' },
      }),
      data: user,
    };
  }
  async updayeUserMe(payload, updateUserDto: UpdateUserDto, i18n) {
    if (!payload._id) {
      throw new NotFoundException(
        await i18n.t('service.NOT_FOUND', {
          args: { not_found_name: i18n.lang === 'en' ? 'User' : 'المستخدم' },
        }),
      );
    }
    const user = await this.userModel
      .findById(payload._id)
      .select('-password -__v');
    if (!user) {
      throw new NotFoundException(
        await i18n.t('service.NOT_FOUND', {
          args: { not_found_name: i18n.lang === 'en' ? 'User' : 'المستخدم' },
        }),
      );
    }
    return {
      status: 200,
      message: await i18n.t('service.UPDATED_SUCCESS', {
        args: { updated_name: i18n.lang === 'en' ? 'User' : 'المستخدم' },
      }),
      data: await this.userModel
        .findByIdAndUpdate(payload._id, updateUserDto, {
          new: true,
        })
        .select('-password -__v'),
    };
  }
  async deleteUserMe(payload, i18n): Promise<void> {
    if (!payload._id) {
      throw new NotFoundException(
        await i18n.t('service.NOT_FOUND', {
          args: { not_found_name: i18n.lang === 'en' ? 'User' : 'المستخدم' },
        }),
      );
    }
    const user = await this.userModel
      .findById(payload._id)
      .select('-password -__v');
    if (!user) {
      throw new NotFoundException(
        await i18n.t('service.NOT_FOUND', {
          args: { not_found_name: i18n.lang === 'en' ? 'User' : 'المستخدم' },
        }),
      );
    }
    await this.userModel.findByIdAndUpdate(payload._id, { active: false });
  }
}

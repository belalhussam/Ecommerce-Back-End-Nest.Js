import { JwtService } from '@nestjs/jwt';
import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { SignInDto, SignUpDto } from './dto/create-auth.dto';
import { User } from 'src/user/user-schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private JwtService: JwtService,
  ) {}
  async signUp(signUpDto: SignUpDto) {
    const userExist = await this.userModel.findOne({ email: signUpDto.email });
    if (userExist) {
      throw new HttpException('User already exist', 400);
    }
    console.log(userExist);
    const password = await bcrypt.hash(signUpDto.password, 10);
    const userCreated = {
      password,
      active: true,
      role: 'user',
    };
    const user = await this.userModel.create({ ...signUpDto, ...userCreated });
    const payload = {
      _id: user._id,
      email: user.email,
      role: user.role,
    };
    const token = await this.JwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
    });

    return {
      status: 200,
      data: user,
      token: token,
    };
  }
  async signIn(signInDto: SignInDto) {
    const user = await this.userModel
      .findOne({ email: signInDto.email })
      .select('-__v');
    if (!user) {
      throw new HttpException('Invalid password or email', 400);
    }
    const isMatch = await bcrypt.compare(signInDto.password, user.password);
    if (!isMatch) {
      throw new HttpException('Invalid password or email', 400);
    }
    const payload = {
      _id: user._id,
      email: user.email,
      role: user.role,
    };
    const token = await this.JwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
    });
    return {
      status: 200,
      message: 'User logged in successfully',
      token: token,
    };
  }
}

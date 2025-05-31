import { JwtService } from '@nestjs/jwt';
import {
  HttpException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ResetPasswordDto,
  SignInDto,
  SignUpDto,
  VerfiyDto,
} from './dto/create-auth.dto';
import { User } from 'src/user/user-schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { MailerService } from '@nestjs-modules/mailer';
@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private JwtService: JwtService,
    private readonly mailService: MailerService,
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
    const access_token = await this.JwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
    });
    // create secret refresh token
    // create payload refresh token
    // create refresh token
    const refresh_token = await this.JwtService.signAsync(
      { ...payload, countEX: 5 },
      {
        secret: process.env.JWT_SECRET_REFRESH_TOKEN,
        expiresIn: '7d',
      },
    );
    return {
      status: 200,
      data: user,
      access_token: access_token,
      refresh_token: refresh_token,
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
    const access_token = await this.JwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
    });
    // create secret refresh token
    // create payload refresh token
    // create refresh token
    const refresh_token = await this.JwtService.signAsync(
      { ...payload, countEX: 5 },
      {
        secret: process.env.JWT_SECRET_REFRESH_TOKEN,
        expiresIn: '7d',
      },
    );
    return {
      status: 200,
      data: user,
      access_token: access_token,
      refresh_token: refresh_token,
    };
  }
  async resetPassword({ email }: ResetPasswordDto) {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new NotFoundException('User Not Found');
    }
    const code = Math.floor(Math.random() * 1000000)
      .toString()
      .padStart(6, '0');
    await this.userModel.findOneAndUpdate(
      { email },
      { verificationCode: code },
    );
    const htmlMessage = `
    <div>
      <h1>Forgot your password? If you didn't forget your password, please ignore this email!</h1>
      <p>Use the following code to verify your account: <h3 style="color: red; font-weight: bold; text-align: center">${code}</h3></p>
      <h6 style="font-weight: bold">Ecommerce-Nest.JS</h6>
    </div>
    `;

    await this.mailService.sendMail({
      from: `Ecommerce-Nest.JS <${process.env.EMAIL_USERNAME}>`,
      to: email,
      subject: `Ecommerce-Nest.JS - Reset Password`,
      html: htmlMessage,
    });
    return {
      status: 200,
      message: `Code sent successfully on your email (${email})`,
    };
  }
  async verifyCode(verifyCode: VerfiyDto) {
    const user = await this.userModel
      .findOne({ email: verifyCode.email })
      .select('verificationCode');

    if (!user) {
      throw new NotFoundException('User Not Found');
    }

    if (user.verificationCode !== verifyCode.code) {
      throw new UnauthorizedException('Invalid code');
    }

    await this.userModel.findOneAndUpdate(
      { email: verifyCode.email },
      { verificationCode: null },
    );

    return {
      status: 200,
      message: 'Code verified successfully, go to change your password',
    };
  }

  async changePassword(changePassword: SignInDto) {
    const user = await this.userModel.findOne({ email: changePassword.email });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const password = await bcrypt.hash(changePassword.password, 10);
    await this.userModel.findOneAndUpdate({ email: user.email }, { password });
    return {
      status: 200,
      message: 'Password changed successfully, go to login',
    };
  }
  async refreshToken(refreshToken) {
    const payload = await this.JwtService.verify(refreshToken, {
      secret: process.env.JWT_SECRET_REFRESH_TOKEN,
    });
    if (!payload || payload.countEX <= 0) {
      throw new UnauthorizedException(
        'Invalid refresh token, please go to sign in',
      );
    }
    const { exp, ...newPayload } = payload;
    const newPayoadForAccessToken = {
      _id: newPayload._id,
      email: newPayload.email,
      role: newPayload.role,
    };

    // create access token
    const access_token = await this.JwtService.signAsync(
      newPayoadForAccessToken,
      {
        secret: process.env.JWT_SECRET,
      },
    );
    const refresh_token = await this.JwtService.signAsync(
      { ...newPayload, countEx: payload.countEX - 1 },
      {
        secret: process.env.JWT_SECRET_REFRESH_TOKEN,
        expiresIn: '7d',
      },
    );
    return {
      status: 200,
      message: 'Refresh Access token successfully',
      access_token,
      refresh_token,
    };
  }
}

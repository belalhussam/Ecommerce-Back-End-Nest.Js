import { Controller, Post, Body, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  ResetPasswordDto,
  SignInDto,
  SignUpDto,
  VerfiyDto,
} from './dto/create-auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  //  @docs   Any User Can signUp
  //  @Route  POST /api/v1/auth/signUp
  //  @access Public
  @Post('signup')
  signUp(
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    signUpDto: SignUpDto,
  ) {
    return this.authService.signUp(signUpDto);
  }
  //  @docs   Any User Can signIn
  //  @Route  POST /api/v1/auth/signIn
  //  @access Public
  @Post('signin')
  signIn(
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    signInDto: SignInDto,
  ) {
    return this.authService.signIn(signInDto);
  }
  //  @docs   Any User Can resetPassword
  //  @Route  POST /api/v1/auth/resetPassword
  //  @access Public
  @Post('reset-password')
  resetPassword(
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    email: ResetPasswordDto,
  ) {
    return this.authService.resetPassword(email);
  }
  //  @docs   Any User Can Verify Code
  //  @Route  POST /api/v1/auth/verify-code
  //  @access Public
  @Post('verify-code')
  verifyCode(
    @Body(new ValidationPipe({ forbidNonWhitelisted: true }))
    verifyCode: VerfiyDto,
  ) {
    return this.authService.verifyCode(verifyCode);
  }
  //  @docs   Any User Can changePassword
  //  @Route  POST /api/v1/auth/changePassword
  //  @access Public
  @Post('change-password')
  changePassword(
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    changePassword: SignInDto,
  ) {
    return this.authService.changePassword(changePassword);
  }
}

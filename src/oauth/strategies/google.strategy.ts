import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, StrategyOptions } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      throw new Error('Google OAuth credentials are not defined');
    }
    const options: StrategyOptions = {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `http://localhost:4000/api/v1/auth/google/callback`,
      scope: ['profile', 'email'],
    };
    super(options);
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile) {
    const user = {
      accessToken,
      profile,
    };
    return user;
  }
}

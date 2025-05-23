import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { CategoryModule } from './category/category.module';
import { SubCategoryModule } from './sub-category/sub-category.module';
import { BrandModule } from './brand/brand.module';
import { CouponModule } from './coupon/coupon.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { RequestProductModule } from './request-product/request-product.module';
import { TaxModule } from './tax/tax.module';
import { ProductModule } from './product/product.module';
import { ReviewModule } from './review/review.module';
import { UploadFilesModule } from './upload-files/upload-files.module';
import { CartModule } from './cart/cart.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(`${process.env.DATABASE_URL}`),
    UserModule,
    AuthModule,
    MailerModule.forRoot({
      transport: {
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD,
        },
      },
    }),
    CategoryModule,
    SubCategoryModule,
    BrandModule,
    CouponModule,
    SuppliersModule,
    RequestProductModule,
    TaxModule,
    ProductModule,
    ReviewModule,
    UploadFilesModule,
    CartModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

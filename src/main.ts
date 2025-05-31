import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { I18nValidationPipe } from 'nestjs-i18n';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
    bodyParser: true,
  });
  app.setGlobalPrefix('/api/v1');
  app.useGlobalPipes(new I18nValidationPipe());
  // start Security
  app.use(helmet());
  app.enableCors({
    origin: ['https://ecommerce-nestjs.com', 'http://localhost:4000'],
  });
  // end Security
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

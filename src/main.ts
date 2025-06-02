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
    origin: true, // Allow all origins in development
    credentials: true,
  });
  // end Security
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();

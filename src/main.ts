import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { I18nValidationPipe } from 'nestjs-i18n';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
    bodyParser: true,
  });
  
  // Set global prefix
  app.setGlobalPrefix('api/v1');
  
  // Global pipes
  app.useGlobalPipes(new I18nValidationPipe());
  
  // Security
  app.use(helmet());
  app.enableCors({
    origin: true,
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  // Get port from environment variable or use default
  const port = process.env.PORT || 3000;
  
  // Start the server
  await app.listen(port);
  console.log(`Application is running on port ${port}`);
}

// Handle Vercel serverless environment
if (process.env.NODE_ENV !== 'production') {
  bootstrap();
}

// Export the bootstrap function for Vercel
export default bootstrap;

import 'dotenv/config';
import { createApp } from './serverless';

async function bootstrap() {
  const { nestApp } = await createApp();
  const port = process.env.PORT || 3001;
  await nestApp.listen(port);
  console.log(`🚀 Backend running on http://localhost:${port}/api/v1`);
}
bootstrap();

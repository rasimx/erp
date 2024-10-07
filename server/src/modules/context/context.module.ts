import { Global, Module } from '@nestjs/common';
import { ClsModule } from 'nestjs-cls';
import { v7 as uuidV7 } from 'uuid';

import { ContextService } from '@/context/context.service.js';

@Global()
@Module({
  imports: [
    ClsModule.forRoot({
      global: true,
      middleware: {
        mount: true,
        generateId: true,
        idGenerator: (req: Request) => req.headers['X-Request-Id'] ?? uuidV7(),
      },
    }),
  ],
  providers: [ContextService],
  exports: [ContextService],
})
export class ContextModule {}

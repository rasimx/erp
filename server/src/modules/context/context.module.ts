import { Global, Module } from '@nestjs/common';
import { ClsModule } from 'nestjs-cls';

import { ContextService } from '@/context/context.service.js';

@Global()
@Module({
  imports: [
    ClsModule.forRoot({
      global: true,
      middleware: { mount: true },
    }),
  ],
  providers: [ContextService],
  exports: [ContextService],
})
export class ContextModule {}

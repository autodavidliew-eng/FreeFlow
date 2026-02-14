import { Module } from '@nestjs/common';
import { MongoDatabaseModule, MongoModelsModule } from '@freeflow/db-mongo';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuditService } from './audit.service';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [MongoDatabaseModule.forRoot(), MongoModelsModule],
  controllers: [AppController, DashboardController],
  providers: [AppService, DashboardService, AuditService],
})
export class AppModule {}

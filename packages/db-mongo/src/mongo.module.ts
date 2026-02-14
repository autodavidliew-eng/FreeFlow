import { Module, type DynamicModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({})
export class MongoDatabaseModule {
  static forRoot(uri?: string): DynamicModule {
    const mongoUri = uri ?? process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('Missing MONGODB_URI');
    }

    return {
      module: MongoDatabaseModule,
      imports: [
        MongooseModule.forRoot(mongoUri, {
          appName: 'freeflow',
        }),
      ],
    };
  }
}

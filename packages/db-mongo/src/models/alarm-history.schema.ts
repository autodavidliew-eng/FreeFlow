import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';

export type AlarmHistoryDocument = HydratedDocument<AlarmHistory>;

@Schema({ timestamps: { createdAt: 'occurredAt', updatedAt: false } })
export class AlarmHistory {
  @Prop({ required: true })
  alarmId!: string;

  @Prop({ required: true })
  label!: string;

  @Prop({ required: true, enum: ['Low', 'Medium', 'High'] })
  severity!: 'Low' | 'Medium' | 'High';

  @Prop({ required: true, enum: ['raised', 'acknowledged', 'resolved'] })
  event!: 'raised' | 'acknowledged' | 'resolved';

  @Prop()
  acknowledgedBy?: string;

  @Prop({ type: Object })
  metadata?: Record<string, unknown>;
}

export const AlarmHistorySchema = SchemaFactory.createForClass(AlarmHistory);

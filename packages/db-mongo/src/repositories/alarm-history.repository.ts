import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import {
  AlarmHistory,
  type AlarmHistoryDocument,
} from '../models/alarm-history.schema';

type CreateAlarmHistoryInput = {
  alarmId: string;
  label: string;
  severity: 'Low' | 'Medium' | 'High';
  event: 'raised' | 'acknowledged' | 'resolved';
  acknowledgedBy?: string;
  metadata?: Record<string, unknown>;
};

@Injectable()
export class AlarmHistoryRepository {
  constructor(
    @InjectModel(AlarmHistory.name)
    private readonly alarmHistoryModel: Model<AlarmHistoryDocument>,
  ) {}

  async record(entry: CreateAlarmHistoryInput) {
    const history = new this.alarmHistoryModel(entry);
    return history.save();
  }

  async findByAlarm(alarmId: string, limit = 50) {
    return this.alarmHistoryModel
      .find({ alarmId })
      .sort({ occurredAt: -1 })
      .limit(limit)
      .lean()
      .exec();
  }
}

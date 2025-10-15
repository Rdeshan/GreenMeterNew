import { Schema, model, Document,Types } from 'mongoose';

export interface IDevice extends Document {
   userId?: Types.ObjectId | string;
  device_name: string;
  type?: string;
  location?: string;
  consumption?: number;
  state:"ON"|"OFF";
  createdAt: Date;
}

const DeviceSchema = new Schema<IDevice>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: false },
  device_name: { type: String, required: true },
  type: { type: String },
  location: { type: String },
  consumption: { type: Number },
    state: { type: String, enum: ["ON", "OFF"], default: "OFF" }, 
  createdAt: { type: Date, default: Date.now },
});

export default model<IDevice>('Device', DeviceSchema);
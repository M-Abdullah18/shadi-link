import mongoose, { Schema, Document } from 'mongoose';

export interface IImage extends Document {
  data: Buffer;
  contentType: string;
  size: number;
  createdAt: Date;
}

const ImageSchema = new Schema<IImage>(
  {
    data: { type: Buffer, required: true },
    contentType: { type: String, required: true, trim: true },
    size: { type: Number, required: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const ImageModel = (mongoose.models.Image as mongoose.Model<IImage>) || mongoose.model<IImage>('Image', ImageSchema);

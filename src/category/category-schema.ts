import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<Category>;
@Schema({ timestamps: true })
export class Category {
  @Prop({
    type: String,
    required: true,
    min: [3, 'Name must be at least 3 characters'],
    max: [30, 'Name must be at most 30 characters'],
  })
  name: string;
  @Prop({
    type: String,
  })
  image: string;
}

export const CategorySchema = SchemaFactory.createForClass(Category);

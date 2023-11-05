import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CategoryDocument = HydratedDocument<Category>;

type SubcategoryType = {
  id: number;
  name: string;
  slug: string;
}

@Schema()
export class Category {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  slug: string;

  @Prop()
  details: string;

  @Prop()
  image: string;

  @Prop()
  subCategories: SubcategoryType[];
}

export const CategorySchema = SchemaFactory.createForClass(Category);
CategorySchema.index({ name: 'text', slug: 'text', details: 'text' });
 
import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Document } from 'mongoose';
import { Category } from '../../categories/schemas/category.schema';
import { Shop } from '../../shops/schemas/shop.schema';
import { Variation } from '../interfaces/variation.interface';
import { ClothingSize } from 'src/products/enums/clothingsize.enum';

export type ProductDocument = Product & Document;

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true })
  name: string;

 

  @Prop()
  description: string;

  @Prop()
  price: number;

  @Prop()
  discount :number;  // discount percentage - apply for BuyingPrice only

  @Prop()
  rentPrice? :number; //per day

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Category' })
  category: Category;

  @Prop()
  category_slug: string;

  @Prop()
  subCategory?: string;  // belong to which categories 

  
  @Prop()
  type?: string;   //example "Ao", "Vay", etc   from sharedSubCategory

  @Prop()
  quantity: number;

  @Prop()
  imageUrl: string;

  @Prop(
    raw({
      conditions: {
        type: [
          {
            name: String,
          },
        ],
      },
      bookCovers: {
        type: [{ name: String }],
      },
    }),
  )
  variations?: Variation;

  
  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;

  @Prop()
  size: ClothingSize[];
}

export const ProductSchema = SchemaFactory.createForClass(Product);
ProductSchema.index({
  name: 'text',
  description: 'text',
  category_slug: 'text',
});

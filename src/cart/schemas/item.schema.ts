import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';
import { ServiceType } from 'src/cart/enum/typeOfService.enum';
export type ItemDocument = Item & Document;

@Schema()
export class Item {
  @Prop({ type: SchemaTypes.ObjectId, ref: 'Product' })
  productId: string;

  @Prop()
  name: string;

  @Prop()
  price: number;

  @Prop()
  quantity: number;

  @Prop()
  subTotalPrice: number;

  @Prop()
  imageUrl: string;

  @Prop()
  ServiceOption?: ServiceType; // {rent, buy}

  @Prop()
  NumOfRentDays?: number;
}

export const ItemSchema = SchemaFactory.createForClass(Item);

export class FilterProductDTO {
  text?: string;
  category?: string;
  subcategory?: string; 
  page?: number;
  limit?: number;
  orderBy?: 'created_at' | 'min_price' | 'max_price';
  price?: string;
}

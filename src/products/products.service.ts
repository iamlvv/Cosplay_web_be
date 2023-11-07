import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CategoriesService } from '../categories/categories.service';
import { CreateProductDTO } from './dtos/create-product.dto';
import { FilterProductDTO } from './dtos/filter-product.dto';
import { UpdateProductDto } from './dtos/update-product.dto';
import { Product, ProductDocument } from './schemas/products.schema';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel('Product')
    private readonly productModel: Model<ProductDocument>,
    private readonly categoriesService: CategoriesService,
  ) {}

  private readonly logger = new Logger('Product Service');

  async getSubCategory(category: string) {
    if (category === 'van-hoc') {
      //for old code and testing
      return [
        { id: 1, name: 'Đương Đại', slug: 'duong-dai' },
        { id: 2, name: 'Cổ Điển', slug: 'co-dien' },
        { id: 3, name: 'Nước Ngoài', slug: 'nuoc-ngoai' },
      ];
    } else if (category === 'le-hoi') {
      return [
        { id: 1, name: 'Halloween', slug: 'halloween' },
        { id: 2, name: 'Giáng sinh', slug: 'giang-sinh' },
        { id: 3, name: 'Tết nguyên đán', slug: 'tet-nguyen-dan' },
        { id: 4, name: 'Tết trung thu', slug: 'tet-trung-thu' },
      ];
    } else if (category === 'su-kien') {
      return [
        { id: 1, name: 'Tiệc sinh nhật', slug: 'tiec-sinh-nhat' },
        { id: 2, name: 'Tiệc công ty', slug: 'tiec-cong-ty' },
        { id: 3, name: 'Hội nghị', slug: 'hoi-nghi' },
      ];
    } else if (category === 'hoa-trang') {
      return [
        { id: 1, name: 'Mushoku Tensei', slug: 'mushoku-tensei' },
        { id: 2, name: 'JUJUTSU KAISEN', slug: 'jujutsu-kaisen' },
        { id: 3, name: 'Bungo Stray Dogs', slug: 'bungo-stray-dogs' },
        { id: 4, name: 'Undead Murder Farce', slug: 'undead-murder-farce' },
        {
          id: 5,
          name: 'Sugar Apple Fairy Tale',
          slug: 'sugar-apple-fairy-tale',
        },
        { id: 6, name: 'BLEACH', slug: 'bleach' },
        { id: 7, name: 'Naruto', slug: 'naruto' },
        { id: 8, name: 'Genshin Impact', slug: 'genshin-impact' },
        { id: 9, name: 'Demon Slayer', slug: 'demon-slayer' },
      ];
    } else if (category === 'nghe-thuat') {
      return [
        { id: 1, name: 'Biểu diễn văn nghệ', slug: 'bieu-dien-van-nghe' },
        { id: 2, name: 'Chụp ảnh ngoại cảnh', slug: 'chup-anh-ngoai-canh' },
        { id: 3, name: 'Chụp kỷ yếu', slug: 'chup-ky-yeu' },
      ];
    } else {
      return 'Undefined Category!';
    }
  }

  async getSharedSubCategory() {
    return [
      { id: 1, name: 'Váy', slug: 'vay' },
      { id: 2, name: 'Áo', slug: 'ao' },
      { id: 3, name: 'Quần', slug: 'quan' },
      { id: 4, name: 'Phụ kiện', slug: 'phu-kien' },
      { id: 5, name: 'Giày', slug: 'giay' },
      { id: 6, name: 'Tóc giả', slug: 'toc-gia' },
      { id: 7, name: 'Combo', slug: 'combo' },
    ];
  }

  async getFilteredProducts({
    text,
    category,
    subcategory,
    types,
    page = 1,
    limit = 20,
    orderBy,
    price,
  }: FilterProductDTO) {
    const sortProps: any =
      orderBy && orderBy !== 'created_at'
        ? {
            price: orderBy === 'max_price' ? -1 : 1,
          }
        : {
            _id: -1,
          };

    console.log(category);
    console.log(price);
    const categoryList = category?.split(',');
    const subcategoryList = subcategory?.split(',');
    console.log(subcategoryList);
    const typesList = types?.split(',');
    let priceRange = null;
    if (price && price.split(',').length === 2) {
      priceRange = price.split(',').map((p) => +p * 1000);
    }

    if (category && !text) {
      console.log(priceRange);
      const findProps: any = !priceRange    // find based on property of category_slug
        ? {
            $and: [
              {
                category_slug: { $in: categoryList },
              },
              subcategoryList?.length > 0?
                {
                  subCategory: { $in: subcategoryList }
                }
                :{},
              typesList?.length >0?
                {
                  type: { $in: typesList },
                }: {},
            ],
          }
          
        : {
            $and: [
              {
                category_slug: { $in: categoryList },
              },
              {
                price: { $gte: priceRange[0], $lte: priceRange[1] },
              },
              subcategoryList?.length > 0?
                {
                  subCategory: { $in: subcategoryList }
                }
                :{},
              typesList?.length >0?
                {
                  type: { $in: typesList },
                }: {},
            ],
          };
          
      
      // let findPropsCombined = Object.assign({}, findProps, findProps2);
      // findPropsCombined = Object.assign({}, findPropsCombined, findProps3);
      const products = await this.productModel
        .find(findProps)
        .sort(sortProps)
        .skip((page - 1) * limit)
        .limit(limit)
        .exec();
      const count = await this.productModel.countDocuments(findProps);

      return {
        data: products,
        count: products.length,
        total: count,
        from: (page - 1) * limit,
        to: (page - 1) * limit + products.length,
        per_page: +limit,
        current_page: +page,
        last_page: Math.ceil(count / limit),
      };
    }


    //for search in all category 
    if(!category ){
      console.log(typesList);
      let findProps:any;
      if(text){
        findProps = !priceRange
        ? {
            $and: [
              
              { $text: { $search: text } },

              typesList?.length >0?
                {
                  type: { $in: typesList },
                }: {},
            ],
            
          }
        : {
            $and: [
              { $text: { $search: text } },
              {
                price: { $gte: priceRange[0], $lte: priceRange[1] },
              },
              typesList?.length >0?
                {
                  type: { $in: typesList },
                }: {},
            ],
          };

      }
      else{
        findProps = !priceRange
      ? {
          $and: [
            typesList?.length >0?
                {
                  type: { $in: typesList },
                }: {},
           
          ],
        }
      : {
          $and: [
            
            {
              price: { $gte: priceRange[0], $lte: priceRange[1] },
            },
            typesList?.length >0?
                {
                  type: { $in: typesList },
                }: {},
          ],
        };
      }

      
      // let findPropsCombined = Object.assign({}, findProps, findProps1);
      const products = await this.productModel
        .find(findProps)
        .sort(sortProps)
        .skip((page - 1) * limit)
        .limit(limit)
        .exec();
      const count = await this.productModel.countDocuments(findProps);

      return {
        data: products,
        count: products.length,
        total: count,
        from: (page - 1) * limit,
        to: (page - 1) * limit + products.length,
        per_page: +limit,
        current_page: +page,
        last_page: Math.ceil(count / limit),
      };
    }

    const findProps: any = !priceRange
      ? {
          $and: [
            categoryList?.length >= 0
              ? {
                  category_slug: { $in: categoryList },
                }
              : {},
            { $text: { $search: text } },
          ],
        }
      : {
          $and: [
            {
              category_slug: { $in: categoryList },
            },
            { $text: { $search: text } },
            {
              price: { $gte: priceRange[0], $lte: priceRange[1] },
            },
          ],
        };

    const products = await this.productModel
      .find(findProps)
      .sort(sortProps)
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();
    const count = await this.productModel.countDocuments(findProps);

    return {
      data: products,
      count: products.length,
      total: count,
      from: (page - 1) * limit,
      to: (page - 1) * limit + products.length,
      per_page: +limit,
      current_page: +page,
      last_page: Math.ceil(count / limit),
    };
  }

  async getAllProducts({ page = 1, limit = 20, orderBy = '' }) {
    const sortProps: any =
      orderBy && orderBy !== 'created_at'
        ? {
            price: orderBy === 'max_price' ? -1 : 1,
          }
        : {
            _id: -1,
          };

    const products = await this.productModel
      .find()
      .sort(sortProps)
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();
    const count = await this.productModel.countDocuments();

    return {
      data: products,
      count: products.length,
      total: count,
      from: (page - 1) * limit,
      to: (page - 1) * limit + products.length,
      per_page: +limit,
      current_page: +page,
      last_page: Math.ceil(count / limit),
    };
  }

  async getPopularProducts({ page = 1, limit = 20 }) {
    const products = await this.productModel
      .find({
        price: { $gte: 90000 },
      })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    return products;
  }

  async getProductById(id: string): Promise<Product> {
    const product = await this.productModel.findById(id).populate('category');

    return product;
  }

  async createProduct(createProductDto: CreateProductDTO): Promise<Product> {
    const category = await this.categoriesService.getCategoryBySlug(
      createProductDto.category_slug,
    );

    const newProduct = await this.productModel.create({
      ...createProductDto,
      category: category?._id,
    });

    return newProduct.save();
  }

  async updateProduct(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const category = await this.categoriesService.getCategoryBySlug(
      updateProductDto.category_slug,
    );

    const updatedProduct = await this.productModel.findByIdAndUpdate(
      id,
      {
        ...updateProductDto,
        category: category?._id,
      },
      { new: true },
    );

    return updatedProduct;
  }

  async deleteProduct(id: string): Promise<any> {
    const deletedProduct = await this.productModel.findByIdAndRemove(id);

    return deletedProduct;
  }

  async isInStock(id: string, quantityBuy: number): Promise<boolean> {
    const { quantity } = await this.getProductById(id);

    if (quantity < quantityBuy) {
      throw new BadRequestException('Not enough product in stock');
    }

    return true;
  }

  async updateMany(items: { id: string; quantity: number }[]) {
    const bulkArr = [];
    for (const item of items) {
      bulkArr.push({
        updateOne: {
          filter: { _id: item.id },
          update: { $inc: { quantity: -item.quantity } },
        },
      });
    }

    const result = await this.productModel.bulkWrite(bulkArr);
    return result;
  }
}

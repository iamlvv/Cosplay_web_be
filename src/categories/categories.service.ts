import { Injectable, Query } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateCategoryDto } from './dto/create-category.dto';
import { GetCategoriesDto } from './dto/get-categories.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category, CategoryDocument } from './schemas/category.schema';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) {}

  async getCategories(
    @Query() { limit = 5, page = 1, search }: GetCategoriesDto,
  ) {
    if (search) {
      const categories = await this.categoryModel
        .find({
          $text: {
            $search: search,
          },
        })
        .skip((page - 1) * limit)
        .limit(limit);

      const total = await this.categoryModel.countDocuments({
        $text: {
          $search: search,
        },
      });

      return {
        data: categories,
        count: categories.length,
        total,
        per_page: +limit,
        current_page: +page,
        last_page: Math.ceil(total / limit),
      };
    }

    const categories = await this.categoryModel
      .find()
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await this.categoryModel.countDocuments();

    return {
      data: categories,
      count: categories.length,
      total,
      per_page: +limit,
      current_page: +page,
      last_page: Math.ceil(total / limit),
    };
  }

  async getCategory(id: string) {
    try {
      const category = await this.categoryModel.findById(id);
      return category;
    } catch (err) {
      return err;
    }
  }
  async getSubCategory(slug: string)  { //get subcategory by category-slug
   const categoryData =  await this.categoryModel.findOne({ slug });
    
   if(!categoryData){
    return "can not find subcategory";
   }
   return categoryData.subCategories;
  }

  GetTypes(){
    return [
      {"id": 1, "name": "Váy", "slug": "vay"},
      {"id": 2, "name": "Áo", "slug": "ao"},
      {"id": 3, "name": "Quần", "slug": "quan"},
      { "id": 4, "name": "Phụ kiện", "slug": "phu-kien" },
      { "id": 5, "name": "Giày", "slug": "giay" },
      { "id": 6, "name": "Tóc giả", "slug": "toc-gia" },
      { "id": 7, "name": "Combo", "slug": "combo" }
    ];
  }

  async getCategoryBySlug(slug: string) {
    const category = await this.categoryModel.findOne({ slug });

    return category;
  }

  async create(creatCategoryDto: CreateCategoryDto) {
    const newCategory = new this.categoryModel(creatCategoryDto);

    return await newCategory.save();
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const updatedCategory = await this.categoryModel.findByIdAndUpdate(
      id,
      updateCategoryDto,
      {
        new: true,
      },
    );

    return updatedCategory;
  }

  async remove(id: string) {
    const deletedCategory = await this.categoryModel.findByIdAndRemove(id);

    return deletedCategory;
  }
}

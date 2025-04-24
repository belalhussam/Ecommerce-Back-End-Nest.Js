import { Category } from './../category/category-schema';
import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { SubCreateCategoryDto } from './dto/create-sub-category.dto';
import { UpdateSubCategoryDto } from './dto/update-sub-category.dto';
import { InjectModel } from '@nestjs/mongoose';
import { SubCategory } from './subCategory-schema';
import { Model } from 'mongoose';

@Injectable()
export class SubCategoryService {
  constructor(
    @InjectModel(SubCategory.name) private subCategoryModel: Model<SubCategory>,
    @InjectModel(Category.name) private CategoryModel: Model<Category>,
  ) {}
  async create(SubCreateCategoryDto: SubCreateCategoryDto) {
    const subCategory = await this.subCategoryModel.findOne({
      name: SubCreateCategoryDto.name,
    });
    if (subCategory) {
      throw new HttpException('SubCategory already exist', 400);
    }
    const category = await this.CategoryModel.findById(
      SubCreateCategoryDto.category,
    );
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const newSubCategory = await (
      await this.subCategoryModel.create(SubCreateCategoryDto)
    ).populate('category', '-_id -__v');
    return {
      status: 200,
      message: 'Sub Category created successfully',
      data: newSubCategory,
    };
  }

  async findAll() {
    const subcategory = await this.subCategoryModel
      .find()
      .populate('category', '-_id -__v');
    return {
      status: 200,
      message: 'Sub Categorys found',
      length: subcategory.length,
      isEmpty: subcategory.length > 0 ? 'false' : 'true',
      data: subcategory,
    };
  }

  async findOne(id: string) {
    const subCategory = await this.subCategoryModel
      .findById(id)
      .select('-__v')
      .populate('category', '-_id -__v');
    if (!subCategory) {
      throw new NotFoundException('Sub Category not found');
    }

    return {
      status: 200,
      message: 'Sub Category found',
      data: subCategory,
    };
  }

  async update(id: string, updateSubCategoryDto: UpdateSubCategoryDto) {
    const subCategory = await this.subCategoryModel.findById(id).select('-__v');
    if (!subCategory) {
      throw new NotFoundException('Sub Category not found');
    }
    const updatedSubCategory = await this.subCategoryModel
      .findByIdAndUpdate(id, updateSubCategoryDto, { new: true })
      .select('-__V')
      .populate('category', '-_id -__v');
    return {
      status: 200,
      message: 'Sub Category updated successfully',
      data: updatedSubCategory,
    };
  }

  async remove(id: string) {
    const subCategory = await this.subCategoryModel.findById(id).select('-__v');
    if (!subCategory) {
      throw new NotFoundException('Sub Category not found');
    }
    await this.subCategoryModel.findByIdAndDelete(id);
  }
}

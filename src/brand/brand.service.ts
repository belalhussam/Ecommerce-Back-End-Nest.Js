import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Brand } from './brand-schema';
import { Model } from 'mongoose';

@Injectable()
export class BrandService {
  constructor(@InjectModel(Brand.name) private brandModel: Model<Brand>) {}
  async create(createBrandDto: CreateBrandDto) {
    const brand = await this.brandModel.findOne({ name: createBrandDto.name });
    if (brand) {
      throw new HttpException('Brand already exist', 400);
    }
    const createBrnad = await this.brandModel.create(createBrandDto);
    return {
      status: 200,
      message: 'Brand created successfully',
      data: createBrnad,
    };
  }

  async findAll() {
    const brand = await this.brandModel.find({}).select('-__v');
    return {
      status: 200,
      length: brand.length,
      isEmpty: brand.length > 0 ? 'false' : 'true',
      message: 'Brand found ',
      data: brand,
    };
  }

  async findOne(id: string) {
    const brand = await this.brandModel.findById(id).select('-__v');
    if (!brand) {
      throw new NotFoundException('Brand not found');
    }
    return {
      status: 200,
      message: 'Brand found',
      data: brand,
    };
  }

  async update(id: string, UpdateBrandDto: UpdateBrandDto) {
    const brand = await this.brandModel.findById(id).select('-__v');
    if (!brand) {
      throw new NotFoundException('Brand not found');
    }
    const updatedBrand = await this.brandModel.findByIdAndUpdate(
      id,
      UpdateBrandDto,
      { new: true },
    );
    return {
      status: 200,
      message: 'Brand updated successfully',
      data: updatedBrand,
    };
  }

  async remove(id: string) {
    const brand = await this.brandModel.findById(id).select('-__v');
    if (!brand) {
      throw new NotFoundException('Brand not found');
    }
    await this.brandModel.findByIdAndDelete(id);
  }
}

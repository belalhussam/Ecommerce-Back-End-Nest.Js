import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateSuppliersDto } from './dto/create-suppliers.dto';
import { UpdateSuppliersDto } from './dto/update-suppliers.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Suppliers } from './suppliers-schema';
import { Model } from 'mongoose';

@Injectable()
export class SuppliersService {
  constructor(
    @InjectModel(Suppliers.name) private suppliersModel: Model<Suppliers>,
  ) {}
  async create(CreateSuppliersDto: CreateSuppliersDto) {
    const suppliers = await this.suppliersModel.findOne({
      name: CreateSuppliersDto.name,
    });
    if (suppliers) {
      throw new HttpException('Suppliers already exist', 400);
    }
    const createSuppliers =
      await this.suppliersModel.create(CreateSuppliersDto);
    return {
      status: 200,
      message: 'Suppliers created successfully',
      data: createSuppliers,
    };
  }

  async findAll() {
    const suppliers = await this.suppliersModel.find({}).select('-__v');
    return {
      status: 200,
      length: suppliers.length,
      isEmpty: suppliers.length > 0 ? 'false' : 'true',
      message: 'Suppliers found ',
      data: suppliers,
    };
  }

  async findOne(id: string) {
    const suppliers = await this.suppliersModel.findById(id).select('-__v');
    if (!suppliers) {
      throw new NotFoundException('Suppliers not found');
    }
    return {
      status: 200,
      message: 'Suppliers found',
      data: suppliers,
    };
  }

  async update(id: string, UpdateSuppliersDto: UpdateSuppliersDto) {
    const suppliers = await this.suppliersModel.findById(id).select('-__v');
    if (!suppliers) {
      throw new NotFoundException('Suppliers not found');
    }
    const updatedSuppliers = await this.suppliersModel.findByIdAndUpdate(
      id,
      UpdateSuppliersDto,
      { new: true },
    );
    return {
      status: 200,
      message: 'Suppliers updated successfully',
      data: updatedSuppliers,
    };
  }

  async remove(id: string) {
    const suppliers = await this.suppliersModel.findById(id).select('-__v');
    if (!suppliers) {
      throw new NotFoundException('Suppliers not found');
    }
    await this.suppliersModel.findByIdAndDelete(id);
  }
}

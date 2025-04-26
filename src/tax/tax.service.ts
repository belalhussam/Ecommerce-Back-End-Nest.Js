import { Injectable } from '@nestjs/common';
import { CreateTexDto } from './dto/create-tax.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Tax } from './tax-schema';
import { Model } from 'mongoose';

@Injectable()
export class TaxService {
  constructor(@InjectModel(Tax.name) private readonly taxModel: Model<Tax>) {}
  async createOrUpdate(createTexDto: CreateTexDto) {
    const tax = await this.taxModel.find();
    if (!tax) {
      // Create New Tax
      const newTex = await this.taxModel.create(createTexDto);
      return {
        status: 200,
        message: 'Tax created successfully',
        data: newTex,
      };
    }
    // Update Tax
    const updateTax = await this.taxModel
      .findOneAndUpdate({}, createTexDto, {
        new: true,
      })
      .select('-__v');
    return {
      status: 200,
      message: 'Tax Updated successfully',
      data: updateTax,
    };
  }

  async find() {
    const tax = await this.taxModel.find().select('-__v');
    return {
      status: 200,
      message: 'Tax found successfully',
      data: tax,
    };
  }

  async reSet(): Promise<void> {
    await this.taxModel.findOneAndUpdate({}, { taxPrice: 0, shippingPrice: 0 });
  }
}

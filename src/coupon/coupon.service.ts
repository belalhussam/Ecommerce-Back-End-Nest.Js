import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Coupon } from './coupon-schema';
import { Model } from 'mongoose';

@Injectable()
export class CouponService {
  constructor(@InjectModel(Coupon.name) private couponModel: Model<Coupon>) {}
  async create(CreateCouponDto: CreateCouponDto) {
    const coupon = await this.couponModel.findOne({
      name: CreateCouponDto.name,
    });
    if (coupon) {
      throw new HttpException('Coupon already exist', 400);
    }
    if (new Date(CreateCouponDto.expireDate) < new Date()) {
      throw new HttpException('Coupon cant be expierd', 400);
    }
    const createCoupon = await this.couponModel.create(CreateCouponDto);
    return {
      status: 200,
      message: 'Coupon created successfully',
      data: createCoupon,
    };
  }

  async findAll() {
    const coupon = await this.couponModel.find({}).select('-__v');
    return {
      status: 200,
      length: coupon.length,
      isEmpty: coupon.length > 0 ? 'false' : 'true',
      message: 'Coupon found ',
      data: coupon,
    };
  }

  async findOne(id: string) {
    const coupon = await this.couponModel.findById(id).select('-__v');
    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }
    return {
      status: 200,
      message: 'Coupon found',
      data: coupon,
    };
  }

  async update(id: string, UpdateCouponDto: UpdateCouponDto) {
    const coupon = await this.couponModel.findById(id).select('-__v');
    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }
    const updatedBrand = await this.couponModel.findByIdAndUpdate(
      id,
      UpdateCouponDto,
      { new: true },
    );
    return {
      status: 200,
      message: 'Coupon updated successfully',
      data: updatedBrand,
    };
  }

  async remove(id: string) {
    const coupon = await this.couponModel.findById(id).select('-__v');
    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }
    await this.couponModel.findByIdAndDelete(id);
  }
}

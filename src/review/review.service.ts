import {
  HttpException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Review } from './review-schema';
import { Model } from 'mongoose';
import { Product } from 'src/product/product-schema';

@Injectable()
export class ReviewService {
  constructor(
    @InjectModel(Review.name) private reviewModel: Model<Review>,
    @InjectModel(Product.name) private productModel: Model<Product>,
  ) {}
  async create(createReviewDto: CreateReviewDto, userId: string) {
    const reviewCheck = await this.reviewModel.findOne({
      user: userId,
      product: createReviewDto.product,
    });
    if (reviewCheck) {
      throw new HttpException(
        'This User already Created Review On this Product',
        400,
      );
    }
    const newReview = await (
      await this.reviewModel.create({
        ...createReviewDto,
        user: userId,
      })
    ).populate('product user', 'name email title description imageCover');
    const reviewsOnSingleProduct = await this.reviewModel
      .find({
        product: createReviewDto.product,
      })
      .select('rating');
    const ratingsQuantity = reviewsOnSingleProduct.length;
    if (ratingsQuantity > 0) {
      let totalRatings: number = 0;
      for (let i = 0; i < reviewsOnSingleProduct.length; i++) {
        totalRatings += reviewsOnSingleProduct[i].rating;
      }
      const ratingsAverage = totalRatings / ratingsQuantity;
      await this.productModel.findByIdAndUpdate(createReviewDto.product, {
        ratingsQuantity,
        ratingsAverage,
      });
    }

    return {
      status: 400,
      message: 'Review Created successfully',
      data: newReview,
    };
  }

  async findAll(productId: string) {
    const review = await this.reviewModel
      .find({
        product: productId,
      })
      .populate('user product', 'name email title')
      .select('-__v');
    if (!review) {
      throw new HttpException('product Id not found', 400);
    }
    return {
      status: 200,
      message: 'Reviews Found',
      length: review.length,
      data: review,
    };
  }

  async findOne(userId: string) {
    const review = await this.reviewModel
      .find({ user: userId })
      .populate('user product', 'name role email title')
      .select('-__v');
    return {
      status: 200,
      message: 'Reviews Found',
      length: review.length,
      data: review,
    };
  }
  async update(id: string, updateReviewDto: UpdateReviewDto, userId) {
    const review = await this.reviewModel.findById(id);
    if (!review) {
      throw new HttpException('review not found', 400);
    }
    if (userId.toString() !== review.user.toString()) {
      throw new UnauthorizedException();
    }
    const updatedReview = await this.reviewModel
      .findByIdAndUpdate(
        id,
        {
          ...updateReviewDto,
          user: userId,
          product: updateReviewDto.product,
        },
        { new: true },
      )
      .select('-__v');
    const reviewsOnSingleProduct = await this.reviewModel
      .find({
        product: review.product,
      })
      .select('rating');
    const ratingsQuantity = reviewsOnSingleProduct.length;
    if (ratingsQuantity > 0) {
      let totalRatings: number = 0;
      for (let i = 0; i < reviewsOnSingleProduct.length; i++) {
        totalRatings += reviewsOnSingleProduct[i].rating;
      }
      const ratingsAverage = totalRatings / ratingsQuantity;
      await this.productModel.findByIdAndUpdate(review.product, {
        ratingsQuantity,
        ratingsAverage,
      });
      return {
        status: 200,
        message: 'Review Updated successfully',
        data: updatedReview,
      };
    }
  }

  async remove(id: string, userId): Promise<void> {
    const review = await this.reviewModel.findById(id);
    if (!review) {
      throw new HttpException('review not found', 400);
    }
    if (userId.toString() !== review.user.toString()) {
      throw new UnauthorizedException();
    }
    await this.reviewModel.findByIdAndDelete(id);
    const reviewsOnSingleProduct = await this.reviewModel
      .find({
        product: review.product,
      })
      .select('rating');
    const ratingsQuantity = reviewsOnSingleProduct.length;
    if (ratingsQuantity > 0) {
      let totalRatings: number = 0;
      for (let i = 0; i < reviewsOnSingleProduct.length; i++) {
        totalRatings += reviewsOnSingleProduct[i].rating;
      }
      const ratingsAverage = totalRatings / ratingsQuantity;
      await this.productModel.findByIdAndUpdate(review.product, {
        ratingsQuantity,
        ratingsAverage,
      });
    }
  }
}

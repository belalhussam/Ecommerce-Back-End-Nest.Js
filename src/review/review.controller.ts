import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  ValidationPipe,
  UnauthorizedException,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { AuthGuard } from 'src/user/guard/Auth.guard';
import { Roles } from 'src/user/decorator/role-decorator';

@Controller('review')
@UseGuards(AuthGuard)
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}
  //  @docs   Any User logged Can Create Review on any product
  //  @Route  POST /api/v1/review
  //  @access Private [User]
  @Post()
  @Roles(['user'])
  create(
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    createReviewDto: CreateReviewDto,
    @Req() req,
  ) {
    if (req.user.role.toLowerCase() === 'admin') {
      throw new UnauthorizedException();
    }
    return this.reviewService.create(createReviewDto, req.user._id);
  }
  //  @docs   Any User logged Can Create Review on any product
  //  @Route  POST /api/v1/review
  //  @access Private [User]
  @Get(':id')
  findAll(@Param('id') productId) {
    return this.reviewService.findAll(productId);
  }
  //  @docs   Any User logged Can update Review on any product
  //  @Route  Patch /api/v1/review
  //  @access Private [User]
  @Patch(':id')
  @Roles(['user'])
  update(
    @Param('id') id: string,
    @Body() updateReviewDto: UpdateReviewDto,
    @Req() req,
  ) {
    if (req.user.role.toLowerCase() === 'admin') {
      throw new UnauthorizedException();
    }
    return this.reviewService.update(id, updateReviewDto, req.user._id);
  }
  //  @docs   Any User logged Can Delete Review on any product
  //  @Route  Delete /api/v1/review
  //  @access Private [User]
  @Delete(':id')
  @Roles(['user'])
  remove(@Param('id') id: string, @Req() req) {
    if (req.user.role.toLowerCase() === 'admin') {
      throw new UnauthorizedException();
    }
    return this.reviewService.remove(id, req.user._id);
  }
}
@Controller('dashboard/review')
export class ReviewDashboardController {
  constructor(private readonly reviewService: ReviewService) {}

  //  @docs   Any User Can Get All Reviews On User
  //  @Route  GET /api/v1/review
  //  @access Private [Admin]
  @Get(':id')
  @Roles(['admin'])
  @UseGuards(AuthGuard)
  findOne(@Param('id') userId: string) {
    return this.reviewService.findOne(userId);
  }
}

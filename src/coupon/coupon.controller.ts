import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import { CouponService } from './coupon.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { AuthGuard } from 'src/user/guard/Auth.guard';
import { Roles } from 'src/user/decorator/role-decorator';

@Controller('coupon')
@UseGuards(AuthGuard)
export class CouponController {
  constructor(private readonly couponService: CouponService) {}
  // @dec  find coupon
  // @Route find api/v1/coupon
  // @access private[admin]
  @Post()
  @Roles(['admin'])
  create(
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    CreateCouponDto: CreateCouponDto,
  ) {
    return this.couponService.create(CreateCouponDto);
  }
  // @dec  find coupon
  // @Route find api/v1/coupon
  // @access private[admin]
  @Get()
  @Roles(['admin'])
  findAll() {
    return this.couponService.findAll();
  }
  // @dec  find coupon
  // @Route find api/v1/coupon
  // @access public
  @Get(':id')
  @Roles(['admin', 'user'])
  findOne(@Param('id') id: string) {
    return this.couponService.findOne(id);
  }
  // @dec  update coupon
  // @Route update api/v1/coupon
  // @access private[admin]
  @Patch(':id')
  @Roles(['admin'])
  update(
    @Param('id') id: string,
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    UpdateBrandDto: UpdateCouponDto,
  ) {
    return this.couponService.update(id, UpdateBrandDto);
  }
  // @dec  delete Brand
  // @Route delete api/v1/coupon
  // @access private[admin]
  @Delete(':id')
  @Roles(['admin'])
  remove(@Param('id') id: string) {
    return this.couponService.remove(id);
  }
}

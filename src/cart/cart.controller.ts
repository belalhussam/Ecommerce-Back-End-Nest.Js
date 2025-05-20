import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UnauthorizedException,
  Req,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AuthGuard } from 'src/user/guard/Auth.guard';
import { Roles } from 'src/user/decorator/role-decorator';
import { UpdateCartItemsDto } from './dto/updateCartItem.dto';
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}
  @Post(':productId')
  @Roles(['user'])
  @UseGuards(AuthGuard)
  create(@Param('productId') productId: string, @Req() req) {
    if (req.user.role.toLowerCase() === 'admin') {
      throw new UnauthorizedException();
    }
    const userId = req.user._id;
    return this.cartService.create(productId, userId);
  }
  @Post('/coupon/:couponName')
  @Roles(['user'])
  @UseGuards(AuthGuard)
  applyCoupons(@Param('couponName') couponName: string, @Req() req) {
    if (req.user.role.toLowerCase() === 'admin') {
      throw new UnauthorizedException();
    }
    const userId = req.user._id;
    return this.cartService.applyCoupon(couponName, userId);
  }

  @Get()
  @Roles(['user'])
  @UseGuards(AuthGuard)
  findOneForUser(@Req() req) {
    if (req.user.role.toLowerCase() === 'admin') {
      throw new UnauthorizedException();
    }
    const userId = req.user._id;
    return this.cartService.findOneForUser(userId);
  }
  @Patch('/:productId')
  @Roles(['user'])
  @UseGuards(AuthGuard)
  update(
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    UpdateCartItemsDto: UpdateCartItemsDto,
    @Param('productId') productId: string,
    @Req() req,
  ) {
    if (req.user.role.toLowerCase() === 'admin') {
      throw new UnauthorizedException();
    }
    const userId = req.user._id;
    return this.cartService.update(UpdateCartItemsDto, productId, userId);
  }
  @Delete('/:productId')
  @Roles(['user'])
  @UseGuards(AuthGuard)
  delete(@Param('productId') productId: string, @Req() req) {
    if (req.user.role.toLowerCase() === 'admin') {
      throw new UnauthorizedException();
    }
    const userId = req.user._id;
    return this.cartService.remove(productId, userId);
  }

  @Get('admin/:userId')
  @Roles(['admin'])
  @UseGuards(AuthGuard)
  findOneForAdmin(@Param('userId') userId: string) {
    return this.cartService.findOneForAdmin(userId);
  }
  @Get('admin')
  @Roles(['admin'])
  @UseGuards(AuthGuard)
  findAllForAdmin() {
    return this.cartService.findAllForAdmin();
  }
}

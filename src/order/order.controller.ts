import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Query,
  UseGuards,
  UnauthorizedException,
  NotFoundException,
  ValidationPipe,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { AcceptOrderCashDto, CreateOrderDto } from './dto/create-order.dto';
import { AuthGuard } from 'src/user/guard/Auth.guard';
import { Roles } from 'src/user/decorator/role-decorator';

@Controller('cart/checkout')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('/:paymentMethodType')
  @Roles(['user'])
  @UseGuards(AuthGuard)
  create(
    @Body() createOrderDto: CreateOrderDto,
    @Param('paymentMethodType') paymentMethodType: 'cash' | 'card',
    @Req() req,
    @Query() query,
  ) {
    if (req.user.role.toLowerCase() === 'admin') {
      throw new UnauthorizedException();
    }
    if (!['card', 'cash'].includes(paymentMethodType)) {
      throw new NotFoundException('No payment method found');
    }
    const {
      success_url = 'https://ecommerce-nestjs.com',
      cancel_url = 'https://ecommerce-nestjs.com',
    } = query;

    const dataAfterPayment = {
      success_url,
      cancel_url,
    };
    const userId = req.user._id;
    return this.orderService.create(
      createOrderDto,
      userId,
      paymentMethodType,
      dataAfterPayment,
    );
  }
}
@Controller('order/user')
export class OrderForUserController {
  constructor(private readonly orderService: OrderService) {}

  //  @docs   User Can get all order
  //  @Route  GET /api/v1/order/user
  //  @access Private [User]
  @Get()
  @Roles(['user'])
  @UseGuards(AuthGuard)
  findAllOrdersOnUser(@Req() req) {
    if (req.user.role.toLowerCase() === 'admin') {
      throw new UnauthorizedException();
    }
    const userId = req.user._id;
    return this.orderService.findAllOrdersOnUser(userId);
  }
}
@Controller('order/admin')
export class OrderForAdminController {
  constructor(private readonly orderService: OrderService) {}

  //  @docs   Admin Can get all order
  //  @Route  GET /api/v1/order/admin
  //  @access Private [Admin]
  @Get()
  @Roles(['admin'])
  @UseGuards(AuthGuard)
  findAllOrders() {
    return this.orderService.findAllOrders();
  }
  //  @docs   Admin Can get all order
  //  @Route  GET /api/v1/order/admin/:userId
  //  @access Private [Admin]
  @Get(':userId')
  @Roles(['admin'])
  @UseGuards(AuthGuard)
  findAllOrdersByUserId(@Param('userId') userId: string) {
    return this.orderService.findAllOrdersOnUser(userId);
  }
}

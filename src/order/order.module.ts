import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import {
  OrderController,
  OrderForAdminController,
  OrderForUserController,
} from './order.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, orderSchema } from './order.schema';
import { Cart, cartSchema } from 'src/cart/cart.schema';
import { Tax, taxSchema } from 'src/tax/tax-schema';
import { Product, productSchema } from 'src/product/product-schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: orderSchema },
      { name: Cart.name, schema: cartSchema },
      { name: Tax.name, schema: taxSchema },
      { name: Product.name, schema: productSchema },
    ]),
  ],
  controllers: [
    OrderController,
    OrderForAdminController,
    OrderForUserController,
  ],
  providers: [OrderService],
})
export class OrderModule {}

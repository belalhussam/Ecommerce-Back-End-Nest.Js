import { Injectable, NotFoundException } from '@nestjs/common';
import { AcceptOrderCashDto, CreateOrderDto } from './dto/create-order.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Order } from './order.schema';
import { Model } from 'mongoose';
import { Tax } from 'src/tax/tax-schema';
import { Cart } from 'src/cart/cart.schema';
import { Product } from 'src/product/product-schema';
import { MailerService } from '@nestjs-modules/mailer';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const stripe = require('stripe')(
  `sk_test_51RGZqePcok6RK5CFv9aqDv8oTZdeqlnBL2mQ9IwEf7j1x5N8DOj5UCDNdRccQaL3AJCduQc6qMbZKQnQcOibHMIL00qGeIMg8N`,
);

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(Tax.name) private taxModel: Model<Tax>,
    @InjectModel(Cart.name) private cartModel: Model<Cart>,
    @InjectModel(Product.name) private productModel: Model<Product>,
    private readonly mailService: MailerService,
  ) {}
  async create(
    createOrderDto: CreateOrderDto,
    userId: string,
    paymentMethodType: 'cash' | 'card',
    dataAfterPayment: {
      success_url: string;
      cancel_url: string;
    },
  ) {
    const cart = await this.cartModel
      .findOne({ user: userId })
      .populate('cartItems.productId user');
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }
    const tax = await this.taxModel.findOne({});
    // eslint-disable-next-line
    // @ts-ignore
    const shippingAddress = cart.user?.address
      ? // eslint-disable-next-line
        // @ts-ignore
        cart.user.address
      : createOrderDto.shippingAddress || false;

    if (!shippingAddress) {
      throw new NotFoundException('Shipping address not found');
    }

    const taxPrice = (tax?.taxPrice as unknown as number) || 0;
    const shippingPrice = (tax?.shippingPrice as unknown as number) || 0;
    // eslint-disable-next-line prefer-const
    let data = {
      user: userId,
      cartItems: cart.cartItems,
      taxPrice,
      shippingPrice,
      totalOrderPrice: cart.totalPrice + taxPrice + shippingPrice,
      paymentMethodType,
      shippingAddress,
    };

    if (paymentMethodType === 'cash') {
      // inser order in db
      const order = await this.orderModel.create({
        ...data,
        isPaid: data.totalOrderPrice === 0 ? true : false,
        paidAt: data.totalOrderPrice === 0 ? new Date() : null,
        isDeliverd: false,
      });
      // reset Cart
      await this.cartModel.findOneAndUpdate(
        { user: userId },
        { cartItems: [], totalPrice: 0 },
      );
      if (data.totalOrderPrice === 0) {
        cart.cartItems.forEach(async (item) => {
          await this.productModel.findByIdAndUpdate(
            item.productId,
            { $inc: { quantity: -item.quantity, sold: item.quantity } },
            { new: true },
          );
        });
      }

      return {
        status: 200,
        message: 'Order created successfully',
        data: order,
      };
    }
    // call the payment gateway here (stripe, etc)
    const line_items = cart.cartItems.map(({ productId, color }) => {
      return {
        price_data: {
          currency: 'egp',
          unit_amount: Math.round(data.totalOrderPrice * 100),
          product_data: {
            // eslint-disable-next-line
            // @ts-ignore
            name: productId.title,
            // eslint-disable-next-line
            // @ts-ignore
            description: productId.description,
            metadata: {
              color,
            },
          },
        },
        quantity: 1,
      };
    });

    const session = await stripe.checkout.sessions.create({
      line_items,
      mode: 'payment',
      success_url: dataAfterPayment.success_url,
      cancel_url: dataAfterPayment.cancel_url,

      client_reference_id: userId.toString(),
      // eslint-disable-next-line
      // @ts-ignore
      customer_email: cart.user.email,
      metadata: {
        address: data.shippingAddress,
      },
    });
    // inser order in db
    const order = await this.orderModel.create({
      ...data,
      sessionId: session.id,
      isPaid: false,
      isDeliverd: false,
    });

    return {
      status: 200,
      message: 'Order created successfully',
      data: {
        url: session.url,
        success_url: `${session.success_url}?session_id=${session.id}`,
        cancel_url: session.cancel_url,
        expires_at: new Date(session.expires_at * 1000),
        sessionId: session.id,
        totalPrice: session.amount_total,
        data: order,
      },
    };
  }
  async updatePaidCash(orderId: string, updateOrderDto: AcceptOrderCashDto) {
    const order = await this.orderModel.findById(orderId);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.paymentMethodType !== 'cash') {
      throw new NotFoundException('This order not paid by cash');
    }

    if (order.isPaid) {
      throw new NotFoundException('Order already paid');
    }

    if (updateOrderDto.isPaid) {
      updateOrderDto.paidAt = new Date();
      const cart = await this.cartModel
        .findOne({ user: order.user.toString() })
        .populate('cartItems.productId user');
      // @ts-ignore
      cart.cartItems.forEach(async (item) => {
        await this.productModel.findByIdAndUpdate(
          item.productId,
          { $inc: { quantity: -item.quantity, sold: item.quantity } },
          { new: true },
        );
      });
      // reset Cart
      await this.cartModel.findOneAndUpdate(
        { user: order.user.toString() },
        { cartItems: [], totalPrice: 0 },
      );
      // send mail
      const htmlMessage = `
    <html>
      <body>
        <h1>Order Confirmation</h1>
        <p>Dear</p>
        <p>Thank you for your purchase! Your order has been successfully placed and paid for with cash.</p>
        <p>We appreciate your business and hope you enjoy your purchase!</p>
        <p>Best regards,</p>
        <p>The Ecommerce-Nest.JS Team</p>
      </body>
    </html>
    `;
      await this.mailService.sendMail({
        from: `Ecommerce-Nest.JS <${process.env.MAIL_USER}>`,
        // eslint-disable-next-line
        // @ts-ignore
        to: cart.user.email,
        subject: `Ecommerce-Nest.JS - Checkout Order`,
        html: htmlMessage,
      });
    }

    if (updateOrderDto.isDeliverd) {
      updateOrderDto.deliverdAt = new Date();
    }

    const updatedOrder = await this.orderModel.findByIdAndUpdate(
      orderId,
      { ...updateOrderDto },
      { new: true },
    );

    return {
      status: 200,
      message: 'Order updated successfully',
      data: updatedOrder,
    };
  }

  async findAllOrders() {
    const orders = await this.orderModel.find({});
    return {
      status: 200,
      message: 'Orders found',
      length: orders.length,
      data: orders,
    };
  }
  async findAllOrdersOnUser(userId: string) {
    const orders = await this.orderModel.find({ user: userId });
    return {
      status: 200,
      message: 'Orders found',
      length: orders.length,
      data: orders,
    };
  }
}

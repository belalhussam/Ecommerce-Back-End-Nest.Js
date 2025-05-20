import {
  Injectable,
  NotFoundException,
  HttpException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cart } from './cart.schema';
import { Model } from 'mongoose';
import { Product } from 'src/product/product-schema';
import { UpdateCartItemsDto } from './dto/updateCartItem.dto';
import { Coupon } from 'src/coupon/coupon-schema';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name) private cartModule: Model<Cart>,
    @InjectModel(Product.name) private productModule: Model<Product>,
    @InjectModel(Coupon.name) private couponModule: Model<Coupon>,
  ) {}
  async create(product_id: string, user_id: string) {
    const cart = await this.cartModule
      .findOne({ user: user_id })
      .populate('cartItems.productId', 'price priceAfterDiscount');

    const product = await this.productModule.findById(product_id);
    // not found this product
    if (!product) {
      throw new NotFoundException('Not Found Product');
    }
    // quantity=0
    if (product.quantity <= 0) {
      throw new NotFoundException('Not Found quantity on this product');
    }

    // if user have cart=> insert product (productId)
    if (cart) {
      // add first product=> insert product in cart

      const indexIfProductAlridyInsert = cart.cartItems.findIndex(
        // -1 not found
        (item) => item.productId._id.toString() === product_id.toString(),
      );

      if (indexIfProductAlridyInsert !== -1) {
        cart.cartItems[indexIfProductAlridyInsert].quantity += 1;
      } else {
        // eslint-disable-next-line
        // @ts-ignore
        cart.cartItems.push({ productId: product_id, color: '', quantity: 1 });
      }

      await cart.populate('cartItems.productId', 'price priceAfterDiscount');

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      let totalPriceAfterInsert = 0;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      let totalDiscountPriceAfterInsert = 0;

      cart.cartItems.map((item) => {
        totalPriceAfterInsert += item.quantity * item.productId.price;
        totalDiscountPriceAfterInsert +=
          item.quantity * item.productId.priceAfterDiscount;
      });

      cart.totalPrice = totalPriceAfterInsert - totalDiscountPriceAfterInsert;

      await cart.save();
      // add second product=> quantity+1

      return {
        status: 200,
        message: 'Created Cart and Insert Product',
        data: cart,
      };
    } else {
      // else user don't have cart=> create cart
      const inserProduct = await this.cartModule.create({
        cartItems: [{ productId: product_id }],
        totalPrice: product.price,
        user: user_id,
      });
      return {
        status: 200,
        message: 'Created Cart and Insert Product',
        data: inserProduct,
      };
    }
  }
  async applyCoupon(couponName: string, userId: string) {
    const cart = await this.cartModule.findOne({ user: userId });
    const coupon = await this.couponModule.findOne({ name: couponName });

    if (!cart) {
      throw new NotFoundException('Not Found Cart');
    }
    if (!coupon) {
      throw new HttpException('Invalid coupon', 400);
    }
    const isExpired = new Date(coupon.expireDate) > new Date();
    if (!isExpired) {
      throw new HttpException('Invalid coupon', 400);
    }

    const ifCouponAlredyUsed = cart.coupons.findIndex(
      (item) => item.name === couponName,
    );
    if (ifCouponAlredyUsed !== -1) {
      throw new HttpException('Coupon alredy used', 400);
    }

    if (cart.totalPrice <= 0) {
      throw new HttpException('You have full discount', 400);
    }

    cart.coupons.push({ name: coupon.name, couponId: coupon._id.toString() });
    cart.totalPrice = cart.totalPrice - coupon.discount;
    await cart.save();

    return {
      status: 200,
      message: 'Coupon Applied',
      data: cart,
    };
  }
  async update(
    UpdateCartItemsDto: UpdateCartItemsDto,
    productId: string,
    userId: string,
  ) {
    const cart = await this.cartModule
      .findOne({ user: userId })
      .populate(
        'cartItems.productId',
        'price title description priceAfterDiscount _id',
      );
    const product = await this.productModule.findById(productId);

    if (!cart) {
      const result = await this.create(productId, userId);
      return result;
    }

    const indexProductUpdate = cart.cartItems.findIndex(
      (item) => item.productId._id.toString() === productId.toString(),
    );
    if (indexProductUpdate === -1) {
      throw new NotFoundException('Not Found any product in cart');
    }
    if (UpdateCartItemsDto.color) {
      cart.cartItems[indexProductUpdate].color = UpdateCartItemsDto.color;
    }
    let totalPriceInsert = 0;
    let priceAfterDiscountInsert = 0;
    if (UpdateCartItemsDto.quantity) {
      cart.cartItems[indexProductUpdate].quantity = UpdateCartItemsDto.quantity;
      cart.cartItems.map((item) => {
        totalPriceInsert += item.quantity * item.productId.price;
        priceAfterDiscountInsert +=
          item.quantity * item.productId.priceAfterDiscount;
      });
      cart.totalPrice = totalPriceInsert - priceAfterDiscountInsert;
    }
    await cart.save();
    return {
      status: 200,
      message: 'Product Updated',
      data: cart,
    };
  }
  async remove(productId: string, userId: string) {
    const cart = await this.cartModule
      .findOne({ user: userId })
      .populate(
        'cartItems.productId',
        'price title description priceAfterDiscount _id',
      );
    const product = await this.productModule.findById(productId);
    const indexProductRemove = cart?.cartItems.findIndex(
      (item) => item.productId._id.toString() === productId.toString(),
    );
    if (indexProductRemove === -1) {
      throw new NotFoundException('Not Found any product in cart');
    }
    //@ts-ignore
    cart.cartItems = cart.cartItems.filter(
      (item, index) => index === indexProductRemove,
    );
    let totalPriceInsert = 0;
    let priceAfterDiscountInsert = 0;
    //@ts-ignore
    cart.cartItems.map((item) => {
      totalPriceInsert += item.quantity * item.productId.price;
      priceAfterDiscountInsert +=
        item.quantity * item.productId.priceAfterDiscount;
    });
    //@ts-ignore
    cart.cartItems = totalPriceInsert - priceAfterDiscountInsert;
    //@ts-ignore
    await cart.save();
    return {
      status: 200,
      message: 'Deleted Product',
      data: cart,
    };
  }
  async findOneForUser(userId) {
    const cart = await this.cartModule
      .findOne({ user: userId })
      .populate('cartItems.productId', 'price title description');
    if (!cart) {
      throw new NotFoundException(
        `You don't hava a cart please go to add prducts`,
      );
    }
    return {
      status: 200,
      message: 'Found Cart',
      data: cart,
    };
  }
  // ===== For Admin ======== \\
  async findOneForAdmin(userId) {
    const cart = await this.cartModule
      .findOne({ user: userId })
      .populate('cartItems.productId', 'price title description');
    if (!cart) {
      throw new NotFoundException('Not Found Cart');
    }
    return {
      status: 200,
      message: 'Found Cart',
      data: cart,
    };
  }
  async findAllForAdmin() {
    const carts = await this.cartModule
      .find()
      .select('-__v')
      .populate(
        'cartItems.productId user coupons.couponId',
        'name email expireDate price title description',
      );
    return {
      status: 200,
      message: 'Found All Carts',
      length: carts.length,
      data: carts,
    };
  }
}

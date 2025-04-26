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
  UnauthorizedException,
  ValidationPipe,
} from '@nestjs/common';
import { RequestProductService } from './request-product.service';
import { CreateRequestProductDto } from './dto/create-request-product.dto';
import { UpdateRequestProductDto } from './dto/update-request-product.dto';
import { Roles } from 'src/user/decorator/role-decorator';
import { AuthGuard } from 'src/user/guard/Auth.guard';

@Controller('req-product')
@UseGuards(AuthGuard)
export class RequestProductController {
  constructor(private readonly requestProductService: RequestProductService) {}

  @Post()
  @Roles(['user'])
  @UseGuards(AuthGuard)
  create(
    @Body(new ValidationPipe({ forbidNonWhitelisted: true, whitelist: true }))
    createRequestProductDto: CreateRequestProductDto,
    @Req() req,
  ) {
    if (req.user.role.toLowerCase() === 'admin') {
      throw new UnauthorizedException();
    }
    return this.requestProductService.create({
      ...createRequestProductDto,
      user: req.user._id,
    });
  }

  @Get()
  @Roles(['admin'])
  findAll() {
    return this.requestProductService.findAll();
  }

  @Get(':id')
  @Roles(['admin', 'user'])
  findOne(@Param('id') id: string, @Req() req) {
    return this.requestProductService.findOne(id, req);
  }

  @Patch(':id')
  @Roles(['user'])
  update(
    @Param('id') id: string,
    @Body() updateRequestProductDto: UpdateRequestProductDto,
    @Req() req,
  ) {
    if (req.user.role.toLowerCase() === 'admin') {
      throw new UnauthorizedException();
    }
    return this.requestProductService.update(id, updateRequestProductDto, req);
  }

  @Delete(':id')
  @Roles(['user'])
  remove(@Param('id') id: string, @Req() req) {
    if (req.user.role.toLowerCase() === 'admin') {
      throw new UnauthorizedException();
    }
    return this.requestProductService.remove(id, req);
  }
}

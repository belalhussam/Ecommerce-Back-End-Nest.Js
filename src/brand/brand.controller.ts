import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ValidationPipe,
} from '@nestjs/common';
import { BrandService } from './brand.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';

@Controller('brand')
export class BrandController {
  constructor(private readonly brandService: BrandService) {}
  // @dec  find Brand
  // @Route find api/v1/Brand
  // @access private[admin]
  @Post()
  create(
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    CreateBrandDto: CreateBrandDto,
  ) {
    return this.brandService.create(CreateBrandDto);
  }
  // @dec  find Brand
  // @Route find api/v1/Brand
  // @access private[admin]
  @Get()
  findAll() {
    return this.brandService.findAll();
  }
  // @dec  find Brand
  // @Route find api/v1/Brand
  // @access public
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.brandService.findOne(id);
  }
  // @dec  update Brand
  // @Route update api/v1/Brand
  // @access private[admin]
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    UpdateBrandDto: UpdateBrandDto,
  ) {
    return this.brandService.update(id, UpdateBrandDto);
  }
  // @dec  delete Brand
  // @Route delete api/v1/Brand
  // @access private[admin]
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.brandService.remove(id);
  }
}

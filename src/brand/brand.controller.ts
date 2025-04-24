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
import { BrandService } from './brand.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { AuthGuard } from 'src/user/guard/Auth.guard';
import { Roles } from 'src/user/decorator/role-decorator';

@Controller('brand')
@UseGuards(AuthGuard)
export class BrandController {
  constructor(private readonly brandService: BrandService) {}
  // @dec  find Brand
  // @Route find api/v1/Brand
  // @access private[admin]
  @Post()
  @Roles(['admin'])
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
  @Roles(['admin'])
  findAll() {
    return this.brandService.findAll();
  }
  // @dec  find Brand
  // @Route find api/v1/Brand
  // @access public
  @Get(':id')
  @Roles(['admin', 'user'])
  findOne(@Param('id') id: string) {
    return this.brandService.findOne(id);
  }
  // @dec  update Brand
  // @Route update api/v1/Brand
  // @access private[admin]
  @Patch(':id')
  @Roles(['admin'])
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
  @Roles(['admin'])
  remove(@Param('id') id: string) {
    return this.brandService.remove(id);
  }
}

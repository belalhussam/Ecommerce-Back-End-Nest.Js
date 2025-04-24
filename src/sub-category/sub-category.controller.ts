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
import { SubCategoryService } from './sub-category.service';
import { SubCreateCategoryDto } from './dto/create-sub-category.dto';
import { UpdateSubCategoryDto } from './dto/update-sub-category.dto';

@Controller('subcategory')
export class SubCategoryController {
  constructor(private readonly subCategoryService: SubCategoryService) {}
  // @dec  find SubCategory
  // @Route find api/v1/SubCategory
  // @access private[admin]
  @Post()
  create(
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    SubCreateCategoryDto: SubCreateCategoryDto,
  ) {
    return this.subCategoryService.create(SubCreateCategoryDto);
  }
  // @dec  find SubCategory
  // @Route find api/v1/SubCategory
  // @access private[admin]
  @Get()
  findAll() {
    return this.subCategoryService.findAll();
  }
  // @dec  find SubCategory
  // @Route find api/v1/SubCategory
  // @access public
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.subCategoryService.findOne(id);
  }
  // @dec  update SubCategory
  // @Route update api/v1/SubCategory
  // @access private[admin]
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    updateSubCategoryDto: UpdateSubCategoryDto,
  ) {
    return this.subCategoryService.update(id, updateSubCategoryDto);
  }
  // @dec  delete SubCategory
  // @Route delete api/v1/SubCategory
  // @access private[admin]
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.subCategoryService.remove(id);
  }
}

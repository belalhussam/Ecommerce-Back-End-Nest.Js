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
  Query,
} from '@nestjs/common';
import { SubCategoryService } from './sub-category.service';
import { SubCreateCategoryDto } from './dto/create-sub-category.dto';
import { UpdateSubCategoryDto } from './dto/update-sub-category.dto';
import { AuthGuard } from 'src/user/guard/Auth.guard';
import { Roles } from 'src/user/decorator/role-decorator';

@Controller('subcategory')
@UseGuards(AuthGuard)
export class SubCategoryController {
  constructor(private readonly subCategoryService: SubCategoryService) {}
  // @dec  find SubCategory
  // @Route find api/v1/SubCategory
  // @access private[admin]
  @Post()
  @Roles(['admin'])
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
  @Roles(['admin'])
  findAll(@Query() query) {
    return this.subCategoryService.findAll();
  }
  // @dec  find SubCategory
  // @Route find api/v1/SubCategory
  // @access public
  @Get(':id')
  @Roles(['admin', 'user'])
  findOne(@Param('id') id: string) {
    return this.subCategoryService.findOne(id);
  }
  // @dec  update SubCategory
  // @Route update api/v1/SubCategory
  // @access private[admin]
  @Patch(':id')
  @Roles(['admin'])
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
  @Roles(['admin'])
  remove(@Param('id') id: string) {
    return this.subCategoryService.remove(id);
  }
}

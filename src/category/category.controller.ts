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
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { AuthGuard } from 'src/user/guard/Auth.guard';
import { Roles } from 'src/user/decorator/role-decorator';

@Controller('category')
@UseGuards(AuthGuard)
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}
  // @dec  find category
  // @Route find api/v1/category
  // @access private[admin]
  @Post()
  @Roles(['admin'])
  create(
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    createCategoryDto: CreateCategoryDto,
  ) {
    return this.categoryService.create(createCategoryDto);
  }
  // @dec  find category
  // @Route find api/v1/category
  // @access private[admin]
  @Get()
  @Roles(['admin'])
  findAll() {
    return this.categoryService.findAll();
  }
  // @dec  find category
  // @Route find api/v1/category
  // @access public
  @Get(':id')
  @Roles(['user', 'admin'])
  findOne(@Param('id') id: string) {
    return this.categoryService.findOne(id);
  }
  // @dec  update category
  // @Route update api/v1/category
  // @access private[admin]
  @Patch(':id')
  @Roles(['admin'])
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoryService.update(id, updateCategoryDto);
  }
  // @dec  delete category
  // @Route delete api/v1/category
  // @access private[admin]
  @Delete(':id')
  @Roles(['admin'])
  remove(@Param('id') id: string) {
    return this.categoryService.remove(id);
  }
}

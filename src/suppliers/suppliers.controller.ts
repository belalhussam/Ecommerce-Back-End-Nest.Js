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
import { SuppliersService } from './suppliers.service';
import { CreateSuppliersDto } from './dto/create-suppliers.dto';
import { UpdateSuppliersDto } from './dto/update-suppliers.dto';
import { AuthGuard } from 'src/user/guard/Auth.guard';
import { Roles } from 'src/user/decorator/role-decorator';

@Controller('suppliers')
@UseGuards(AuthGuard)
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}
  // @dec  find Suppliers
  // @Route find api/v1/Suppliers
  // @access private[admin]
  @Post()
  @Roles(['admin'])
  create(
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    CreateSuppliersDto: CreateSuppliersDto,
  ) {
    return this.suppliersService.create(CreateSuppliersDto);
  }
  // @dec  find Suppliers
  // @Route find api/v1/Suppliers
  // @access private[admin]
  @Get()
  @Roles(['admin'])
  findAll() {
    return this.suppliersService.findAll();
  }
  // @dec  find Suppliers
  // @Route find api/v1/Suppliers
  // @access public
  @Get(':id')
  @Roles(['admin', 'user'])
  findOne(@Param('id') id: string) {
    return this.suppliersService.findOne(id);
  }
  // @dec  update Suppliers
  // @Route update api/v1/Suppliers
  // @access private[admin]
  @Patch(':id')
  @Roles(['admin'])
  update(
    @Param('id') id: string,
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    UpdateSuppliersDto: UpdateSuppliersDto,
  ) {
    return this.suppliersService.update(id, UpdateSuppliersDto);
  }
  // @dec  delete Suppliers
  // @Route delete api/v1/Suppliers
  // @access private[admin]
  @Delete(':id')
  @Roles(['admin'])
  remove(@Param('id') id: string) {
    return this.suppliersService.remove(id);
  }
}

import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  PRODUCT_SERVICE,
  PRODUCT_PATTERNS,
  CreateProductDto,
  UpdateProductDto,
} from '@app/shared';
import { JwtAuthGuard } from '../../common/jwt-auth.guard';

// Every product route is protected behind a valid JWT.
@UseGuards(JwtAuthGuard)
@Controller('products')
export class ProductController {
  constructor(
    @Inject(PRODUCT_SERVICE) private readonly productClient: ClientProxy,
  ) {}

  // FR-1: create
  @Post()
  create(@Body() body: CreateProductDto) {
    return this.productClient.send(PRODUCT_PATTERNS.CREATE, body);
  }

  // FR-1: edit
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateProductDto) {
    return this.productClient.send(PRODUCT_PATTERNS.UPDATE, { id, ...body });
  }

  // FR-2: activate (kích hoạt kinh doanh)
  @Patch(':id/activate')
  activate(@Param('id') id: string) {
    return this.productClient.send(PRODUCT_PATTERNS.ACTIVATE, { id });
  }

  // FR-2: deactivate (ngừng kinh doanh)
  @Patch(':id/deactivate')
  deactivate(@Param('id') id: string) {
    return this.productClient.send(PRODUCT_PATTERNS.DEACTIVATE, { id });
  }

  @Get(':id')
  getProduct(@Param('id') id: string) {
    return this.productClient.send(PRODUCT_PATTERNS.GET_PRODUCT, { id });
  }
}

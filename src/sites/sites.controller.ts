import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { CreateSiteDto } from './dto/create-site.dto';
import { UpdateSiteDto } from './dto/update-site.dto';
import { SiteEntity } from './entities/site.entity';
import { SitesService } from './sites.service';

@ApiTags('sites')
@Controller('api/v1/sites')
export class SitesController {
  constructor(private readonly sitesService: SitesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all registered websites' })
  @ApiOkResponse({ type: [SiteEntity] })
  async findAll(): Promise<SiteEntity[]> {
    return this.sitesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a website by ID' })
  @ApiOkResponse({ type: SiteEntity })
  @ApiNotFoundResponse({ description: 'Site not found' })
  async findOne(@Param('id') id: string): Promise<SiteEntity> {
    return this.sitesService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new website' })
  @ApiCreatedResponse({ type: SiteEntity })
  async create(@Body() createSiteDto: CreateSiteDto): Promise<SiteEntity> {
    return this.sitesService.create(createSiteDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a website details or status' })
  @ApiOkResponse({ type: SiteEntity })
  @ApiNotFoundResponse({ description: 'Site not found' })
  async update(
    @Param('id') id: string,
    @Body() updateSiteDto: UpdateSiteDto,
  ): Promise<SiteEntity> {
    return this.sitesService.update(id, updateSiteDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a website' })
  @ApiOkResponse({ type: SiteEntity })
  @ApiNotFoundResponse({ description: 'Site not found' })
  async remove(@Param('id') id: string): Promise<SiteEntity> {
    return this.sitesService.remove(id);
  }

  @Get(':id/verify')
  @ApiOperation({ summary: 'Verify if the tracking script is installed on the website' })
  @ApiOkResponse({ description: 'Verification result' })
  async verify(@Param('id') id: string): Promise<{ verified: boolean; error?: string }> {
    return this.sitesService.verifySite(id);
  }
}


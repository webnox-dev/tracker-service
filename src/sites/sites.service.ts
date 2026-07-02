import { Injectable, NotFoundException } from '@nestjs/common';
import * as crypto from 'node:crypto';

import { PrismaService } from '../prisma/prisma.service';
import { CreateSiteDto } from './dto/create-site.dto';
import { UpdateSiteDto } from './dto/update-site.dto';
import { SiteEntity } from './entities/site.entity';

@Injectable()
export class SitesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<SiteEntity[]> {
    return this.prisma.site.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string): Promise<SiteEntity> {
    const site = await this.prisma.site.findUnique({
      where: { id },
    });

    if (!site) {
      throw new NotFoundException(`Site with ID ${id} not found`);
    }

    return site;
  }

  async create(dto: CreateSiteDto): Promise<SiteEntity> {
    const apiKey = `tr_${crypto.randomBytes(16).toString('hex')}`;
    return this.prisma.site.create({
      data: {
        name: dto.name,
        domain: dto.domain,
        description: dto.description ?? null,
        apiKey,
        status: 'enabled',
      },
    });
  }

  async update(id: string, dto: UpdateSiteDto): Promise<SiteEntity> {
    // Verify site exists
    await this.findOne(id);

    return this.prisma.site.update({
      where: { id },
      data: {
        name: dto.name,
        domain: dto.domain,
        description: dto.description !== undefined ? dto.description : undefined,
        status: dto.status,
      },
    });
  }

  async remove(id: string): Promise<SiteEntity> {
    // Verify site exists
    await this.findOne(id);

    return this.prisma.site.delete({
      where: { id },
    });
  }

  async verifySite(id: string): Promise<{ verified: boolean; error?: string }> {
    const site = await this.findOne(id);
    const url = `https://${site.domain}?t=${Date.now()}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      });
      clearTimeout(timeout);

      const html = await response.text();
      const verified = html.includes(site.apiKey);

      if (verified) {
        return { verified: true };
      }

      // If not verified on HTTPS, try HTTP as fallback
      return this.verifyHttpSite(site.domain, site.apiKey);
    } catch (err: any) {
      clearTimeout(timeout);
      // Fallback to HTTP
      return this.verifyHttpSite(site.domain, site.apiKey);
    }
  }

  private async verifyHttpSite(
    domain: string,
    apiKey: string,
  ): Promise<{ verified: boolean; error?: string }> {
    const url = `http://${domain}?t=${Date.now()}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      });
      clearTimeout(timeout);

      const html = await response.text();
      const verified = html.includes(apiKey);

      if (verified) {
        return { verified: true };
      }

      return {
        verified: false,
        error: 'Tracking script API Key not found in the website HTML source code.',
      };
    } catch (err: any) {
      clearTimeout(timeout);
      const isAbort = err.name === 'AbortError';
      return {
        verified: false,
        error: isAbort
          ? 'Connection timed out. The website is taking too long to respond.'
          : `Could not connect to website: ${err.message}`,
      };
    }
  }
}


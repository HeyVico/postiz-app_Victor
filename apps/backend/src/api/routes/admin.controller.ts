import {
  Body,
  Controller,
  Get,
  HttpException,
  Param,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { GetUserFromRequest } from '@gitroom/nestjs-libraries/user/user.from.request';
import { User } from '@prisma/client';
import { ApiTags } from '@nestjs/swagger';
import { ErrorsService } from '@gitroom/nestjs-libraries/database/prisma/errors/errors.service';
import { AdminStatsService } from '@gitroom/nestjs-libraries/database/prisma/admin-stats/admin-stats.service';
import { OrganizationService } from '@gitroom/nestjs-libraries/database/prisma/organizations/organization.service';
import { IntegrationManager } from '@gitroom/nestjs-libraries/integrations/integration.manager';
import { AdminCreateOrganizationDto } from '@gitroom/nestjs-libraries/dtos/settings/admin.create.organization.dto';
import { AdminAllowedProvidersDto } from '@gitroom/nestjs-libraries/dtos/settings/admin.allowed.providers.dto';
import dayjs from 'dayjs';

@ApiTags('Admin')
@Controller('/admin')
export class AdminController {
  constructor(
    private _errorsService: ErrorsService,
    private _adminStatsService: AdminStatsService,
    private _organizationService: OrganizationService,
    private _integrationManager: IntegrationManager
  ) {}

  private assertSuperAdmin(user: User) {
    if (!user?.isSuperAdmin) {
      throw new HttpException('Unauthorized', 400);
    }
  }

  @Get('/errors')
  async listErrors(
    @GetUserFromRequest() user: User,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('platform') platform?: string,
    @Query('email') email?: string,
    @Query('unknownFirst') unknownFirst?: string
  ) {
    this.assertSuperAdmin(user);
    return this._errorsService.listErrors({
      page: page ? parseInt(page, 10) : 0,
      limit: limit ? parseInt(limit, 10) : 20,
      platform: platform || undefined,
      email: email || undefined,
      unknownFirst: unknownFirst === 'true' || unknownFirst === '1',
    });
  }

  @Get('/errors/platforms')
  async listPlatforms(@GetUserFromRequest() user: User) {
    this.assertSuperAdmin(user);
    return this._errorsService.listPlatforms();
  }

  @Get('/organizations')
  async listOrganizations(
    @GetUserFromRequest() user: User,
    @Query('search') search?: string
  ) {
    this.assertSuperAdmin(user);
    return (
      await this._organizationService.getOrganizationsForAdmin(
        user.id,
        search || undefined
      )
    ).map((org) => ({
      id: org.id,
      name: org.name,
      createdAt: org.createdAt,
      member: org.users.length > 0,
      members: org._count.users,
      channels: org._count.Integration,
      allowedProviders: org.allowedProviders
        ? this._integrationManager.getOrganizationSocialsIntegrations(
            org.allowedProviders
          )
        : null,
    }));
  }

  @Post('/organizations')
  async createOrganization(
    @GetUserFromRequest() user: User,
    @Req() req: Request,
    @Body() body: AdminCreateOrganizationDto
  ) {
    this.assertSuperAdmin(user);

    // while impersonating, the request user is the impersonated one and
    // would become the owner of the new organization
    if (req.cookies?.impersonate || req.headers.impersonate) {
      throw new HttpException('Stop impersonating to create a workspace', 400);
    }

    return this._organizationService.createOrganizationForAdmin(
      user.id,
      body.name
    );
  }

  @Put('/organizations/:id/providers')
  async updateAllowedProviders(
    @GetUserFromRequest() user: User,
    @Param('id') id: string,
    @Body() body: AdminAllowedProvidersDto
  ) {
    this.assertSuperAdmin(user);

    const known = this._integrationManager.getAllowedSocialsIntegrations();
    return this._organizationService.updateAllowedProviders(
      id,
      body.providers ? body.providers.filter((p) => known.includes(p)) : null
    );
  }

  @Get('/stats')
  async getStats(
    @GetUserFromRequest() user: User,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('unknownOnly') unknownOnly?: string
  ) {
    this.assertSuperAdmin(user);

    const fromDate = from ? dayjs(from) : dayjs().subtract(30, 'day');
    const toDate = to ? dayjs(to) : dayjs();

    return this._adminStatsService.getStats({
      from: fromDate.startOf('day').toDate(),
      to: toDate.endOf('day').toDate(),
      unknownOnly: unknownOnly === 'true' || unknownOnly === '1',
    });
  }
}

import {
  CurrentUser,
  JwtAuthGuard,
  type AuthenticatedUser,
} from '@freeflow/auth';
import { FgaGuard, RequireFga } from '@freeflow/authz-fga';
import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';

import { FormsService } from './forms.service';

@Controller('forms')
export class FormsController {
  constructor(private readonly formsService: FormsService) {}

  @Get(':formId/schema')
  @UseGuards(JwtAuthGuard, FgaGuard)
  @RequireFga('form', ':formId', 'view')
  getSchema(
    @CurrentUser() user: AuthenticatedUser,
    @Param('formId') formId: string
  ) {
    return this.formsService.getSchema(user, formId);
  }

  @Post(':formId/submissions')
  @UseGuards(JwtAuthGuard, FgaGuard)
  @RequireFga('form', ':formId', 'submit')
  submitForm(
    @CurrentUser() user: AuthenticatedUser,
    @Param('formId') formId: string,
    @Body() payload: Record<string, unknown>
  ) {
    return this.formsService.submitForm(user, formId, payload);
  }
}

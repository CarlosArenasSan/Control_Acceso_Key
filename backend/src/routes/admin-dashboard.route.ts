import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminDashboardService } from '../services/admin-dashboard.service';
import { AdminGuard } from '../guards/admin.guard';

@Controller('admin-dashboard')
@UseGuards(AdminGuard)
export class AdminDashboardRoute {
  constructor(private readonly dashboardService: AdminDashboardService) {}

  @Get('start-panel')
  getStartPanel() {
    return this.dashboardService.getStartPanel();
  }
}

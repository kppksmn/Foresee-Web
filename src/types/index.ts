export interface User {
  id: number;
  username: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export interface Job {
  id: number;
  jobNumber: string;
  title: string;
  description?: string;
  driverId?: number;
  driverName?: string;
  vehicleId?: number;
  vehiclePlate?: string;
  status: 'Pending' | 'Assigned' | 'Started' | 'Arrived' | 'Completed' | 'Cancelled';
  pickupLocation: string;
  scheduledStartAt?: string;
  startedAt?: string;
  arrivedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
}

export interface DashboardSummary {
  totalJobsToday: number;
  pendingJobs: number;
  assignedJobs: number;
  startedJobs: number;
  arrivedJobs: number;
  completedJobs: number;
  cancelledJobs: number;
  activeDrivers: number;
  expiredLicenses: number;
}

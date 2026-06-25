export type AdminUserRole = "agency" | "admin";
export type AdminUserStatus = "pending" | "active" | "rejected" | "suspended";

export type AdminUser = {
  id: string;
  agencyName: string;
  agencyNameEn: string;
  email: string;
  role: AdminUserRole;
  status: AdminUserStatus;
  createdAt: string;
  rejectReason?: string;
};

export type AdminUsersFilters = {
  status?: string;
  role?: string;
  search?: string;
  page?: number;
};

export type AdminUsersResult = {
  data: AdminUser[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type AdminPendingUser = {
  id: string;
  agencyName: string;
  agencyNameEn: string;
  email: string;
  createdAt: string;
  initials: string;
};

export type AdminDatasetStatus = "published" | "draft";

export type AdminDataset = {
  id: string;
  title: string;
  titleEn: string;
  agency: string;
  agencyEn: string;
  category: string;
  categoryEn: string;
  status: AdminDatasetStatus;
  qualityScore: number;
  updatedAt: string;
};

export type AdminDatasetsFilters = {
  search?: string;
  status?: string;
  agency?: string;
  page?: number;
};

export type AdminDatasetsResult = {
  data: AdminDataset[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  agencies: string[];
};

export type AdminSubcategory = {
  id: string;
  nameTh: string;
  nameEn: string;
  slug: string;
  agencyName: string;
  datasetCount: number;
};

export type AdminCategory = {
  id: string;
  nameTh: string;
  nameEn: string;
  slug: string;
  datasetCount: number;
  subcategories: AdminSubcategory[];
};

export type AdminCategoryInput = {
  nameTh: string;
  nameEn: string;
  slug: string;
};

export type AdminTag = {
  id: string;
  name: string;
  datasetCount: number;
};

export type AdminCategoriesResult = {
  data: AdminCategory[];
  totalL1: number;
  totalL2: number;
  page: number;
  totalPages: number;
};

export type AdminMonthlyCount = {
  month: string;
  monthEn: string;
  count: number;
};

export type AdminDashboardData = {
  totalUsers: number;
  totalDatasets: number;
  pendingUsers: number;
  todayDownloads: number;
  userTrendPercent: number;
  datasetTrendPercent: number;
  datasetsByMonth: AdminMonthlyCount[];
  downloadsByMonth: AdminMonthlyCount[];
  pendingUserList: AdminPendingUser[];
};

export type AuditLogAction =
  | "UPLOAD"
  | "LOGIN"
  | "DELETE"
  | "APPROVE"
  | "REJECT"
  | "DOWNLOAD";

export type AuditLog = {
  id: string;
  timestamp: string;
  email: string;
  action: AuditLogAction;
  detail: string;
  ip: string;
};

export type AuditLogsFilters = {
  dateFrom?: string;
  dateTo?: string;
  action?: string;
  search?: string;
  page?: number;
};

export type AuditLogsResult = {
  data: AuditLog[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

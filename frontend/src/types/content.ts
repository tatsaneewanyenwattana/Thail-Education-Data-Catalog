export type PageContentTextSection = {
  id: string;
  titleTh: string;
  titleEn: string;
  type?: "text";
  contentTh: string;
  contentEn: string;
};

export type PageContentWarningSection = {
  id: string;
  titleTh: string;
  titleEn: string;
  type: "warning";
  contentTh: string;
  contentEn: string;
  bodyTh?: string;
  bodyEn?: string;
};

export type PageContentRightsSection = {
  id: string;
  titleTh: string;
  titleEn: string;
  type: "rights";
  allowedTh: string[];
  allowedEn: string[];
  prohibitedTh: string[];
  prohibitedEn: string[];
};

export type PageContentSection =
  | PageContentTextSection
  | PageContentWarningSection
  | PageContentRightsSection;

export type PageContentMock = {
  slug: string;
  titleTh: string;
  titleEn: string;
  updatedAt: string;
  sections: PageContentSection[];
};

export type StaticPageIcon = "policy" | "gavel" | "api" | "help";
export type StaticPageStatus = "published" | "draft";

export type AdminStaticPageMeta = {
  slug: string;
  titleTh: string;
  titleEn: string;
  route: string;
  icon: StaticPageIcon;
  status: StaticPageStatus;
  updatedAt: string;
};

export type AdminPageEditorContent = PageContentMock & {
  contentTh: string;
  contentEn: string;
};

export type AdminPageUpdateInput = {
  contentTh: string;
  contentEn: string;
  titleTh?: string;
  titleEn?: string;
};

export type HeroImageMock = {
  imageUrl: string | null;
};

export type ApiDocParam = {
  name: string;
  type: string;
  required: boolean;
  descTh: string;
  descEn: string;
};

export type ApiDocEndpoint = {
  id: string;
  titleTh: string;
  titleEn: string;
  descTh?: string;
  descEn?: string;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  path?: string;
  baseUrl?: string;
  code?: string;
  params?: ApiDocParam[];
  response?: string;
  contentTh?: string;
  contentEn?: string;
};

export type ApiDocsMock = {
  slug: string;
  titleTh: string;
  titleEn: string;
  descriptionTh: string;
  descriptionEn: string;
  version: string;
  updatedAt: string;
  baseUrl: string;
  endpoints: ApiDocEndpoint[];
};

export type Announcement = {
  id: string;
  title: string;
  content: string;
  isActive: boolean;
  imageUrl?: string | null;
  createdAt: string;
};

export type AnnouncementInput = {
  title: string;
  content: string;
  isActive: boolean;
  imageUrl?: string | null;
};

export type AdminAnnouncementsResult = {
  data: Announcement[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

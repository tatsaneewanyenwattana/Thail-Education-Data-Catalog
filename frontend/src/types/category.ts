export type CategorySubcategoryMock = {
  id?: string;
  slug: string;
  nameTh: string;
  nameEn: string;
  level: 2;
  datasetCount: number;
};

export type CategoryMock = {
  id?: string;
  slug: string;
  nameTh: string;
  nameEn: string;
  level: 1;
  datasetCount: number;
  searchCategoryId: string;
  subcategories: CategorySubcategoryMock[];
};

export type CategoryPageData = {
  level: 1 | 2;
  category: CategoryMock;
  subcategory: CategorySubcategoryMock | null;
};

export type MegaMenuLink = {
  id: string;
  slug?: string;
  labelTh: string;
  labelEn: string;
  href?: string;
};

export type MegaMenuCategory = MegaMenuLink & {
  children?: MegaMenuLink[];
};

export type AgencyCategoryL1 = {
  id: string;
  nameTh: string;
  nameEn: string;
  slug: string;
  datasetCount: number;
};

export type AgencyCategoryL2 = {
  id: string;
  nameTh: string;
  nameEn: string;
  slug: string;
  parentId: string;
  parentNameTh: string;
  parentNameEn: string;
  datasetCount: number;
};

export type AgencyCategoryInput = {
  nameTh: string;
  nameEn: string;
  slug: string;
  parentId?: string;
};

export type AgencyCategoriesResponse = {
  data: AgencyCategoryL1[] | AgencyCategoryL2[];
  total: number;
  page: number;
  totalPages: number;
};

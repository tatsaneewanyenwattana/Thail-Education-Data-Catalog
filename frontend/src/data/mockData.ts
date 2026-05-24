export type DatasetStatus = "published" | "draft" | "submitted" | "rejected";

export type DatasetLicense = "open" | "conditional" | "cc";

export type HomeDatasetMock = {
  id: string;
  title: string;
  category: string;
  agency: string;
  status: DatasetStatus;
  downloadCount: number;
  updatedAt: string;
  license: DatasetLicense;
};

export const MOCK_HOME_STATS = {
  totalDatasets: 1234,
  totalDownloads: 56789,
  totalAgencies: 45,
};

export const MOCK_POPULAR_DATASETS: HomeDatasetMock[] = [
  {
    id: "1",
    title: "สถิตินักเรียนรายจังหวัด 2566",
    category: "สถิตินักเรียน",
    agency: "สพฐ.",
    status: "published",
    downloadCount: 12400,
    updatedAt: "2024-01-01T00:00:00Z",
    license: "open",
  },
  {
    id: "2",
    title: "จำนวนนักเรียนรายชั้นเรียน จำแนกตามเพศ ปีการศึกษา 2566",
    category: "สถิติพื้นฐาน",
    agency: "สำนักงานคณะกรรมการการศึกษาขั้นพื้นฐาน (สพฐ.)",
    status: "published",
    downloadCount: 12400,
    updatedAt: "2025-01-13T00:00:00Z",
    license: "open",
  },
  {
    id: "3",
    title: "รายชื่อโรงเรียนและพิกัดที่ตั้งทั่วประเทศไทย ประจำปี 2567",
    category: "ทรัพยากร",
    agency: "กระทรวงศึกษาธิการ",
    status: "published",
    downloadCount: 8100,
    updatedAt: "2025-01-10T00:00:00Z",
    license: "open",
  },
  {
    id: "4",
    title: "สถิติจำนวนบัณฑิตจบใหม่ แยกตามกลุ่มสาขาวิชา 2562-2566",
    category: "อุดมศึกษา",
    agency: "กระทรวง อว. (MHESI)",
    status: "published",
    downloadCount: 5300,
    updatedAt: "2025-01-06T00:00:00Z",
    license: "conditional",
  },
  {
    id: "5",
    title: "ข้อมูลครูและบุคลากรทางการศึกษา 2566",
    category: "บุคลากร",
    agency: "สพฐ.",
    status: "published",
    downloadCount: 8900,
    updatedAt: "2024-12-15T00:00:00Z",
    license: "open",
  },
  {
    id: "6",
    title: "ผลการเรียน O-NET ระดับประถมศึกษา 2566",
    category: "การประเมิน",
    agency: "สถาบันการประเมินผลการศึกษาแห่งชาติ",
    status: "published",
    downloadCount: 15600,
    updatedAt: "2024-11-20T00:00:00Z",
    license: "cc",
  },
];

export const MOCK_LATEST_DATASETS: HomeDatasetMock[] = [
  {
    id: "7",
    title: "งบประมาณสนับสนุนรายหัวนักเรียนระดับประถมศึกษา 2567",
    category: "งบประมาณ",
    agency: "สำนักงบประมาณ",
    status: "published",
    downloadCount: 320,
    updatedAt: "2025-01-15T08:00:00Z",
    license: "open",
  },
  {
    id: "8",
    title: "รายชื่อสถานประกอบการที่ร่วมจัดการศึกษาทวิภาคี 2566",
    category: "อาชีวศึกษา",
    agency: "สอศ. (OVEC)",
    status: "published",
    downloadCount: 540,
    updatedAt: "2025-01-15T06:00:00Z",
    license: "conditional",
  },
  {
    id: "9",
    title: "จำนวนข้าราชการครูเกษียณอายุราชการรายจังหวัด 2567-2570",
    category: "บุคลากร",
    agency: "ก.ค.ศ. (OTEPC)",
    status: "published",
    downloadCount: 210,
    updatedAt: "2025-01-15T02:15:00Z",
    license: "open",
  },
  {
    id: "10",
    title: "สถิตินักเรียนระดับมัธยมศึกษา ปีการศึกษา 2567",
    category: "สถิตินักเรียน",
    agency: "สพฐ.",
    status: "published",
    downloadCount: 980,
    updatedAt: "2025-01-14T12:00:00Z",
    license: "open",
  },
  {
    id: "11",
    title: "รายชื่อโรงเรียนในเขตกรุงเทพมหานคร",
    category: "โรงเรียน",
    agency: "สพฐ.",
    status: "published",
    downloadCount: 2100,
    updatedAt: "2025-01-14T09:00:00Z",
    license: "open",
  },
  {
    id: "12",
    title: "อัตราการเข้าเรียนต่อเนื่อง ม.3-ม.6",
    category: "นักเรียน",
    agency: "สำนักงานคณะกรรมการส่งเสริมการศึกษาเอกชน",
    status: "published",
    downloadCount: 720,
    updatedAt: "2025-01-13T16:30:00Z",
    license: "open",
  },
];

export type CategorySubcategoryMock = {
  slug: string;
  nameTh: string;
  nameEn: string;
  level: 2;
  datasetCount: number;
};

export type CategoryMock = {
  slug: string;
  nameTh: string;
  nameEn: string;
  level: 1;
  datasetCount: number;
  searchCategoryId: string;
  subcategories: CategorySubcategoryMock[];
};

export const MOCK_CATEGORIES: CategoryMock[] = [
  {
    slug: "student-statistics",
    nameTh: "สถิตินักเรียน",
    nameEn: "Student Statistics",
    level: 1,
    datasetCount: 45,
    searchCategoryId: "student-stats",
    subcategories: [
      {
        slug: "student-by-province",
        nameTh: "รายจังหวัด",
        nameEn: "By Province",
        level: 2,
        datasetCount: 12,
      },
      {
        slug: "student-by-year",
        nameTh: "รายปี",
        nameEn: "By Year",
        level: 2,
        datasetCount: 8,
      },
      {
        slug: "student-by-gender",
        nameTh: "รายเพศ",
        nameEn: "By Gender",
        level: 2,
        datasetCount: 6,
      },
    ],
  },
  {
    slug: "teacher-statistics",
    nameTh: "จำนวนครู",
    nameEn: "Teacher Statistics",
    level: 1,
    datasetCount: 28,
    searchCategoryId: "teacher-records",
    subcategories: [
      {
        slug: "teacher-by-subject",
        nameTh: "รายวิชา",
        nameEn: "By Subject",
        level: 2,
        datasetCount: 10,
      },
      {
        slug: "teacher-by-province",
        nameTh: "รายจังหวัด",
        nameEn: "By Province",
        level: 2,
        datasetCount: 8,
      },
    ],
  },
];

export type CategoryPageData = {
  level: 1 | 2;
  category: CategoryMock;
  subcategory: CategorySubcategoryMock | null;
};

export function findCategoryPage(slug: string): CategoryPageData | null {
  for (const category of MOCK_CATEGORIES) {
    if (category.slug === slug) {
      return { level: 1, category, subcategory: null };
    }
    const subcategory = category.subcategories.find((s) => s.slug === slug);
    if (subcategory) {
      return { level: 2, category, subcategory };
    }
  }
  return null;
}

export function getCategoryDatasets(pageData: CategoryPageData): SearchResultMock[] {
  const { category, subcategory, level } = pageData;
  return MOCK_SEARCH_RESULTS.filter((item) => {
    if (item.categoryId !== category.searchCategoryId) return false;
    if (level === 2 && subcategory) {
      return item.subcategorySlug === subcategory.slug;
    }
    return true;
  });
}

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

export const MOCK_MEGAMENU_CATEGORIES: MegaMenuCategory[] = MOCK_CATEGORIES.map(
  (cat) => ({
    id: cat.slug,
    slug: cat.slug,
    labelTh: cat.nameTh,
    labelEn: cat.nameEn,
    children: cat.subcategories.map((sub) => ({
      id: sub.slug,
      slug: sub.slug,
      labelTh: sub.nameTh,
      labelEn: sub.nameEn,
    })),
  })
);

export const MOCK_MEGAMENU_YEARS: MegaMenuLink[] = [
  { id: "y2567", labelTh: "ปีการศึกษา 2567", labelEn: "Academic year 2567" },
  { id: "y2566", labelTh: "ปีการศึกษา 2566", labelEn: "Academic year 2566" },
  { id: "y2565", labelTh: "ปีการศึกษา 2565", labelEn: "Academic year 2565" },
  { id: "y2564", labelTh: "ปีการศึกษา 2564", labelEn: "Academic year 2564" },
  { id: "y2563", labelTh: "ปีการศึกษา 2563", labelEn: "Academic year 2563" },
];

export const MOCK_MEGAMENU_AGENCIES: MegaMenuLink[] = [
  { id: "obec", labelTh: "สพฐ. (OBEC)", labelEn: "OBEC" },
  { id: "ovec", labelTh: "สอศ. (OVEC)", labelEn: "OVEC" },
  { id: "ohec", labelTh: "สกอ. (OHEC)", labelEn: "OHEC" },
  { id: "onie", labelTh: "กศน. (ONIE)", labelEn: "ONIE" },
];

export type SearchFileFormat = "csv" | "excel" | "json";

export type SearchResultMock = {
  id: string;
  titleTh: string;
  titleEn: string;
  descriptionTh: string;
  descriptionEn: string;
  categoryTh: string;
  categoryEn: string;
  categoryId: string;
  subcategorySlug?: string;
  agencyTh: string;
  agencyEn: string;
  agencyId: string;
  status: DatasetStatus;
  downloadCount: number;
  updatedAt: string;
  license: DatasetLicense;
  fileFormats: SearchFileFormat[];
  year: number;
};

export const MOCK_SEARCH_RESULTS: SearchResultMock[] = [
  {
    id: "1",
    titleTh: "สถิตินักเรียนรายจังหวัด 2566",
    titleEn: "Provincial Student Statistics 2023",
    descriptionTh: "ข้อมูลสถิตินักเรียนแยกตามจังหวัดทั่วประเทศ",
    descriptionEn: "Student statistics by province nationwide",
    categoryTh: "สถิตินักเรียน",
    categoryEn: "Student Statistics",
    categoryId: "student-stats",
    subcategorySlug: "student-by-province",
    agencyTh: "สพฐ.",
    agencyEn: "OBEC",
    agencyId: "obec",
    status: "published",
    downloadCount: 12340,
    updatedAt: "2024-05-01T00:00:00Z",
    license: "open",
    fileFormats: ["csv", "excel"],
    year: 2566,
  },
  {
    id: "2",
    titleTh: "สถิติการลงทะเบียนนักเรียนประถมศึกษา 2566",
    titleEn: "Primary Enrollment Statistics 2023",
    descriptionTh:
      "จำนวนนักเรียนแยกตามระดับชั้นและเพศในโรงเรียนสังกัด สพฐ.",
    descriptionEn:
      "Enrollment by grade and gender in OBEC-affiliated schools",
    categoryTh: "สถิตินักเรียน",
    categoryEn: "Student Statistics",
    categoryId: "student-stats",
    subcategorySlug: "student-by-year",
    agencyTh: "สพฐ.",
    agencyEn: "OBEC",
    agencyId: "obec",
    status: "published",
    downloadCount: 8900,
    updatedAt: "2024-04-15T00:00:00Z",
    license: "open",
    fileFormats: ["csv", "json"],
    year: 2566,
  },
  {
    id: "3",
    titleTh: "ข้อมูลครูและบุคลากรทางการศึกษา 2566",
    titleEn: "Teacher and Education Personnel 2023",
    descriptionTh: "จำนวนครูแยกตามสาขาวิชาและวุฒิการศึกษา",
    descriptionEn: "Teacher counts by subject and qualification",
    categoryTh: "ข้อมูลครู",
    categoryEn: "Teacher Records",
    categoryId: "teacher-records",
    subcategorySlug: "teacher-by-subject",
    agencyTh: "สพฐ.",
    agencyEn: "OBEC",
    agencyId: "obec",
    status: "published",
    downloadCount: 5600,
    updatedAt: "2024-03-20T00:00:00Z",
    license: "conditional",
    fileFormats: ["excel"],
    year: 2566,
  },
  {
    id: "4",
    titleTh: "งบประมาณสถาบันอาชีวศึกษา 2566",
    titleEn: "Vocational Institute Budget 2023",
    descriptionTh: "รายงานงบประมาณแยกตามจังหวัดและประเภทสถาบัน",
    descriptionEn: "Budget reports by province and institution type",
    categoryTh: "งบประมาณ",
    categoryEn: "Budget",
    categoryId: "enrollment-secondary",
    agencyTh: "สอศ.",
    agencyEn: "OVEC",
    agencyId: "ovec",
    status: "published",
    downloadCount: 1800,
    updatedAt: "2024-04-01T00:00:00Z",
    license: "cc",
    fileFormats: ["csv", "excel", "json"],
    year: 2566,
  },
  {
    id: "5",
    titleTh: "แผนที่โครงสร้างพื้นฐานดิจิทัลโรงเรียน 2567",
    titleEn: "School Digital Infrastructure Map 2024",
    descriptionTh: "ข้อมูลความพร้อมอินเทอร์เน็ตและห้องปฏิบัติการคอมพิวเตอร์",
    descriptionEn: "Internet readiness and computer lab facilities",
    categoryTh: "โครงสร้างพื้นฐาน",
    categoryEn: "Infrastructure",
    categoryId: "primary",
    agencyTh: "กระทรวงศึกษาธิการ",
    agencyEn: "MOE",
    agencyId: "moe",
    status: "published",
    downloadCount: 850,
    updatedAt: "2025-01-10T00:00:00Z",
    license: "conditional",
    fileFormats: ["json"],
    year: 2567,
  },
  {
    id: "6",
    titleTh: "ผลสัมฤทธิ์ O-NET ระดับมัธยมศึกษาตอนต้น 2566",
    titleEn: "O-NET Lower Secondary Results 2023",
    descriptionTh: "คะแนนเฉลี่ยแยกตามวิชาและภูมิภาค",
    descriptionEn: "Average scores by subject and region",
    categoryTh: "ผลการเรียน",
    categoryEn: "Learning Outcomes",
    categoryId: "secondary",
    agencyTh: "สพฐ.",
    agencyEn: "OBEC",
    agencyId: "obec",
    status: "published",
    downloadCount: 4200,
    updatedAt: "2024-02-10T00:00:00Z",
    license: "open",
    fileFormats: ["csv"],
    year: 2566,
  },
  {
    id: "7",
    titleTh: "รายชื่อสถานประกอบการทวิภาคี 2566",
    titleEn: "Dual Vocational Partner Companies 2023",
    descriptionTh: "รายชื่อสถานประกอบการที่ร่วมจัดการศึกษาทวิภาคี",
    descriptionEn: "Companies participating in dual vocational programs",
    categoryTh: "อาชีวศึกษา",
    categoryEn: "Vocational Education",
    categoryId: "enrollment-secondary",
    agencyTh: "สอศ.",
    agencyEn: "OVEC",
    agencyId: "ovec",
    status: "published",
    downloadCount: 2100,
    updatedAt: "2024-01-28T00:00:00Z",
    license: "open",
    fileFormats: ["excel"],
    year: 2566,
  },
  {
    id: "8",
    titleTh: "จำนวนบัณฑิตจบใหม่ แยกสาขาวิชา 2562-2566",
    titleEn: "New Graduates by Field 2019-2023",
    descriptionTh: "สถิติบัณฑิตจบใหม่ระดับอุดมศึกษา",
    descriptionEn: "Higher education graduate statistics",
    categoryTh: "อุดมศึกษา",
    categoryEn: "Higher Education",
    categoryId: "secondary",
    agencyTh: "กระทรวง อว.",
    agencyEn: "MHESI",
    agencyId: "moe",
    status: "published",
    downloadCount: 5300,
    updatedAt: "2024-01-15T00:00:00Z",
    license: "cc",
    fileFormats: ["csv", "excel"],
    year: 2566,
  },
  {
    id: "9",
    titleTh: "งบประมาณรายหัวนักเรียนประถมศึกษา 2567",
    titleEn: "Per-Student Primary Budget 2024",
    descriptionTh: "งบสนับสนุนรายหัวนักเรียนระดับประถมศึกษา",
    descriptionEn: "Per-capita funding for primary education",
    categoryTh: "งบประมาณ",
    categoryEn: "Budget",
    categoryId: "student-stats",
    subcategorySlug: "student-by-year",
    agencyTh: "สำนักงบประมาณ",
    agencyEn: "Budget Bureau",
    agencyId: "moe",
    status: "published",
    downloadCount: 980,
    updatedAt: "2025-01-05T00:00:00Z",
    license: "open",
    fileFormats: ["csv", "json"],
    year: 2567,
  },
  {
    id: "10",
    titleTh: "อัตราการเข้าเรียนต่อเนื่อง ม.3-ม.6",
    titleEn: "Continuation Rate Grades 10-12",
    descriptionTh: "อัตราการสำเร็จการศึกษาและเข้าศึกษาต่อระดับที่สูงขึ้น",
    descriptionEn: "Completion and progression rates to higher levels",
    categoryTh: "สถิตินักเรียน",
    categoryEn: "Student Statistics",
    categoryId: "student-stats",
    subcategorySlug: "student-by-gender",
    agencyTh: "สพฐ.",
    agencyEn: "OBEC",
    agencyId: "obec",
    status: "published",
    downloadCount: 3200,
    updatedAt: "2024-06-01T00:00:00Z",
    license: "open",
    fileFormats: ["csv", "excel", "json"],
    year: 2566,
  },
  {
    id: "11",
    titleTh: "จำนวนครูรายจังหวัด ปีการศึกษา 2566",
    titleEn: "Teachers by Province 2023",
    descriptionTh: "ข้อมูลจำนวนครูแยกตามจังหวัดทั่วประเทศ",
    descriptionEn: "Teacher counts by province nationwide",
    categoryTh: "ข้อมูลครู",
    categoryEn: "Teacher Records",
    categoryId: "teacher-records",
    subcategorySlug: "teacher-by-province",
    agencyTh: "สพฐ.",
    agencyEn: "OBEC",
    agencyId: "obec",
    status: "published",
    downloadCount: 3100,
    updatedAt: "2024-03-01T00:00:00Z",
    license: "open",
    fileFormats: ["csv", "excel"],
    year: 2566,
  },
];

export const MOCK_FILTER_CATEGORIES: MegaMenuCategory[] = [
  {
    id: "primary",
    labelTh: "การศึกษาขั้นพื้นฐาน",
    labelEn: "Primary Education",
    children: [
      {
        id: "student-stats",
        labelTh: "สถิตินักเรียน",
        labelEn: "Student Statistics",
      },
      {
        id: "teacher-records",
        labelTh: "ข้อมูลครู",
        labelEn: "Teacher Records",
      },
    ],
  },
  {
    id: "secondary",
    labelTh: "การศึกษาขั้นพื้นฐานตอนปลาย",
    labelEn: "Secondary Education",
    children: [
      {
        id: "enrollment-secondary",
        labelTh: "การลงทะเบียน",
        labelEn: "Enrollment",
      },
    ],
  },
];

export const MOCK_FILTER_AGENCIES = [
  { id: "obec", labelTh: "สพฐ. (OBEC)", labelEn: "OBEC" },
  { id: "ovec", labelTh: "สอศ. (OVEC)", labelEn: "OVEC" },
  { id: "moe", labelTh: "กระทรวงศึกษาธิการ", labelEn: "MOE" },
];

export const MOCK_FILTER_YEARS = ["2567", "2566", "2565"];

export const MOCK_FILTER_FORMATS: { id: SearchFileFormat; label: string }[] = [
  { id: "csv", label: "CSV" },
  { id: "excel", label: "XLSX" },
  { id: "json", label: "JSON" },
];

export const MOCK_SEARCH_TOTAL = 1234;

export type DatasetPreviewColumn = {
  key: string;
  labelTh: string;
  labelEn: string;
  masked: boolean;
};

export type DatasetDetailMock = {
  id: string;
  titleTh: string;
  titleEn: string;
  descriptionTh: string;
  descriptionEn: string;
  categoryTh: string;
  categoryEn: string;
  subcategoryTh: string;
  subcategoryEn: string;
  agencyTh: string;
  agencyEn: string;
  publishedAt: string;
  downloadCount: number;
  qualityScore: number;
  license: DatasetLicense;
  status: DatasetStatus;
  tagsTh: string[];
  tagsEn: string[];
  columns: DatasetPreviewColumn[];
  previewData: Record<string, string | number>[];
  citationApaTh: string;
  citationApaEn: string;
  citationVancouverTh: string;
  citationVancouverEn: string;
};

const PREVIEW_COLUMNS_STUDENT: DatasetPreviewColumn[] = [
  { key: "order", labelTh: "ลำดับ", labelEn: "No.", masked: false },
  {
    key: "schoolId",
    labelTh: "รหัสสถานศึกษา",
    labelEn: "School ID",
    masked: false,
  },
  {
    key: "studentName",
    labelTh: "ชื่อนักเรียน",
    labelEn: "Student name",
    masked: true,
  },
  {
    key: "grade",
    labelTh: "ระดับชั้น",
    labelEn: "Grade",
    masked: false,
  },
  { key: "gender", labelTh: "เพศ", labelEn: "Gender", masked: false },
  { key: "province", labelTh: "จังหวัด", labelEn: "Province", masked: false },
];

const PREVIEW_ROWS_STUDENT: Record<string, string | number>[] = [
  {
    order: 1,
    schoolId: "10110001",
    studentName: "นายสมชาย ใจดี",
    grade: "ม.6",
    gender: "ชาย",
    province: "กรุงเทพมหานคร",
  },
  {
    order: 2,
    schoolId: "10110002",
    studentName: "นางสาวสมศรี สุขใจ",
    grade: "ป.4",
    gender: "หญิง",
    province: "เชียงใหม่",
  },
  {
    order: 3,
    schoolId: "10110003",
    studentName: "ด.ช.มานะ ขยันเรียน",
    grade: "ป.1",
    gender: "ชาย",
    province: "ขอนแก่น",
  },
  {
    order: 4,
    schoolId: "10110004",
    studentName: "นางสาวพิมพ์ใจ รักเรียน",
    grade: "ม.3",
    gender: "หญิง",
    province: "นครราชสีมา",
  },
  {
    order: 5,
    schoolId: "10110005",
    studentName: "นายวีรภาพ เก่งมาก",
    grade: "ม.1",
    gender: "ชาย",
    province: "สงขลา",
  },
];

const PREVIEW_COLUMNS_PROVINCE: DatasetPreviewColumn[] = [
  { key: "province", labelTh: "จังหวัด", labelEn: "Province", masked: false },
  {
    key: "studentCount",
    labelTh: "จำนวนนักเรียน",
    labelEn: "Students",
    masked: false,
  },
];

const PREVIEW_ROWS_PROVINCE: Record<string, string | number>[] = [
  { province: "กรุงเทพมหานคร", studentCount: 412345 },
  { province: "เชียงใหม่", studentCount: 198765 },
  { province: "ขอนแก่น", studentCount: 156432 },
  { province: "นครราชสีมา", studentCount: 143210 },
  { province: "สงขลา", studentCount: 128900 },
];

const PREVIEW_COLUMNS_TEACHER: DatasetPreviewColumn[] = [
  { key: "subject", labelTh: "วิชา", labelEn: "Subject", masked: false },
  {
    key: "teacherCount",
    labelTh: "จำนวนครู",
    labelEn: "Teachers",
    masked: false,
  },
];

const PREVIEW_ROWS_TEACHER: Record<string, string | number>[] = [
  { subject: "คณิตศาสตร์", teacherCount: 5432 },
  { subject: "ภาษาไทย", teacherCount: 6789 },
  { subject: "วิทยาศาสตร์", teacherCount: 4890 },
  { subject: "ภาษาอังกฤษ", teacherCount: 5120 },
];

const PREVIEW_COLUMNS_SCHOOL: DatasetPreviewColumn[] = [
  { key: "schoolId", labelTh: "รหัสโรงเรียน", labelEn: "School ID", masked: false },
  { key: "schoolName", labelTh: "ชื่อโรงเรียน", labelEn: "School name", masked: false },
  { key: "latitude", labelTh: "ละติจูด", labelEn: "Latitude", masked: false },
  { key: "longitude", labelTh: "ลองจิจูด", labelEn: "Longitude", masked: false },
];

const PREVIEW_ROWS_SCHOOL: Record<string, string | number>[] = [
  {
    schoolId: "10001",
    schoolName: "โรงเรียนบ้านหนองบัว",
    latitude: 13.7563,
    longitude: 100.5018,
  },
  {
    schoolId: "10002",
    schoolName: "โรงเรียนเทศบาล 1",
    latitude: 18.7883,
    longitude: 98.9853,
  },
  {
    schoolId: "10003",
    schoolName: "โรงเรียนชุมชนบ้านโนน",
    latitude: 16.4419,
    longitude: 102.836,
  },
];

const PREVIEW_COLUMNS_GRADUATE: DatasetPreviewColumn[] = [
  { key: "field", labelTh: "สาขาวิชา", labelEn: "Field", masked: false },
  {
    key: "graduateCount",
    labelTh: "จำนวนบัณฑิต",
    labelEn: "Graduates",
    masked: false,
  },
];

const PREVIEW_ROWS_GRADUATE: Record<string, string | number>[] = [
  { field: "วิศวกรรมศาสตร์", graduateCount: 12450 },
  { field: "ครุศาสตร์", graduateCount: 18900 },
  { field: "พยาบาลศาสตร์", graduateCount: 6780 },
  { field: "บริหารธุรกิจ", graduateCount: 22100 },
];

const PREVIEW_COLUMNS_ONET: DatasetPreviewColumn[] = [
  { key: "subject", labelTh: "วิชา", labelEn: "Subject", masked: false },
  { key: "avgScore", labelTh: "คะแนนเฉลี่ย", labelEn: "Average score", masked: false },
  { key: "region", labelTh: "ภูมิภาค", labelEn: "Region", masked: false },
];

const PREVIEW_ROWS_ONET: Record<string, string | number>[] = [
  { subject: "คณิตศาสตร์", avgScore: 52.4, region: "ภาคกลาง" },
  { subject: "ภาษาไทย", avgScore: 58.1, region: "ภาคกลาง" },
  { subject: "วิทยาศาสตร์", avgScore: 49.8, region: "ภาคเหนือ" },
  { subject: "ภาษาอังกฤษ", avgScore: 41.2, region: "ภาคใต้" },
];

function makeCitations(
  titleTh: string,
  titleEn: string,
  agencyTh: string,
  agencyEn: string
): Pick<
  DatasetDetailMock,
  | "citationApaTh"
  | "citationApaEn"
  | "citationVancouverTh"
  | "citationVancouverEn"
> {
  return {
    citationApaTh: `${agencyTh}. (2567). ${titleTh}. Thai EduData Insight.`,
    citationApaEn: `${agencyEn}. (2024). ${titleEn}. Thai EduData Insight.`,
    citationVancouverTh: `${agencyTh}. ${titleTh} [Dataset]. Thai EduData Insight; 2567.`,
    citationVancouverEn: `${agencyEn}. ${titleEn} [Dataset]. Thai EduData Insight; 2024.`,
  };
}

const DATASET_DETAIL_1: DatasetDetailMock = {
  id: "1",
  titleTh: "สถิตินักเรียนรายจังหวัด 2566",
  titleEn: "Provincial Student Statistics 2023",
  descriptionTh:
    "ข้อมูลสถิติจำนวนนักเรียนแยกตามจังหวัดทั่วประเทศ ประจำปีการศึกษา 2566 สำหรับการวางแผนและจัดสรรทรัพยากรการศึกษา",
  descriptionEn:
    "Student enrollment statistics by province nationwide for academic year 2023, for education planning and resource allocation.",
  categoryTh: "สถิตินักเรียน",
  categoryEn: "Student statistics",
  subcategoryTh: "รายจังหวัด",
  subcategoryEn: "By province",
  agencyTh: "สพฐ.",
  agencyEn: "OBEC",
  publishedAt: "2024-01-01T00:00:00Z",
  downloadCount: 12400,
  qualityScore: 88,
  license: "open",
  status: "published",
  tagsTh: ["นักเรียน", "จังหวัด", "2566"],
  tagsEn: ["students", "province", "2023"],
  columns: PREVIEW_COLUMNS_PROVINCE,
  previewData: PREVIEW_ROWS_PROVINCE,
  ...makeCitations(
    "สถิตินักเรียนรายจังหวัด 2566",
    "Provincial Student Statistics 2023",
    "สำนักงานคณะกรรมการการศึกษาขั้นพื้นฐาน",
    "Office of the Basic Education Commission"
  ),
};

const DATASET_DETAIL_2: DatasetDetailMock = {
  id: "2",
  titleTh: "จำนวนนักเรียนรายชั้นเรียน จำแนกตามเพศ ปีการศึกษา 2566",
  titleEn: "Student Enrollment by Grade and Gender, Academic Year 2023",
  descriptionTh:
    "ชุดข้อมูลสถิติจำนวนนักเรียนรายชั้นเรียน ประจำปีการศึกษา 2566 โดยจำแนกตามเพศและระดับชั้น ครอบคลุมสถานศึกษาในสังกัด สพฐ. ทั่วประเทศ",
  descriptionEn:
    "Student enrollment by grade and gender for academic year 2023 across OBEC-affiliated schools nationwide.",
  categoryTh: "สถิติพื้นฐาน",
  categoryEn: "Basic statistics",
  subcategoryTh: "สถิตินักเรียน",
  subcategoryEn: "Student statistics",
  agencyTh: "สพฐ.",
  agencyEn: "OBEC",
  publishedAt: "2025-01-13T00:00:00Z",
  downloadCount: 12400,
  qualityScore: 85,
  license: "open",
  status: "published",
  tagsTh: ["สถิติการศึกษา", "นักเรียน", "ปี 2566"],
  tagsEn: ["education statistics", "students", "year 2023"],
  columns: PREVIEW_COLUMNS_STUDENT,
  previewData: PREVIEW_ROWS_STUDENT,
  ...makeCitations(
    "จำนวนนักเรียนรายชั้นเรียน จำแนกตามเพศ ปีการศึกษา 2566",
    "Student Enrollment by Grade and Gender, Academic Year 2023",
    "สำนักงานคณะกรรมการการศึกษาขั้นพื้นฐาน",
    "Office of the Basic Education Commission"
  ),
};

const DATASET_DETAIL_3: DatasetDetailMock = {
  id: "3",
  titleTh: "รายชื่อโรงเรียนและพิกัดที่ตั้งทั่วประเทศไทย ประจำปี 2567",
  titleEn: "School Directory and Coordinates Nationwide 2024",
  descriptionTh:
    "รายชื่อโรงเรียนพร้อมพิกัดที่ตั้งทางภูมิศาสตร์ทั่วประเทศ สำหรับการวางแผนโครงสร้างพื้นฐานและบริการข้อมูลเชิงพื้นที่",
  descriptionEn:
    "Directory of schools with geographic coordinates nationwide for infrastructure planning and spatial analysis.",
  categoryTh: "ทรัพยากร",
  categoryEn: "Resources",
  subcategoryTh: "โรงเรียน",
  subcategoryEn: "Schools",
  agencyTh: "กระทรวงศึกษาธิการ",
  agencyEn: "MOE",
  publishedAt: "2025-01-10T00:00:00Z",
  downloadCount: 8100,
  qualityScore: 82,
  license: "open",
  status: "published",
  tagsTh: ["โรงเรียน", "พิกัด", "2567"],
  tagsEn: ["schools", "coordinates", "2024"],
  columns: PREVIEW_COLUMNS_SCHOOL,
  previewData: PREVIEW_ROWS_SCHOOL,
  ...makeCitations(
    "รายชื่อโรงเรียนและพิกัดที่ตั้งทั่วประเทศไทย ประจำปี 2567",
    "School Directory and Coordinates Nationwide 2024",
    "กระทรวงศึกษาธิการ",
    "Ministry of Education"
  ),
};

const DATASET_DETAIL_4: DatasetDetailMock = {
  id: "4",
  titleTh: "สถิติจำนวนบัณฑิตจบใหม่ แยกตามกลุ่มสาขาวิชา 2562-2566",
  titleEn: "New Graduates by Field of Study 2019-2023",
  descriptionTh:
    "สถิติบัณฑิตจบใหม่ระดับอุดมศึกษาแยกตามกลุ่มสาขาวิชา ช่วงปีการศึกษา 2562-2566",
  descriptionEn:
    "Higher education graduate statistics by field of study for academic years 2019-2023.",
  categoryTh: "อุดมศึกษา",
  categoryEn: "Higher education",
  subcategoryTh: "บัณฑิต",
  subcategoryEn: "Graduates",
  agencyTh: "กระทรวง อว.",
  agencyEn: "MHESI",
  publishedAt: "2025-01-06T00:00:00Z",
  downloadCount: 5300,
  qualityScore: 80,
  license: "conditional",
  status: "published",
  tagsTh: ["บัณฑิต", "อุดมศึกษา", "2566"],
  tagsEn: ["graduates", "higher education", "2023"],
  columns: PREVIEW_COLUMNS_GRADUATE,
  previewData: PREVIEW_ROWS_GRADUATE,
  ...makeCitations(
    "สถิติจำนวนบัณฑิตจบใหม่ แยกตามกลุ่มสาขาวิชา 2562-2566",
    "New Graduates by Field of Study 2019-2023",
    "กระทรวงการอุดมศึกษา วิทยาศาสตร์ วิจัยและนวัตกรรม",
    "Ministry of Higher Education, Science, Research and Innovation"
  ),
};

const DATASET_DETAIL_5: DatasetDetailMock = {
  id: "5",
  titleTh: "ข้อมูลครูและบุคลากรทางการศึกษา 2566",
  titleEn: "Teachers and Education Personnel 2023",
  descriptionTh:
    "ข้อมูลจำนวนครูและบุคลากรทางการศึกษาแยกตามวิชาที่สอน ประจำปีการศึกษา 2566",
  descriptionEn:
    "Number of teachers disaggregated by teaching subject for academic year 2023.",
  categoryTh: "บุคลากร",
  categoryEn: "Personnel",
  subcategoryTh: "รายวิชา",
  subcategoryEn: "By subject",
  agencyTh: "สพฐ.",
  agencyEn: "OBEC",
  publishedAt: "2024-12-15T00:00:00Z",
  downloadCount: 8900,
  qualityScore: 78,
  license: "open",
  status: "published",
  tagsTh: ["ครู", "วิชา", "2566"],
  tagsEn: ["teachers", "subject", "2023"],
  columns: PREVIEW_COLUMNS_TEACHER,
  previewData: PREVIEW_ROWS_TEACHER,
  ...makeCitations(
    "ข้อมูลครูและบุคลากรทางการศึกษา 2566",
    "Teachers and Education Personnel 2023",
    "สำนักงานคณะกรรมการการศึกษาขั้นพื้นฐาน",
    "Office of the Basic Education Commission"
  ),
};

const DATASET_DETAIL_7: DatasetDetailMock = {
  id: "7",
  titleTh: "รายชื่อสถานประกอบการทวิภาคี 2566",
  titleEn: "Dual Vocational Partner Companies 2023",
  descriptionTh: "รายชื่อสถานประกอบการที่ร่วมจัดการศึกษาทวิภาคี",
  descriptionEn: "Companies participating in dual vocational programs",
  categoryTh: "อาชีวศึกษา",
  categoryEn: "Vocational Education",
  subcategoryTh: "ทวิภาคี",
  subcategoryEn: "Dual training",
  agencyTh: "สอศ.",
  agencyEn: "OVEC",
  publishedAt: "2024-01-28T00:00:00Z",
  downloadCount: 2100,
  qualityScore: 76,
  license: "open",
  status: "published",
  tagsTh: ["ทวิภาคี", "อาชีวศึกษา", "2566"],
  tagsEn: ["dual", "vocational", "2023"],
  columns: PREVIEW_COLUMNS_SCHOOL,
  previewData: PREVIEW_ROWS_SCHOOL,
  ...makeCitations(
    "รายชื่อสถานประกอบการทวิภาคี 2566",
    "Dual Vocational Partner Companies 2023",
    "สำนักงานคณะกรรมการการอาชีวศึกษา",
    "Office of the Vocational Education Commission"
  ),
};

const DATASET_DETAIL_8: DatasetDetailMock = {
  id: "8",
  titleTh: "จำนวนบัณฑิตจบใหม่ แยกสาขาวิชา 2562-2566",
  titleEn: "New Graduates by Field 2019-2023",
  descriptionTh: "สถิติบัณฑิตจบใหม่ระดับอุดมศึกษา",
  descriptionEn: "Higher education graduate statistics",
  categoryTh: "อุดมศึกษา",
  categoryEn: "Higher Education",
  subcategoryTh: "บัณฑิต",
  subcategoryEn: "Graduates",
  agencyTh: "กระทรวง อว.",
  agencyEn: "MHESI",
  publishedAt: "2024-01-15T00:00:00Z",
  downloadCount: 5300,
  qualityScore: 79,
  license: "cc",
  status: "published",
  tagsTh: ["บัณฑิต", "อุดมศึกษา", "2566"],
  tagsEn: ["graduates", "higher education", "2023"],
  columns: PREVIEW_COLUMNS_GRADUATE,
  previewData: PREVIEW_ROWS_GRADUATE,
  ...makeCitations(
    "จำนวนบัณฑิตจบใหม่ แยกสาขาวิชา 2562-2566",
    "New Graduates by Field 2019-2023",
    "กระทรวงการอุดมศึกษา วิทยาศาสตร์ วิจัยและนวัตกรรม",
    "Ministry of Higher Education, Science, Research and Innovation"
  ),
};

const DATASET_DETAIL_9: DatasetDetailMock = {
  id: "9",
  titleTh: "งบประมาณรายหัวนักเรียนประถมศึกษา 2567",
  titleEn: "Per-Student Primary Budget 2024",
  descriptionTh: "งบสนับสนุนรายหัวนักเรียนระดับประถมศึกษา",
  descriptionEn: "Per-capita funding for primary education",
  categoryTh: "งบประมาณ",
  categoryEn: "Budget",
  subcategoryTh: "รายหัว",
  subcategoryEn: "Per capita",
  agencyTh: "สำนักงบประมาณ",
  agencyEn: "Budget Bureau",
  publishedAt: "2025-01-05T00:00:00Z",
  downloadCount: 980,
  qualityScore: 74,
  license: "open",
  status: "published",
  tagsTh: ["งบประมาณ", "ประถมศึกษา", "2567"],
  tagsEn: ["budget", "primary", "2024"],
  columns: PREVIEW_COLUMNS_PROVINCE,
  previewData: PREVIEW_ROWS_PROVINCE,
  ...makeCitations(
    "งบประมาณรายหัวนักเรียนประถมศึกษา 2567",
    "Per-Student Primary Budget 2024",
    "สำนักงบประมาณ",
    "Budget Bureau"
  ),
};

const DATASET_DETAIL_10: DatasetDetailMock = {
  id: "10",
  titleTh: "อัตราการเข้าเรียนต่อเนื่อง ม.3-ม.6",
  titleEn: "Continuation Rate Grades 10-12",
  descriptionTh: "อัตราการสำเร็จการศึกษาและเข้าศึกษาต่อระดับที่สูงขึ้น",
  descriptionEn: "Completion and progression rates to higher levels",
  categoryTh: "สถิตินักเรียน",
  categoryEn: "Student Statistics",
  subcategoryTh: "การเข้าศึกษาต่อ",
  subcategoryEn: "Continuation",
  agencyTh: "สพฐ.",
  agencyEn: "OBEC",
  publishedAt: "2024-06-01T00:00:00Z",
  downloadCount: 3200,
  qualityScore: 83,
  license: "open",
  status: "published",
  tagsTh: ["นักเรียน", "มัธยมศึกษา", "2566"],
  tagsEn: ["students", "secondary", "2023"],
  columns: PREVIEW_COLUMNS_STUDENT,
  previewData: PREVIEW_ROWS_STUDENT,
  ...makeCitations(
    "อัตราการเข้าเรียนต่อเนื่อง ม.3-ม.6",
    "Continuation Rate Grades 10-12",
    "สำนักงานคณะกรรมการการศึกษาขั้นพื้นฐาน",
    "Office of the Basic Education Commission"
  ),
};

const DATASET_DETAIL_6: DatasetDetailMock = {
  id: "6",
  titleTh: "ผลการเรียน O-NET ระดับประถมศึกษา 2566",
  titleEn: "O-NET Primary Education Results 2023",
  descriptionTh:
    "ผลการทดสอบทางการศึกษาระดับชาติ (O-NET) ระดับประถมศึกษา แยกตามวิชาและภูมิภาค ปีการศึกษา 2566",
  descriptionEn:
    "National Educational Test (O-NET) results for primary education by subject and region, academic year 2023.",
  categoryTh: "การประเมิน",
  categoryEn: "Assessment",
  subcategoryTh: "O-NET",
  subcategoryEn: "O-NET",
  agencyTh: "สถาบันการประเมินผลการศึกษาแห่งชาติ",
  agencyEn: "NIETS",
  publishedAt: "2024-11-20T00:00:00Z",
  downloadCount: 15600,
  qualityScore: 91,
  license: "cc",
  status: "published",
  tagsTh: ["O-NET", "ประถมศึกษา", "2566"],
  tagsEn: ["O-NET", "primary", "2023"],
  columns: PREVIEW_COLUMNS_ONET,
  previewData: PREVIEW_ROWS_ONET,
  ...makeCitations(
    "ผลการเรียน O-NET ระดับประถมศึกษา 2566",
    "O-NET Primary Education Results 2023",
    "สถาบันการประเมินผลการศึกษาแห่งชาติ",
    "National Institute of Educational Testing Service"
  ),
};

export const MOCK_DATASET_DETAILS: Record<string, DatasetDetailMock> = {
  "1": DATASET_DETAIL_1,
  "2": DATASET_DETAIL_2,
  "3": DATASET_DETAIL_3,
  "4": DATASET_DETAIL_4,
  "5": DATASET_DETAIL_5,
  "6": DATASET_DETAIL_6,
  "7": DATASET_DETAIL_7,
  "8": DATASET_DETAIL_8,
  "9": DATASET_DETAIL_9,
  "10": DATASET_DETAIL_10,
};

export function getDatasetDetailById(id: string): DatasetDetailMock | null {
  return MOCK_DATASET_DETAILS[id] ?? null;
}

export type StatsYearPoint = {
  year: string;
  count: number;
};

export type StatsCategorySlice = {
  nameTh: string;
  nameEn: string;
  value: number;
};

export type StatsTopDataset = {
  id: string;
  titleTh: string;
  titleEn: string;
  categoryTh: string;
  categoryEn: string;
  downloads: number;
};

export type StatsDataMock = {
  overview: {
    totalDatasets: number;
    totalAgencies: number;
    totalDownloads: number;
    totalCategories: number;
  };
  studentsByYear: StatsYearPoint[];
  teachersByYear: StatsYearPoint[];
  schoolsByYear: StatsYearPoint[];
  datasetByCategory: StatsCategorySlice[];
  topDatasets: StatsTopDataset[];
};

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

export const MOCK_PAGE_CONTENT: PageContentMock[] = [
  {
    slug: "privacy-policy",
    titleTh: "นโยบายความเป็นส่วนตัว",
    titleEn: "Privacy Policy",
    updatedAt: "2024-10-15",
    sections: [
      {
        id: "introduction",
        titleTh: "บทนำ",
        titleEn: "Introduction",
        contentTh:
          '<div class="rounded-r-radius-lg border-l-4 border-primary bg-primary-light p-6"><p class="font-sarabun text-body-md leading-relaxed text-surface-navy">ยินดีต้อนรับสู่ Thai EduData Insight เราให้ความสำคัญสูงสุดกับการคุ้มครองข้อมูลส่วนบุคคลของผู้ใช้งานทุกท่าน นโยบายนี้จัดทำขึ้นเพื่อชี้แจงรายละเอียดเกี่ยวกับการเก็บรวบรวม การใช้ และการคุ้มครองข้อมูลของคุณตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA)</p></div>',
        contentEn:
          '<div class="rounded-r-radius-lg border-l-4 border-primary bg-primary-light p-6"><p class="font-sarabun text-body-md leading-relaxed text-surface-navy">Welcome to Thai EduData Insight. We are committed to protecting your personal data. This policy explains how we collect, use, and safeguard your information under Thailand\'s Personal Data Protection Act (PDPA).</p></div>',
      },
      {
        id: "data-collection",
        titleTh: "ข้อมูลที่เก็บรวบรวม",
        titleEn: "Data Collection",
        contentTh:
          '<p class="mb-4 font-sarabun text-body-md text-text-secondary">เราอาจมีการเก็บรวบรวมข้อมูลส่วนบุคคลดังต่อไปนี้ เพื่อการปรับปรุงการให้บริการ:</p><ul class="space-y-3"><li class="flex items-start gap-3"><span class="mt-1 shrink-0 text-primary" aria-hidden="true">✓</span><span class="font-sarabun text-body-md text-text-secondary">ข้อมูลระบุตัวตน (เช่น ชื่อ นามสกุล และหน่วยงานต้นสังกัด)</span></li><li class="flex items-start gap-3"><span class="mt-1 shrink-0 text-primary" aria-hidden="true">✓</span><span class="font-sarabun text-body-md text-text-secondary">ข้อมูลการติดต่อ (เช่น อีเมล และหมายเลขโทรศัพท์)</span></li><li class="flex items-start gap-3"><span class="mt-1 shrink-0 text-primary" aria-hidden="true">✓</span><span class="font-sarabun text-body-md text-text-secondary">ข้อมูลทางเทคนิค (เช่น เลขที่อยู่ไอพี คุกกี้ และประวัติการเข้าใช้งานระบบ)</span></li></ul>',
        contentEn:
          '<p class="mb-4 font-sarabun text-body-md text-text-secondary">We may collect the following personal data to improve our services:</p><ul class="space-y-3"><li class="flex items-start gap-3"><span class="mt-1 shrink-0 text-primary" aria-hidden="true">✓</span><span class="font-sarabun text-body-md text-text-secondary">Identity data (e.g. name and affiliated agency)</span></li><li class="flex items-start gap-3"><span class="mt-1 shrink-0 text-primary" aria-hidden="true">✓</span><span class="font-sarabun text-body-md text-text-secondary">Contact data (e.g. email and phone number)</span></li><li class="flex items-start gap-3"><span class="mt-1 shrink-0 text-primary" aria-hidden="true">✓</span><span class="font-sarabun text-body-md text-text-secondary">Technical data (e.g. IP address, cookies, and usage history)</span></li></ul>',
      },
      {
        id: "data-usage",
        titleTh: "วัตถุประสงค์การใช้ข้อมูล",
        titleEn: "Data Usage",
        contentTh:
          '<div class="space-y-4"><div class="flex gap-4"><span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-radius-full bg-surface-navy font-kanit text-label font-bold text-white">1</span><p class="pt-1 font-sarabun text-body-md text-text-secondary">เพื่อยืนยันตัวตนในการเข้าใช้ฐานข้อมูลการศึกษาและบริหารจัดการสิทธิ์การเข้าถึงข้อมูลตามระดับชั้นความลับ</p></div><div class="flex gap-4"><span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-radius-full bg-surface-navy font-kanit text-label font-bold text-white">2</span><p class="pt-1 font-sarabun text-body-md text-text-secondary">เพื่อวิเคราะห์พฤติกรรมการใช้งานและนำมาปรับปรุงประสิทธิภาพของระบบการสืบค้นข้อมูลให้ดียิ่งขึ้น</p></div><div class="flex gap-4"><span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-radius-full bg-surface-navy font-kanit text-label font-bold text-white">3</span><p class="pt-1 font-sarabun text-body-md text-text-secondary">เพื่อการติดต่อสื่อสาร แจ้งข่าวสารเกี่ยวกับการอัปเดตชุดข้อมูลใหม่ หรือการเปลี่ยนแปลงนโยบายต่างๆ</p></div></div>',
        contentEn:
          '<div class="space-y-4"><div class="flex gap-4"><span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-radius-full bg-surface-navy font-kanit text-label font-bold text-white">1</span><p class="pt-1 font-sarabun text-body-md text-text-secondary">To verify identity and manage data access according to classification levels.</p></div><div class="flex gap-4"><span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-radius-full bg-surface-navy font-kanit text-label font-bold text-white">2</span><p class="pt-1 font-sarabun text-body-md text-text-secondary">To analyze usage and improve search performance.</p></div><div class="flex gap-4"><span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-radius-full bg-surface-navy font-kanit text-label font-bold text-white">3</span><p class="pt-1 font-sarabun text-body-md text-text-secondary">To communicate updates about new datasets or policy changes.</p></div></div>',
      },
      {
        id: "data-disclosure",
        titleTh: "การเปิดเผยข้อมูล",
        titleEn: "Data Disclosure",
        contentTh:
          '<p class="font-sarabun text-body-md leading-relaxed text-text-secondary">เราจะไม่มีการเปิดเผยข้อมูลส่วนบุคคลของคุณให้แก่บุคคลภายนอก เว้นแต่จะเป็นไปตามฐานอำนาจทางกฎหมาย หรือได้รับการยินยอมอย่างชัดแจ้งจากท่าน โดยหน่วยงานที่เราอาจเปิดเผยข้อมูลให้รวมถึงหน่วยงานรัฐที่มีอำนาจตามกฎหมาย หรือผู้ให้บริการประมวลผลข้อมูลที่ทำสัญญากับเราภายใต้มาตรการความปลอดภัยที่เข้มงวด</p>',
        contentEn:
          '<p class="font-sarabun text-body-md leading-relaxed text-text-secondary">We do not disclose your personal data to third parties except as required by law or with your explicit consent, including government authorities or contracted processors under strict security measures.</p>',
      },
      {
        id: "user-rights",
        titleTh: "สิทธิของเจ้าของข้อมูล",
        titleEn: "User Rights",
        contentTh:
          '<div class="grid grid-cols-1 gap-4 sm:grid-cols-2"><div class="rounded-radius-lg border border-border-default/80 bg-surface-container/50 p-5"><h3 class="mb-2 font-kanit text-label font-bold text-surface-navy">สิทธิในการเข้าถึง</h3><p class="font-sarabun text-caption text-text-muted">ขอเข้าถึงและขอรับสำเนาข้อมูลส่วนบุคคลที่เกี่ยวกับท่าน</p></div><div class="rounded-radius-lg border border-border-default/80 bg-surface-container/50 p-5"><h3 class="mb-2 font-kanit text-label font-bold text-surface-navy">สิทธิในการแก้ไข</h3><p class="font-sarabun text-caption text-text-muted">ขอให้ดำเนินการแก้ไขข้อมูลที่ไม่ถูกต้องหรือไม่สมบูรณ์</p></div><div class="rounded-radius-lg border border-border-default/80 bg-surface-container/50 p-5"><h3 class="mb-2 font-kanit text-label font-bold text-surface-navy">สิทธิในการลบข้อมูล</h3><p class="font-sarabun text-caption text-text-muted">ขอให้ลบหรือทำลายข้อมูลส่วนบุคคลในบางกรณี</p></div><div class="rounded-radius-lg border border-border-default/80 bg-surface-container/50 p-5"><h3 class="mb-2 font-kanit text-label font-bold text-surface-navy">สิทธิในการคัดค้าน</h3><p class="font-sarabun text-caption text-text-muted">คัดค้านการเก็บรวบรวม ใช้ หรือเปิดเผยข้อมูลส่วนบุคคล</p></div><div class="rounded-radius-lg border border-border-default/80 bg-surface-container/50 p-5"><h3 class="mb-2 font-kanit text-label font-bold text-surface-navy">สิทธิในการโอนย้าย</h3><p class="font-sarabun text-caption text-text-muted">ขอรับข้อมูลในรูปแบบที่สามารถอ่านหรือใช้งานได้โดยเครื่องมืออัตโนมัติ</p></div><div class="rounded-radius-lg border border-border-default/80 bg-surface-container/50 p-5"><h3 class="mb-2 font-kanit text-label font-bold text-surface-navy">สิทธิในการถอนความยินยอม</h3><p class="font-sarabun text-caption text-text-muted">ถอนความยินยอมที่ได้ให้ไว้ได้ตลอดระยะเวลาที่ข้อมูลยังถูกเก็บรักษา</p></div></div>',
        contentEn:
          '<div class="grid grid-cols-1 gap-4 sm:grid-cols-2"><div class="rounded-radius-lg border border-border-default/80 bg-surface-container/50 p-5"><h3 class="mb-2 font-kanit text-label font-bold text-surface-navy">Right of access</h3><p class="font-sarabun text-caption text-text-muted">Request access to and copies of your personal data.</p></div><div class="rounded-radius-lg border border-border-default/80 bg-surface-container/50 p-5"><h3 class="mb-2 font-kanit text-label font-bold text-surface-navy">Right to rectification</h3><p class="font-sarabun text-caption text-text-muted">Request correction of inaccurate or incomplete data.</p></div><div class="rounded-radius-lg border border-border-default/80 bg-surface-container/50 p-5"><h3 class="mb-2 font-kanit text-label font-bold text-surface-navy">Right to erasure</h3><p class="font-sarabun text-caption text-text-muted">Request deletion or destruction of personal data in certain cases.</p></div><div class="rounded-radius-lg border border-border-default/80 bg-surface-container/50 p-5"><h3 class="mb-2 font-kanit text-label font-bold text-surface-navy">Right to object</h3><p class="font-sarabun text-caption text-text-muted">Object to collection, use, or disclosure of personal data.</p></div><div class="rounded-radius-lg border border-border-default/80 bg-surface-container/50 p-5"><h3 class="mb-2 font-kanit text-label font-bold text-surface-navy">Right to data portability</h3><p class="font-sarabun text-caption text-text-muted">Receive data in a machine-readable format.</p></div><div class="rounded-radius-lg border border-border-default/80 bg-surface-container/50 p-5"><h3 class="mb-2 font-kanit text-label font-bold text-surface-navy">Right to withdraw consent</h3><p class="font-sarabun text-caption text-text-muted">Withdraw consent at any time while data is retained.</p></div></div>',
      },
      {
        id: "data-security",
        titleTh: "ความปลอดภัยของข้อมูล",
        titleEn: "Data Security",
        contentTh:
          '<p class="font-sarabun text-body-md leading-relaxed text-text-secondary">เราใช้เทคโนโลยีความปลอดภัยมาตรฐานระดับสากล เช่น การเข้ารหัสข้อมูลแบบ SSL/TLS ระบบ Firewall ป้องกันการบุกรุก และการจำกัดสิทธิ์การเข้าถึงข้อมูลเฉพาะเจ้าหน้าที่ที่เกี่ยวข้องเท่านั้น เพื่อให้มั่นใจว่าข้อมูลของคุณจะถูกเก็บรักษาอย่างปลอดภัยและไม่ถูกเข้าถึงโดยมิชอบ</p>',
        contentEn:
          '<p class="font-sarabun text-body-md leading-relaxed text-text-secondary">We use industry-standard security including SSL/TLS encryption, firewalls, and role-based access controls to protect your data from unauthorized access.</p>',
      },
      {
        id: "contact",
        titleTh: "การติดต่อ",
        titleEn: "Contact",
        contentTh:
          '<div class="flex flex-col gap-6 rounded-radius-lg bg-surface-navy p-8 text-white md:flex-row md:items-center"><div class="flex h-16 w-16 shrink-0 items-center justify-center rounded-radius-full bg-white/10"><span class="text-3xl" aria-hidden="true">☎</span></div><div class="space-y-3"><h3 class="font-kanit text-heading-3-mobile font-bold">เจ้าหน้าที่คุ้มครองข้อมูลส่วนบุคคล (DPO)</h3><p class="font-sarabun text-body-md text-white/80">privacy@edudata.go.th</p><p class="font-sarabun text-body-md text-white/80">02-123-4567 ต่อ 888</p><p class="font-sarabun text-body-md text-white/80">ศูนย์ข้อมูลการศึกษาแห่งชาติ เลขที่ 319 วังจันทรเกษม ถนนราชดำเนินนอก เขตดุสิต กรุงเทพฯ 10300</p></div></div>',
        contentEn:
          '<div class="flex flex-col gap-6 rounded-radius-lg bg-surface-navy p-8 text-white md:flex-row md:items-center"><div class="flex h-16 w-16 shrink-0 items-center justify-center rounded-radius-full bg-white/10"><span class="text-3xl" aria-hidden="true">☎</span></div><div class="space-y-3"><h3 class="font-kanit text-heading-3-mobile font-bold">Data Protection Officer (DPO)</h3><p class="font-sarabun text-body-md text-white/80">privacy@edudata.go.th</p><p class="font-sarabun text-body-md text-white/80">02-123-4567 ext. 888</p><p class="font-sarabun text-body-md text-white/80">National Education Data Center, 319 Wang Chankasem, Ratchadaphisek Road, Dusit, Bangkok 10300</p></div></div>',
      },
    ],
  },
  {
    slug: "terms",
    titleTh: "เงื่อนไขการใช้งาน",
    titleEn: "Terms of Service",
    updatedAt: "2024-01-01",
    sections: [
      {
        id: "acceptance",
        titleTh: "การยอมรับเงื่อนไข",
        titleEn: "Acceptance of Terms",
        type: "warning",
        contentTh:
          "การใช้งานระบบถือว่าท่านยอมรับเงื่อนไขทั้งหมดที่ระบุไว้ในหน้านี้อย่างไม่มีเงื่อนไข",
        contentEn:
          "By using this system you unconditionally accept all terms stated on this page.",
        bodyTh:
          "ยินดีต้อนรับสู่ Thai EduData Insight ศูนย์รวมข้อมูลการศึกษาของประเทศไทย การเข้าถึงและการใช้บริการเว็บไซต์นี้ ถือว่าท่านตกลงที่จะผูกพันตามข้อกำหนดและเงื่อนไขการใช้งานเหล่านี้ หากท่านไม่ตกลงตามเงื่อนไขดังกล่าว โปรดงดเว้นจากการใช้งานระบบของเรา",
        bodyEn:
          "Welcome to Thai EduData Insight, Thailand's education data hub. By accessing and using this website you agree to be bound by these terms. If you do not agree, please refrain from using the system.",
      },
      {
        id: "usage",
        titleTh: "การใช้งานระบบ",
        titleEn: "System Usage",
        type: "text",
        contentTh:
          '<p class="font-sarabun text-body-md leading-relaxed text-text-secondary">ผู้ใช้งานตกลงจะใช้งานระบบเพื่อวัตถุประสงค์ที่ชอบด้วยกฎหมายเท่านั้น โดยต้องไม่กระทำการใดๆ ที่เป็นการรบกวนการทำงานของระบบ การเข้าถึงข้อมูลโดยไม่ได้รับอนุญาต หรือการพยายามเจาะระบบรักษาความปลอดภัยของเครือข่าย Thai EduData Insight</p>',
        contentEn:
          '<p class="font-sarabun text-body-md leading-relaxed text-text-secondary">Users agree to use the system only for lawful purposes and must not disrupt operations, access data without authorization, or attempt to breach Thai EduData Insight security.</p>',
      },
      {
        id: "rights",
        titleTh: "สิทธิ์และข้อจำกัด",
        titleEn: "Rights and Restrictions",
        type: "rights",
        allowedTh: [
          "ดาวน์โหลดข้อมูลเพื่อการศึกษา",
          "อ้างอิงแหล่งที่มา",
          "นำไปวิจัยและพัฒนา",
          "แชร์ลิงก์ข้อมูลไปยังแพลตฟอร์มอื่น",
        ],
        allowedEn: [
          "Download data for education",
          "Cite the source",
          "Use for research and development",
          "Share dataset links on other platforms",
        ],
        prohibitedTh: [
          "นำข้อมูลไปจำหน่าย",
          "แก้ไขข้อมูลโดยไม่ได้รับอนุญาต",
          "อ้างความเป็นเจ้าของข้อมูล",
          "ใช้สคริปต์อัตโนมัติดึงข้อมูลเกินความจำเป็น",
        ],
        prohibitedEn: [
          "Sell the data",
          "Modify data without permission",
          "Claim ownership of data",
          "Use automated scripts to scrape data excessively",
        ],
      },
      {
        id: "intellectual-property",
        titleTh: "ทรัพย์สินทางปัญญา",
        titleEn: "Intellectual Property",
        type: "text",
        contentTh:
          '<p class="font-sarabun text-body-md leading-relaxed text-text-secondary">เนื้อหาทั้งหมดที่ปรากฏบน Thai EduData Insight รวมถึงโลโก้ กราฟิก ซอฟต์แวร์ และชุดข้อมูลที่ผ่านการประมวลผล เป็นทรัพย์สินของหน่วยงานเจ้าของข้อมูลหรือผู้จัดทำระบบ เว้นแต่จะระบุไว้เป็นอย่างอื่นในสัญญาอนุญาตของชุดข้อมูลนั้นๆ</p>',
        contentEn:
          '<p class="font-sarabun text-body-md leading-relaxed text-text-secondary">All content on Thai EduData Insight, including logos, graphics, software, and processed datasets, belongs to the data owners or system operators unless otherwise stated in the dataset license.</p>',
      },
      {
        id: "liability",
        titleTh: "ข้อจำกัดความรับผิด",
        titleEn: "Limitation of Liability",
        type: "text",
        contentTh:
          '<p class="font-sarabun text-body-md leading-relaxed text-text-secondary">เราพยายามอย่างเต็มที่เพื่อให้ข้อมูลมีความถูกต้องและเป็นปัจจุบัน อย่างไรก็ตาม Thai EduData Insight ไม่รับประกันความสมบูรณ์ ความถูกต้อง หรือความพร้อมใช้งานของข้อมูลตลอดเวลา และจะไม่รับผิดชอบต่อความเสียหายใดๆ ที่เกิดขึ้นจากการนำข้อมูลไปใช้งาน</p>',
        contentEn:
          '<p class="font-sarabun text-body-md leading-relaxed text-text-secondary">We strive to keep data accurate and up to date, but Thai EduData Insight does not guarantee completeness, accuracy, or availability at all times and is not liable for damages arising from use of the data.</p>',
      },
      {
        id: "termination",
        titleTh: "การยกเลิกบัญชี",
        titleEn: "Account Termination",
        type: "text",
        contentTh:
          '<p class="font-sarabun text-body-md leading-relaxed text-text-secondary">ทางระบบขอสงวนสิทธิ์ในการระงับหรือยกเลิกการเข้าถึงบัญชีผู้ใช้งาน หากพบว่ามีการละเมิดเงื่อนไขการใช้งานที่ระบุไว้ โดยไม่ต้องแจ้งให้ทราบล่วงหน้า</p>',
        contentEn:
          '<p class="font-sarabun text-body-md leading-relaxed text-text-secondary">We reserve the right to suspend or terminate user accounts for violations of these terms without prior notice.</p>',
      },
      {
        id: "changes",
        titleTh: "การเปลี่ยนแปลงเงื่อนไข",
        titleEn: "Changes to Terms",
        type: "text",
        contentTh:
          '<p class="font-sarabun text-body-md leading-relaxed text-text-secondary">เราอาจปรับปรุงเงื่อนไขเหล่านี้เป็นครั้งคราวเพื่อให้สอดคล้องกับการเปลี่ยนแปลงของกฎหมายและนโยบายภาครัฐ โดยจะระบุวันที่อัปเดตล่าสุดไว้ด้านบนสุดของหน้า</p>',
        contentEn:
          '<p class="font-sarabun text-body-md leading-relaxed text-text-secondary">We may update these terms periodically to reflect legal and policy changes. The latest update date will be shown at the top of this page.</p>',
      },
    ],
  },
  {
    slug: "api-docs",
    titleTh: "เอกสาร API",
    titleEn: "API Documentation",
    updatedAt: "2024-03-28",
    sections: [],
  },
  {
    slug: "help-center",
    titleTh: "Help Center",
    titleEn: "Help Center",
    updatedAt: "2024-04-14",
    sections: [
      {
        id: "intro",
        titleTh: "ศูนย์ช่วยเหลือ",
        titleEn: "Help Center",
        contentTh:
          '<p class="font-sarabun text-body-md text-text-secondary">เนื้อหากำลังจัดทำ กรุณากลับมาตรวจสอบอีกครั้งในภายหลัง</p>',
        contentEn:
          '<p class="font-sarabun text-body-md text-text-secondary">Content is being prepared. Please check back later.</p>',
      },
    ],
  },
];

let pageContentState: PageContentMock[] = MOCK_PAGE_CONTENT.map((page) => ({
  ...page,
  sections: page.sections.map((section) => ({ ...section })),
}));

export function getPageContentBySlug(slug: string): PageContentMock | null {
  const page = pageContentState.find((item) => item.slug === slug);
  if (!page) {
    return null;
  }
  return {
    ...page,
    sections: page.sections.map((section) => ({ ...section })),
  };
}

export { MOCK_PAGE_CONTENT as mockPageContent };

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

const INITIAL_STATIC_PAGES: AdminStaticPageMeta[] = [
  {
    slug: "privacy-policy",
    titleTh: "นโยบายความเป็นส่วนตัว",
    titleEn: "Privacy Policy",
    route: "/privacy-policy",
    icon: "policy",
    status: "published",
    updatedAt: "2023-10-12",
  },
  {
    slug: "terms",
    titleTh: "เงื่อนไขการใช้งาน",
    titleEn: "Terms of Service",
    route: "/terms",
    icon: "gavel",
    status: "published",
    updatedAt: "2024-01-05",
  },
  {
    slug: "api-docs",
    titleTh: "เอกสาร API",
    titleEn: "API Documentation",
    route: "/api-docs",
    icon: "api",
    status: "published",
    updatedAt: "2024-03-28",
  },
  {
    slug: "help-center",
    titleTh: "Help Center",
    titleEn: "Help Center",
    route: "/help-center",
    icon: "help",
    status: "draft",
    updatedAt: "2024-04-14",
  },
];

let staticPagesMetaState: AdminStaticPageMeta[] = INITIAL_STATIC_PAGES.map(
  (page) => ({ ...page })
);

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function serializeSectionContent(
  section: PageContentSection,
  lang: "th" | "en"
): string {
  if (section.type === "rights") {
    const allowed = lang === "th" ? section.allowedTh : section.allowedEn;
    const prohibited =
      lang === "th" ? section.prohibitedTh : section.prohibitedEn;
    return [...allowed, ...prohibited].join("\n");
  }

  const content = lang === "th" ? section.contentTh : section.contentEn;
  const body =
    section.type === "warning"
      ? lang === "th"
        ? section.bodyTh
        : section.bodyEn
      : undefined;

  return [stripHtml(content), body?.trim()].filter(Boolean).join("\n\n");
}

function serializePageContent(page: PageContentMock, lang: "th" | "en"): string {
  if (page.sections.length === 0) {
    return "";
  }
  return page.sections
    .map((section) => serializeSectionContent(section, lang))
    .filter(Boolean)
    .join("\n\n");
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function wrapEditorContent(text: string): string {
  const escaped = escapeHtml(text).replace(/\n/g, "<br/>");
  return `<p class="font-sarabun text-body-md text-text-secondary">${escaped}</p>`;
}

export function getAdminStaticPagesMock(): AdminStaticPageMeta[] {
  return staticPagesMetaState.map((page) => ({ ...page }));
}

export function getAdminPageContentMock(
  slug: string
): AdminPageEditorContent | null {
  const page = pageContentState.find((item) => item.slug === slug);
  if (!page) {
    return null;
  }

  return {
    ...page,
    sections: page.sections.map((section) => ({ ...section })),
    contentTh: serializePageContent(page, "th"),
    contentEn: serializePageContent(page, "en"),
  };
}

export function updateAdminPageContentMock(
  slug: string,
  input: AdminPageUpdateInput
): AdminPageEditorContent {
  const index = pageContentState.findIndex((item) => item.slug === slug);
  if (index === -1) {
    throw new Error("PAGE_NOT_FOUND");
  }

  const current = pageContentState[index];
  const updatedAt = new Date().toISOString().slice(0, 10);
  const nextPage: PageContentMock = {
    ...current,
    titleTh: input.titleTh ?? current.titleTh,
    titleEn: input.titleEn ?? current.titleEn,
    updatedAt,
    sections: [
      {
        id: "main-content",
        titleTh: input.titleTh ?? current.titleTh,
        titleEn: input.titleEn ?? current.titleEn,
        type: "text",
        contentTh: wrapEditorContent(input.contentTh),
        contentEn: wrapEditorContent(input.contentEn),
      },
    ],
  };

  pageContentState = pageContentState.map((item, itemIndex) =>
    itemIndex === index ? nextPage : item
  );

  staticPagesMetaState = staticPagesMetaState.map((item) =>
    item.slug === slug
      ? {
          ...item,
          titleTh: nextPage.titleTh,
          titleEn: nextPage.titleEn,
          updatedAt,
        }
      : item
  );

  return getAdminPageContentMock(slug)!;
}

export type HeroImageMock = {
  imageUrl: string | null;
};

let heroImageUrl: string | null = null;

export function getHeroImageMock(): HeroImageMock {
  return { imageUrl: heroImageUrl };
}

export async function uploadHeroImageMock(file: File): Promise<HeroImageMock> {
  const maxSize = 5 * 1024 * 1024;
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ];

  if (file.size > maxSize) {
    throw new Error("FILE_TOO_LARGE");
  }

  if (!allowedTypes.includes(file.type)) {
    throw new Error("FILE_INVALID_FORMAT");
  }

  await new Promise((resolve) => setTimeout(resolve, 500));

  if (heroImageUrl?.startsWith("blob:")) {
    URL.revokeObjectURL(heroImageUrl);
  }

  heroImageUrl = URL.createObjectURL(file);
  return { imageUrl: heroImageUrl };
}

export async function deleteHeroImageMock(): Promise<HeroImageMock> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  if (heroImageUrl?.startsWith("blob:")) {
    URL.revokeObjectURL(heroImageUrl);
  }

  heroImageUrl = null;
  return { imageUrl: null };
}

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

export const MOCK_API_DOCS: ApiDocsMock = {
  slug: "api-docs",
  titleTh: "เอกสาร API",
  titleEn: "API Documentation",
  descriptionTh:
    "ศูนย์รวมข้อมูลการเชื่อมต่อและใช้งาน Application Programming Interface (API) สำหรับนักพัฒนาเพื่อเข้าถึงชุดข้อมูลการศึกษาของประเทศไทยอย่างมีประสิทธิภาพและโปร่งใส",
  descriptionEn:
    "Central hub for connecting to and using our Application Programming Interface (API), enabling developers to access Thai education datasets efficiently and transparently.",
  version: "v1.0.0-stable",
  updatedAt: "2024-01-01",
  baseUrl:
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1",
  endpoints: [
    {
      id: "getting-started",
      titleTh: "เริ่มต้นใช้งาน",
      titleEn: "Introduction",
      descTh:
        "API ของระบบใช้รูปแบบ JSend และรองรับการเข้าถึงแบบสาธารณะสำหรับชุดข้อมูลที่เผยแพร่แล้ว",
      descEn:
        "Our API uses the JSend format and supports public access to published datasets.",
    },
    {
      id: "authentication",
      titleTh: "การยืนยันตัวตน",
      titleEn: "Authentication",
      descTh:
        "Endpoint ที่ต้องเข้าสู่ระบบจะต้องแนบ JWT Token ใน Header ทุกครั้ง",
      descEn:
        "Authenticated endpoints require a JWT token in the Authorization header.",
      code: "Authorization: Bearer {your_token}",
    },
    {
      id: "get-datasets",
      method: "GET",
      path: "/public/datasets",
      titleTh: "รายการ Dataset",
      titleEn: "List Datasets",
      descTh:
        "เรียกดูรายการชุดข้อมูลทั้งหมดที่เผยแพร่แล้ว รองรับ Pagination และการกรองพื้นฐาน",
      descEn:
        "List all published datasets with pagination and basic filters.",
      params: [
        {
          name: "page",
          type: "integer",
          required: false,
          descTh: "เลขหน้าข้อมูลที่ต้องการเรียกดู (Default: 1)",
          descEn: "Page number (default: 1)",
        },
        {
          name: "page_size",
          type: "integer",
          required: false,
          descTh: "จำนวนรายการต่อหน้า (Max: 100)",
          descEn: "Items per page (max: 100)",
        },
      ],
      response: `{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "สถิติจำนวนนักเรียนรายจังหวัด 2566",
      "status": "published"
    }
  ],
  "pagination": {
    "page": 1,
    "page_size": 20,
    "total_items": 45,
    "total_pages": 3
  },
  "message": "ok"
}`,
    },
    {
      id: "get-dataset",
      method: "GET",
      path: "/public/datasets/{id}",
      titleTh: "รายละเอียด Dataset",
      titleEn: "Get Dataset",
      descTh:
        "เรียกดูรายละเอียดเชิงลึกของชุดข้อมูลที่ระบุ รวม Metadata และสถิติ",
      descEn:
        "Retrieve detailed information for a specific dataset including metadata and stats.",
      params: [
        {
          name: "id",
          type: "string",
          required: true,
          descTh: "รหัสชุดข้อมูล (UUID)",
          descEn: "Dataset unique identifier (UUID)",
        },
      ],
      response: `{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "สถิติจำนวนนักเรียนรายจังหวัด 2566",
    "license": "open"
  },
  "message": "ok"
}`,
    },
    {
      id: "search",
      method: "GET",
      path: "/search",
      titleTh: "ค้นหา Dataset",
      titleEn: "Search Datasets",
      descTh: "ค้นหาชุดข้อมูลด้วยคำสำคัญและตัวกรอง",
      descEn: "Search published datasets by keyword and filters.",
      params: [
        {
          name: "keyword",
          type: "string",
          required: true,
          descTh: 'คำค้นหา เช่น "มหาวิทยาลัย", "ยากจน"',
          descEn: 'Search keyword, e.g. "university", "poverty"',
        },
        {
          name: "category_id",
          type: "string",
          required: false,
          descTh: "กรองตามหมวดหมู่ (UUID)",
          descEn: "Filter by category (UUID)",
        },
      ],
      response: `{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "page_size": 20,
    "total_items": 234,
    "total_pages": 12
  },
  "message": "ok"
}`,
    },
    {
      id: "download",
      method: "GET",
      path: "/public/datasets/{id}/download",
      titleTh: "ดาวน์โหลด Dataset",
      titleEn: "Download Dataset",
      descTh:
        "ดาวน์โหลดไฟล์ข้อมูลในรูปแบบที่เลือก (csv, excel, json, xml) ต้องระบุวัตถุประสงค์",
      descEn:
        "Download dataset files in the selected format (csv, excel, json, xml). Purpose is required.",
      params: [
        {
          name: "format",
          type: "string",
          required: true,
          descTh: "รูปแบบไฟล์: csv, excel, json, xml",
          descEn: "File format: csv, excel, json, xml",
        },
        {
          name: "purpose",
          type: "string",
          required: true,
          descTh: "วัตถุประสงค์การใช้งานข้อมูล",
          descEn: "Purpose of data use",
        },
      ],
      response: `{
  "success": true,
  "data": {
    "download_url": "https://storage.example/files/dataset.csv"
  },
  "message": "ok"
}`,
    },
    {
      id: "error-codes",
      titleTh: "รหัสข้อผิดพลาด",
      titleEn: "Error Codes",
      contentTh:
        "ทุก Error Response ใช้รูปแบบ JSend พร้อม error.code (UPPER_SNAKE_CASE) และ error.message ภาษาไทย เช่น DATASET_NOT_FOUND, RATE_LIMIT_EXCEEDED",
      contentEn:
        "All error responses use JSend with error.code (UPPER_SNAKE_CASE) and a Thai error.message, e.g. DATASET_NOT_FOUND, RATE_LIMIT_EXCEEDED.",
    },
    {
      id: "rate-limits",
      titleTh: "ขีดจำกัดการเรียกใช้",
      titleEn: "Rate Limits",
      contentTh:
        "จำกัด 100 คำขอต่อนาทีต่อ IP สำหรับทุก Endpoint เมื่อเกินขีดจำกัดระบบจะคืน HTTP 429 พร้อม RATE_LIMIT_EXCEEDED",
      contentEn:
        "Limited to 100 requests per minute per IP for all endpoints. Exceeding the limit returns HTTP 429 with RATE_LIMIT_EXCEEDED.",
    },
  ],
};

export function getApiDocsMock(): ApiDocsMock {
  return MOCK_API_DOCS;
}

export const MOCK_STATS_DATA: StatsDataMock = {
  overview: {
    totalDatasets: 1234,
    totalAgencies: 45,
    totalDownloads: 56789,
    totalCategories: 12,
  },
  studentsByYear: [
    { year: "2560", count: 7234567 },
    { year: "2561", count: 7156234 },
    { year: "2562", count: 7089123 },
    { year: "2563", count: 6987456 },
    { year: "2564", count: 6876543 },
    { year: "2565", count: 6789012 },
    { year: "2566", count: 6712345 },
  ],
  teachersByYear: [
    { year: "2560", count: 456789 },
    { year: "2561", count: 461234 },
    { year: "2562", count: 458976 },
    { year: "2563", count: 452341 },
    { year: "2564", count: 447832 },
    { year: "2565", count: 443219 },
    { year: "2566", count: 438765 },
  ],
  schoolsByYear: [
    { year: "2560", count: 30123 },
    { year: "2561", count: 29876 },
    { year: "2562", count: 29654 },
    { year: "2563", count: 29432 },
    { year: "2564", count: 29198 },
    { year: "2565", count: 28976 },
    { year: "2566", count: 28754 },
  ],
  datasetByCategory: [
    { nameTh: "สถิตินักเรียน", nameEn: "Student statistics", value: 45 },
    { nameTh: "จำนวนครู", nameEn: "Teachers", value: 28 },
    { nameTh: "โรงเรียน", nameEn: "Schools", value: 32 },
    { nameTh: "มหาวิทยาลัย", nameEn: "Higher education", value: 19 },
    { nameTh: "อื่นๆ", nameEn: "Other", value: 15 },
  ],
  topDatasets: [
    {
      id: "1",
      titleTh: "สถิตินักเรียนรายจังหวัด 2566",
      titleEn: "Provincial Student Statistics 2023",
      categoryTh: "สถิตินักเรียน",
      categoryEn: "Student statistics",
      downloads: 12400,
    },
    {
      id: "2",
      titleTh: "จำนวนนักเรียนรายชั้นเรียน จำแนกตามเพศ ปีการศึกษา 2566",
      titleEn: "Student Enrollment by Grade and Gender, Academic Year 2023",
      categoryTh: "สถิติพื้นฐาน",
      categoryEn: "Basic statistics",
      downloads: 9800,
    },
    {
      id: "3",
      titleTh: "รายชื่อโรงเรียนและพิกัดที่ตั้งทั่วประเทศไทย ประจำปี 2567",
      titleEn: "School Directory and Coordinates Nationwide 2024",
      categoryTh: "ทรัพยากร",
      categoryEn: "Resources",
      downloads: 8765,
    },
    {
      id: "4",
      titleTh: "สถิติจำนวนบัณฑิตจบใหม่ แยกตามกลุ่มสาขาวิชา 2562-2566",
      titleEn: "New Graduates by Field of Study 2019-2023",
      categoryTh: "อุดมศึกษา",
      categoryEn: "Higher education",
      downloads: 7654,
    },
    {
      id: "5",
      titleTh: "ผลการเรียน O-NET ระดับประถมศึกษา 2566",
      titleEn: "O-NET Primary Education Results 2023",
      categoryTh: "การประเมิน",
      categoryEn: "Assessment",
      downloads: 6543,
    },
  ],
};

export type AgencyMonthlyDownload = {
  month: string;
  monthEn: string;
  count: number;
};

export type AgencyDashboardStats = {
  totalDatasets: number;
  publishedDatasets: number;
  draftDatasets: number;
  totalDownloads: number;
  monthlyDownloads: AgencyMonthlyDownload[];
};

export type AgencyDatasetRow = {
  id: string;
  title: string;
  titleEn: string;
  category: string;
  categoryEn: string;
  subcategory: string;
  subcategoryEn: string;
  status: "draft" | "published";
  qualityScore: number;
  downloadCount: number;
  updatedAt: string;
};

export const mockAgencyStats: AgencyDashboardStats = {
  totalDatasets: 24,
  publishedDatasets: 18,
  draftDatasets: 6,
  totalDownloads: 12456,
  monthlyDownloads: [
    { month: "ม.ค.", monthEn: "Jan", count: 1200 },
    { month: "ก.พ.", monthEn: "Feb", count: 1450 },
    { month: "มี.ค.", monthEn: "Mar", count: 1890 },
    { month: "เม.ย.", monthEn: "Apr", count: 1670 },
    { month: "พ.ค.", monthEn: "May", count: 2340 },
    { month: "มิ.ย.", monthEn: "Jun", count: 1980 },
  ],
};

export const mockAgencyDatasets: AgencyDatasetRow[] = [
  {
    id: "1",
    title: "ข้อมูลสถิติจำนวนนักเรียนรายจังหวัด ประจำปี 2566",
    titleEn: "Provincial student statistics 2023",
    category: "การศึกษาพื้นฐาน",
    categoryEn: "Basic education",
    subcategory: "สถิติ",
    subcategoryEn: "Statistics",
    status: "published",
    qualityScore: 95,
    downloadCount: 1234,
    updatedAt: "2023-10-12",
  },
  {
    id: "2",
    title: "งบประมาณสนับสนุนการวิจัยรายปี (Draft)",
    titleEn: "Annual research support budget (draft)",
    category: "อุดมศึกษา",
    categoryEn: "Higher education",
    subcategory: "งบประมาณ",
    subcategoryEn: "Budget",
    status: "draft",
    qualityScore: 62,
    downloadCount: 0,
    updatedAt: "2023-10-08",
  },
  {
    id: "3",
    title: "รายชื่อสถาบันการอาชีวศึกษาทั่วประเทศ",
    titleEn: "Vocational institutions nationwide",
    category: "อาชีวศึกษา",
    categoryEn: "Vocational education",
    subcategory: "ข้อมูลพื้นฐาน",
    subcategoryEn: "Basic data",
    status: "published",
    qualityScore: 88,
    downloadCount: 856,
    updatedAt: "2023-10-01",
  },
  {
    id: "4",
    title: "ผลการทดสอบ O-NET ป.6 ย้อนหลัง 5 ปี",
    titleEn: "Grade 6 O-NET results (5 years)",
    category: "วัดผล",
    categoryEn: "Assessment",
    subcategory: "สถิติ",
    subcategoryEn: "Statistics",
    status: "published",
    qualityScore: 74,
    downloadCount: 654,
    updatedAt: "2023-09-25",
  },
  {
    id: "5",
    title: "สถิตินักเรียนรายจังหวัด 2566",
    titleEn: "Provincial student statistics 2023",
    category: "สถิตินักเรียน",
    categoryEn: "Student statistics",
    subcategory: "จำนวนประชากร",
    subcategoryEn: "Population",
    status: "published",
    qualityScore: 92,
    downloadCount: 1234,
    updatedAt: "2024-01-01",
  },
  {
    id: "6",
    title: "จำนวนครูรายวิชา 2566",
    titleEn: "Teachers by subject 2023",
    category: "จำนวนครู",
    categoryEn: "Teacher counts",
    subcategory: "รายวิชา",
    subcategoryEn: "By subject",
    status: "published",
    qualityScore: 85,
    downloadCount: 856,
    updatedAt: "2024-02-01",
  },
  {
    id: "7",
    title: "งบประมาณการศึกษา 2566",
    titleEn: "Education budget 2023",
    category: "งบประมาณ",
    categoryEn: "Budget",
    subcategory: "จัดสรร",
    subcategoryEn: "Allocation",
    status: "draft",
    qualityScore: 45,
    downloadCount: 0,
    updatedAt: "2024-03-01",
  },
  {
    id: "8",
    title: "ผลการเรียน O-NET 2566",
    titleEn: "O-NET results 2023",
    category: "ผลการเรียน",
    categoryEn: "Academic results",
    subcategory: "สรุปผล",
    subcategoryEn: "Summary",
    status: "published",
    qualityScore: 76,
    downloadCount: 654,
    updatedAt: "2024-03-15",
  },
  {
    id: "9",
    title: "จำนวนโรงเรียนรายจังหวัด 2566",
    titleEn: "Schools by province 2023",
    category: "โรงเรียน",
    categoryEn: "Schools",
    subcategory: "ที่ตั้ง",
    subcategoryEn: "Location",
    status: "draft",
    qualityScore: 58,
    downloadCount: 0,
    updatedAt: "2024-04-01",
  },
  {
    id: "10",
    title: "แผนผังอาคารวิจัยและวิเคราะห์พัฒนาบุคลากร",
    titleEn: "Research building master plan",
    category: "งานวิจัย",
    categoryEn: "Research",
    subcategory: "โครงสร้างพื้นฐาน",
    subcategoryEn: "Infrastructure",
    status: "draft",
    qualityScore: 51,
    downloadCount: 0,
    updatedAt: "2024-03-08",
  },
  {
    id: "11",
    title: "ข้อมูลหลักสูตรการเรียนรู้ตลอดชีวิต ระยะสั้น",
    titleEn: "Short-term lifelong learning curricula",
    category: "การเรียนรู้ตลอดชีวิต",
    categoryEn: "Lifelong learning",
    subcategory: "หลักสูตร",
    subcategoryEn: "Curriculum",
    status: "published",
    qualityScore: 81,
    downloadCount: 420,
    updatedAt: "2024-02-20",
  },
  {
    id: "12",
    title: "แผนที่สถานศึกษาในกำกับกรมการเรียนรู้ตลอดชีวิต",
    titleEn: "Lifelong learning institution map",
    category: "สถานที่",
    categoryEn: "Places",
    subcategory: "แผนที่",
    subcategoryEn: "Maps",
    status: "published",
    qualityScore: 90,
    downloadCount: 3122,
    updatedAt: "2024-03-05",
  },
];

export type AgencyDatasetFormInitial = {
  title: string;
  description: string;
  categoryLevel1: string;
  categoryLevel2: string;
  license: DatasetLicense;
  tags: string[];
  year?: number;
  province?: string;
};

export type FileAnalysisResult = {
  qualityScore: number;
  piiColumnsTh: string[];
  piiColumnsEn: string[];
};

export const mockFileAnalysisResult: FileAnalysisResult = {
  qualityScore: 85,
  piiColumnsTh: ["เลขบัตรประชาชน", "เบอร์โทรศัพท์"],
  piiColumnsEn: ["National ID", "Phone number"],
};

export const mockCategories = MOCK_CATEGORIES;

// — Agency category management (mutable in-memory for UI-only phase) —

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

export const mockCategoriesL1: AgencyCategoryL1[] = [
  {
    id: "cat-1",
    nameTh: "สถิตินักเรียน",
    nameEn: "Student Statistics",
    slug: "student-statistics",
    datasetCount: 12,
  },
  {
    id: "cat-2",
    nameTh: "จำนวนครู",
    nameEn: "Teacher Statistics",
    slug: "teacher-statistics",
    datasetCount: 8,
  },
  {
    id: "cat-3",
    nameTh: "โรงเรียน",
    nameEn: "Schools",
    slug: "schools",
    datasetCount: 0,
  },
  {
    id: "cat-4",
    nameTh: "ข้อมูลบุคลากรทางการศึกษา",
    nameEn: "Personnel Data",
    slug: "personnel-data",
    datasetCount: 18,
  },
  {
    id: "cat-5",
    nameTh: "งบประมาณรายจ่าย",
    nameEn: "Budgeting",
    slug: "budgeting",
    datasetCount: 12,
  },
  {
    id: "cat-6",
    nameTh: "อาคารและสถานที่",
    nameEn: "Facilities",
    slug: "facilities",
    datasetCount: 7,
  },
];

export const mockCategoriesL2: AgencyCategoryL2[] = [
  {
    id: "sub-1",
    nameTh: "รายจังหวัด",
    nameEn: "By Province",
    slug: "by-province",
    parentId: "cat-1",
    parentNameTh: "สถิตินักเรียน",
    parentNameEn: "Student Statistics",
    datasetCount: 6,
  },
  {
    id: "sub-2",
    nameTh: "รายปี",
    nameEn: "By Year",
    slug: "by-year",
    parentId: "cat-1",
    parentNameTh: "สถิตินักเรียน",
    parentNameEn: "Student Statistics",
    datasetCount: 4,
  },
  {
    id: "sub-3",
    nameTh: "รายวิชา",
    nameEn: "By Subject",
    slug: "by-subject",
    parentId: "cat-2",
    parentNameTh: "จำนวนครู",
    parentNameEn: "Teacher Statistics",
    datasetCount: 0,
  },
];

let agencyCategoriesL1: AgencyCategoryL1[] = mockCategoriesL1.map((c) => ({
  ...c,
}));
let agencyCategoriesL2: AgencyCategoryL2[] = mockCategoriesL2.map((c) => ({
  ...c,
}));

export type AgencyCategoriesResponse = {
  data: AgencyCategoryL1[] | AgencyCategoryL2[];
  total: number;
  page: number;
  totalPages: number;
};

const AGENCY_CATEGORY_PAGE_SIZE = 4;

export function fetchAgencyCategoriesMock(
  level: 1 | 2,
  page: number
): AgencyCategoriesResponse {
  const list =
    level === 1
      ? ([...agencyCategoriesL1] as AgencyCategoryL1[] | AgencyCategoryL2[])
      : ([...agencyCategoriesL2] as AgencyCategoryL1[] | AgencyCategoryL2[]);

  const totalPages = Math.max(
    1,
    Math.ceil(list.length / AGENCY_CATEGORY_PAGE_SIZE)
  );
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const start = (currentPage - 1) * AGENCY_CATEGORY_PAGE_SIZE;

  return {
    data: list.slice(start, start + AGENCY_CATEGORY_PAGE_SIZE),
    total: list.length,
    page: currentPage,
    totalPages,
  };
}

export function getAgencyCategoriesL1Mock(): AgencyCategoryL1[] {
  return [...agencyCategoriesL1];
}

export function createAgencyCategoryMock(
  level: 1 | 2,
  input: AgencyCategoryInput
): AgencyCategoryL1 | AgencyCategoryL2 {
  if (level === 1) {
    const created: AgencyCategoryL1 = {
      id: `cat-${Date.now()}`,
      nameTh: input.nameTh,
      nameEn: input.nameEn,
      slug: input.slug,
      datasetCount: 0,
    };
    agencyCategoriesL1 = [...agencyCategoriesL1, created];
    return created;
  }

  const parent = agencyCategoriesL1.find((c) => c.id === input.parentId);
  if (!parent) {
    throw new Error("CATEGORY_PARENT_NOT_FOUND");
  }

  const created: AgencyCategoryL2 = {
    id: `sub-${Date.now()}`,
    nameTh: input.nameTh,
    nameEn: input.nameEn,
    slug: input.slug,
    parentId: parent.id,
    parentNameTh: parent.nameTh,
    parentNameEn: parent.nameEn,
    datasetCount: 0,
  };
  agencyCategoriesL2 = [...agencyCategoriesL2, created];
  return created;
}

export function updateAgencyCategoryMock(
  level: 1 | 2,
  id: string,
  input: AgencyCategoryInput
): void {
  if (level === 1) {
    agencyCategoriesL1 = agencyCategoriesL1.map((c) =>
      c.id === id
        ? {
            ...c,
            nameTh: input.nameTh,
            nameEn: input.nameEn,
            slug: input.slug,
          }
        : c
    );
    agencyCategoriesL2 = agencyCategoriesL2.map((c) =>
      c.parentId === id
        ? {
            ...c,
            parentNameTh: input.nameTh,
            parentNameEn: input.nameEn,
          }
        : c
    );
    return;
  }

  const parent = agencyCategoriesL1.find((c) => c.id === input.parentId);
  if (!parent) {
    throw new Error("CATEGORY_PARENT_NOT_FOUND");
  }

  agencyCategoriesL2 = agencyCategoriesL2.map((c) =>
    c.id === id
      ? {
          ...c,
          nameTh: input.nameTh,
          nameEn: input.nameEn,
          slug: input.slug,
          parentId: parent.id,
          parentNameTh: parent.nameTh,
          parentNameEn: parent.nameEn,
        }
      : c
  );
}

export function deleteAgencyCategoryMock(level: 1 | 2, id: string): void {
  if (level === 1) {
    const target = agencyCategoriesL1.find((c) => c.id === id);
    if (!target) {
      throw new Error("CATEGORY_NOT_FOUND");
    }
    if (target.datasetCount > 0) {
      throw new Error("CATEGORY_HAS_DATASETS");
    }
    agencyCategoriesL1 = agencyCategoriesL1.filter((c) => c.id !== id);
    agencyCategoriesL2 = agencyCategoriesL2.filter((c) => c.parentId !== id);
    return;
  }

  const target = agencyCategoriesL2.find((c) => c.id === id);
  if (!target) {
    throw new Error("CATEGORY_NOT_FOUND");
  }
  if (target.datasetCount > 0) {
    throw new Error("CATEGORY_HAS_DATASETS");
  }
  agencyCategoriesL2 = agencyCategoriesL2.filter((c) => c.id !== id);
}

// — Agency saved items (bookmarks, subscriptions, saved searches) —

export type AgencyBookmarkMock = {
  id: string;
  datasetId: string;
  title: string;
  titleEn: string;
  category: string;
  categoryEn: string;
  agency: string;
  agencyEn: string;
  status: "published" | "draft";
  viewCount: number;
  updatedAt: string;
};

export type AgencySubscriptionMock = {
  id: string;
  type: "category" | "agency";
  name: string;
  nameEn: string;
  subscribedAt: string;
};

export type SavedSearchFilters = Record<string, string>;

export type AgencySavedSearchMock = {
  id: string;
  name: string;
  filters: SavedSearchFilters;
  createdAt: string;
};

export const mockBookmarks: AgencyBookmarkMock[] = [
  {
    id: "bm-1",
    datasetId: "1",
    title: "สถิติจำนวนนักเรียนรายจังหวัด ประจำปี 2566",
    titleEn: "Provincial student statistics academic year 2026",
    category: "สถิตินักเรียน",
    categoryEn: "Education",
    agency: "สำนักงานปลัดกระทรวงศึกษาธิการ",
    agencyEn: "Office of the Permanent Secretary",
    status: "published",
    viewCount: 1200,
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "bm-2",
    datasetId: "2",
    title: "งบประมาณรายจ่ายด้านการศึกษาจำแนกตามโครงการ",
    titleEn: "Education expenditure budget by project",
    category: "ทรัพยากร",
    categoryEn: "Resources",
    agency: "สำนักงบประมาณ",
    agencyEn: "Bureau of the Budget",
    status: "published",
    viewCount: 856,
    updatedAt: "2024-02-01T00:00:00Z",
  },
  {
    id: "bm-3",
    datasetId: "3",
    title: "ทำเนียบครูและบุคลากรทางการศึกษา (Open Data)",
    titleEn: "Teacher and education personnel directory (Open Data)",
    category: "ครู",
    categoryEn: "Teacher",
    agency: "สำนักงานคณะกรรมการการศึกษาขั้นพื้นฐาน",
    agencyEn: "Office of the Basic Education Commission",
    status: "published",
    viewCount: 3400,
    updatedAt: "2024-03-15T00:00:00Z",
  },
];

export const mockSubscriptions: AgencySubscriptionMock[] = [
  {
    id: "sub-1",
    type: "category",
    name: "เทคโนโลยีดิจิทัลเพื่อการเรียนรู้",
    nameEn: "Digital technology for learning",
    subscribedAt: "2024-01-12T00:00:00Z",
  },
  {
    id: "sub-2",
    type: "agency",
    name: "กองทุนเพื่อความเสมอภาคทางการศึกษา (กสศ.)",
    nameEn: "Equitable Education Fund (EEF)",
    subscribedAt: "2024-01-05T00:00:00Z",
  },
];

export const mockSavedSearches: AgencySavedSearchMock[] = [
  {
    id: "ss-1",
    name: "สถิตินักเรียน 2566",
    filters: {
      q: "นักเรียน",
      category: "student-statistics",
      year: "2566",
      format: "csv",
    },
    createdAt: "2024-01-15T00:00:00Z",
  },
  {
    id: "ss-2",
    name: "ข้อมูลครู Excel",
    filters: {
      q: "ครู",
      format: "excel",
    },
    createdAt: "2024-02-20T00:00:00Z",
  },
];

let agencyBookmarks: AgencyBookmarkMock[] = mockBookmarks.map((b) => ({ ...b }));
let agencySubscriptions: AgencySubscriptionMock[] = mockSubscriptions.map(
  (s) => ({ ...s })
);
let agencySavedSearches: AgencySavedSearchMock[] = mockSavedSearches.map(
  (s) => ({ ...s })
);

export function getAgencyBookmarksMock(): AgencyBookmarkMock[] {
  return [...agencyBookmarks];
}

export function deleteAgencyBookmarkMock(id: string): void {
  agencyBookmarks = agencyBookmarks.filter((b) => b.id !== id);
}

export function getAgencySubscriptionsMock(): AgencySubscriptionMock[] {
  return [...agencySubscriptions];
}

export function deleteAgencySubscriptionMock(id: string): void {
  agencySubscriptions = agencySubscriptions.filter((s) => s.id !== id);
}

export function getAgencySavedSearchesMock(): AgencySavedSearchMock[] {
  return [...agencySavedSearches];
}

export function deleteAgencySavedSearchMock(id: string): void {
  agencySavedSearches = agencySavedSearches.filter((s) => s.id !== id);
}

export function buildSavedSearchUrl(
  locale: string,
  filters: SavedSearchFilters
): string {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.category) params.set("category", filters.category);
  if (filters.year) params.set("year", filters.year);
  if (filters.format) params.set("format", filters.format);
  if (filters.agency) params.set("agency", filters.agency);
  const query = params.toString();
  return `/${locale}/search${query ? `?${query}` : ""}`;
}

// — Custom dashboard widgets —

export type DashboardWidgetType = "bar" | "line" | "pie" | "stat";

export type DashboardGridWidget = {
  id: string;
  type: DashboardWidgetType;
  colSpan: 1 | 2 | 3;
};

export type WidgetChartPoint = {
  name: string;
  nameEn: string;
  value: number;
};

export type WidgetStatData = {
  value: number;
  labelTh: string;
  labelEn: string;
  trend: string;
  trendUp: boolean;
};

export const mockWidgetBarData: WidgetChartPoint[] = [
  { name: "เขต 1", nameEn: "Zone 1", value: 1200 },
  { name: "เขต 2", nameEn: "Zone 2", value: 1700 },
  { name: "เขต 3", nameEn: "Zone 3", value: 900 },
  { name: "เขต 4", nameEn: "Zone 4", value: 1900 },
  { name: "เขต 5", nameEn: "Zone 5", value: 1400 },
  { name: "เขต 6", nameEn: "Zone 6", value: 800 },
];

export const mockWidgetLineData: WidgetChartPoint[] = [
  { name: "2560", nameEn: "2560", value: 250 },
  { name: "2561", nameEn: "2561", value: 240 },
  { name: "2562", nameEn: "2562", value: 200 },
  { name: "2563", nameEn: "2563", value: 180 },
  { name: "2564", nameEn: "2564", value: 100 },
  { name: "2565", nameEn: "2565", value: 120 },
  { name: "2566", nameEn: "2566", value: 80 },
  { name: "2567", nameEn: "2567", value: 50 },
];

export const mockWidgetPieData: WidgetChartPoint[] = [
  { name: "ประถมศึกษา", nameEn: "Primary", value: 420 },
  { name: "มัธยมศึกษา", nameEn: "Secondary", value: 310 },
  { name: "อาชีวศึกษา", nameEn: "Vocational", value: 180 },
  { name: "อุดมศึกษา", nameEn: "Higher ed.", value: 90 },
];

export const mockWidgetStatData: WidgetStatData = {
  value: 32450,
  labelTh: "รวมจำนวนโรงเรียนทั้งหมด",
  labelEn: "Total schools",
  trend: "+2.4%",
  trendUp: true,
};

export const DEFAULT_DASHBOARD_WIDGETS: DashboardGridWidget[] = [
  { id: "widget-bar-default", type: "bar", colSpan: 2 },
  { id: "widget-stat-default", type: "stat", colSpan: 1 },
  { id: "widget-line-default", type: "line", colSpan: 3 },
];

export function createDashboardWidgetId(): string {
  return `widget-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function defaultColSpanForWidgetType(
  type: DashboardWidgetType
): 1 | 2 | 3 {
  switch (type) {
    case "bar":
      return 2;
    case "line":
      return 3;
    case "pie":
    case "stat":
    default:
      return 1;
  }
}

export const mockProvinces = [
  {
    value: "all",
    labelTh: "ทุกจังหวัด (ภาพรวมประเทศ)",
    labelEn: "All provinces (national)",
  },
  { value: "bangkok", labelTh: "กรุงเทพมหานคร", labelEn: "Bangkok" },
  { value: "chiangmai", labelTh: "เชียงใหม่", labelEn: "Chiang Mai" },
  { value: "khonkaen", labelTh: "ขอนแก่น", labelEn: "Khon Kaen" },
];

const mockAgencyDatasetFormById: Record<string, AgencyDatasetFormInitial> = {
  "1": {
    title: "ข้อมูลสถิติจำนวนนักเรียนรายจังหวัด ประจำปี 2566",
    description:
      "ข้อมูลจำนวนนักเรียนแยกตามจังหวัด ปีการศึกษา 2566 สำหรับวิเคราะห์ภาพรวมการศึกษาไทย",
    categoryLevel1: "student-statistics",
    categoryLevel2: "student-by-province",
    license: "open",
    tags: ["การศึกษา", "สถิติปี 2566"],
    year: 2567,
    province: "all",
  },
  "2": {
    title: "งบประมาณสนับสนุนการวิจัยรายปี (Draft)",
    description:
      "รายละเอียดงบประมาณสนับสนุนการวิจัยของหน่วยงาน แยกตามโครงการและปีงบประมาณ",
    categoryLevel1: "teacher-statistics",
    categoryLevel2: "teacher-by-subject",
    license: "conditional",
    tags: ["งบประมาณ", "วิจัย"],
    year: 2567,
    province: "bangkok",
  },
};

function resolveCategorySlugs(
  categoryTh: string,
  subcategoryTh: string
): { categoryLevel1: string; categoryLevel2: string } {
  const category =
    MOCK_CATEGORIES.find(
      (item) =>
        item.nameTh === categoryTh ||
        categoryTh.includes(item.nameTh) ||
        item.nameTh.includes(categoryTh)
    ) ?? MOCK_CATEGORIES[0];

  const subcategory =
    category.subcategories.find(
      (item) =>
        item.nameTh === subcategoryTh ||
        subcategoryTh.includes(item.nameTh) ||
        item.nameTh.includes(subcategoryTh)
    ) ?? category.subcategories[0];

  return {
    categoryLevel1: category.slug,
    categoryLevel2: subcategory?.slug ?? "",
  };
}

export function getAgencyDatasetFormInitial(
  id: string
): AgencyDatasetFormInitial | null {
  const preset = mockAgencyDatasetFormById[id];
  if (preset) {
    return preset;
  }

  const row = mockAgencyDatasets.find((dataset) => dataset.id === id);
  if (!row) {
    return null;
  }

  const { categoryLevel1, categoryLevel2 } = resolveCategorySlugs(
    row.category,
    row.subcategory
  );

  return {
    title: row.title,
    description:
      "รายละเอียดของชุดข้อมูล วัตถุประสงค์ และการนำไปใช้งานเชิงนโยบายการศึกษา",
    categoryLevel1,
    categoryLevel2,
    license: "open",
    tags: ["การศึกษา"],
    year: 2567,
    province: "all",
  };
}

export async function fetchMockFileAnalysis(): Promise<FileAnalysisResult> {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  return mockFileAnalysisResult;
}

export type BulkUploadErrorDetail = {
  row: number;
  titleTh: string;
  titleEn: string;
  column: string;
  reasonTh: string;
  reasonEn: string;
};

export type BulkUploadResult = {
  success: number;
  errors: number;
  errorDetails: BulkUploadErrorDetail[];
};

export const mockBulkUploadResult: BulkUploadResult = {
  success: 8,
  errors: 2,
  errorDetails: [
    {
      row: 3,
      titleTh: "สถิตินักเรียน 2565",
      titleEn: "Student statistics 2022",
      column: "category",
      reasonTh: "หมวดหมู่ไม่ถูกต้อง",
      reasonEn: "Invalid category",
    },
    {
      row: 7,
      titleTh: "จำนวนครู 2565",
      titleEn: "Teacher count 2022",
      column: "license",
      reasonTh: "License ไม่ถูกต้อง",
      reasonEn: "Invalid license",
    },
  ],
};

export async function fetchMockBulkUpload(file: File): Promise<BulkUploadResult> {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  void file;
  return mockBulkUploadResult;
}

const BULK_UPLOAD_TEMPLATE_CSV =
  "title,description,category_id,subcategory_id,license,tags,year,province\n" +
  "ตัวอย่าง Dataset,คำอธิบายชุดข้อมูล,student-statistics,student-by-province,open,การศึกษา,2567,all\n";

export function createBulkUploadTemplateBlob(): Blob {
  return new Blob([BULK_UPLOAD_TEMPLATE_CSV], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

export type DatasetVersionChangelogType = "edit" | "add" | "initial";

export type DatasetVersionItem = {
  version: string;
  createdAt: string;
  createdByTh: string;
  createdByEn: string;
  changelogType: DatasetVersionChangelogType;
  changelogTh: string[];
  changelogEn: string[];
  isCurrent: boolean;
};

export const mockVersionHistory: DatasetVersionItem[] = [
  {
    version: "3.0",
    createdAt: "2024-03-12T14:30:00Z",
    createdByTh: "นายสมชาย มั่นคง",
    createdByEn: "Mr. Somchai Mankong",
    changelogType: "edit",
    changelogTh: ["อัปเดตข้อมูลปี 2566", "เพิ่มคอลัมน์จังหวัด"],
    changelogEn: ["Updated 2023 academic year data", "Added province column"],
    isCurrent: true,
  },
  {
    version: "2.0",
    createdAt: "2024-03-05T10:15:00Z",
    createdByTh: "นายสมชาย มั่นคง",
    createdByEn: "Mr. Somchai Mankong",
    changelogType: "add",
    changelogTh: ["แก้ไขข้อมูลผิดพลาดแถว 15-20", "อัปเดต License"],
    changelogEn: ["Fixed incorrect rows 15-20", "Updated license"],
    isCurrent: false,
  },
  {
    version: "1.0",
    createdAt: "2024-03-01T09:00:00Z",
    createdByTh: "ระบบ (Initial Upload)",
    createdByEn: "System (Initial Upload)",
    changelogType: "initial",
    changelogTh: ["อัปโหลดครั้งแรก"],
    changelogEn: ["Initial upload"],
    isCurrent: false,
  },
];

export async function fetchMockVersionHistory(
  datasetId: string
): Promise<DatasetVersionItem[]> {
  await Promise.resolve();
  void datasetId;
  return mockVersionHistory;
}

export function getAgencyDatasetById(id: string): AgencyDatasetRow | undefined {
  return mockAgencyDatasets.find((dataset) => dataset.id === id);
}

export async function fetchMockRestoreVersion(
  datasetId: string,
  version: string
): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  void datasetId;
  void version;
}

export type AdminMonthlyCount = {
  month: string;
  monthEn: string;
  count: number;
};

export type AdminPendingUser = {
  id: string;
  agencyName: string;
  agencyNameEn: string;
  email: string;
  createdAt: string;
  initials: string;
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

const INITIAL_ADMIN_DASHBOARD: AdminDashboardData = {
  totalUsers: 156,
  totalDatasets: 1234,
  pendingUsers: 8,
  todayDownloads: 432,
  userTrendPercent: 12,
  datasetTrendPercent: 5.4,
  datasetsByMonth: [
    { month: "ม.ค.", monthEn: "Jan", count: 45 },
    { month: "ก.พ.", monthEn: "Feb", count: 62 },
    { month: "มี.ค.", monthEn: "Mar", count: 58 },
    { month: "เม.ย.", monthEn: "Apr", count: 71 },
    { month: "พ.ค.", monthEn: "May", count: 89 },
    { month: "มิ.ย.", monthEn: "Jun", count: 76 },
  ],
  downloadsByMonth: [
    { month: "ม.ค.", monthEn: "Jan", count: 3200 },
    { month: "ก.พ.", monthEn: "Feb", count: 4100 },
    { month: "มี.ค.", monthEn: "Mar", count: 3800 },
    { month: "เม.ย.", monthEn: "Apr", count: 5200 },
    { month: "พ.ค.", monthEn: "May", count: 6100 },
    { month: "มิ.ย.", monthEn: "Jun", count: 5800 },
  ],
  pendingUserList: [
    {
      id: "u-1",
      agencyName: "กรมการศึกษา",
      agencyNameEn: "Department of Education",
      email: "edu@gov.th",
      createdAt: "2024-05-01",
      initials: "กศ",
    },
    {
      id: "u-2",
      agencyName: "สำนักงานสถิติ",
      agencyNameEn: "National Statistical Office",
      email: "stat@gov.th",
      createdAt: "2024-05-02",
      initials: "สส",
    },
    {
      id: "u-3",
      agencyName: "กระทรวงศึกษาธิการ",
      agencyNameEn: "Ministry of Education",
      email: "moe@gov.th",
      createdAt: "2024-05-03",
      initials: "กศ",
    },
  ],
};

let adminDashboardState: AdminDashboardData = {
  ...INITIAL_ADMIN_DASHBOARD,
  pendingUserList: INITIAL_ADMIN_DASHBOARD.pendingUserList.map((user) => ({
    ...user,
  })),
  datasetsByMonth: INITIAL_ADMIN_DASHBOARD.datasetsByMonth.map((item) => ({
    ...item,
  })),
  downloadsByMonth: INITIAL_ADMIN_DASHBOARD.downloadsByMonth.map((item) => ({
    ...item,
  })),
};

export const mockAdminDashboard: AdminDashboardData = INITIAL_ADMIN_DASHBOARD;

export function getAdminDashboardMock(): AdminDashboardData {
  syncDashboardPendingUsers();
  return {
    ...adminDashboardState,
    pendingUserList: adminDashboardState.pendingUserList.map((user) => ({
      ...user,
    })),
    datasetsByMonth: adminDashboardState.datasetsByMonth.map((item) => ({
      ...item,
    })),
    downloadsByMonth: adminDashboardState.downloadsByMonth.map((item) => ({
      ...item,
    })),
  };
}

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

export const ADMIN_USERS_PAGE_SIZE = 5;

const INITIAL_ADMIN_USERS: AdminUser[] = [
  {
    id: "u-1",
    agencyName: "กรมการศึกษา",
    agencyNameEn: "Department of Education",
    email: "edu@gov.th",
    role: "agency",
    status: "pending",
    createdAt: "2024-05-01",
  },
  {
    id: "u-2",
    agencyName: "สพฐ.",
    agencyNameEn: "Office of the Basic Education Commission",
    email: "obec@gov.th",
    role: "agency",
    status: "active",
    createdAt: "2024-01-15",
  },
  {
    id: "u-3",
    agencyName: "สอศ.",
    agencyNameEn: "Office of the Vocational Education Commission",
    email: "ovec@gov.th",
    role: "agency",
    status: "suspended",
    createdAt: "2024-02-20",
  },
  {
    id: "u-4",
    agencyName: "Admin System",
    agencyNameEn: "Admin System",
    email: "admin@edudata.go.th",
    role: "admin",
    status: "active",
    createdAt: "2024-01-01",
  },
  {
    id: "u-5",
    agencyName: "กระทรวงศึกษาธิการ",
    agencyNameEn: "Ministry of Education",
    email: "moe@gov.th",
    role: "agency",
    status: "rejected",
    createdAt: "2024-03-10",
    rejectReason:
      "เอกสารหนังสือรับรองหน่วยงานไม่ครบถ้วน กรุณาส่งเอกสารเพิ่มเติมและสมัครใหม่อีกครั้ง",
  },
];

let adminUsersState: AdminUser[] = INITIAL_ADMIN_USERS.map((user) => ({ ...user }));

export const mockAdminUsers: AdminUser[] = INITIAL_ADMIN_USERS;

function adminUserToPending(user: AdminUser): AdminPendingUser {
  const initials = user.agencyName
    .replace(/[^\u0E00-\u0E7FA-Za-z]/g, "")
    .slice(0, 2)
    .toUpperCase();

  return {
    id: user.id,
    agencyName: user.agencyName,
    agencyNameEn: user.agencyNameEn,
    email: user.email,
    createdAt: user.createdAt,
    initials: initials || "AG",
  };
}

function syncDashboardPendingUsers(): void {
  adminDashboardState.pendingUserList = adminUsersState
    .filter((user) => user.status === "pending")
    .map(adminUserToPending);
  adminDashboardState.pendingUsers = adminDashboardState.pendingUserList.length;
  adminDashboardState.totalUsers = adminUsersState.length;
}

export function getAdminUsersMock(
  filters?: AdminUsersFilters
): AdminUsersResult {
  let data = adminUsersState.map((user) => ({ ...user }));

  if (filters?.status && filters.status !== "all") {
    data = data.filter((user) => user.status === filters.status);
  }

  if (filters?.role && filters.role !== "all") {
    data = data.filter((user) => user.role === filters.role);
  }

  if (filters?.search?.trim()) {
    const keyword = filters.search.trim().toLowerCase();
    data = data.filter(
      (user) =>
        user.agencyName.toLowerCase().includes(keyword) ||
        user.agencyNameEn.toLowerCase().includes(keyword) ||
        user.email.toLowerCase().includes(keyword)
    );
  }

  const total = data.length;
  const page = Math.max(1, filters?.page ?? 1);
  const totalPages = Math.max(1, Math.ceil(total / ADMIN_USERS_PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * ADMIN_USERS_PAGE_SIZE;

  return {
    data: data.slice(start, start + ADMIN_USERS_PAGE_SIZE),
    total,
    page: safePage,
    pageSize: ADMIN_USERS_PAGE_SIZE,
    totalPages,
  };
}

export function approveAdminUserMock(userId: string): void {
  const user = adminUsersState.find((item) => item.id === userId);
  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }
  user.status = "active";
  delete user.rejectReason;
  syncDashboardPendingUsers();
}

export function rejectAdminUserMock(userId: string, reason = ""): void {
  const user = adminUsersState.find((item) => item.id === userId);
  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }
  user.status = "rejected";
  user.rejectReason = reason;
  syncDashboardPendingUsers();
}

export function suspendAdminUserMock(userId: string): void {
  const user = adminUsersState.find((item) => item.id === userId);
  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }
  if (user.role === "admin") {
    throw new Error("USER_CANNOT_SUSPEND_SELF");
  }
  user.status = "suspended";
}

export function unsuspendAdminUserMock(userId: string): void {
  const user = adminUsersState.find((item) => item.id === userId);
  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }
  user.status = "active";
}

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

export const ADMIN_DATASETS_PAGE_SIZE = 5;

const INITIAL_ADMIN_DATASETS: AdminDataset[] = [
  {
    id: "1",
    title: "สถิตินักเรียนรายจังหวัด 2566",
    titleEn: "Provincial Student Statistics 2023",
    agency: "สพฐ.",
    agencyEn: "OBEC",
    category: "สถิตินักเรียน",
    categoryEn: "Student statistics",
    status: "published",
    qualityScore: 85,
    updatedAt: "2024-01-01",
  },
  {
    id: "2",
    title: "จำนวนครูรายวิชา 2566",
    titleEn: "Teachers by Subject 2023",
    agency: "สพฐ.",
    agencyEn: "OBEC",
    category: "จำนวนครู",
    categoryEn: "Teacher count",
    status: "published",
    qualityScore: 78,
    updatedAt: "2024-02-01",
  },
  {
    id: "3",
    title: "งบประมาณการศึกษา 2566",
    titleEn: "Education Budget 2023",
    agency: "สำนักงบประมาณ",
    agencyEn: "Bureau of the Budget",
    category: "งบประมาณ",
    categoryEn: "Budget",
    status: "draft",
    qualityScore: 62,
    updatedAt: "2024-03-01",
  },
  {
    id: "4",
    title: "ผลการเรียน O-NET 2566",
    titleEn: "O-NET Results 2023",
    agency: "สทศ.",
    agencyEn: "NIETS",
    category: "ผลการเรียน",
    categoryEn: "Academic results",
    status: "published",
    qualityScore: 91,
    updatedAt: "2024-03-15",
  },
  {
    id: "5",
    title: "จำนวนโรงเรียนรายจังหวัด 2566",
    titleEn: "Schools by Province 2023",
    agency: "สพฐ.",
    agencyEn: "OBEC",
    category: "โรงเรียน",
    categoryEn: "Schools",
    status: "draft",
    qualityScore: 70,
    updatedAt: "2024-04-01",
  },
];

let adminDatasetsState: AdminDataset[] = INITIAL_ADMIN_DATASETS.map((item) => ({
  ...item,
}));

export const mockAdminDatasets: AdminDataset[] = INITIAL_ADMIN_DATASETS;

function getAdminDatasetAgencies(): string[] {
  return [...new Set(adminDatasetsState.map((item) => item.agency))].sort();
}

export function getAdminDatasetsMock(
  filters?: AdminDatasetsFilters
): AdminDatasetsResult {
  let data = adminDatasetsState.map((item) => ({ ...item }));

  if (filters?.status && filters.status !== "all") {
    data = data.filter((item) => item.status === filters.status);
  }

  if (filters?.agency && filters.agency !== "all") {
    data = data.filter((item) => item.agency === filters.agency);
  }

  if (filters?.search?.trim()) {
    const keyword = filters.search.trim().toLowerCase();
    data = data.filter(
      (item) =>
        item.title.toLowerCase().includes(keyword) ||
        item.titleEn.toLowerCase().includes(keyword)
    );
  }

  const total = data.length;
  const page = Math.max(1, filters?.page ?? 1);
  const totalPages = Math.max(1, Math.ceil(total / ADMIN_DATASETS_PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * ADMIN_DATASETS_PAGE_SIZE;

  return {
    data: data.slice(start, start + ADMIN_DATASETS_PAGE_SIZE),
    total,
    page: safePage,
    pageSize: ADMIN_DATASETS_PAGE_SIZE,
    totalPages,
    agencies: getAdminDatasetAgencies(),
  };
}

export function deleteAdminDatasetMock(datasetId: string): void {
  const index = adminDatasetsState.findIndex((item) => item.id === datasetId);
  if (index === -1) {
    throw new Error("DATASET_NOT_FOUND");
  }
  adminDatasetsState = adminDatasetsState.filter((item) => item.id !== datasetId);
}

// — Admin category & tag management (mutable in-memory for UI-only phase) —

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

export const mockAdminCategories: AdminCategory[] = [
  {
    id: "cat-1",
    nameTh: "สถิตินักเรียน",
    nameEn: "Student Statistics",
    slug: "student-statistics",
    datasetCount: 45,
    subcategories: [
      {
        id: "sub-1",
        nameTh: "รายจังหวัด",
        nameEn: "By Province",
        slug: "by-province",
        agencyName: "สพฐ.",
        datasetCount: 12,
      },
      {
        id: "sub-2",
        nameTh: "รายปี",
        nameEn: "By Year",
        slug: "by-year",
        agencyName: "สพฐ.",
        datasetCount: 8,
      },
    ],
  },
  {
    id: "cat-2",
    nameTh: "จำนวนครู",
    nameEn: "Teacher Statistics",
    slug: "teacher-statistics",
    datasetCount: 28,
    subcategories: [
      {
        id: "sub-3",
        nameTh: "รายวิชา",
        nameEn: "By Subject",
        slug: "by-subject",
        agencyName: "สพฐ.",
        datasetCount: 10,
      },
    ],
  },
  {
    id: "cat-3",
    nameTh: "โรงเรียน",
    nameEn: "Schools",
    slug: "schools",
    datasetCount: 0,
    subcategories: [],
  },
];

export const mockAdminTags: AdminTag[] = [
  { id: "tag-1", name: "นักเรียน", datasetCount: 23 },
  { id: "tag-2", name: "ครู", datasetCount: 15 },
  { id: "tag-3", name: "2566", datasetCount: 45 },
  { id: "tag-4", name: "จังหวัด", datasetCount: 18 },
  { id: "tag-5", name: "CSV", datasetCount: 32 },
];

let adminCategoriesState: AdminCategory[] = mockAdminCategories.map((c) => ({
  ...c,
  subcategories: c.subcategories.map((s) => ({ ...s })),
}));
let adminTagsState: AdminTag[] = mockAdminTags.map((t) => ({ ...t }));

const ADMIN_CATEGORY_PAGE_SIZE = 4;

export type AdminCategoriesResult = {
  data: AdminCategory[];
  totalL1: number;
  totalL2: number;
  page: number;
  totalPages: number;
};

function recalcAdminCategoryDatasetCount(category: AdminCategory): AdminCategory {
  const subTotal = category.subcategories.reduce(
    (sum, sub) => sum + sub.datasetCount,
    0
  );
  return {
    ...category,
    datasetCount: Math.max(category.datasetCount, subTotal),
  };
}

export function getAdminCategoriesMock(
  search?: string,
  page = 1
): AdminCategoriesResult {
  const keyword = search?.trim().toLowerCase() ?? "";
  let filtered = [...adminCategoriesState];

  if (keyword) {
    filtered = filtered.filter((category) => {
      const l1Match =
        category.nameTh.toLowerCase().includes(keyword) ||
        category.nameEn.toLowerCase().includes(keyword) ||
        category.slug.toLowerCase().includes(keyword);
      const l2Match = category.subcategories.some(
        (sub) =>
          sub.nameTh.toLowerCase().includes(keyword) ||
          sub.nameEn.toLowerCase().includes(keyword) ||
          sub.slug.toLowerCase().includes(keyword) ||
          sub.agencyName.toLowerCase().includes(keyword)
      );
      return l1Match || l2Match;
    });
  }

  const totalL1 = filtered.length;
  const totalL2 = filtered.reduce(
    (sum, category) => sum + category.subcategories.length,
    0
  );
  const totalPages = Math.max(
    1,
    Math.ceil(totalL1 / ADMIN_CATEGORY_PAGE_SIZE)
  );
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const start = (safePage - 1) * ADMIN_CATEGORY_PAGE_SIZE;

  return {
    data: filtered.slice(start, start + ADMIN_CATEGORY_PAGE_SIZE),
    totalL1,
    totalL2,
    page: safePage,
    totalPages,
  };
}

export function createAdminCategoryMock(
  input: AdminCategoryInput
): AdminCategory {
  const created: AdminCategory = {
    id: `cat-${Date.now()}`,
    nameTh: input.nameTh,
    nameEn: input.nameEn,
    slug: input.slug,
    datasetCount: 0,
    subcategories: [],
  };
  adminCategoriesState = [...adminCategoriesState, created];
  return created;
}

export function updateAdminCategoryMock(
  level: 1 | 2,
  id: string,
  input: AdminCategoryInput
): void {
  if (level === 1) {
    adminCategoriesState = adminCategoriesState.map((category) =>
      category.id === id
        ? {
            ...category,
            nameTh: input.nameTh,
            nameEn: input.nameEn,
            slug: input.slug,
          }
        : category
    );
    return;
  }

  adminCategoriesState = adminCategoriesState.map((category) => ({
    ...category,
    subcategories: category.subcategories.map((sub) =>
      sub.id === id
        ? {
            ...sub,
            nameTh: input.nameTh,
            nameEn: input.nameEn,
            slug: input.slug,
          }
        : sub
    ),
  }));
}

export function deleteAdminCategoryMock(level: 1 | 2, id: string): void {
  if (level === 1) {
    const target = adminCategoriesState.find((category) => category.id === id);
    if (!target) {
      throw new Error("CATEGORY_NOT_FOUND");
    }
  const hasDatasets =
    target.datasetCount > 0 ||
    target.subcategories.some((sub) => sub.datasetCount > 0);
    if (hasDatasets) {
      throw new Error("CATEGORY_HAS_DATASETS");
    }
    adminCategoriesState = adminCategoriesState.filter(
      (category) => category.id !== id
    );
    return;
  }

  let found = false;
  adminCategoriesState = adminCategoriesState.map((category) => {
    const sub = category.subcategories.find((item) => item.id === id);
    if (!sub) {
      return category;
    }
    found = true;
    if (sub.datasetCount > 0) {
      throw new Error("CATEGORY_HAS_DATASETS");
    }
    const nextSubcategories = category.subcategories.filter(
      (item) => item.id !== id
    );
    return recalcAdminCategoryDatasetCount({
      ...category,
      subcategories: nextSubcategories,
      datasetCount: nextSubcategories.reduce(
        (sum, item) => sum + item.datasetCount,
        0
      ),
    });
  });

  if (!found) {
    throw new Error("CATEGORY_NOT_FOUND");
  }
}

export function getAdminTagsMock(search?: string): AdminTag[] {
  const keyword = search?.trim().toLowerCase() ?? "";
  if (!keyword) {
    return [...adminTagsState];
  }
  return adminTagsState.filter((tag) =>
    tag.name.toLowerCase().includes(keyword)
  );
}

export function createAdminTagMock(name: string): AdminTag {
  const exists = adminTagsState.some(
    (tag) => tag.name.toLowerCase() === name.toLowerCase()
  );
  if (exists) {
    throw new Error("TAG_NAME_EXISTS");
  }
  const created: AdminTag = {
    id: `tag-${Date.now()}`,
    name,
    datasetCount: 0,
  };
  adminTagsState = [...adminTagsState, created];
  return created;
}

export function updateAdminTagMock(id: string, name: string): void {
  const exists = adminTagsState.some(
    (tag) => tag.id !== id && tag.name.toLowerCase() === name.toLowerCase()
  );
  if (exists) {
    throw new Error("TAG_NAME_EXISTS");
  }
  const index = adminTagsState.findIndex((tag) => tag.id === id);
  if (index === -1) {
    throw new Error("TAG_NOT_FOUND");
  }
  adminTagsState = adminTagsState.map((tag) =>
    tag.id === id ? { ...tag, name } : tag
  );
}

export function deleteAdminTagMock(id: string): void {
  const target = adminTagsState.find((tag) => tag.id === id);
  if (!target) {
    throw new Error("TAG_NOT_FOUND");
  }
  if (target.datasetCount > 0) {
    throw new Error("TAG_HAS_DATASETS");
  }
  adminTagsState = adminTagsState.filter((tag) => tag.id !== id);
}

// — Announcements (mutable in-memory for UI-only phase) —

export type Announcement = {
  id: string;
  title: string;
  content: string;
  isActive: boolean;
  createdAt: string;
};

export type AnnouncementInput = {
  title: string;
  content: string;
  isActive: boolean;
};

export const mockAnnouncements: Announcement[] = [
  {
    id: "ann-1",
    title: "ระบบเปิดให้บริการอย่างเป็นทางการ",
    content:
      "ยินดีต้อนรับสู่ Thai EduData Insight ระบบเปิดให้บริการแล้ว",
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "ann-2",
    title: "อัปเดตข้อมูลประจำปี 2566",
    content: "ข้อมูลสถิติการศึกษาปี 2566 พร้อมให้ดาวน์โหลดแล้ว",
    isActive: false,
    createdAt: "2024-02-01T00:00:00Z",
  },
  {
    id: "ann-3",
    title: "แจ้งปิดระบบชั่วคราว",
    content: "ระบบจะปิดปรับปรุงในวันที่ 30 มีนาคม 2567",
    isActive: false,
    createdAt: "2024-03-01T00:00:00Z",
  },
];

let announcementsState: Announcement[] = mockAnnouncements.map((item) => ({
  ...item,
}));

const ADMIN_ANNOUNCEMENTS_PAGE_SIZE = 10;

export type AdminAnnouncementsResult = {
  data: Announcement[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export function getAdminAnnouncementsMock(
  page = 1
): AdminAnnouncementsResult {
  const sorted = [...announcementsState].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  const total = sorted.length;
  const totalPages = Math.max(
    1,
    Math.ceil(total / ADMIN_ANNOUNCEMENTS_PAGE_SIZE)
  );
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const start = (safePage - 1) * ADMIN_ANNOUNCEMENTS_PAGE_SIZE;

  return {
    data: sorted.slice(start, start + ADMIN_ANNOUNCEMENTS_PAGE_SIZE),
    total,
    page: safePage,
    pageSize: ADMIN_ANNOUNCEMENTS_PAGE_SIZE,
    totalPages,
  };
}

export function getActiveAnnouncementsMock(): Announcement[] {
  return [...announcementsState]
    .filter((item) => item.isActive)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
}

export function createAnnouncementMock(
  input: AnnouncementInput
): Announcement {
  const created: Announcement = {
    id: `ann-${Date.now()}`,
    title: input.title,
    content: input.content,
    isActive: input.isActive,
    createdAt: new Date().toISOString(),
  };
  announcementsState = [created, ...announcementsState];
  return created;
}

export function updateAnnouncementMock(
  id: string,
  input: AnnouncementInput
): Announcement {
  const index = announcementsState.findIndex((item) => item.id === id);
  if (index === -1) {
    throw new Error("ANNOUNCEMENT_NOT_FOUND");
  }
  const updated: Announcement = {
    ...announcementsState[index],
    title: input.title,
    content: input.content,
    isActive: input.isActive,
  };
  announcementsState = announcementsState.map((item) =>
    item.id === id ? updated : item
  );
  return updated;
}

export function deleteAnnouncementMock(id: string): void {
  const exists = announcementsState.some((item) => item.id === id);
  if (!exists) {
    throw new Error("ANNOUNCEMENT_NOT_FOUND");
  }
  announcementsState = announcementsState.filter((item) => item.id !== id);
}

export function toggleAnnouncementMock(id: string, isActive: boolean): void {
  const index = announcementsState.findIndex((item) => item.id === id);
  if (index === -1) {
    throw new Error("ANNOUNCEMENT_NOT_FOUND");
  }
  announcementsState = announcementsState.map((item) =>
    item.id === id ? { ...item, isActive } : item
  );
}

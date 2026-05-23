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

export type MegaMenuLink = {
  id: string;
  labelTh: string;
  labelEn: string;
  href?: string;
};

export type MegaMenuCategory = MegaMenuLink & {
  children?: MegaMenuLink[];
};

export const MOCK_MEGAMENU_CATEGORIES: MegaMenuCategory[] = [
  {
    id: "cat-students",
    labelTh: "สถิตินักเรียนและนักศึกษา",
    labelEn: "Student statistics",
    children: [
      {
        id: "cat-students-enroll",
        labelTh: "การลงทะเบียนเรียน",
        labelEn: "Enrollment",
      },
      {
        id: "cat-students-region",
        labelTh: "แยกตามภูมิภาค",
        labelEn: "By region",
      },
    ],
  },
  {
    id: "cat-teachers",
    labelTh: "ข้อมูลจำนวนครูและบุคลากร",
    labelEn: "Teachers and staff",
  },
  {
    id: "cat-schools",
    labelTh: "ที่ตั้งสถานศึกษาทั่วประเทศ",
    labelEn: "School locations",
  },
  {
    id: "cat-budget",
    labelTh: "งบประมาณด้านการศึกษา",
    labelEn: "Education budget",
  },
  {
    id: "cat-outcomes",
    labelTh: "ผลสัมฤทธิ์ทางการเรียน",
    labelEn: "Learning outcomes",
  },
];

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

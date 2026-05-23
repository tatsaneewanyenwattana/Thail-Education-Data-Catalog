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

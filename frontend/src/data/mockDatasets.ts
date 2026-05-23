export type MockDataset = {
  id: string;
  title: string;
  description: string;
  agency: string;
  category: string;
  categorySlug: string;
  license: "open" | "conditional" | "cc";
  downloadCount: number;
  viewCount: number;
  publishedAt: string;
  tags: string[];
  year?: number;
  province?: string;
};

export const MOCK_DATASETS: MockDataset[] = [
  {
    id: "ds-001",
    title: "สถิตินักเรียนระดับมัธยมศึกษา ปีการศึกษา 2567",
    description:
      "จำนวนนักเรียนแยกตามจังหวัด ระดับชั้น และเพศ ข้อมูลจาก สพฐ.",
    agency: "สำนักงานคณะกรรมการการศึกษาขั้นพื้นฐาน",
    category: "นักเรียน",
    categorySlug: "students",
    license: "open",
    downloadCount: 1240,
    viewCount: 5820,
    publishedAt: "2025-01-10T08:00:00Z",
    tags: ["นักเรียน", "มัธยม", "2567"],
    year: 2567,
    province: "ทั่วประเทศ",
  },
  {
    id: "ds-002",
    title: "ข้อมูลครูและบุคลากรทางการศึกษา 2566",
    description:
      "จำนวนครูแยกตามสาขาวิชา วุฒิการศึกษา และประเภทโรงเรียน",
    agency: "สำนักงานคณะกรรมการการศึกษาขั้นพื้นฐาน",
    category: "ครู",
    categorySlug: "teachers",
    license: "conditional",
    downloadCount: 890,
    viewCount: 3210,
    publishedAt: "2024-12-15T10:30:00Z",
    tags: ["ครู", "บุคลากร"],
    year: 2566,
  },
  {
    id: "ds-003",
    title: "รายชื่อโรงเรียนในเขตกรุงเทพมหานคร",
    description: "ข้อมูลโรงเรียน ที่อยู่ ประเภท และขนาดโรงเรียน",
    agency: "สำนักงานคณะกรรมการการศึกษาขั้นพื้นฐาน",
    category: "โรงเรียน",
    categorySlug: "schools",
    license: "open",
    downloadCount: 2100,
    viewCount: 9100,
    publishedAt: "2025-02-01T09:00:00Z",
    tags: ["โรงเรียน", "กรุงเทพ"],
    province: "กรุงเทพมหานคร",
  },
  {
    id: "ds-004",
    title: "ผลการเรียน O-NET ระดับประถมศึกษา 2566",
    description: "คะแนนเฉลี่ยแยกตามวิชาและภูมิภาค",
    agency: "สถาบันการประเมินผลการศึกษาแห่งชาติ",
    category: "การประเมิน",
    categorySlug: "assessment",
    license: "cc",
    downloadCount: 1560,
    viewCount: 4400,
    publishedAt: "2024-11-20T14:00:00Z",
    tags: ["O-NET", "ประถม"],
    year: 2566,
  },
  {
    id: "ds-005",
    title: "งบประมาณการศึกษาจังหวัดละ 2567",
    description: "งบจัดสรรแยกตามหมวดและจังหวัด",
    agency: "สำนักงานคณะกรรมการการศึกษาขั้นพื้นฐาน",
    category: "งบประมาณ",
    categorySlug: "budget",
    license: "open",
    downloadCount: 430,
    viewCount: 1890,
    publishedAt: "2025-01-28T11:00:00Z",
    tags: ["งบประมาณ", "จังหวัด"],
    year: 2567,
  },
  {
    id: "ds-006",
    title: "อัตราการเข้าเรียนต่อเนื่อง ม.3-ม.6",
    description: "อัตราการสำเร็จการศึกษาและเข้าศึกษาต่อในระดับที่สูงขึ้น",
    agency: "สำนักงานคณะกรรมการส่งเสริมการศึกษาเอกชน",
    category: "นักเรียน",
    categorySlug: "students",
    license: "open",
    downloadCount: 720,
    viewCount: 2650,
    publishedAt: "2024-10-05T08:30:00Z",
    tags: ["เข้าเรียน", "มัธยม"],
    year: 2566,
  },
];

export function getMockDatasetById(id: string): MockDataset | undefined {
  return MOCK_DATASETS.find((d) => d.id === id);
}

export function getMockDatasetsByCategorySlug(slug: string): MockDataset[] {
  return MOCK_DATASETS.filter((d) => d.categorySlug === slug);
}

export const MOCK_CATEGORIES = [
  { slug: "students", nameTh: "นักเรียน", nameEn: "Students" },
  { slug: "teachers", nameTh: "ครู", nameEn: "Teachers" },
  { slug: "schools", nameTh: "โรงเรียน", nameEn: "Schools" },
  { slug: "assessment", nameTh: "การประเมิน", nameEn: "Assessment" },
  { slug: "budget", nameTh: "งบประมาณ", nameEn: "Budget" },
];

export const MOCK_HOME_STATS = {
  datasets: 1284,
  agencies: 42,
  downloads: 98500,
  categories: 156,
};

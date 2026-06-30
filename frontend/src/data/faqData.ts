export type FaqItem = {
  id: string;
  question: { th: string; en: string };
  answer: { th: string; en: string };
  link?: { href: string; label: { th: string; en: string } };
  related?: string[];
};

export type FaqCategory = {
  id: string;
  title: { th: string; en: string };
  icon: string;
  items: FaqItem[];
};

export type QuickAction = {
  label: { th: string; en: string };
  href: string;
};

export const QUICK_ACTIONS: QuickAction[] = [
  { label: { th: "ค้นหาข้อมูล", en: "Search Data" }, href: "/search" },
  { label: { th: "สมัครสมาชิก", en: "Register" }, href: "/register" },
  { label: { th: "ทุนการศึกษา", en: "Scholarships" }, href: "/scholarship" },
  { label: { th: "เครื่องมือ API", en: "API Docs" }, href: "/api-docs" },
];

export const FAQ_CATEGORIES: FaqCategory[] = [
  {
    id: "search",
    title: { th: "การค้นหาข้อมูล", en: "Searching Data" },
    icon: "search",
    items: [
      {
        id: "search-1",
        question: {
          th: "ค้นหาชุดข้อมูลยังไง?",
          en: "How do I search for datasets?",
        },
        answer: {
          th: "ไปที่หน้า \"ค้นหา\" จากเมนูด้านบน แล้วพิมพ์คำที่ต้องการในช่องค้นหา สามารถกรองผลลัพธ์ตามหมวดหมู่ หน่วยงาน หรือรูปแบบไฟล์ได้",
          en: "Go to the \"Search\" page from the top menu, then type your keywords in the search box. You can filter results by category, organization, or file format.",
        },
        link: {
          href: "/search",
          label: { th: "ไปหน้าค้นหา →", en: "Go to Search →" },
        },
        related: ["search-2", "download-1"],
      },
      {
        id: "search-2",
        question: {
          th: "กรองข้อมูลตามหมวดหมู่ได้ไหม?",
          en: "Can I filter data by category?",
        },
        answer: {
          th: "ได้ ในหน้าค้นหาจะมีตัวกรองด้านซ้าย สามารถเลือกหมวดหมู่ หน่วยงาน รูปแบบไฟล์ และช่วงเวลาได้",
          en: "Yes, the search page has filters on the left side. You can select category, organization, file format, and date range.",
        },
        link: {
          href: "/search",
          label: { th: "ไปหน้าค้นหา →", en: "Go to Search →" },
        },
        related: ["search-1"],
      },
      {
        id: "search-3",
        question: {
          th: "ดูสถิติภาพรวมข้อมูลได้ที่ไหน?",
          en: "Where can I see data statistics?",
        },
        answer: {
          th: "ไปที่หน้า \"สถิติภาพรวม\" จากเมนูด้านบน จะเห็นแดชบอร์ดแสดงจำนวนชุดข้อมูล การดาวน์โหลด และสถิติต่างๆ",
          en: "Go to the \"Dashboard\" page from the top menu to see charts showing dataset counts, downloads, and other statistics.",
        },
        link: {
          href: "/stats",
          label: { th: "ไปหน้าสถิติ →", en: "Go to Dashboard →" },
        },
      },
    ],
  },
  {
    id: "account",
    title: { th: "สมัครสมาชิก/เข้าสู่ระบบ", en: "Account & Login" },
    icon: "account",
    items: [
      {
        id: "account-1",
        question: {
          th: "สมัครสมาชิกยังไง?",
          en: "How do I register?",
        },
        answer: {
          th: "กดปุ่ม \"เข้าสู่ระบบ\" มุมขวาบน แล้วเลือก \"สมัครสมาชิก\" กรอกอีเมล ตั้งรหัสผ่าน และกรอกข้อมูลหน่วยงาน จากนั้นยืนยันอีเมลที่ได้รับ",
          en: "Click \"Login\" at the top right, then select \"Register\". Fill in your email, set a password, and enter your organization info. Then verify your email.",
        },
        link: {
          href: "/register",
          label: { th: "ไปหน้าสมัครสมาชิก →", en: "Go to Register →" },
        },
        related: ["account-2", "account-3"],
      },
      {
        id: "account-2",
        question: {
          th: "ลืมรหัสผ่านทำยังไง?",
          en: "What if I forgot my password?",
        },
        answer: {
          th: "ในหน้าเข้าสู่ระบบ กดลิงก์ \"ลืมรหัสผ่าน\" กรอกอีเมลที่ใช้สมัคร ระบบจะส่งลิงก์รีเซ็ตรหัสผ่านไปทางอีเมล",
          en: "On the login page, click \"Forgot Password\", enter your registered email, and the system will send a password reset link.",
        },
        link: {
          href: "/forgot-password",
          label: { th: "ไปหน้ารีเซ็ตรหัสผ่าน →", en: "Reset Password →" },
        },
      },
      {
        id: "account-3",
        question: {
          th: "ต้องสมัครสมาชิกก่อนถึงจะใช้งานได้ไหม?",
          en: "Do I need an account to use the site?",
        },
        answer: {
          th: "ไม่จำเป็น สามารถค้นหาและดูข้อมูลได้เลยโดยไม่ต้องสมัคร แต่ถ้าต้องการดาวน์โหลดข้อมูลหรือเผยแพร่ชุดข้อมูล ต้องสมัครสมาชิกก่อน",
          en: "No, you can search and view data without an account. However, downloading data or publishing datasets requires registration.",
        },
        related: ["account-1", "download-1"],
      },
    ],
  },
  {
    id: "download",
    title: { th: "การดาวน์โหลดข้อมูล", en: "Downloading Data" },
    icon: "download",
    items: [
      {
        id: "download-1",
        question: {
          th: "ดาวน์โหลดชุดข้อมูลยังไง?",
          en: "How do I download a dataset?",
        },
        answer: {
          th: "1. ค้นหาชุดข้อมูลที่ต้องการ\n2. กดเข้าไปดูรายละเอียด\n3. กดปุ่ม \"ดาวน์โหลด\" เลือกรูปแบบไฟล์ที่ต้องการ\n\nต้องเข้าสู่ระบบก่อนถึงจะดาวน์โหลดได้",
          en: "1. Search for the dataset\n2. Click to view details\n3. Click \"Download\" and select your preferred file format\n\nYou must be logged in to download.",
        },
        related: ["download-2", "search-1"],
      },
      {
        id: "download-2",
        question: {
          th: "ดาวน์โหลดได้กี่ไฟล์?",
          en: "How many files can I download?",
        },
        answer: {
          th: "ไม่จำกัดจำนวนการดาวน์โหลด สามารถดาวน์โหลดได้ทุกชุดข้อมูลที่เผยแพร่แล้ว",
          en: "There is no download limit. You can download any published dataset.",
        },
      },
      {
        id: "download-3",
        question: {
          th: "ไฟล์ที่ดาวน์โหลดมาเปิดไม่ได้ทำยังไง?",
          en: "What if I can't open the downloaded file?",
        },
        answer: {
          th: "ตรวจสอบรูปแบบไฟล์ที่ดาวน์โหลด (CSV, Excel, JSON) แล้วใช้โปรแกรมที่เหมาะสมเปิด เช่น CSV ใช้ Excel หรือ Google Sheets, JSON ใช้ text editor",
          en: "Check the file format (CSV, Excel, JSON) and open it with the appropriate program. For example, CSV with Excel or Google Sheets, JSON with a text editor.",
        },
      },
    ],
  },
  {
    id: "scholarship",
    title: { th: "ทุนการศึกษา", en: "Scholarships" },
    icon: "scholarship",
    items: [
      {
        id: "scholarship-1",
        question: {
          th: "ดูทุนการศึกษาได้ที่ไหน?",
          en: "Where can I find scholarships?",
        },
        answer: {
          th: "ไปที่หน้า \"ทุนการศึกษา\" จากเมนูด้านบน จะเห็นรายการทุนทั้งหมดที่เปิดรับอยู่ สามารถกรองตามระดับการศึกษาและสาขาได้",
          en: "Go to the \"Scholarships\" page from the top menu to see all available scholarships. You can filter by education level and field.",
        },
        link: {
          href: "/scholarship",
          label: { th: "ไปหน้าทุนการศึกษา →", en: "Go to Scholarships →" },
        },
        related: ["scholarship-2"],
      },
      {
        id: "scholarship-2",
        question: {
          th: "สมัครทุนการศึกษาผ่านเว็บนี้ได้ไหม?",
          en: "Can I apply for scholarships through this site?",
        },
        answer: {
          th: "เว็บนี้เป็นแหล่งรวบรวมข้อมูลทุนการศึกษา แต่การสมัครต้องไปที่เว็บไซต์ของผู้ให้ทุนโดยตรง ในรายละเอียดทุนจะมีลิงก์ไปยังแหล่งสมัคร",
          en: "This site collects scholarship information, but applications must be made through the scholarship provider's website. Details include links to application sources.",
        },
      },
    ],
  },
  {
    id: "api",
    title: { th: "เครื่องมือ API", en: "API Tools" },
    icon: "api",
    items: [
      {
        id: "api-1",
        question: {
          th: "API คืออะไร ใช้ยังไง?",
          en: "What is the API and how do I use it?",
        },
        answer: {
          th: "API เป็นเครื่องมือสำหรับนักพัฒนาที่ต้องการดึงข้อมูลไปใช้ในระบบอื่น สามารถดูเอกสารวิธีใช้ได้ที่หน้าเครื่องมือ API",
          en: "The API is a tool for developers who want to pull data into other systems. See the API documentation page for usage details.",
        },
        link: {
          href: "/api-docs",
          label: { th: "ไปหน้า API Docs →", en: "Go to API Docs →" },
        },
      },
      {
        id: "api-2",
        question: {
          th: "ใช้ API ต้องเสียเงินไหม?",
          en: "Does the API cost money?",
        },
        answer: {
          th: "ไม่เสียเงิน API เปิดให้ใช้งานฟรีสำหรับทุกคน",
          en: "No, the API is free to use for everyone.",
        },
      },
    ],
  },
  {
    id: "general",
    title: { th: "ทั่วไป", en: "General" },
    icon: "general",
    items: [
      {
        id: "general-1",
        question: {
          th: "เว็บนี้คืออะไร?",
          en: "What is this website?",
        },
        answer: {
          th: "Thai EduData Insight เป็นศูนย์กลางการเชื่อมโยงข้อมูลการศึกษาแบบเปิดแห่งประเทศไทย รวบรวมชุดข้อมูลด้านการศึกษาจากหน่วยงานต่างๆ เพื่อสนับสนุนการวิจัยและพัฒนา",
          en: "Thai EduData Insight is Thailand's open education data portal, collecting educational datasets from various organizations to support research and development.",
        },
      },
      {
        id: "general-2",
        question: {
          th: "ติดต่อทีมงานได้ยังไง?",
          en: "How can I contact the team?",
        },
        answer: {
          th: "สามารถติดต่อได้ผ่านหน้า Help Center หรือส่งอีเมลมาที่อีเมลของทีมงาน",
          en: "You can reach us through the Help Center page or by sending an email to the team.",
        },
        link: {
          href: "/help-center",
          label: { th: "ไปหน้า Help Center →", en: "Go to Help Center →" },
        },
      },
      {
        id: "general-3",
        question: {
          th: "เว็บรองรับภาษาอะไรบ้าง?",
          en: "What languages does the site support?",
        },
        answer: {
          th: "รองรับ 2 ภาษา คือ ไทย และ อังกฤษ สามารถสลับภาษาได้จากปุ่ม TH/EN ด้านบนขวา",
          en: "The site supports Thai and English. You can switch languages using the TH/EN button at the top right.",
        },
      },
    ],
  },
];

export function searchFaq(keyword: string, locale: string): FaqItem[] {
  const lower = keyword.toLowerCase().trim();
  if (!lower) return [];

  const results: FaqItem[] = [];
  for (const cat of FAQ_CATEGORIES) {
    for (const item of cat.items) {
      const q = locale === "th" ? item.question.th : item.question.en;
      const a = locale === "th" ? item.answer.th : item.answer.en;
      if (q.toLowerCase().includes(lower) || a.toLowerCase().includes(lower)) {
        results.push(item);
      }
    }
  }
  return results;
}

export function getFaqById(id: string): FaqItem | undefined {
  for (const cat of FAQ_CATEGORIES) {
    const found = cat.items.find((item) => item.id === id);
    if (found) return found;
  }
  return undefined;
}

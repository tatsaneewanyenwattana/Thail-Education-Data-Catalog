# Module: Core
# Feature: Error Code Dictionary ตาม #24 + HTTP Status Rules ตาม #26

from fastapi import HTTPException

ERROR_DEFINITIONS: dict[str, tuple[int, str]] = {
    # Auth
    "AUTH_INVALID_CREDENTIALS": (401, "อีเมลหรือรหัสผ่านไม่ถูกต้อง"),
    "AUTH_TOKEN_EXPIRED": (401, "Token หมดอายุ กรุณา Login ใหม่"),
    "AUTH_TOKEN_INVALID": (401, "Token ไม่ถูกต้อง"),
    "AUTH_TOKEN_ALREADY_USED": (400, "ลิงก์นี้ถูกใช้ไปแล้ว"),
    "AUTH_TOKEN_MISSING": (401, "ไม่มี Token"),
    "AUTH_ACCOUNT_SUSPENDED": (403, "บัญชีถูกระงับ"),
    "AUTH_ACCOUNT_PENDING": (403, "บัญชียังรอการอนุมัติ"),
    "AUTH_ACCOUNT_REJECTED": (403, "บัญชีถูกปฏิเสธ"),
    "AUTH_EMAIL_NOT_VERIFIED": (403, "กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ"),
    "AUTH_ACCOUNT_LOCKED": (423, "บัญชีถูกล็อกชั่วคราว กรุณาลองใหม่ภายหลัง"),
    "AUTH_ACCOUNT_DELETED": (410, "บัญชีถูกลบแล้ว"),
    "AUTH_RESEND_COOLDOWN": (429, "กรุณารอสักครู่ก่อนขออีเมลใหม่"),
    "AUTH_PERMISSION_DENIED": (403, "ไม่มีสิทธิ์ทำสิ่งนี้"),
    "TURNSTILE_REQUIRED": (400, "กรุณายืนยันว่าไม่ใช่บอท"),
    "TURNSTILE_FAILED": (400, "การยืนยันไม่สำเร็จ กรุณาลองใหม่"),
    # User
    "USER_NOT_FOUND": (404, "ไม่พบ User"),
    "USER_EMAIL_EXISTS": (409, "Email นี้มีในระบบแล้ว"),
    "USER_CANNOT_SUSPEND_SELF": (400, "Admin ไม่สามารถ Suspend ตัวเองได้"),
    "USER_CANNOT_DELETE_SELF": (400, "ไม่สามารถลบบัญชีตัวเองได้"),
    "USER_CANNOT_DELETE_ADMIN": (400, "ไม่สามารถลบบัญชี Admin ได้"),
    "CANNOT_CHANGE_OWN_ROLE": (400, "ไม่สามารถเปลี่ยน Role ของตัวเองได้"),
    "LAST_ADMIN_ERROR": (400, "ไม่สามารถลด Role Admin คนสุดท้ายได้"),
    "USER_STATUS_INVALID": (400, "สถานะบัญชีไม่ถูกต้อง"),
    # Dataset
    "DATASET_NOT_FOUND": (404, "ไม่พบ Dataset"),
    "DATASET_PERMISSION_DENIED": (403, "ไม่ใช่เจ้าของ Dataset"),
    "DATASET_INVALID_STATUS": (400, "สถานะ Dataset ไม่อนุญาตให้ทำสิ่งนี้"),
    "DATASET_ALREADY_PUBLISHED": (400, "Dataset ถูก Publish แล้ว"),
    "DATASET_REJECT_COMMENT_REQUIRED": (400, "ต้องใส่ Comment เมื่อ Reject"),
    # File
    "FILE_TOO_LARGE": (400, "ไฟล์ใหญ่เกิน 100MB"),
    "FILE_INVALID_FORMAT": (400, "ไฟล์ไม่ใช่ CSV/Excel/JSON"),
    "FILE_UPLOAD_FAILED": (500, "อัปโหลดไฟล์ไม่สำเร็จ"),
    "FILE_NOT_FOUND": (404, "ไม่พบไฟล์"),
    "VERIFICATION_DOC_REQUIRED": (400, "ต้องอัปโหลดเอกสารยืนยันตน"),
    "VERIFICATION_DOC_TOO_LARGE": (413, "เอกสารยืนยันตนใหญ่เกิน 5MB"),
    "INVALID_MIME_TYPE": (415, "ประเภทไฟล์ไม่ถูกต้อง ต้องเป็น PDF"),
    # Search
    "SEARCH_KEYWORD_TOO_SHORT": (400, "คำค้นหาสั้นเกินไป"),
    "SEARCH_INVALID_FILTER": (400, "Filter ไม่ถูกต้อง"),
    # Download
    "DOWNLOAD_PURPOSE_REQUIRED": (400, "ต้องกรอกวัตถุประสงค์ก่อนดาวน์โหลด"),
    "DOWNLOAD_INVALID_FORMAT": (400, "Format ที่เลือกไม่รองรับ"),
    # Category / Tag
    "CATEGORY_NOT_FOUND": (404, "ไม่พบหมวดหมู่"),
    "CATEGORY_SLUG_EXISTS": (409, "ชื่อซ้ำในระบบ"),
    "CATEGORY_PARENT_NOT_FOUND": (404, "ไม่พบหมวดหมู่ระดับบนสุด"),
    "CATEGORY_MAX_DEPTH_REACHED": (400, "เกินจำนวนระดับที่กำหนด"),
    "CATEGORY_HAS_DATASETS": (400, "ลบไม่ได้เพราะมี Dataset อยู่"),
    "CATEGORY_HAS_CHILDREN": (400, "ลบไม่ได้เพราะมีหมวดหมู่ย่อยอยู่"),
    "CATEGORY_NOT_LEAF": (400, "Dataset ต้องผูกกับหมวดหมู่ปลายทางเท่านั้น"),
    "CATEGORY_PERMISSION_DENIED": (403, "ไม่ใช่เจ้าของหมวดหมู่นี้"),
    "CATEGORY_NOT_OWNED": (403, "หมวดหมู่นี้เป็นของ Agency อื่น"),
    "TAG_NOT_FOUND": (404, "ไม่พบแท็ก"),
    "TAG_NAME_EXISTS": (409, "ชื่อแท็กนี้มีในระบบแล้ว"),
    # Page
    "PAGE_SLUG_EXISTS": (409, "Slug นี้มีในระบบแล้ว"),
    "PAGE_NOT_FOUND": (404, "ไม่พบหน้าที่ต้องการ"),
    # System
    "VALIDATION_ERROR": (422, "ข้อมูลที่ส่งมาไม่ถูกต้อง"),
    "RATE_LIMIT_EXCEEDED": (429, "เรียก API เกินจำนวนที่กำหนด"),
    "INTERNAL_SERVER_ERROR": (500, "ระบบขัดข้อง"),
    "NOT_FOUND": (404, "ไม่พบสิ่งที่ต้องการ"),
}


class AppException(HTTPException):
    def __init__(
        self,
        code: str,
        message: str | None = None,
        details: dict | None = None,
    ) -> None:
        if code not in ERROR_DEFINITIONS:
            raise ValueError(f"Unknown error code: {code}")
        status_code, default_message = ERROR_DEFINITIONS[code]
        self.code = code
        error_body: dict = {
            "code": code,
            "message": message or default_message,
        }
        if details:
            error_body["details"] = details
        super().__init__(
            status_code=status_code,
            detail={
                "success": False,
                "error": error_body,
            },
        )


def raise_app_error(
    code: str,
    message: str | None = None,
    details: dict | None = None,
) -> None:
    raise AppException(code, message, details)

# Module: M9 Email
# Feature: Central template names ตาม claude-v3 #33

from enum import Enum


class EmailTemplateType(str, Enum):
    VERIFY_EMAIL = "verify_email"
    ACCOUNT_APPROVED = "account_approved"
    ACCOUNT_REJECTED = "account_rejected"
    ACCOUNT_SUSPENDED = "account_suspended"
    ACCOUNT_UNSUSPENDED = "account_unsuspended"
    PASSWORD_RESET = "password_reset"
    PASSWORD_CHANGED = "password_changed"
    ACCOUNT_LOCKOUT = "account_lockout"
    NEW_DATASET_NOTIFICATION = "new_dataset_notification"
    ADMIN_NEW_REGISTRATION = "admin_new_registration"
    ACCOUNT_DELETED = "account_deleted"

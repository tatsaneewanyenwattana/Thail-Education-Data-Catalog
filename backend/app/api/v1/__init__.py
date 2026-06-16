from fastapi import APIRouter

from app.api.v1.routers.admin_router import router as admin_router
from app.api.v1.routers.agency_router import router as agency_router
from app.api.v1.routers.auth_router import router as auth_router
from app.api.v1.routers.category_router import router as category_router
from app.api.v1.routers.dataset_router import router as dataset_router
from app.api.v1.routers.download_router import router as download_router
from app.api.v1.routers.public_router import router as public_router
from app.api.v1.routers.search_router import router as search_router
from app.api.v1.routers.tag_router import router as tag_router
from app.api.v1.routers.notification_router import router as notification_router
from app.api.v1.routers.scholarship_router import router as scholarship_router
from app.api.v1.routers.visualization_router import router as visualization_router
from app.pii.router import router as pii_router

api_router = APIRouter()
api_router.include_router(auth_router, tags=["Auth"])
api_router.include_router(agency_router)
api_router.include_router(admin_router, tags=["Admin"])
api_router.include_router(dataset_router, tags=["Dataset"])
api_router.include_router(category_router, tags=["Category"])
api_router.include_router(tag_router, tags=["Tag"])
api_router.include_router(search_router, tags=["Search"])
api_router.include_router(download_router, tags=["Download"])
api_router.include_router(visualization_router, tags=["Visualization"])
api_router.include_router(notification_router, tags=["Notification"])
api_router.include_router(public_router, tags=["Public API"])
api_router.include_router(scholarship_router, tags=["Scholarship"])
api_router.include_router(pii_router, tags=["PII"])

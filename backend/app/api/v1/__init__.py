from fastapi import APIRouter

from app.api.v1.routers.auth_router import router as auth_router
from app.api.v1.routers.category_router import router as category_router
from app.api.v1.routers.dataset_router import router as dataset_router
from app.api.v1.routers.tag_router import router as tag_router

api_router = APIRouter()
api_router.include_router(auth_router, tags=["Auth"])
api_router.include_router(dataset_router, tags=["Dataset"])
api_router.include_router(category_router, tags=["Category"])
api_router.include_router(tag_router, tags=["Tag"])

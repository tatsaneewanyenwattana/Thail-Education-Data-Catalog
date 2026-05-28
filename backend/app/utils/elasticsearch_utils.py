# Module: M3 Search
# Feature: Elasticsearch Index Management ตาม #8

import json
import logging
from dataclasses import dataclass
from typing import Any

from app.core.logging import get_logger, log_request
from app.core.pagination import PaginationParams

logger = get_logger(__name__)

INDEX_NAME = "datasets"

UTF8_HEADERS = {
    "Content-Type": "application/json; charset=utf-8",
    "Accept": "application/json; charset=utf-8",
}

INDEX_SORT_FIELDS = {
    "published_at",
    "download_count",
    "created_at",
    "updated_at",
}

INDEX_MAPPINGS = {
    "mappings": {
        "properties": {
            "title": {"type": "text", "analyzer": "thai"},
            "description": {"type": "text", "analyzer": "thai"},
            "tags": {"type": "keyword"},
            "agency_name": {"type": "text", "analyzer": "thai"},
            "category_id": {"type": "keyword"},
            "user_id": {"type": "keyword"},
            "license": {"type": "keyword"},
            "status": {"type": "keyword"},
            "published_at": {"type": "date"},
            "created_at": {"type": "date"},
            "updated_at": {"type": "date"},
            "download_count": {"type": "integer"},
            "metadata": {
                "properties": {
                    "year": {"type": "integer"},
                    "province": {"type": "keyword"},
                }
            },
        }
    }
}


@dataclass
class SearchResult:
    items: list[dict[str, Any]]
    total: int


def _resolve_sort_field(es_client, sort: str) -> str:
    if sort not in INDEX_SORT_FIELDS:
        return "published_at"
    try:
        if not es_client.indices.exists(index=INDEX_NAME):
            return "published_at"
        mapping = es_client.indices.get_mapping(index=INDEX_NAME)
        properties = (
            mapping.get(INDEX_NAME, {})
            .get("mappings", {})
            .get("properties", {})
        )
        if sort in properties:
            return sort
    except Exception:
        pass
    return "published_at"


def _ensure_es_client_utf8_headers(es_client) -> None:
    client_headers = getattr(es_client, "_headers", None)
    if isinstance(client_headers, dict):
        es_client._headers = {**client_headers, **UTF8_HEADERS}
    else:
        es_client._headers = dict(UTF8_HEADERS)

    transport = getattr(es_client, "transport", None)
    if transport is not None:
        transport_headers = getattr(transport, "headers", None)
        if isinstance(transport_headers, dict):
            transport.headers = {**transport_headers, **UTF8_HEADERS}
        else:
            transport.headers = dict(UTF8_HEADERS)


def _prepare_document_utf8(dataset: dict[str, Any]) -> dict[str, Any]:
    payload = json.dumps(dataset, ensure_ascii=False)
    payload.encode("utf-8")
    return json.loads(payload)


def delete_index(es_client) -> None:
    try:
        if es_client.indices.exists(index=INDEX_NAME):
            es_client.indices.delete(index=INDEX_NAME)
    except Exception as exc:
        log_request(logger, logging.ERROR, f"Elasticsearch delete_index failed: {exc}")


def create_index_if_not_exists(es_client) -> None:
    try:
        if es_client.indices.exists(index=INDEX_NAME):
            return
        es_client.indices.create(index=INDEX_NAME, body=INDEX_MAPPINGS)
    except Exception as exc:
        log_request(
            logger, logging.ERROR, f"Elasticsearch create_index_if_not_exists failed: {exc}"
        )


def recreate_index(es_client) -> None:
    try:
        delete_index(es_client)
        es_client.indices.create(index=INDEX_NAME, body=INDEX_MAPPINGS)
    except Exception as exc:
        log_request(logger, logging.ERROR, f"Elasticsearch recreate_index failed: {exc}")


def index_dataset(es_client, dataset: dict[str, Any]) -> None:
    try:
        _ensure_es_client_utf8_headers(es_client)
        create_index_if_not_exists(es_client)
        doc_id = str(dataset.get("id", ""))
        if not doc_id:
            return
        document = _prepare_document_utf8(dataset)
        es_client.index(index=INDEX_NAME, id=doc_id, document=document)
    except Exception as exc:
        log_request(logger, logging.ERROR, f"Elasticsearch index_dataset failed: {exc}")


def delete_dataset_index(es_client, dataset_id: str) -> None:
    try:
        if es_client.indices.exists(index=INDEX_NAME):
            es_client.delete(index=INDEX_NAME, id=str(dataset_id), ignore=[404])
    except Exception as exc:
        log_request(
            logger, logging.ERROR, f"Elasticsearch delete_dataset_index failed: {exc}"
        )


def search_datasets(
    es_client,
    keyword: str,
    filters: dict[str, Any] | None,
    pagination: PaginationParams,
) -> SearchResult:
    create_index_if_not_exists(es_client)

    must_clauses: list[dict] = [{"term": {"status": "published"}}]

    if filters:
        if filters.get("category_id"):
            must_clauses.append({"term": {"category_id": str(filters["category_id"])}})
        if filters.get("license"):
            must_clauses.append({"term": {"license": filters["license"]}})
        if filters.get("agency_user_id"):
            must_clauses.append(
                {"term": {"user_id": str(filters["agency_user_id"])}}
            )
        if filters.get("year") is not None:
            must_clauses.append(
                {"term": {"metadata.year": int(filters["year"])}}
            )
        if filters.get("province"):
            must_clauses.append(
                {"term": {"metadata.province": filters["province"]}}
            )
        if filters.get("tag"):
            must_clauses.append(
                {
                    "wildcard": {
                        "tags": {
                            "value": f"*{str(filters['tag']).lower()}*",
                            "case_insensitive": True,
                        }
                    }
                }
            )

    should_clauses: list[dict] = [
        {
            "multi_match": {
                "query": keyword,
                "fields": ["title", "description", "agency_name", "tags"],
                "operator": "or",
                "analyzer": "thai",
            }
        },
        {
            "wildcard": {
                "tags": {"value": f"*{keyword.lower()}*", "case_insensitive": True}
            }
        },
    ]

    sort_field = _resolve_sort_field(es_client, pagination.sort)

    body: dict[str, Any] = {
        "query": {
            "bool": {
                "must": must_clauses,
                "should": should_clauses,
                "minimum_should_match": 1,
            }
        },
        "from": pagination.offset,
        "size": pagination.page_size,
        "sort": [{sort_field: {"order": pagination.order}}],
    }

    try:
        response = es_client.search(index=INDEX_NAME, body=body)
        hits = response.get("hits", {})
        total = hits.get("total", {})
        if isinstance(total, dict):
            total_count = total.get("value", 0)
        else:
            total_count = int(total)
        items = [hit["_source"] for hit in hits.get("hits", [])]
        return SearchResult(items=items, total=total_count)
    except Exception as exc:
        log_request(logger, logging.ERROR, f"Elasticsearch search failed: {exc}")
        return SearchResult(items=[], total=0)


def autocomplete_datasets(es_client, keyword: str) -> list[str]:
    create_index_if_not_exists(es_client)

    body = {
        "query": {
            "bool": {
                "must": [{"term": {"status": "published"}}],
                "should": [
                    {"match_phrase_prefix": {"title": keyword}},
                    {"match_phrase_prefix": {"description": keyword}},
                    {"match_phrase_prefix": {"agency_name": keyword}},
                ],
                "minimum_should_match": 1,
            }
        },
        "_source": ["title", "description", "agency_name"],
        "size": 10,
    }

    suggestions: list[str] = []
    seen: set[str] = set()

    try:
        response = es_client.search(index=INDEX_NAME, body=body)
        for hit in response.get("hits", {}).get("hits", []):
            source = hit.get("_source", {})
            for field in ("title", "description", "agency_name"):
                value = source.get(field)
                if value and value not in seen:
                    seen.add(value)
                    suggestions.append(value)
                    if len(suggestions) >= 10:
                        return suggestions
    except Exception as exc:
        log_request(
            logger, logging.ERROR, f"Elasticsearch autocomplete failed: {exc}"
        )

    return suggestions

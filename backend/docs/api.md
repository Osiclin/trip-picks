# Trip Picks API Documentation

Base URL: `http://localhost:3001`

All responses use `Content-Type: application/json`.

---

## Error Response Format

All errors follow this consistent shape:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": {}
  }
}
```

| HTTP Status | Code | When |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Request body fails schema validation |
| 400 | `BAD_REQUEST` | Semantic validation failed (e.g. referencing non-existent IDs) |
| 404 | `NOT_FOUND` | Resource does not exist |
| 500 | `INTERNAL_SERVER_ERROR` | Unexpected server error |

---

## Activities

### `GET /activities/filters`

Returns all distinct categories, areas, and tags present in the database. Useful for populating filter UI dynamically.

**Success Response `200`**

```json
{
  "categories": ["Beach", "Culture", "History", "Music & Books", "Nature", "Shopping"],
  "areas": ["Ikoyi", "Lagos Harbour", "Lagos Island", "Lekki", "Victoria Island"],
  "tags": ["Afrobeat", "art", "beach", "books", "concerts", "culture", "eco-tourism", "gallery", "heritage", "history", "jazz", "music", "nature", "outdoor", "relaxation", "shopping", "street food", "theatre", "vinyl", "wildlife"]
}
```

---

### `GET /activities`

Returns a paginated, filterable list of activities.

**Query Parameters**

| Param | Type | Default | Description |
|---|---|---|---|
| `q` | string | — | Case-insensitive search on `title` |
| `category` | string | — | Filter by exact category (e.g. `Culture`) |
| `area` | string | — | Filter by exact area (e.g. `Lekki`) |
| `page` | integer | `1` | Page number |
| `limit` | integer | `10` | Results per page (max 100) |

**Success Response `200`**

```json
{
  "data": [
    {
      "id": "act_001",
      "title": "Nike Art Gallery",
      "category": "Culture",
      "area": "Lekki",
      "durationMinutes": 90,
      "priceLevel": 2,
      "rating": 4.7,
      "imageUrl": "https://...",
      "description": "...",
      "tags": ["art", "gallery"],
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z"
    }
  ],
  "meta": {
    "total": 7,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

**Example requests**

```
GET /activities
GET /activities?category=Culture
GET /activities?area=Lekki&page=1&limit=5
GET /activities?q=beach
```

---

### `GET /activities/:id`

Returns a single activity by ID.

**Path Parameters**

| Param | Description |
|---|---|
| `id` | Activity ID (e.g. `act_001`) |

**Success Response `200`** — single Activity object (same shape as items in the list above)

**Error Responses**

| Status | Code | Condition |
|---|---|---|
| 404 | `NOT_FOUND` | No activity with the given ID |

---

## Plans

### `GET /plans`

Returns all plans (most recent first), each including their linked activities.

**Success Response `200`** — array of plan objects (same shape as `POST /plans` success response)

---

### `POST /plans`

Creates a new day plan.

**Request Body**

```json
{
  "name": "Lagos Culture Day",
  "date": "2025-07-15",
  "notes": "Start early to beat traffic",
  "activityIds": ["act_001", "act_002"]
}
```

| Field | Type | Required | Constraints |
|---|---|---|---|
| `name` | string | ✅ | Non-empty, max 100 chars |
| `date` | string | ✅ | Valid ISO date string |
| `notes` | string | ❌ | Max 1000 chars |
| `activityIds` | string[] | ✅ | Non-empty array; all IDs must reference existing activities |

**Success Response `201`**

```json
{
  "id": "plan_abc123def456",
  "name": "Lagos Culture Day",
  "date": "2025-07-15T00:00:00.000Z",
  "notes": "Start early to beat traffic",
  "activities": [
    { "id": "act_001", "title": "Nike Art Gallery", "..." : "..." }
  ],
  "createdAt": "2025-06-01T10:00:00.000Z",
  "updatedAt": "2025-06-01T10:00:00.000Z"
}
```

**Error Responses**

| Status | Code | Condition |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Missing or invalid fields |
| 400 | `BAD_REQUEST` | One or more `activityIds` do not exist |

---

### `GET /plans/:id`

Returns a single plan including its linked activities.

**Path Parameters**

| Param | Description |
|---|---|
| `id` | Plan ID |

**Success Response `200`** — same shape as POST /plans success response

**Error Responses**

| Status | Code | Condition |
|---|---|---|
| 404 | `NOT_FOUND` | No plan with the given ID |

---

### `PATCH /plans/:id`

Partially updates a plan. All fields are optional; supplying `activityIds` replaces the full activity list.

**Request Body** _(all fields optional)_

```json
{
  "name": "Updated Name",
  "date": "2025-08-01",
  "notes": null,
  "activityIds": ["act_003", "act_005"]
}
```

**Success Response `200`** — updated plan with activities

**Error Responses**

| Status | Code | Condition |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Fields present but invalid |
| 400 | `BAD_REQUEST` | Supplied `activityIds` reference non-existent activities |
| 404 | `NOT_FOUND` | Plan does not exist |

---

## Health Check

### `GET /health`

Returns server status.

```json
{ "status": "ok", "timestamp": "2025-06-01T10:00:00.000Z" }
```

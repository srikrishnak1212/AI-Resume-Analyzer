# API.md
# REST API Specification
## AI Resume Analyzer & Career Assistant

**Document Version:** 1.0
**Document Type:** REST API Specification
**Reference:** SRS v1.0, Database Architecture v1.0
**Stack:** Node.js, Express.js, MongoDB, JWT, Google Gemini AI
**Status:** Ready for Development

---

## Table of Contents

1. API Design Principles
2. Authentication APIs
3. Resume APIs
4. AI Analysis APIs
5. Job Description APIs
6. Cover Letter APIs
7. Interview APIs
8. Reports APIs
9. Analytics APIs
10. Settings APIs
11. Notification APIs
12. Admin APIs (Future)
13. Standard Response Format
14. Authentication Flow
15. API Security
16. Error Handling Strategy
17. API Versioning
18. Rate Limiting
19. Logging
20. Monitoring
21. API Testing Strategy

---

## 1. API Design Principles

### 1.1 REST Standards

The API is designed as a RESTful HTTP API conforming to the following constraints:

| Principle | Implementation |
|---|---|
| Uniform Interface | All resources exposed via consistent URL patterns and HTTP methods |
| Statelessness | Every request contains all information needed; no server-side session state |
| Resource-Based URLs | URLs identify resources (nouns), not actions (verbs) |
| HTTP Methods as Verbs | `GET` = read, `POST` = create, `PUT` = full replace, `PATCH` = partial update, `DELETE` = remove |
| Representation | All request/response bodies are JSON (`Content-Type: application/json`) |
| HATEOAS (Light) | Key responses include related resource URLs for discoverability |

### 1.2 URL Naming Convention

| Rule | Example |
|---|---|
| Lowercase, hyphen-separated | `/resume-analysis`, `/cover-letters` |
| Plural nouns for collections | `/resumes`, `/reports`, `/notifications` |
| Singular noun for specific resource | `/resumes/:resumeId` |
| Nested routes for ownership | `/resumes/:resumeId/analysis` |
| Action routes use verbs only where REST method is insufficient | `/auth/refresh-token`, `/resumes/:resumeId/rewrite` |
| No trailing slashes | `/api/v1/resumes` not `/api/v1/resumes/` |

### 1.3 Versioning

- All routes are prefixed with `/api/v1/`.
- Version is embedded in the URL path (not a header) for maximum client compatibility.
- When breaking changes are introduced, `/api/v2/` routes are added without removing `/api/v1/` routes until all clients have migrated.

### 1.4 Authentication Convention

- All authenticated endpoints require a valid JWT access token.
- Tokens are sent as a `Bearer` token in the `Authorization` header: `Authorization: Bearer <accessToken>`.
- Alternatively, HTTP-only cookies may carry the access token for browser clients (preferred for security).
- Routes that do not require authentication are explicitly marked as **Public**.

### 1.5 Standard Request Headers

| Header | Required | Value |
|---|---|---|
| `Content-Type` | Yes (for POST/PUT/PATCH) | `application/json` |
| `Authorization` | Yes (for protected routes) | `Bearer <accessToken>` |
| `Accept` | Recommended | `application/json` |
| `X-Request-ID` | Optional | UUID — client-generated for tracing |

### 1.6 HTTP Status Codes

| Code | Meaning | When Used |
|---|---|---|
| `200 OK` | Success | GET, PATCH, PUT responses |
| `201 Created` | Resource created | POST responses that create a resource |
| `204 No Content` | Success, no body | DELETE responses |
| `400 Bad Request` | Validation error / malformed input | Input validation failures |
| `401 Unauthorized` | Missing or invalid token | Authentication failures |
| `403 Forbidden` | Valid token but insufficient permissions | Authorization failures |
| `404 Not Found` | Resource does not exist | Resource lookup failures |
| `409 Conflict` | Duplicate resource | Duplicate email registration |
| `413 Payload Too Large` | File too large | Resume upload > 5MB |
| `415 Unsupported Media Type` | Wrong file type | Non-PDF/DOCX uploads |
| `422 Unprocessable Entity` | Semantic error in valid JSON | Business logic validation failure |
| `429 Too Many Requests` | Rate limit exceeded | Rate limiting responses |
| `500 Internal Server Error` | Unhandled server error | Unexpected backend failures |
| `503 Service Unavailable` | Downstream service down | Gemini API unavailable |

---

## 2. Authentication APIs

Base path: `/api/v1/auth`

---

### 2.1 Register User

| Property | Value |
|---|---|
| **Purpose** | Create a new user account with email and password |
| **Method** | `POST` |
| **Route** | `/api/v1/auth/register` |
| **Authentication** | Public |

**Request Headers:**
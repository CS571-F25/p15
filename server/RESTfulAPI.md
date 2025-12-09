# API Documentation

WIP
This API is organized into three main domains:

- **User** — Authentication, profiles, account data
- **Character** — Playable characters, attributes, inventory
- **Map** — Game maps, regions, metadata

---

## User API

### Endpoints

| Endpoint     | Method | Description      | Params | Body    | Response | Auth Required |
| ------------ | ------ | ---------------- | ------ | ------- | -------- | ------------- |
| `/user`      | GET    | Get current user | None   | None    | `{...}`  | Yes           |
| `/user/{id}` | GET    | Get user by ID   | `id`   | None    | `{...}`  | Yes           |
| `/user`      | POST   | Create new user  | None   | `{...}` | `{...}`  | No            |
| `/user/{id}` | PATCH  | Update user      | `id`   | `{...}` | `{...}`  | Yes           |
| `/user/{id}` | DELETE | Delete a user    | `id`   | None    | `{...}`  | Yes           |

---

## Character API

### Endpoints

| Endpoint          | Method | Description         | Params | Body    | Response | Auth Required |
| ----------------- | ------ | ------------------- | ------ | ------- | -------- | ------------- |
| `/character`      | GET    | Get all characters  | None   | None    | `[...]`  | Yes           |
| `/character/{id}` | GET    | Get character by ID | `id`   | None    | `{...}`  | Yes           |
| `/character`      | POST   | Create a character  | None   | `{...}` | `{...}`  | Yes           |
| `/character/{id}` | PATCH  | Update a character  | `id`   | `{...}` | `{...}`  | Yes           |
| `/character/{id}` | DELETE | Delete character    | `id`   | None    | `{...}`  | Yes           |

---

## Map API

### Endpoints

| Endpoint    | Method | Description   | Params | Body    | Response | Auth Required |
| ----------- | ------ | ------------- | ------ | ------- | -------- | ------------- |
| `/map`      | GET    | Get all maps  | None   | None    | `[...]`  | No            |
| `/map/{id}` | GET    | Get map by ID | `id`   | None    | `{...}`  | No            |
| `/map`      | POST   | Create a map  | None   | `{...}` | `{...}`  | Yes           |
| `/map/{id}` | PATCH  | Update a map  | `id`   | `{...}` | `{...}`  | Yes           |
| `/map/{id}` | DELETE | Delete map    | `id`   | None    | `{...}`  | Yes           |

---

### Notes:

- **Params** lists URL parameters.
- **Body** specifies the expected JSON request body.
- **Response** shows the typical JSON response.
- **Auth Required** indicates if authentication is needed. Token based authentication is used.

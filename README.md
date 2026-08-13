# RescuedFurWorld

Monorepo with two projects:

- `frontend/` — Angular 15 app (UI). See `frontend/README.md` for Angular CLI usage.
- `backend/` — Node/Express + lowdb API server (auth, cat CRUD, image upload).

## Development

Run the backend (port 4300):

```
cd backend
npm start
```

Run the frontend (port 4200, proxies `/api` and `/uploads` to the backend):

```
cd frontend
npm start
```

## Build

```
cd frontend
npm run build
```

## Tests

```
cd frontend
npm test
```


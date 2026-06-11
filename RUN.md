# Run CRESCO

This project has two separate applications:

- `frontend`: React 18 and Vite, served on port 3000
- `backend`: Node.js and Express, connected to MySQL

## Frontend

Open PowerShell in the `frontend` folder and run:

```powershell
npm.cmd install
npm.cmd run dev
```

Then open `http://localhost:3000`.

## Backend

Open another PowerShell window in the `backend` folder and run:

```powershell
npm.cmd install
npm.cmd start
```

The backend requires the database and service settings already listed in
`backend/.env`. Make sure the referenced MySQL database is available.

## Verification

The frontend production build was verified successfully with:

```powershell
npm.cmd run build
```

The backend entry point passed Node's syntax check:

```powershell
node --check server.js
```

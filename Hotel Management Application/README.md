# HotelPro

HotelPro is a React/Vite frontend with an Express, MongoDB, and Mongoose backend. This guide explains how to configure Atlas, run both apps locally, and test registration, login, protected pages, and admin room management.

## Requirements

- Node.js 20.19+ or 22.12+
- npm
- A MongoDB Atlas cluster and a database user

## 1. Configure MongoDB Atlas

1. Create or select a cluster in MongoDB Atlas.
2. In **Database Access**, create a database user and save its password securely.
3. In **Network Access**, allow your current IP address.
4. Select **Connect → Drivers → Node.js** and copy the connection string.
5. In Atlas **Browse Collections**, you can check the application data after the first registration. Use the database name in your connection string (the example below uses `Roomly`).

If the Atlas password contains special characters, URL-encode them in the connection string. Do not commit or share database credentials.

## 2. Configure the backend

Open a PowerShell terminal at the repository root and run:

```powershell
cd "Hotel Management Application\Server"
Copy-Item .env.example .env
```

Edit `Server/.env` and set the Atlas URI and a private JWT secret:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<database-user>:<url-encoded-password>@<cluster-host>/Roomly
JWT_SECRET=<a-random-secret-at-least-32-characters-long>
```

Generate a suitable random JWT secret with:

```powershell
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

The `.env` file is ignored by Git. Keep it private.

Install dependencies and start the backend:

```powershell
npm install
npm run dev
```

Wait for the console to report **Connected to MongoDB** and **Server listening on port 5000**. Check the health endpoint in a browser:

```text
http://localhost:5000/api/health
```

It should return a healthy status with the database marked as connected.

## 3. Configure and start the frontend

Open a **second** PowerShell terminal at the repository root:

```powershell
cd "Hotel Management Application\Client"
Copy-Item .env.example .env
npm install
npm run dev
```

Open the local URL Vite prints, usually `http://localhost:5173`. If the backend uses a different URL, set `VITE_API_URL` in `Client/.env`, for example:

```env
VITE_API_URL=http://localhost:5000/api
```

Restart Vite after changing its environment file.

## 4. Test the customer flow

1. Open `/register` and create an account with a name, email, phone number, and password of at least 8 characters.
2. Registration creates a customer account, hashes the password on the server, and signs the customer in.
3. Sign out, then use `/login` to test login.
4. Visit `/dashboard`, `/user`, and `/order`. These pages require a valid login.
5. Refresh a protected page to verify that the stored token is checked against `GET /api/auth/me`.

Useful routes:

| Route | Access | Purpose |
| --- | --- | --- |
| `/` | Public | HotelPro home page |
| `/products` | Public | Sample stay listings |
| `/login` | Public | Sign in |
| `/register` | Public | Create a customer account |
| `/dashboard` | Signed in | Customer dashboard |
| `/user` | Signed in | Account details |
| `/order` | Signed in | Booking placeholder |
| `/admin` | Admin only | Room inventory management |

## 5. Create an admin test account

There is no preconfigured admin account or shared test password. Register a test user through `/register`, then promote that account in Atlas:

1. Open the cluster’s **Browse Collections** view.
2. Select the app database (for example, `Roomly`) and the `users` collection.
3. Find the user document by the email used during registration.
4. Edit `userType` from `"customer"` to `"admin"` and save.
5. Sign out and sign back in; then open `/admin`.

Alternatively, use **Connect → MongoDB Shell** and update the test account (replace the email):

```javascript
use Roomly
db.users.updateOne(
  { email: "your-test-email@example.com" },
  { $set: { userType: "admin" } }
)
```

Confirm the result reports `matchedCount: 1`. The admin role is read from MongoDB when the user signs in, so signing in again refreshes the role in the frontend session. Do not promote accounts you do not control.

## 6. Test admin room management

At `/admin`, test the following:

1. Add a room with a unique room number, type, nightly price, guest capacity, and optional description.
2. Verify the room appears in **All rooms** and the inventory count updates.
3. Search by room number or type; filter by available, booked, or maintenance.
4. Change a room’s status and verify its status badge and summary count update.
5. Remove a room and confirm it disappears from inventory.

Room changes are persisted in MongoDB. The API endpoints are protected by both JWT authentication and the admin role:

| Method | Endpoint | Operation |
| --- | --- | --- |
| `GET` | `/api/admin/rooms` | List rooms |
| `POST` | `/api/admin/rooms` | Add a room |
| `PATCH` | `/api/admin/rooms/:roomId/status` | Set available, booked, or maintenance status |
| `DELETE` | `/api/admin/rooms/:roomId` | Remove a room |

## Deploy on Vercel

The frontend and backend are deployed as **two Vercel projects** from the same Git repository. This keeps Vite's static build and Express's serverless API in their supported project roots.

### Deploy the backend API

1. Push the project to a Git repository and import it into Vercel.
2. Create a Vercel project named, for example, `hotelpro-api`.
3. Set **Root Directory** to `Hotel Management Application/Server`.
4. Leave the framework as **Other**. Vercel detects the function in `api/[...path].js`; no long-running `npm run dev` process is needed.
5. Add these **Environment Variables** in the Vercel project settings for Production (and Preview if needed):

   | Name | Value |
   | --- | --- |
   | `MONGODB_URI` | Your MongoDB Atlas connection URI, including the database name |
   | `JWT_SECRET` | A strong random secret of at least 32 characters |
   | `CLIENT_URL` | The deployed frontend origin, e.g. `https://hotelpro.vercel.app` |

6. In Atlas **Network Access**, allow connections from Vercel. Vercel functions may use dynamic outbound IP addresses; use Atlas network access controls/static egress appropriate to your Vercel plan. If using `0.0.0.0/0` for a quick test, protect it with a dedicated least-privilege database user and a strong password, and understand it allows network access from any IP.
7. Deploy the project. Test `https://<your-api-domain>/api/health`; it should return a healthy status with `"database":"connected"`.

### Deploy the frontend

1. From the same repository, create a second Vercel project named, for example, `hotelpro-web`.
2. Set **Root Directory** to `Hotel Management Application/Client`.
3. The Client project includes `vercel.json` with `npm run build` as its build command and `dist` as its output directory. If the import wizard does not identify the framework, choose **Other**; the root directory and explicit Vercel build settings are sufficient to build the Vite app.
4. Confirm the install command is `npm install` and the Node.js version is 20.19+ (or 22.12+).
5. Add this frontend environment variable for Production (and Preview if needed):

   | Name | Value |
   | --- | --- |
   | `VITE_API_URL` | The backend deployment origin plus `/api`, e.g. `https://hotelpro-api.vercel.app/api` |

6. Deploy. The included `Client/vercel.json` rewrites client-side routes such as `/login` and `/admin` to the Vite app.
7. If the frontend deployment URL differs from `CLIENT_URL`, update the backend `CLIENT_URL` setting to the exact frontend origin, then redeploy the backend.

After both deployments are live, register a customer account, promote your own account to admin using the Atlas instructions above, sign in again, and test room management on the frontend's `/admin` route. Never put `MONGODB_URI` or `JWT_SECRET` in `VITE_*` variables; Vite variables are included in frontend code.

## Current scope

Authentication and admin room inventory are connected to the backend. The public stay cards are sample content, and the booking page is currently a placeholder: guest reservations, availability calendars, and payments are not implemented yet. Marking a room **booked** in the admin page manually changes its inventory status; it does not create a guest reservation.

## Quality checks

Run the frontend checks from `Client`:

```powershell
npm run lint
npm run build
```

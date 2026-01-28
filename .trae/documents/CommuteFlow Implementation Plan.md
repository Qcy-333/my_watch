# CommuteFlow Development Plan

Based on your request and the PRD, I have analyzed your current codebase (Vite + React) and the Lark API examples. Here is the plan to finalize the application.

## 1. Architecture: Migrate to Next.js
**Recommendation**: Yes, Next.js is the best choice for a "lightweight, personal" app because it combines the Frontend and Backend (API) into a single project.
- **Why**: You need a backend to securely hold your Feishu App Secret and proxy requests to the Lark API (to avoid CORS issues and exposing keys). Next.js API Routes are perfect for this.
- **Action**: I will convert your current Vite setup to a Next.js App Router structure.

## 2. Frontend & Interaction Optimization
Your current React components (`ReviewOverlay`, `QueueDrawer`) are excellent and match the PRD well. I will perform the following optimizations:
- **Data Persistence**: Implement `LocalStorage` for the `queueIds` so your playlist survives page refreshes (Requirement F3.1).
- **Real Data Binding**: Replace `MOCK_RECORDS` with real data fetching from our new API.
- **Dynamic Tag Cloud**: Ensure tags are derived from the *live* data from Feishu.

## 3. Lark (Feishu) API Integration
I will implement the backend logic using the examples you provided in `components/lark_api_example`.
- **API Routes**:
  - `GET /api/videos`: Fetches "ToWatch" records and Tag metadata (Colors/Names) concurrently.
  - `PATCH /api/videos`: Updates status (Done/Trash) and adds notes.
  - `POST /api/search`: Handles global search.
- **Security**: I will set up a `.env.local` file for your `APP_ID`, `APP_SECRET`, and `TABLE_ID`.

## Execution Steps
1.  **Refactor Directory**: Reorganize files into a Next.js structure (`app/`, `components/`, `lib/`).
2.  **Install Dependencies**: Add `next` and `axios` (for API calls).
3.  **Develop API**: Create the server-side logic to connect to Feishu.
4.  **Update Frontend**: Connect the UI to the new API and add LocalStorage persistence.
5.  **Verify**: Ensure the app runs locally and communicates with Feishu.

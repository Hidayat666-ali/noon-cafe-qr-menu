# Noon Cafe — QR Digital Menu Web App
**Kismatpur, Hyderabad**

A mobile-first QR digital menu web application designed specifically for **Noon Cafe — Kismatpur, Hyderabad**.

---

## 🚀 Quick Start on Any Computer

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.17+ or v20+ recommended)
- `npm` or `yarn`

### Setup & Run

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd noon-cafe-qr-menu
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser. It automatically redirects to `/menu/noon`.

4. **Production Build & Run:**
   ```bash
   npm run build
   npm start
   ```

---

## 📱 Application Routes

- **Customer QR Menu:** [`/menu/noon`](http://localhost:3000/menu/noon) — Optimized for mobile screens (360px – 412px). Strictly display-only (no carts, ordering, or payment).
- **Root Redirect:** [`/`](http://localhost:3000/) — Redirects directly to `/menu/noon`.
- **Staff Admin Portal:** [`/admin`](http://localhost:3000/admin) — Protected management dashboard.
  - **Default Staff PIN:** `noon123` (or `1234`)

---

## 🗄️ Architecture & Data Persistence

### What Survives Cloning:
- **Menu Data:** The full initial menu dataset (28 items across 6 categories with accurate rupee prices) is committed in [`data/menu-data.json`](./data/menu-data.json). This survives cloning completely.
- **Brand Assets & Food Photography:** All 28 food images and SVG brand marks are in [`public/images/`](./public/images/) and are tracked in Git.
- **Admin Configuration & Layout:** All UI components, settings, categories, and styles survive cloning.

### What is Stored Locally (Per Browser / Device):
- **Client-Side Menu Cache (`localStorage`):** The browser uses `localStorage` (`noon_cafe_menu_data_v1`) for zero-latency instant rendering. When you clone onto a new computer, the app initializes from [`data/menu-data.json`](./data/menu-data.json).
- **Admin Authentication Session:** The PIN authentication state (`noon_admin_auth`) is stored in the browser's `localStorage`. You will simply enter the PIN (`noon123`) once when accessing `/admin` on the new computer.
- **User-Uploaded Photos:** Uploaded photos from the admin panel are saved to [`public/uploads/`](./public/uploads/) and served statically.

---

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS with custom Noon Cafe palette
- **Fonts:** `Plus Jakarta Sans` & `Amiri` / `Noto Sans Arabic`
- **Icons:** Lucide React
- **QR Engine:** `qrcode` npm library

# Aaradhya Fashion — Order Form Generator

A professional, offline-first client order form generator built for Aaradhya Fashion. Create, manage, and export client order forms as PDFs — works entirely in the browser with no backend required.

---

## Features

- **Client Management** — Add, edit, delete, and search clients with full contact details
- **Order Form Generator** — Auto-filled forms with client data, order details, quantity, rate, and totals
- **Custom Fields** — Add unlimited custom fields (text, number, dropdown, checkbox, multiline)
- **Digital Signature** — Smooth bezier-curve signature pad with speed-responsive ink width
- **PDF Export** — Professional PDF layout with business branding, signature, and terms
- **Terms & Conditions** — Editable terms that appear on every PDF automatically
- **Dark / Light Mode** — Full theme toggle
- **Offline First** — All data stored in browser localStorage, no internet needed
- **Backup & Restore** — Export/import JSON backup files

---

## Tech Stack

| Tool | Purpose |
|------|---------|
| React 18 | UI framework |
| Vite 5 | Build tool & dev server |
| lucide-react | Icons |
| localStorage | Data persistence |
| Canvas API | Signature drawing |

---

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Install & Run

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/aaradhya-fashion.git
cd aaradhya-fashion

# Install dependencies
npm install

# Start dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
```

Output is in the `dist/` folder. Deploy to Vercel, Netlify, or any static host.

### Deploy to Vercel (one click)

```bash
npm install -g vercel
vercel
```

---

## Project Structure

```
aaradhya-fashion/
├── public/
│   └── favicon.svg
├── src/
│   ├── App.jsx        # Main application (all components)
│   ├── main.jsx       # React entry point
│   └── index.css      # Base styles
├── index.html
├── package.json
├── vite.config.js
├── .gitignore
└── README.md
```

---

## Data Storage

All data is saved to `localStorage` under these keys:

| Key | Contents |
|-----|---------|
| `af2-clients` | Client list |
| `af2-forms` | Order forms |
| `af2-settings` | App settings & custom fields |
| `af2-n` | Form number counter |

Use **Settings → Backup** to export a `.json` file before clearing browser data.

---

## PDF Export

Click **Export PDF** inside any form to open the PDF viewer. Then:
- **Desktop** — Click `🖨️ Print / Save as PDF` → set destination to *Save as PDF*
- **Mobile (Chrome)** — Tap the print button → tap the PDF icon or share to Files

---

## License

MIT — free to use and modify for your business.

---

*Built for Krushnavi Laser & CNC · Aaradhya Fashion Studio*

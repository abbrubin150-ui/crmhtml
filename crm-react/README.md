# Enterprise CRM - Portable Offline React Version

A fully-featured, offline-first Customer Relationship Management (CRM) system built with React. All data is stored locally in the browser's localStorage, making it perfect for portable, offline use.

## Features

- **Dashboard** - Real-time metrics and business overview
- **Contact Management** - Comprehensive contact and project tracking
- **Meeting Scheduler** - Schedule and manage meetings
- **Task Management** - Track tasks and assignments
- **Document Management** - Store and organize documents
- **Calendar** - Visual calendar view of events
- **Team Management** - Manage team members
- **Reports & Analytics** - Performance metrics and analytics
- **Settings** - Customizable statuses and configurations

## Offline-First Design

- ✅ **100% Offline** - Works completely without internet connection (except for Font Awesome icons)
- ✅ **Local Storage** - All data stored in browser localStorage
- ✅ **No Backend Required** - Pure frontend application
- ✅ **Portable** - Can be run from any web server or locally
- ✅ **Fast** - No network delays, instant response

## Installation & Usage

### Option 1: Development Mode

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

The application will be available at `http://localhost:5173`

### Option 2: Production Build (Portable)

```bash
# Build for production
npm run build
```

The built files will be in the `dist` folder. You can:

1. **Serve locally:**
   ```bash
   npm run preview
   ```

2. **Deploy to any static host:**
   - Copy the `dist` folder to any web server
   - Serve with any static file server (nginx, Apache, etc.)

3. **Create a portable package:**
   - Zip the `dist` folder
   - Unzip on any computer
   - Serve with a simple HTTP server:
     ```bash
     # Python 3
     cd dist && python -m http.server 8000

     # Node.js (with http-server)
     npx http-server dist -p 8000
     ```

## Browser Compatibility

- ✅ Chrome/Edge (Latest)
- ✅ Firefox (Latest)
- ✅ Safari (Latest)
- ⚠️ Requires modern browser with localStorage support

## Data Persistence

All data is automatically saved to browser's localStorage:
- Contacts
- Meetings
- Tasks
- Documents
- Team members
- Custom statuses
- User settings

**Note:** Data is stored per browser/domain. To backup your data, you can use the browser's developer tools to export localStorage, or implement a backup feature in the application.

## Key Features

### Contact Management
- Add, edit, and delete contacts
- Advanced filtering (by type, status, owner, importance, date)
- Quick edit (click on any cell to edit)
- Export to CSV
- Create meetings and tasks directly from contacts

### Meeting Management
- Schedule meetings with date and time
- Link to contacts
- Track meeting status
- Autocomplete contact names
- Quick edit capabilities

### Task Management
- Set due dates and priorities
- Assign to team members
- Link to projects/contacts
- Track completion status
- Visual priority indicators

### Dashboard
- Active contacts count
- Open tasks counter
- Upcoming meetings (7-day view)
- Estimated revenue
- Overdue tasks list
- Contact status breakdown

### Settings
- Customize contact statuses
- Configure meeting statuses
- Set task statuses
- Define project types
- Manage locations
- Team member configuration

## Technology Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **LocalStorage** - Data persistence
- **CSS3** - Modern styling with gradients and animations
- **Font Awesome 6** - Icon library

## Project Structure

```
crm-react/
├── src/
│   ├── components/        # React components
│   │   ├── Sidebar.jsx
│   │   ├── Topbar.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Contacts.jsx
│   │   ├── Meetings.jsx
│   │   ├── Tasks.jsx
│   │   ├── Documents.jsx
│   │   ├── Calendar.jsx
│   │   ├── Team.jsx
│   │   ├── Reports.jsx
│   │   ├── Settings.jsx
│   │   └── QuickModal.jsx
│   ├── hooks/            # Custom React hooks
│   │   └── useCRM.js
│   ├── services/         # Business logic
│   │   └── storage.js
│   ├── App.jsx           # Main app component
│   ├── App.css           # Styles
│   └── main.jsx          # Entry point
├── public/               # Static assets
├── dist/                 # Production build
└── package.json
```

## Development

```bash
# Install dependencies
npm install

# Start dev server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## Performance

- **Initial Load:** < 1 second
- **Bundle Size:** ~245 KB (gzipped: ~71 KB)
- **Storage:** Limited by browser localStorage (typically 5-10 MB)
- **Contacts:** Can handle thousands of records efficiently

## Security Notes

- All data is stored locally in browser
- No server-side processing
- Data is NOT encrypted in localStorage
- For sensitive data, consider:
  - Using HTTPS when hosting
  - Regular backups
  - Browser security best practices
  - Not using on shared computers

## Known Limitations

- localStorage size limits (browser dependent)
- Data not synced across devices/browsers
- No real-time collaboration
- Document management is placeholder (no actual file upload)
- Requires internet for Font Awesome icons (can be made fully offline by downloading Font Awesome)

## Troubleshooting

**Data not saving:**
- Check browser console for errors
- Verify localStorage is not disabled
- Check available storage space

**Application not loading:**
- Clear browser cache
- Check JavaScript is enabled
- Verify Font Awesome CDN is accessible

**Styles not appearing:**
- Check CSS file is loaded
- Verify Font Awesome icons load
- Clear browser cache

## License

This is a demonstration/educational project. Modify and use as needed.

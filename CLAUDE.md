# CLAUDE.md - AI Assistant Guide for Enterprise CRM Repository

**Last Updated**: 2025-11-30
**Repository**: Enterprise CRM System
**Purpose**: Guide AI assistants working on this codebase

---

## Table of Contents

1. [Repository Overview](#repository-overview)
2. [Codebase Architecture](#codebase-architecture)
3. [Technology Stack](#technology-stack)
4. [Development Workflows](#development-workflows)
5. [Key Conventions](#key-conventions)
6. [Data Models & Storage](#data-models--storage)
7. [Common Development Tasks](#common-development-tasks)
8. [Testing & Debugging](#testing--debugging)
9. [Important Constraints](#important-constraints)
10. [File Reference Guide](#file-reference-guide)

---

## Repository Overview

This repository contains **two distinct implementations** of an Enterprise CRM system:

### Vanilla HTML/CSS/JavaScript Version
- **Location**: Root directory (`index.html`, `js/app.js`, `css/styles.css`)
- **Type**: Single-page application with no build process
- **Size**: ~1,850 lines of code
- **Target**: Direct browser execution, maximum portability
- **Status**: Primary implementation, fully functional

### React Version
- **Location**: `/crm-react/` directory
- **Type**: Modern React SPA with Vite build system
- **Size**: ~1,200+ lines across 12+ components
- **Target**: Development with HMR, optimized production builds
- **Status**: Modern implementation, feature-complete

**Both versions**:
- Share identical feature sets and data structures
- Use browser `localStorage` as the single source of truth
- Are completely offline-capable (no backend required)
- Support the same CRM features: Contacts, Meetings, Tasks, Calendar, Team, Reports, Settings

---

## Codebase Architecture

### Directory Structure

```
crmhtml/
├── README.md                    # Hebrew documentation
├── CLAUDE.md                    # This file - AI assistant guide
├── index.html                   # Vanilla version entry point
├── crm.html                     # Deprecated original file (DO NOT USE)
├── css/
│   └── styles.css              # Unified styling for vanilla version
├── js/
│   └── app.js                  # Main vanilla JS application (1,689 lines)
└── crm-react/                  # React implementation root
    ├── package.json            # Dependencies & scripts
    ├── vite.config.js          # Build configuration
    ├── eslint.config.js        # Linting rules
    ├── index.html              # React entry point
    ├── public/                 # Static assets
    └── src/
        ├── main.jsx            # React bootstrap
        ├── App.jsx             # Root component
        ├── App.css             # App-level styles
        ├── index.css           # Global styles
        ├── components/         # 12 feature components
        │   ├── Sidebar.jsx
        │   ├── Topbar.jsx
        │   ├── Dashboard.jsx
        │   ├── Contacts.jsx
        │   ├── Meetings.jsx
        │   ├── Tasks.jsx
        │   ├── Documents.jsx
        │   ├── Calendar.jsx
        │   ├── Team.jsx
        │   ├── Reports.jsx
        │   ├── Settings.jsx
        │   └── QuickModal.jsx
        ├── hooks/
        │   └── useCRM.js       # Main state management hook
        └── services/
            └── storage.js      # localStorage abstraction
```

### Component Responsibility Map (React Version)

| Component | Responsibility | Key Features |
|-----------|---------------|--------------|
| **App.jsx** | Root orchestration, state distribution | Tab routing, modal state, data flow coordination |
| **Sidebar.jsx** | Navigation menu | Tab switching, collapsible menu |
| **Topbar.jsx** | Header UI | User info, help modal, notifications |
| **Dashboard.jsx** | KPI metrics & summaries | Real-time calculations, 7-day forecast |
| **Contacts.jsx** | Contact CRUD & filtering | Advanced search, inline editing, bulk operations |
| **Meetings.jsx** | Meeting scheduling | Date/time picker, status tracking |
| **Tasks.jsx** | Task management | Priority levels, due dates, assignment |
| **Documents.jsx** | Document list (placeholder) | Display only, no actual file handling |
| **Calendar.jsx** | Monthly calendar view | Event display, navigation |
| **Team.jsx** | Team member display | Card grid layout, contact info |
| **Reports.jsx** | Analytics & reporting | Team activity aggregation, metrics |
| **Settings.jsx** | System configuration | Customizable statuses, project types |
| **QuickModal.jsx** | Bulk operations | Create multiple meetings/tasks |

### State Management Patterns

#### React Version: `useCRM` Hook Pattern
```javascript
// Location: crm-react/src/hooks/useCRM.js

const {
  contacts, meetings, tasks, documents, team, statuses, users, settings,
  addContact, updateContact, deleteContact,
  addMeeting, updateMeeting, deleteMeeting,
  addTask, updateTask, deleteTask,
  updateSettings, updateStatuses
} = useCRM();
```

**Key Characteristics**:
- Single source of truth via `useState` hook
- Automatic localStorage sync via `useEffect`
- Immutable state updates using spread operator
- No external state library (Redux/Context not used)

#### Vanilla Version: Global State Object
```javascript
// Location: js/app.js

let state = {
  contacts: [],
  meetings: [],
  tasks: [],
  documents: [],
  team: [],
  statuses: null,
  users: [],
  settings: {},
  currentUser: null,
  filters: {}
};
```

**Key Characteristics**:
- Direct state mutations (in-place updates)
- Manual `saveAll()` and `refreshAll()` calls
- Event-driven updates via DOM listeners
- Manual localStorage management

---

## Technology Stack

### Vanilla Version
- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **Icons**: Font Awesome 7.0.1 (CDN)
- **Storage**: Browser localStorage
- **Dependencies**: Zero npm dependencies
- **Build**: None required

### React Version
- **Framework**: React 19.2.0
- **Build Tool**: Vite 7.2.4
- **Dev Server**: Vite with HMR
- **Linting**: ESLint 9.39.1
- **Icons**: Font Awesome 6+ (CDN)
- **Storage**: Browser localStorage
- **Bundle Size**: ~71 KB gzipped

### Shared Technologies
- **Data Persistence**: localStorage API (5-10 MB limit)
- **Date Handling**: Native JavaScript Date API
- **Validation**: Custom regex and utility functions
- **Browser Support**: Modern browsers (Chrome, Firefox, Safari, Edge)

---

## Development Workflows

### Working with the Vanilla Version

#### Setup
```bash
# No setup required - just open in browser
open index.html
# Or serve with any static server
python -m http.server 8000
```

#### Making Changes
1. **Read before modifying**: Always read `js/app.js` before making changes
2. **Locate the function**: Search for function names (e.g., `addContactFromForm`, `renderContacts`)
3. **Edit carefully**: The file is 1,689 lines - use precise `Edit` tool operations
4. **Test in browser**: Refresh the page to see changes
5. **Check console**: Open DevTools to verify no JavaScript errors

#### Common Modifications
- **Add a field**: Update form HTML, data model, save/load functions, and render function
- **Change styling**: Edit `css/styles.css`
- **Add validation**: Add logic to `addContactFromForm` or similar functions
- **Fix bugs**: Check console errors, use browser debugger

### Working with the React Version

#### Setup
```bash
cd crm-react
npm install           # Install dependencies
npm run dev           # Start dev server (http://localhost:5173)
```

#### Making Changes
1. **Identify the component**: Map feature to component (see table above)
2. **Read the component**: Use `Read` tool on relevant `.jsx` file
3. **Check dependencies**: If modifying state, check `useCRM.js`
4. **Edit component**: Use `Edit` tool for surgical changes
5. **Verify in browser**: HMR will auto-reload changes
6. **Check console**: Look for React warnings or errors

#### Building for Production
```bash
cd crm-react
npm run build         # Creates dist/ directory
npm run preview       # Preview production build locally
```

#### Linting
```bash
cd crm-react
npm run lint          # Check code quality
```

### Git Workflow

**CRITICAL**: Always work on feature branches with `claude/` prefix

```bash
# Current branch (from context)
git branch
# claude/claude-md-milg5839ic0q7tjl-013TJMCHc6rC4GdtUUPmAUb6

# Making commits
git add .
git commit -m "$(cat <<'EOF'
Brief summary of changes

More detailed explanation if needed
EOF
)"

# Pushing changes (use -u for new branches)
git push -u origin claude/claude-md-milg5839ic0q7tjl-013TJMCHc6rC4GdtUUPmAUb6

# NEVER push to main/master directly
# NEVER use --force unless explicitly requested
```

**Git Retry Logic**: If network failures occur during push/fetch, retry up to 4 times with exponential backoff (2s, 4s, 8s, 16s)

### Creating Pull Requests

Use `gh` CLI:
```bash
# After committing and pushing
gh pr create --title "Feature: Add new field to contacts" --body "$(cat <<'EOF'
## Summary
- Added company_size field to contact model
- Updated contact form and display table
- Added migration for existing contacts

## Test plan
- [ ] Test contact creation with new field
- [ ] Verify existing contacts still load
- [ ] Check localStorage persistence
- [ ] Test filtering by company size
EOF
)"
```

---

## Key Conventions

### Coding Style

#### JavaScript Conventions
- **Variables**: camelCase (`contactList`, `currentUser`)
- **Constants**: UPPER_SNAKE_CASE (`LS_KEYS`, `DEFAULT_STATUSES`)
- **Functions**: camelCase verbs (`addContact`, `renderMeetings`, `deleteTask`)
- **IDs**: Generate using `uid()` function (timestamp + random)
- **Dates**: Store as `YYYY-MM-DD` strings, format using `fmtDate()`
- **Validation**: Use helper functions (`validateEmail()`, required field checks)

#### React Conventions
- **Components**: PascalCase (`Dashboard.jsx`, `Contacts.jsx`)
- **Hooks**: Use prefix `use` (`useCRM`, `useState`, `useEffect`)
- **Props**: Destructure in function parameters
- **State**: Use functional updates when depending on previous state
- **Events**: Use `handleX` naming (`handleSubmit`, `handleDelete`)
- **Memoization**: Use `useMemo` for expensive calculations only

#### CSS Conventions
- **Classes**: kebab-case (`.contact-card`, `.btn-primary`)
- **CSS Variables**: Use for theming (`--primary-color`, `--bg-color`)
- **Layout**: Use CSS Grid for main layout, Flexbox for components
- **Responsive**: Mobile-first approach with `@media` queries

### Data Conventions

#### localStorage Keys
```javascript
LS_KEYS = {
  contacts: 'crm_enterprise_contacts',
  meetings: 'crm_enterprise_meetings',
  tasks: 'crm_enterprise_tasks',
  documents: 'crm_enterprise_documents',
  team: 'crm_enterprise_team',
  statuses: 'crm_enterprise_statuses',
  users: 'crm_enterprise_users',
  settings: 'crm_enterprise_settings'
}
```

**NEVER change these keys** - it will break existing user data!

#### ID Generation
```javascript
// Vanilla version
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2);

// Always use this pattern for new records
const newContact = {
  id: uid(),
  created_at: new Date().toISOString(),
  // ... other fields
};
```

#### Date Handling
```javascript
// Standard date format: YYYY-MM-DD
const todayStr = () => new Date().toISOString().split('T')[0];

// Display format: MM/DD/YYYY
const fmtDate = (dateStr) => {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${m}/${d}/${y}`;
};
```

### Error Handling

#### Vanilla Version
```javascript
// localStorage operations should use try-catch
function saveContacts() {
  try {
    localStorage.setItem(LS_KEYS.contacts, JSON.stringify(state.contacts));
  } catch (err) {
    console.error('Failed to save contacts', err);
    alert('Failed to save data. localStorage may be full.');
  }
}
```

#### React Version
```javascript
// Use try-catch in storage service
export const saveData = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (err) {
    console.error(`Failed to save ${key}:`, err);
    return false;
  }
};
```

### Form Validation Patterns

```javascript
// Always validate required fields
if (!name.trim()) {
  showError('name', 'Name is required');
  return;
}

// Email validation
const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Date validation
if (!dueDate) {
  showError('due', 'Due date is required');
  return;
}
```

---

## Data Models & Storage

### Contact Model
```javascript
{
  id: string,              // uid() generated
  created_at: string,      // ISO8601 timestamp
  name: string,            // REQUIRED
  phone: string,
  email: string,           // Validated format
  project_type: string,    // From settings.project_types
  stage: string,
  project_id: string,
  location: string,        // From settings.locations
  contact_person: string,
  next_meeting: string,    // YYYY-MM-DD
  owner: string,           // Team member name
  source: string,
  status: string,          // From statuses.contact
  important: boolean,
  notes: string
}
```

### Meeting Model
```javascript
{
  id: string,              // uid() generated
  date: string,            // YYYY-MM-DD (REQUIRED)
  time: string,            // HH:MM
  contact_name: string,    // REQUIRED
  phone: string,
  email: string,
  subject: string,
  location: string,
  owner: string,
  status: string,          // From statuses.meeting
  notes: string
}
```

### Task Model
```javascript
{
  id: string,              // uid() generated
  due: string,             // YYYY-MM-DD (REQUIRED)
  contact_name: string,
  task: string,            // REQUIRED
  owner: string,
  priority: string,        // "High" | "Medium" | "Low"
  status: string,          // From statuses.task
  project_id: string,
  notes: string
}
```

### Status Configuration
```javascript
DEFAULT_STATUSES = {
  contact: ["New", "In Progress", "Waiting for Contact", "Closed"],
  meeting: ["Scheduled", "Completed", "Cancelled", "No Show"],
  task: ["Open", "In Progress", "Completed", "On Hold"],
  project_types: ["Consulting", "Sales", "Support", "Implementation", "Marketing", "Development"],
  locations: ["New York", "London", "Remote", "On-site", "Chicago", "Los Angeles"],
  team: []  // Populated from team members
}
```

**Customization**: Users can modify these via Settings tab. Changes persist in localStorage.

### localStorage Schema

```javascript
// Key-value pairs in localStorage
localStorage.setItem('crm_enterprise_contacts', JSON.stringify([...]));
localStorage.setItem('crm_enterprise_meetings', JSON.stringify([...]));
localStorage.setItem('crm_enterprise_tasks', JSON.stringify([...]));
localStorage.setItem('crm_enterprise_statuses', JSON.stringify({...}));
localStorage.setItem('crm_enterprise_users', JSON.stringify([...]));
localStorage.setItem('crm_enterprise_settings', JSON.stringify({...}));
```

**Size Limits**: localStorage is typically limited to 5-10 MB. With this schema, can store ~500-1000 contacts/meetings/tasks before hitting limits.

---

## Common Development Tasks

### Task 1: Add a New Field to Contact Model

#### Vanilla Version Steps:
1. **Update form HTML** in `index.html`:
   ```html
   <input type="text" id="contact-company-size" placeholder="Company Size">
   ```

2. **Update `addContactFromForm()` in `js/app.js`**:
   ```javascript
   const companySizeInput = document.getElementById('contact-company-size');
   const newContact = {
     // ... existing fields
     company_size: companySizeInput.value.trim()
   };
   ```

3. **Update `renderContacts()` to display new field**:
   ```javascript
   <td>${c.company_size || ''}</td>
   ```

4. **Update table header**:
   ```html
   <th>Company Size</th>
   ```

#### React Version Steps:
1. **Update form state in `Contacts.jsx`**:
   ```javascript
   const [formData, setFormData] = useState({
     // ... existing fields
     company_size: ''
   });
   ```

2. **Add input field**:
   ```jsx
   <input
     type="text"
     value={formData.company_size}
     onChange={(e) => setFormData({...formData, company_size: e.target.value})}
     placeholder="Company Size"
   />
   ```

3. **Update table display**:
   ```jsx
   <td>{contact.company_size || ''}</td>
   ```

**Testing**: Verify data persists after page refresh.

### Task 2: Add a New Status Option

#### Both Versions:
1. Navigate to Settings tab
2. Find the appropriate status type (contact/meeting/task)
3. Add new status to comma-separated list
4. Click "Save Settings"
5. Verify new status appears in dropdowns

**Programmatic approach** (if needed):
```javascript
// Vanilla version
state.statuses.contact.push('New Custom Status');
saveStatuses();

// React version
updateStatuses({
  ...statuses,
  contact: [...statuses.contact, 'New Custom Status']
});
```

### Task 3: Implement a New Filter

#### React Version Example:
```javascript
// In Contacts.jsx
const [filters, setFilters] = useState({
  search: '',
  type: '',
  status: '',
  owner: '',
  important: false,
  // Add new filter
  company_size: ''
});

// Update filter logic
const filtered = useMemo(() => {
  return contacts.filter(c => {
    // ... existing filters
    if (filters.company_size && c.company_size !== filters.company_size) return false;
    return true;
  });
}, [contacts, filters]);

// Add filter UI
<select
  value={filters.company_size}
  onChange={(e) => setFilters({...filters, company_size: e.target.value})}
>
  <option value="">All Sizes</option>
  <option value="Small">Small</option>
  <option value="Medium">Medium</option>
  <option value="Large">Large</option>
</select>
```

### Task 4: Fix a Bug in Date Handling

#### Common Issues:
- **Timezone differences**: Always use `YYYY-MM-DD` format without time
- **Invalid dates**: Check for empty strings before parsing
- **Display format**: Use `fmtDate()` for consistent display

#### Example Fix:
```javascript
// Before (buggy)
const dueDate = new Date(task.due);

// After (correct)
const dueDate = task.due ? new Date(task.due + 'T00:00:00') : null;

// Or use startOfDay utility
const startOfDay = (dateStr) => new Date(dateStr + 'T00:00:00');
```

### Task 5: Add Validation to a Form

#### Pattern:
```javascript
// Vanilla version
function addContactFromForm() {
  const nameInput = document.getElementById('contact-name');
  const emailInput = document.getElementById('contact-email');

  // Clear previous errors
  clearAllErrors();

  // Validate required fields
  if (!nameInput.value.trim()) {
    showError('contact-name', 'Name is required');
    return;
  }

  // Validate email format
  if (emailInput.value && !validateEmail(emailInput.value)) {
    showError('contact-email', 'Invalid email format');
    return;
  }

  // Proceed with save
  // ...
}

function showError(inputId, message) {
  const input = document.getElementById(inputId);
  input.classList.add('error');
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message';
  errorDiv.textContent = message;
  input.parentElement.appendChild(errorDiv);
}
```

### Task 6: Add a New Component (React Only)

1. **Create component file**: `crm-react/src/components/NewFeature.jsx`
2. **Import in App.jsx**:
   ```javascript
   import NewFeature from './components/NewFeature';
   ```
3. **Add to tab routing**:
   ```javascript
   {currentTab === 'newfeature' && <NewFeature {...crmProps} />}
   ```
4. **Add to sidebar**: Update `Sidebar.jsx` with new tab option
5. **Pass required props**: Ensure state and functions are passed from `useCRM`

---

## Testing & Debugging

### Browser Testing

#### Vanilla Version:
1. Open `index.html` in browser
2. Open DevTools Console (F12)
3. Check for JavaScript errors
4. Inspect localStorage: `Application > Storage > Local Storage`
5. Test all CRUD operations
6. Verify data persists after refresh

#### React Version:
1. Start dev server: `npm run dev`
2. Open http://localhost:5173
3. Check browser console for errors/warnings
4. Use React DevTools extension for component inspection
5. Test HMR by making changes and verifying auto-reload
6. Verify localStorage persistence

### Common Debugging Techniques

#### Check localStorage Data:
```javascript
// In browser console
console.log(JSON.parse(localStorage.getItem('crm_enterprise_contacts')));
console.log(JSON.parse(localStorage.getItem('crm_enterprise_meetings')));
console.log(JSON.parse(localStorage.getItem('crm_enterprise_tasks')));
```

#### Clear localStorage:
```javascript
// Reset all data (use with caution!)
localStorage.clear();
// Or clear specific key
localStorage.removeItem('crm_enterprise_contacts');
```

#### React Component Debugging:
```javascript
// Add console.log in component
useEffect(() => {
  console.log('Contacts updated:', contacts);
}, [contacts]);

// Check useCRM hook state
console.log('CRM State:', {contacts, meetings, tasks});
```

### Error Scenarios

| Error | Likely Cause | Solution |
|-------|--------------|----------|
| "Cannot read property 'map' of undefined" | State not initialized | Check initial state in `useCRM` or `loadAll()` |
| "localStorage is full" | Exceeded 5-10 MB limit | Implement data cleanup or migration |
| "Invalid date" | Date format mismatch | Use `YYYY-MM-DD` format consistently |
| "Cannot find element with ID..." | DOM not loaded yet | Ensure code runs after DOMContentLoaded |
| Infinite re-render (React) | Missing dependency in useEffect | Add all dependencies to dependency array |
| Filter not working | State not updating | Check setState call, verify filter logic |

---

## Important Constraints

### Technical Limitations

1. **localStorage Size**: 5-10 MB limit (browser-dependent)
   - Can store ~500-1000 records comfortably
   - No automatic cleanup - manual data management needed

2. **No Backend**:
   - All data is local to browser
   - No synchronization across devices
   - Data lost if localStorage cleared
   - No server-side validation or business logic

3. **No Authentication**:
   - User/role system is cosmetic only
   - No actual access control
   - Anyone with browser access can view/modify data

4. **Single User**:
   - No real-time collaboration
   - No conflict resolution
   - No audit logging of who changed what

5. **Browser Compatibility**:
   - Requires modern browser (ES6+, localStorage, CSS Grid)
   - No IE11 support
   - May need polyfills for older browsers

### Business Logic Constraints

1. **Revenue Calculation**: Hardcoded as `contacts.length * 2500`
   - Not configurable
   - No per-contact revenue tracking

2. **Documents**: Placeholder implementation only
   - No actual file upload/storage
   - Display-only UI

3. **Team Management**: Static display
   - No CRUD operations for team members
   - Default team hardcoded

4. **Relationships**:
   - No enforced foreign keys
   - Contact names are strings, not references
   - Deleting a contact doesn't cascade to meetings/tasks

5. **Validation**: Basic only
   - Email regex validation
   - Required field checks
   - No complex business rules

### Development Constraints

1. **No TypeScript**:
   - Both versions use plain JavaScript
   - No type checking at compile time
   - Use JSDoc comments for documentation

2. **No Testing Framework**:
   - No unit tests
   - No integration tests
   - Manual testing only

3. **No CI/CD**:
   - Manual build and deployment
   - No automated checks

4. **Styling**:
   - No CSS preprocessor (SASS/Less)
   - Plain CSS only
   - Limited CSS variable usage

### Security Constraints

1. **No Encryption**: Data stored in plain text in localStorage
2. **No XSS Protection**: Vanilla version uses `innerHTML` - potential risk
3. **No CSRF Protection**: Not applicable (no backend)
4. **No Input Sanitization**: Basic validation only
5. **No Rate Limiting**: Not applicable (client-side only)

---

## File Reference Guide

### Critical Files to Read Before Modifying

#### Vanilla Version:
- **js/app.js** (1,689 lines) - Core application logic
  - Read before: Adding features, fixing bugs, understanding data flow
  - Key sections: State management (lines 1-50), CRUD operations (lines 100-800), Event handlers (lines 1400+)

- **css/styles.css** (163 lines) - All styling
  - Read before: Changing layout, colors, responsive design

- **index.html** - Application structure
  - Read before: Adding UI elements, changing layout structure

#### React Version:
- **src/hooks/useCRM.js** - State management
  - Read before: Modifying data operations, adding new data types

- **src/services/storage.js** - localStorage abstraction
  - Read before: Changing persistence logic

- **src/App.jsx** - Root component
  - Read before: Adding new tabs, changing global state

- **src/components/[Feature].jsx** - Individual features
  - Read before: Modifying specific functionality

- **package.json** - Dependencies and scripts
  - Read before: Adding libraries, changing build process

### Configuration Files

| File | Purpose | Modify When |
|------|---------|-------------|
| `crm-react/vite.config.js` | Vite build settings | Need custom build behavior, aliases, plugins |
| `crm-react/eslint.config.js` | Linting rules | Need to add/change code quality rules |
| `crm-react/package.json` | Dependencies & scripts | Adding npm packages, changing scripts |
| `.gitignore` | Git ignore patterns | Excluding new files from version control |

### Deprecated Files

- **crm.html** - Original monolithic file, DO NOT USE
  - Replaced by `index.html` and modular structure
  - Kept for reference only

---

## Best Practices for AI Assistants

### Before Making Changes

1. **Read First**: Always read files before modifying
   - Use `Read` tool on target file
   - Understand context and existing patterns
   - Check for dependencies

2. **Identify Version**: Confirm which version you're working on
   - Vanilla (root directory) or React (crm-react/)
   - Don't mix patterns between versions

3. **Check localStorage Keys**: Never change `LS_KEYS` constants
   - Breaking change for existing users
   - Data migration required if changing keys

4. **Test Data Impact**: Consider existing user data
   - Adding fields: Use default values or null
   - Removing fields: Consider backward compatibility
   - Changing types: Migrate existing data

### When Making Changes

1. **Use Precise Edits**: Use `Edit` tool for surgical changes
   - Don't rewrite entire files unless necessary
   - Preserve existing indentation and style
   - Match existing code patterns

2. **Maintain Consistency**: Follow existing conventions
   - Naming patterns (camelCase, PascalCase)
   - Code structure and organization
   - Comment style and documentation

3. **Validate Changes**: Think through edge cases
   - Empty states (no data)
   - Invalid inputs
   - localStorage failures
   - Browser compatibility

4. **Update Documentation**: Keep CLAUDE.md current
   - Document new patterns
   - Update data models if changed
   - Add new common tasks

### After Making Changes

1. **Test Thoroughly**: Verify in browser
   - CRUD operations work
   - Data persists after refresh
   - No console errors
   - Responsive design intact

2. **Check localStorage**: Inspect data format
   - JSON is valid
   - Schema matches expectations
   - No data corruption

3. **Commit Properly**: Use clear commit messages
   - Describe what and why
   - Reference issue numbers if applicable
   - Follow git workflow conventions

4. **Document Changes**: Update relevant files
   - README.md if user-facing changes
   - CLAUDE.md if AI assistant workflow changes
   - Add code comments for complex logic

---

## Quick Command Reference

### React Development
```bash
cd crm-react
npm install                    # Install dependencies
npm run dev                    # Start dev server
npm run build                  # Production build
npm run preview                # Preview production build
npm run lint                   # Lint code
```

### Git Operations
```bash
git status                     # Check current state
git add .                      # Stage changes
git commit -m "message"        # Commit with message
git push -u origin <branch>    # Push to remote
gh pr create                   # Create pull request
```

### Browser Console Debugging
```javascript
// Inspect localStorage
Object.keys(localStorage).filter(k => k.startsWith('crm_'))

// Load contacts
JSON.parse(localStorage.getItem('crm_enterprise_contacts'))

// Clear all CRM data
Object.keys(localStorage)
  .filter(k => k.startsWith('crm_'))
  .forEach(k => localStorage.removeItem(k))
```

---

## Support & Resources

### Documentation
- **README.md**: User-facing documentation (Hebrew)
- **CLAUDE.md**: This file - AI assistant guide
- **Code Comments**: Inline documentation in source files

### External Resources
- React Docs: https://react.dev
- Vite Docs: https://vitejs.dev
- MDN localStorage: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
- Font Awesome: https://fontawesome.com

### Repository
- **Issues**: Report via GitHub Issues
- **PRs**: Follow git workflow above
- **Discussions**: Use PR comments for technical discussions

---

## Changelog

| Date | Change | Author |
|------|--------|--------|
| 2025-11-30 | Initial CLAUDE.md creation | AI Assistant |

---

**End of CLAUDE.md**

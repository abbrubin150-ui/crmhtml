    // --- Local Storage and Data Structures ---
    const LS_KEYS = {
      contacts: 'crm_enterprise_contacts',
      meetings: 'crm_enterprise_meetings',
      tasks: 'crm_enterprise_tasks',
      documents: 'crm_enterprise_documents',
      team: 'crm_enterprise_team',
      statuses: 'crm_enterprise_statuses',
      users: 'crm_enterprise_users',
      settings: 'crm_enterprise_settings',
      notifications: 'crm_enterprise_notifications'
    };

    const DEFAULT_STATUSES = {
      contact: ["New","In Progress","Waiting for Contact","Closed"],
      meeting: ["Scheduled","Completed","Cancelled","No Show"],
      task: ["Open","In Progress","Completed","On Hold"],
      project_types: ["Consulting", "Sales", "Support", "Implementation", "Marketing", "Development"],
      locations: ["New York", "London", "Remote", "On-site", "Chicago", "Los Angeles"],
      team: []
    };

    // --- User Belonging System Constants ---
    const USER_ROLES = {
      ADMIN: 'admin',
      REGIONAL_MANAGER: 'regional_manager',
      TEAM_LEAD: 'team_lead',
      SALES_REP: 'sales_rep',
      CONSULTANT: 'consultant',
      PROJECT_MANAGER: 'project_manager'
    };

    const VIEW_MODES = {
      MY_DATA: 'my_data',
      TEAM_DATA: 'team_data',
      REGIONAL_DATA: 'regional_data',
      PROJECT_TYPE_DATA: 'project_type_data',
      ALL_DATA: 'all_data'
    };

    const VIEW_MODE_LABELS = {
      my_data: 'My Work',
      team_data: 'My Team',
      regional_data: 'My Region',
      project_type_data: 'My Projects',
      all_data: 'All Data'
    };

    // Default permissions by role
    function getDefaultPermissions(role) {
      switch(role) {
        case USER_ROLES.ADMIN:
          return {
            contacts: { view: true, create: true, edit: true, delete: true },
            meetings: { view: true, create: true, edit: true, delete: true },
            tasks: { view: true, create: true, edit: true, delete: true },
            reports: { view: true, export: true },
            settings: { view: true, edit: true }
          };
        case USER_ROLES.REGIONAL_MANAGER:
          return {
            contacts: { view: true, create: true, edit: true, delete: true },
            meetings: { view: true, create: true, edit: true, delete: true },
            tasks: { view: true, create: true, edit: true, delete: true },
            reports: { view: true, export: true },
            settings: { view: true, edit: false }
          };
        case USER_ROLES.TEAM_LEAD:
          return {
            contacts: { view: true, create: true, edit: true, delete: true },
            meetings: { view: true, create: true, edit: true, delete: true },
            tasks: { view: true, create: true, edit: true, delete: true },
            reports: { view: true, export: true },
            settings: { view: true, edit: false }
          };
        case USER_ROLES.SALES_REP:
          return {
            contacts: { view: true, create: true, edit: true, delete: true },
            meetings: { view: true, create: true, edit: true, delete: true },
            tasks: { view: true, create: true, edit: true, delete: true },
            reports: { view: true, export: true },
            settings: { view: true, edit: false }
          };
        case USER_ROLES.CONSULTANT:
        case USER_ROLES.PROJECT_MANAGER:
          return {
            contacts: { view: true, create: true, edit: true, delete: false },
            meetings: { view: true, create: true, edit: true, delete: false },
            tasks: { view: true, create: true, edit: true, delete: false },
            reports: { view: true, export: false },
            settings: { view: true, edit: false }
          };
        default:
          return {
            contacts: { view: true, create: true, edit: false, delete: false },
            meetings: { view: true, create: true, edit: false, delete: false },
            tasks: { view: true, create: true, edit: false, delete: false },
            reports: { view: true, export: false },
            settings: { view: false, edit: false }
          };
      }
    }

    // Default view mode by role
    function getDefaultViewMode(role) {
      switch(role) {
        case USER_ROLES.ADMIN:
          return VIEW_MODES.ALL_DATA;
        case USER_ROLES.REGIONAL_MANAGER:
          return VIEW_MODES.REGIONAL_DATA;
        case USER_ROLES.TEAM_LEAD:
          return VIEW_MODES.TEAM_DATA;
        case USER_ROLES.PROJECT_MANAGER:
          return VIEW_MODES.PROJECT_TYPE_DATA;
        default:
          return VIEW_MODES.MY_DATA;
      }
    }

    // Default dashboard config
    function getDefaultDashboardConfig(role) {
      return {
        show_kpis: ['all'],
        show_charts: true,
        default_date_range: '7days'
      };
    }

    // Migrate existing users to V2 (with belonging system)
    function migrateUsersToV2() {
      let migrated = false;
      state.users = state.users.map(user => {
        if (!user.view_mode) {
          migrated = true;
          return {
            ...user,
            view_mode: user.role === 'admin' ? VIEW_MODES.ALL_DATA : VIEW_MODES.MY_DATA,
            filter_preset: {
              owner: [user.name],
              project_types: [],
              locations: [],
              teams: []
            },
            permissions: getDefaultPermissions(user.role || 'consultant'),
            dashboard_config: getDefaultDashboardConfig(user.role || 'consultant')
          };
        }
        return user;
      });

      if (migrated) {
        console.log('Users migrated to V2 with belonging system');
        localStorage.setItem(LS_KEYS.users, JSON.stringify(state.users));
      }
    }

    // Core filtering function - applies user's "world view"
    function getFilteredData(dataArray, currentUser) {
      if (!dataArray || dataArray.length === 0) return [];
      if (!currentUser) return dataArray;

      // Admin with all_data mode sees everything
      if (currentUser.role === 'admin' && currentUser.view_mode === VIEW_MODES.ALL_DATA) {
        return dataArray;
      }

      let filtered = dataArray;

      switch(currentUser.view_mode) {
        case VIEW_MODES.MY_DATA:
          // Only records owned by or assigned to the user
          filtered = filtered.filter(item =>
            item.owner === currentUser.name ||
            (item.assigned_users && item.assigned_users.includes(currentUser.id))
          );
          break;

        case VIEW_MODES.TEAM_DATA:
          // Records of the team members
          if (currentUser.filter_preset && currentUser.filter_preset.owner.length > 0) {
            filtered = filtered.filter(item =>
              currentUser.filter_preset.owner.includes(item.owner) ||
              item.team_name === currentUser.team_name
            );
          } else {
            // Fallback to own data if no team configured
            filtered = filtered.filter(item => item.owner === currentUser.name);
          }
          break;

        case VIEW_MODES.REGIONAL_DATA:
          // All records in the user's region
          if (currentUser.filter_preset && currentUser.filter_preset.locations.length > 0) {
            filtered = filtered.filter(item =>
              currentUser.filter_preset.locations.includes(item.location) ||
              currentUser.filter_preset.locations.includes(item.region)
            );
          } else {
            // Fallback to own data if no region configured
            filtered = filtered.filter(item => item.owner === currentUser.name);
          }
          break;

        case VIEW_MODES.PROJECT_TYPE_DATA:
          // Records by project type
          if (currentUser.filter_preset && currentUser.filter_preset.project_types.length > 0) {
            filtered = filtered.filter(item =>
              currentUser.filter_preset.project_types.includes(item.project_type)
            );
          } else {
            // Fallback to own data if no project types configured
            filtered = filtered.filter(item => item.owner === currentUser.name);
          }
          break;

        case VIEW_MODES.ALL_DATA:
          // No filtering - user sees everything
          break;
      }

      return filtered;
    }

    // Get scope label for UI display
    function getScopeLabel(user) {
      if (!user || !user.view_mode) return 'All';
      return VIEW_MODE_LABELS[user.view_mode] || 'All';
    }

    // Check if user can switch to a specific view mode
    function canSwitchView(user, newMode) {
      if (!user) return false;

      // Admin can switch to any view
      if (user.role === 'admin') return true;

      // Regional managers can switch between regional, team, and my data
      if (user.role === 'regional_manager') {
        return [VIEW_MODES.REGIONAL_DATA, VIEW_MODES.TEAM_DATA, VIEW_MODES.MY_DATA].includes(newMode);
      }

      // Team leads can switch between team and my data
      if (user.role === 'team_lead') {
        return [VIEW_MODES.TEAM_DATA, VIEW_MODES.MY_DATA].includes(newMode);
      }

      // Project managers can switch between project type and my data
      if (user.role === 'project_manager') {
        return [VIEW_MODES.PROJECT_TYPE_DATA, VIEW_MODES.MY_DATA].includes(newMode);
      }

      // Everyone else can only see their own data
      return newMode === VIEW_MODES.MY_DATA;
    }

    // Switch view mode
    function switchViewMode(newMode) {
      if (!state.currentUser) return;

      if (!canSwitchView(state.currentUser, newMode)) {
        alert('You do not have permission to access this view');
        return;
      }

      state.currentUser.view_mode = newMode;
      localStorage.setItem(LS_KEYS.users, JSON.stringify(state.users));

      // Refresh all displays
      refreshAll();

      // Show toast notification
      showToast('Switched to ' + VIEW_MODE_LABELS[newMode]);
    }

    // Simple toast notification
    function showToast(message) {
      const toast = document.createElement('div');
      toast.className = 'toast-notification';
      toast.textContent = message;
      toast.style.cssText = 'position: fixed; bottom: 20px; right: 20px; background: #333; color: white; padding: 12px 20px; border-radius: 8px; z-index: 9999; animation: fadeInOut 2s;';
      document.body.appendChild(toast);

      setTimeout(() => {
        toast.remove();
      }, 2000);
    }

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
      filters: {},
      notifications: [],
      notificationDismissals: {}
    };

    // Initial load from localStorage
    function loadAll(){
      try{ 
        const contactsData = localStorage.getItem(LS_KEYS.contacts);
        state.contacts = contactsData ? JSON.parse(contactsData) : [];
      }catch(e){ 
        console.error('Error loading contacts:', e);
        state.contacts = [];
      }
      try{ 
        const meetingsData = localStorage.getItem(LS_KEYS.meetings);
        state.meetings = meetingsData ? JSON.parse(meetingsData) : [];
      }catch(e){ 
        console.error('Error loading meetings:', e);
        state.meetings = [];
      }
      try{ 
        const tasksData = localStorage.getItem(LS_KEYS.tasks);
        state.tasks = tasksData ? JSON.parse(tasksData) : [];
      }catch(e){ 
        console.error('Error loading tasks:', e);
        state.tasks = [];
      }
      try{
        const documentsData = localStorage.getItem(LS_KEYS.documents);
        state.documents = documentsData ? JSON.parse(documentsData) : [];
      }catch(e){
        console.error('Error loading documents:', e);
        state.documents = [];
      }
      try{
        const teamData = localStorage.getItem(LS_KEYS.team);
        state.team = teamData ? JSON.parse(teamData) : [];
      }catch(e){
        console.error('Error loading team:', e);
        state.team = [];
      }
      try{
        const statusesData = localStorage.getItem(LS_KEYS.statuses);
        state.statuses = statusesData ? JSON.parse(statusesData) : JSON.parse(JSON.stringify(DEFAULT_STATUSES));
      }catch(e){
        console.error('Error loading statuses:', e);
        state.statuses = JSON.parse(JSON.stringify(DEFAULT_STATUSES));
      }
      try{
        const usersData = localStorage.getItem(LS_KEYS.users);
        state.users = usersData ? JSON.parse(usersData) : [];
      }catch(e){
        console.error('Error loading users:', e);
        state.users = [];
      }
      try{
        const settingsData = localStorage.getItem(LS_KEYS.settings);
        state.settings = settingsData ? JSON.parse(settingsData) : {};
      }catch(e){
        console.error('Error loading settings:', e);
        state.settings = {};
      }
      try{
        const notificationsData = localStorage.getItem(LS_KEYS.notifications);
        state.notificationDismissals = notificationsData ? JSON.parse(notificationsData) : {};
      }catch(e){
        console.error('Error loading notifications:', e);
        state.notificationDismissals = {};
      }
      
      // If no users, create default admin user with belonging system
      if(state.users.length === 0) {
        state.users.push({
          id: uid(),
          name: "System Admin",
          email: "admin@company.com",
          role: "admin",
          active: true,
          created: new Date().toISOString(),
          lastLogin: null,
          view_mode: VIEW_MODES.ALL_DATA,
          filter_preset: {
            owner: [],
            project_types: [],
            locations: [],
            teams: []
          },
          permissions: getDefaultPermissions(USER_ROLES.ADMIN),
          dashboard_config: getDefaultDashboardConfig(USER_ROLES.ADMIN)
        });
      }

      // Migrate existing users to V2 (if needed)
      migrateUsersToV2();

      // Set current user
      state.currentUser = state.users[0];
    }

    function saveAll(){
      try{
        localStorage.setItem(LS_KEYS.contacts, JSON.stringify(state.contacts));
        localStorage.setItem(LS_KEYS.meetings, JSON.stringify(state.meetings));
        localStorage.setItem(LS_KEYS.tasks, JSON.stringify(state.tasks));
        localStorage.setItem(LS_KEYS.documents, JSON.stringify(state.documents));
        localStorage.setItem(LS_KEYS.team, JSON.stringify(state.team));
        localStorage.setItem(LS_KEYS.statuses, JSON.stringify(state.statuses));
        localStorage.setItem(LS_KEYS.users, JSON.stringify(state.users));
        localStorage.setItem(LS_KEYS.settings, JSON.stringify(state.settings));
        refreshAll();
      }catch(e){
        console.error('Error saving data:', e);
        alert('Error saving data. Local storage might be full.');
      }
    }

    // --- Utilities ---
    const fmtDate = d => {
      if(!d) return '';
      try{
        return new Date(d).toLocaleDateString('en-US');
      }catch(e){
        return d;
      }
    };
    const todayStr = () => new Date().toISOString().slice(0,10);
    const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2,7);

    // --- Validation ---
    function validateEmail(email){
      if(!email) return true; // Email is optional
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(email);
    }

    function showError(elementId, show = true){
      const el = document.getElementById(elementId);
      if(el){
        if(show) el.classList.add('show');
        else el.classList.remove('show');
      }
    }

    function clearAllErrors(){
      document.querySelectorAll('.error-msg').forEach(el => el.classList.remove('show'));
    }

    // --- Building Status Options ---
    function applyStatusesToSelectors(){
      fillOptions(document.getElementById('c_status'), state.statuses.contact);
      fillOptions(document.getElementById('m_status'), state.statuses.meeting);
      fillOptions(document.getElementById('t_status'), state.statuses.task);
      fillOptions(document.getElementById('filterStatus'), state.statuses.contact, true);
      fillOptions(document.getElementById('filterProjectType'), state.statuses.project_types, true);
      
      // List of contact names for autocomplete
      const contactNames = document.getElementById('contactNames');
      if(contactNames) {
        contactNames.innerHTML = '';
        const names = [...new Set(state.contacts.map(c => c.name))];
        names.forEach(name => {
          const option = document.createElement('option');
          option.value = name;
          contactNames.appendChild(option);
        });
      }
      
      // List of assigned team members
      const owners = [...new Set(state.contacts.map(c => c.owner).filter(Boolean))];
      if(state.team.length > 0) {
        owners.push(...state.team.map(m => m.name));
      }
      const uniqueOwners = [...new Set(owners)];
      
      fillOptions(document.getElementById('c_owner'), uniqueOwners, true);
      fillOptions(document.getElementById('m_owner'), uniqueOwners, true);
      fillOptions(document.getElementById('t_owner'), uniqueOwners, true);
      fillOptions(document.getElementById('filterOwner'), uniqueOwners, true);
      fillOptions(document.getElementById('documentFilterContact'), [...new Set(state.contacts.map(c => c.name))], true);
      
      // List of projects
      const projects = state.contacts.map(c => ({value: c.id, text: `${c.name} - ${c.project_id || 'No Project ID'}`}));
      fillOptionsWithValues(document.getElementById('t_project'), projects, true);
    }

    function fillOptions(sel, arr, includeAll = false){
      if(!sel || !arr) return;
      sel.innerHTML = '';
      if(includeAll) {
        const o = document.createElement('option');
        o.textContent = 'All';
        o.value = '';
        sel.appendChild(o);
      }
      arr.forEach(s=>{
        const o = document.createElement('option');
        o.textContent = s;
        o.value = s;
        sel.appendChild(o);
      });
    }
    
    function fillOptionsWithValues(sel, arr, includeAll = false){
      if(!sel || !arr) return;
      sel.innerHTML = '';
      if(includeAll) {
        const o = document.createElement('option');
        o.textContent = 'All';
        o.value = '';
        sel.appendChild(o);
      }
      arr.forEach(item=>{
        const o = document.createElement('option');
        o.textContent = item.text;
        o.value = item.value;
        sel.appendChild(o);
      });
    }

    // --- General Refresh ---
    function refreshAll(){
      renderContacts();
      renderMeetings();
      renderTasks();
      renderDashboard();
      renderDocuments();
      renderTeam();
      renderReports();
      renderCalendar();
      updateUserInfo();
      evaluateNotifications();
    }

    // --- Notifications ---
    function saveNotificationDismissals() {
      try {
        localStorage.setItem(LS_KEYS.notifications, JSON.stringify(state.notificationDismissals || {}));
      } catch (e) {
        console.error('Error saving notification dismissals:', e);
      }
    }

    function ensureNotificationPanel(){
      if(document.getElementById('notificationsPanel')) return;

      const panel = document.createElement('div');
      panel.id = 'notificationsPanel';
      panel.className = 'notification-panel';
      panel.innerHTML = `
        <div class="notification-panel__backdrop"></div>
        <div class="notification-panel__container">
          <div class="notification-panel__header">
            <div>
              <div class="brand" style="margin-bottom:4px">Notifications</div>
              <div class="muted" id="notificationsSubtitle">Stay ahead of upcoming work</div>
            </div>
            <button class="pill ghost" id="notificationsClose" aria-label="Close notifications">&times;</button>
          </div>
          <div class="notification-panel__content" id="notificationList"></div>
        </div>`;

      document.body.appendChild(panel);

      const backdrop = panel.querySelector('.notification-panel__backdrop');
      const closeBtn = panel.querySelector('#notificationsClose');

      if(backdrop) backdrop.addEventListener('click', closeNotificationPanel);
      if(closeBtn) closeBtn.addEventListener('click', closeNotificationPanel);
    }

    function normalizeDateOnly(dateStr){
      if(!dateStr) return null;
      const d = new Date(dateStr);
      if(Number.isNaN(d.getTime())) return null;
      d.setHours(0,0,0,0);
      return d;
    }

    function buildNotificationGroups(){
      const todayDate = new Date();
      todayDate.setHours(0,0,0,0);
      const soonDate = new Date(todayDate);
      soonDate.setDate(soonDate.getDate() + 2);

      const sections = [];
      const dismissalMap = state.notificationDismissals || {};
      const filteredMeetings = getFilteredData(state.meetings, state.currentUser);
      const filteredTasks = getFilteredData(state.tasks, state.currentUser);

      const meetingsByUrgency = { overdue: [], today: [], upcoming: [] };
      filteredMeetings.forEach(m => {
        if(!m) return;
        if(m.status && ['Completed','Cancelled'].includes(m.status)) return;
        const normalized = normalizeDateOnly(m.date);
        const key = `meeting-${m.id}`;
        if(!normalized || dismissalMap[key]) return;
        if(normalized < todayDate) meetingsByUrgency.overdue.push(m);
        else if(normalized.getTime() === todayDate.getTime()) meetingsByUrgency.today.push(m);
        else if(normalized <= soonDate) meetingsByUrgency.upcoming.push(m);
      });

      const tasksByUrgency = { overdue: [], today: [], upcoming: [] };
      filteredTasks.forEach(t => {
        if(!t) return;
        if(t.status && ['Completed','Cancelled','Done'].includes(t.status)) return;
        const normalized = normalizeDateOnly(t.due);
        const key = `task-${t.id}`;
        if(!normalized || dismissalMap[key]) return;
        if(normalized < todayDate) tasksByUrgency.overdue.push(t);
        else if(normalized.getTime() === todayDate.getTime()) tasksByUrgency.today.push(t);
        else if(normalized <= soonDate) tasksByUrgency.upcoming.push(t);
      });

      const sectionBuilder = (title, items, type, severity) => {
        if(items.length === 0) return;
        sections.push({
          title,
          items: items.map(item => ({
            id: item.id,
            type,
            label: type === 'meeting' ? (item.subject || 'Meeting') : (item.task || 'Task'),
            context: type === 'meeting' ? (item.contact_name || item.location || '') : (item.contact_name || ''),
            date: type === 'meeting' ? item.date : item.due,
            time: type === 'meeting' ? item.time : '',
            priority: item.priority || '',
            status: item.status || ''
          })),
          severity
        });
      };

      sectionBuilder("Today's meetings", meetingsByUrgency.today, 'meeting', 'high');
      sectionBuilder('Overdue meetings', meetingsByUrgency.overdue, 'meeting', 'high');
      sectionBuilder('Upcoming meetings', meetingsByUrgency.upcoming, 'meeting', 'medium');
      sectionBuilder("Today's tasks", tasksByUrgency.today, 'task', 'high');
      sectionBuilder('Overdue tasks', tasksByUrgency.overdue, 'task', 'high');
      sectionBuilder('Upcoming tasks', tasksByUrgency.upcoming, 'task', 'medium');

      return sections;
    }

    function updateNotificationsBadge(groups){
      const btn = document.getElementById('btnNotifications');
      if(!btn) return;

      let badge = btn.querySelector('.notification-badge');
      if(!badge){
        badge = document.createElement('span');
        badge.className = 'notification-badge hidden';
        badge.id = 'notificationsBadge';
        btn.appendChild(badge);
      }

      const highPriority = (groups || []).reduce((sum, grp) => {
        if(grp.severity === 'high') {
          return sum + (grp.items ? grp.items.length : 0);
        }
        return sum;
      }, 0);

      badge.textContent = highPriority > 99 ? '99+' : highPriority;
      badge.classList.toggle('hidden', highPriority === 0);
    }

    function renderNotificationsPanel(){
      ensureNotificationPanel();
      const container = document.getElementById('notificationList');
      const subtitle = document.getElementById('notificationsSubtitle');
      if(!container) return;

      container.innerHTML = '';
      const groups = state.notifications || [];

      if(groups.length === 0){
        if(subtitle) subtitle.textContent = 'No pending alerts right now';
        const empty = document.createElement('div');
        empty.className = 'notification-empty';
        empty.textContent = 'You are all caught up!';
        container.appendChild(empty);
        return;
      }

      if(subtitle) subtitle.textContent = 'Quickly act on time-sensitive updates';

      groups.forEach(group => {
        const section = document.createElement('div');
        section.className = 'notification-section';
        section.innerHTML = `
          <div class="notification-section__title">
            <span>${group.title}</span>
            <span class="badge">${group.items.length}</span>
          </div>`;

        group.items.forEach(item => {
          const itemEl = document.createElement('div');
          itemEl.className = `notification-item ${group.severity === 'high' ? 'is-critical' : ''}`;
          itemEl.dataset.id = item.id;
          itemEl.dataset.type = item.type;
          itemEl.innerHTML = `
            <div class="notification-item__main">
              <div>
                <div class="notification-item__title">${esc(item.label)}</div>
                <div class="notification-item__meta">${esc(item.context)}${item.context && item.date ? ' • ' : ''}${esc(item.date || '')}${item.time ? ' @ ' + esc(item.time) : ''}</div>
              </div>
              <div class="notification-item__status">${esc(item.status || item.priority || '')}</div>
            </div>
            <div class="notification-item__actions">
              <button data-action="view" class="ghost">View</button>
              <button data-action="done" class="good">Mark done</button>
              <button data-action="reschedule" class="pill">Reschedule</button>
              <button data-action="dismiss" class="ghost">Dismiss</button>
            </div>`;
          section.appendChild(itemEl);
        });

        container.appendChild(section);
      });

      container.querySelectorAll('button[data-action]').forEach(btn => {
        btn.addEventListener('click', handleNotificationAction);
      });
    }

    function evaluateNotifications(){
      state.notifications = buildNotificationGroups();
      updateNotificationsBadge(state.notifications);

      const panel = document.getElementById('notificationsPanel');
      if(panel && panel.classList.contains('open')){
        renderNotificationsPanel();
      }
    }

    function navigateToTab(tabId){
      const link = document.querySelector(`.sidebar-menu a[data-tab="${tabId}"]`);
      if(link){
        link.click();
      }
    }

    function handleNotificationAction(e){
      const btn = e.currentTarget;
      const itemEl = btn.closest('.notification-item');
      if(!itemEl) return;

      const action = btn.dataset.action;
      const id = itemEl.dataset.id;
      const type = itemEl.dataset.type;

      switch(action){
        case 'view':
          navigateToTab(type === 'meeting' ? 'tab-meetings' : 'tab-tasks');
          closeNotificationPanel();
          break;
        case 'done':
          markNotificationDone(type, id);
          break;
        case 'reschedule':
          rescheduleNotification(type, id);
          break;
        case 'dismiss':
          dismissNotification(type, id);
          break;
      }
    }

    function markNotificationDone(type, id){
      if(type === 'meeting'){
        const meeting = state.meetings.find(m => m.id === id);
        if(meeting){
          meeting.status = 'Completed';
          saveAll();
          showToast('Meeting marked as completed');
        }
      } else if(type === 'task'){
        const task = state.tasks.find(t => t.id === id);
        if(task){
          task.status = 'Completed';
          saveAll();
          showToast('Task marked as completed');
        }
      }
    }

    function rescheduleNotification(type, id){
      if(type === 'meeting'){
        const meeting = state.meetings.find(m => m.id === id);
        if(meeting){
          const newDate = prompt('New meeting date (YYYY-MM-DD):', meeting.date || todayStr());
          if(!newDate) return;
          const newTime = prompt('New meeting time (HH:MM):', meeting.time || '');
          meeting.date = newDate;
          if(newTime !== null) meeting.time = newTime;
          saveAll();
          showToast('Meeting rescheduled');
        }
      } else if(type === 'task'){
        const task = state.tasks.find(t => t.id === id);
        if(task){
          const newDate = prompt('New due date (YYYY-MM-DD):', task.due || todayStr());
          if(!newDate) return;
          task.due = newDate;
          saveAll();
          showToast('Task rescheduled');
        }
      }
    }

    function dismissNotification(type, id){
      if(!state.notificationDismissals) state.notificationDismissals = {};
      state.notificationDismissals[`${type}-${id}`] = true;
      saveNotificationDismissals();
      evaluateNotifications();
    }

    function openNotificationPanel(){
      ensureNotificationPanel();
      renderNotificationsPanel();
      const panel = document.getElementById('notificationsPanel');
      if(panel) panel.classList.add('open');
    }

    function closeNotificationPanel(){
      const panel = document.getElementById('notificationsPanel');
      if(panel) panel.classList.remove('open');
    }
    
    function updateUserInfo() {
      const userName = document.getElementById('userName');
      const userRole = document.getElementById('userRole');
      const userAvatar = document.getElementById('userAvatar');
      
      if(state.currentUser) {
        if(userName) userName.textContent = state.currentUser.name;
        if(userRole) userRole.textContent = state.currentUser.role === 'admin' ? 'Admin' : 'User';
        if(userAvatar) userAvatar.textContent = state.currentUser.name.charAt(0);
      }
    }

    // --- Contacts ---
    function addContactFromForm(){
      clearAllErrors();
      
      const name = val('c_name');
      const email = val('c_email');
      
      let hasError = false;
      
      if(!name){
        showError('err_c_name');
        hasError = true;
      }
      
      if(email && !validateEmail(email)){
        showError('err_c_email');
        hasError = true;
      }
      
      if(hasError) return;

      const o = {
        id: uid(),
        created_at: val('c_created') || new Date().toISOString(),
        name: name,
        phone: val('c_phone'),
        email: email,
        project_type: val('c_project_type'),
        stage: val('c_stage'),
        project_id: val('c_project_id'),
        location: val('c_location'),
        contact_person: val('c_contact_person'),
        next_meeting: val('c_next_meeting'),
        owner: document.getElementById('c_owner').value,
        source: val('c_source'),
        status: document.getElementById('c_status').value || state.statuses.contact[0] || '',
        important: document.getElementById('c_important').value === 'true',
        notes: val('c_notes')
      };
      
      state.contacts.unshift(o);
      clearContactForm();
      saveAll();
      
      // Log activity
      logActivity(`Added new contact: ${name}`, 'contact');
    }

    function clearContactForm(){
      ['c_name','c_phone','c_email','c_project_type','c_stage','c_project_id','c_location','c_contact_person','c_next_meeting','c_source','c_notes'].forEach(id=>{
        const el = document.getElementById(id);
        if(el) el.value = '';
      });
      const createdEl = document.getElementById('c_created');
      if(createdEl) createdEl.value = todayStr();
      const statusEl = document.getElementById('c_status');
      if(statusEl) statusEl.value = state.statuses.contact[0] || '';
      const importantEl = document.getElementById('c_important');
      if(importantEl) importantEl.value = 'false';
      clearAllErrors();
    }

    function renderContacts(){
      const tbody = document.querySelector('#tblContacts tbody');
      if(!tbody) return;

      const q = document.getElementById('contactSearch')?.value?.trim().toLowerCase() || '';
      tbody.innerHTML = '';

      // Apply user's belonging filter first
      const allContacts = state.contacts;
      let rows = getFilteredData(allContacts, state.currentUser);
      
      // Filter by search
      if(q){
        rows = rows.filter(r=> {
          const searchStr = Object.values(r).join(' ').toLowerCase();
          return searchStr.includes(q);
        });
      }
      
      // Advanced filtering
      if(state.filters.contact) {
        const filters = state.filters.contact;
        if(filters.projectType) {
          rows = rows.filter(r => r.project_type === filters.projectType);
        }
        if(filters.status) {
          rows = rows.filter(r => r.status === filters.status);
        }
        if(filters.owner) {
          rows = rows.filter(r => r.owner === filters.owner);
        }
        if(filters.important !== undefined) {
          rows = rows.filter(r => r.important === (filters.important === 'true'));
        }
        if(filters.created) {
          const days = parseInt(filters.created);
          const cutoff = new Date();
          cutoff.setDate(cutoff.getDate() - days);
          rows = rows.filter(r => new Date(r.created_at) >= cutoff);
        }
      }
      
      for(const r of rows){
        const tr = document.createElement('tr');
        tr.classList.add('fade-in');
        tr.innerHTML = `
          <td>
            <input type="checkbox" data-id="${esc(r.id)}" class="ckContact">
          </td>
          <td>${fmtDate(r.created_at)}</td>
          <td contenteditable="true" data-k="name">${esc(r.name)}</td>
          <td contenteditable="true" data-k="phone">${esc(r.phone||'')}</td>
          <td contenteditable="true" data-k="email">${esc(r.email||'')}</td>
          <td contenteditable="true" data-k="project_type">${esc(r.project_type||'')}</td>
          <td contenteditable="true" data-k="stage">${esc(r.stage||'')}</td>
          <td contenteditable="true" data-k="project_id">${esc(r.project_id||'')}</td>
          <td contenteditable="true" data-k="location">${esc(r.location||'')}</td>
          <td contenteditable="true" data-k="contact_person">${esc(r.contact_person||'')}</td>
          <td contenteditable="true" data-k="next_meeting">${esc(r.next_meeting||'')}</td>
          <td contenteditable="true" data-k="owner">${esc(r.owner||'')}</td>
          <td contenteditable="true" data-k="source">${esc(r.source||'')}</td>
          <td>${buildStatusSelect('contact', r.status, r.id)}</td>
          <td>
            ${r.important ? '<span class="badge">Important</span>' : ''}
          </td>
          <td contenteditable="true" data-k="notes">${esc(r.notes||'')}</td>
          <td class="actions">
            <button 
              data-act="mkmeeting" 
              data-id="${esc(r.id)}" 
              title="Meeting" 
              class="ghost">
              📅
            </button>
            <button 
              data-act="mktask" 
              data-id="${esc(r.id)}" 
              title="Task" 
              class="ghost">
              ✅
            </button>
            <button 
              data-act="toggleImportant" 
              data-id="${esc(r.id)}" 
              class="ghost" 
              title="Mark Important">
              ${r.important ? '★' : '☆'}
            </button>
            <button 
              data-act="delContact" 
              data-id="${esc(r.id)}" 
              class="bad" 
              title="Delete">
              Delete
            </button>
          </td>
        `;
        tbody.appendChild(tr);
      }

      // Listeners for quick edit
      tbody.querySelectorAll('td[contenteditable=true]').forEach(td=>{
        td.addEventListener('blur', e=>{
          const tr = e.target.closest('tr');
          const idx = [...tbody.children].indexOf(tr);
          const row = rows[idx];
          if(!row) return;
          const real = state.contacts.find(x=>x.id===row.id);
          if(!real) return;
          const key = e.target.dataset.k;
          const newValue = e.target.textContent.trim();
          
          // Email validation
          if(key === 'email' && newValue && !validateEmail(newValue)){
            alert('Invalid email format');
            e.target.textContent = real[key] || '';
            return;
          }
          
          real[key] = newValue;
          saveAll();
          
          // Log activity
          logActivity(`Updated contact: ${real.name} (${key})`, 'contact');
        });
      });
      
      // Statuses (select)
      tbody.querySelectorAll('select[data-kind=contact]').forEach(sel=>{
        sel.addEventListener('change', e=>{
          const id = e.target.dataset.id;
          const row = state.contacts.find(x=>x.id===id);
          if(row){
            row.status = e.target.value;
            saveAll();
            
            // Log activity
            logActivity(`Changed status for contact: ${row.name} -> ${row.status}`, 'contact');
          }
        });
      });
      
      // Actions
      tbody.querySelectorAll('button[data-act]').forEach(btn=>{
        btn.addEventListener('click', e=>{
          const id = e.currentTarget.dataset.id;
          const act = e.currentTarget.dataset.act;
          if(act==='delContact'){
            if(confirm('Delete this contact?')){
              const contact = state.contacts.find(x=>x.id===id);
              state.contacts = state.contacts.filter(x=>x.id!==id);
              saveAll();
              
              // Log activity
              if(contact) {
                logActivity(`Deleted contact: ${contact.name}`, 'contact');
              }
            }
          } else if(act==='mkmeeting'){
            openQuickModal('meeting', [id]);
          } else if(act==='mktask'){
            openQuickModal('task', [id]);
          } else if(act==='toggleImportant'){
            const row = state.contacts.find(x=>x.id===id);
            if(row){
              row.important = !row.important;
              saveAll();
              
              // Log activity
              logActivity(`Marked as ${row.important ? 'important' : 'regular'}: ${row.name}`, 'contact');
            }
          }
        });
      });

      // Update scope indicator if exists
      const scopeIndicator = document.getElementById('contacts-scope-indicator');
      if (scopeIndicator) {
        const scopeLabel = getScopeLabel(state.currentUser);
        scopeIndicator.innerHTML = `
          <span class="scope-badge ${state.currentUser.view_mode}">
            ${scopeLabel}
          </span>
          <span class="scope-count">Showing ${rows.length} of ${allContacts.length} contacts</span>
        `;
      }
    }

    function buildStatusSelect(kind, value, id){
      const arr = state.statuses[kind] || [];
      const options = arr.map(s=>`<option ${s===value?'selected':''} value="${esc(s)}">${esc(s)}</option>`).join('');
      return `<select data-kind="${kind}" data-id="${esc(id)}">${options}</select>`;
    }

    // --- Meetings ---
    function addMeetingFromForm(){
      clearAllErrors();
      
      const date = val('m_date');
      const contactName = val('m_contact_name');
      
      let hasError = false;
      
      if(!date){
        showError('err_m_date');
        hasError = true;
      }
      
      if(!contactName){
        showError('err_m_contact');
        hasError = true;
      }
      
      if(hasError) return;

      const o = {
        id: uid(),
        date: date,
        time: val('m_time'),
        contact_name: contactName,
        phone: val('m_phone'),
        email: val('m_email'),
        subject: val('m_subject'),
        location: val('m_location'),
        owner: document.getElementById('m_owner').value,
        status: document.getElementById('m_status').value || state.statuses.meeting[0] || '',
        notes: val('m_notes')
      };
      
      state.meetings.unshift(o);
      saveAll();
      clearMeetingForm();
      
      // Log activity
      logActivity(`Added meeting: ${contactName} - ${o.subject}`, 'meeting');
    }

    function clearMeetingForm(){
      ['m_date','m_time','m_contact_name','m_phone','m_email','m_subject','m_location','m_notes'].forEach(id=>{
        const el = document.getElementById(id);
        if(el) el.value = '';
      });
      const statusEl = document.getElementById('m_status');
      if(statusEl) statusEl.value = state.statuses.meeting[0] || '';
      clearAllErrors();
    }

    function renderMeetings(){
      const tbody = document.querySelector('#tblMeetings tbody');
      if(!tbody) return;

      tbody.innerHTML='';

      // Apply user's belonging filter
      const allMeetings = state.meetings;
      const filteredMeetings = getFilteredData(allMeetings, state.currentUser);

      for(const r of filteredMeetings){
        const tr = document.createElement('tr');
        tr.classList.add('fade-in');
        tr.innerHTML = `
          <td>${esc(r.date)}</td>
          <td>${esc(r.time||'')}</td>
          <td contenteditable="true" data-k="contact_name">${esc(r.contact_name)}</td>
          <td contenteditable="true" data-k="phone">${esc(r.phone||'')}</td>
          <td contenteditable="true" data-k="email">${esc(r.email||'')}</td>
          <td contenteditable="true" data-k="subject">${esc(r.subject||'')}</td>
          <td contenteditable="true" data-k="location">${esc(r.location||'')}</td>
          <td contenteditable="true" data-k="owner">${esc(r.owner||'')}</td>
          <td>${buildStatusSelect('meeting', r.status, r.id)}</td>
          <td contenteditable="true" data-k="notes">${esc(r.notes||'')}</td>
          <td class="actions">
            <button data-act="delMeeting" data-id="${esc(r.id)}" class="bad">Delete</button>
          </td>`;
        tbody.appendChild(tr);
      }
      
      tbody.querySelectorAll('td[contenteditable=true]').forEach(td=>{
        td.addEventListener('blur', e=>{
          const tr = e.target.closest('tr');
          const idx = [...tbody.children].indexOf(tr);
          const row = state.meetings[idx];
          if(!row) return;
          const key = e.target.dataset.k;
          row[key] = e.target.textContent.trim();
          saveAll();
        });
      });
      
      tbody.querySelectorAll('select[data-kind=meeting]').forEach(sel=>{
        sel.addEventListener('change', e=>{
          const id = e.target.dataset.id;
          const row = state.meetings.find(x=>x.id===id);
          if(row){
            row.status = e.target.value;
            saveAll();
          }
        });
      });
      
      tbody.querySelectorAll('button[data-act=delMeeting]').forEach(btn=>{
        btn.addEventListener('click', e=>{
          const id = e.currentTarget.dataset.id;
          if(confirm('Delete meeting?')){
            const meeting = state.meetings.find(x=>x.id===id);
            state.meetings = state.meetings.filter(x=>x.id!==id);
            saveAll();
            
            // Log activity
            if(meeting) {
              logActivity(`Deleted meeting: ${meeting.contact_name} - ${meeting.subject}`, 'meeting');
            }
          }
        });
      });

      // Update scope indicator if exists
      const scopeIndicator = document.getElementById('meetings-scope-indicator');
      if (scopeIndicator) {
        const scopeLabel = getScopeLabel(state.currentUser);
        scopeIndicator.innerHTML = `
          <span class="scope-badge ${state.currentUser.view_mode}">
            ${scopeLabel}
          </span>
          <span class="scope-count">Showing ${filteredMeetings.length} of ${allMeetings.length} meetings</span>
        `;
      }
    }

    // --- Tasks ---
    function addTaskFromForm(){
      clearAllErrors();
      
      const due = val('t_due');
      const task = val('t_task');
      
      let hasError = false;
      
      if(!due){
        showError('err_t_due');
        hasError = true;
      }
      
      if(!task){
        showError('err_t_task');
        hasError = true;
      }
      
      if(hasError) return;

      const o = {
        id: uid(),
        due: due,
        contact_name: val('t_contact_name'),
        task: task,
        owner: document.getElementById('t_owner').value,
        priority: document.getElementById('t_priority').value,
        status: document.getElementById('t_status').value || state.statuses.task[0] || '',
        project_id: document.getElementById('t_project').value,
        notes: val('t_notes')
      };
      
      state.tasks.unshift(o);
      saveAll();
      clearTaskForm();
      
      // Log activity
      logActivity(`Added task: ${task}`, 'task');
    }

    function clearTaskForm(){
      ['t_due','t_contact_name','t_task','t_notes'].forEach(id=>{
        const el = document.getElementById(id);
        if(el) el.value = '';
      });
      const priorityEl = document.getElementById('t_priority');
      if(priorityEl) priorityEl.value = 'Medium';
      const statusEl = document.getElementById('t_status');
      if(statusEl) statusEl.value = state.statuses.task[0] || '';
      const projectEl = document.getElementById('t_project');
      if(projectEl) projectEl.value = '';
      clearAllErrors();
    }

    function renderTasks(){
      const tbody = document.querySelector('#tblTasks tbody');
      if(!tbody) return;

      tbody.innerHTML='';

      // Apply user's belonging filter
      const allTasks = state.tasks;
      const filteredTasks = getFilteredData(allTasks, state.currentUser);

      for(const r of filteredTasks){
        const contact = state.contacts.find(c => c.id === r.project_id);
        const contactName = contact ? contact.name : r.contact_name;
        
        const tr = document.createElement('tr');
        tr.classList.add('fade-in');
        const priorityClass = `priority-${r.priority === 'High' ? 'high' : r.priority === 'Low' ? 'low' : 'medium'}`;
        tr.innerHTML = `
          <td>${esc(r.due)}</td>
          <td contenteditable="true" data-k="contact_name">${esc(contactName||'')}</td>
          <td contenteditable="true" data-k="task">${esc(r.task||'')}</td>
          <td contenteditable="true" data-k="owner">${esc(r.owner||'')}</td>
          <td class="${priorityClass}">${esc(r.priority||'')}</td>
          <td>${buildStatusSelect('task', r.status, r.id)}</td>
          <td>${contact ? `${contact.name} - ${contact.project_type}` : ''}</td>
          <td contenteditable="true" data-k="notes">${esc(r.notes||'')}</td>
          <td class="actions"><button data-act="delTask" data-id="${esc(r.id)}" class="bad">Delete</button></td>`;
        tbody.appendChild(tr);
      }
      
      tbody.querySelectorAll('td[contenteditable=true]').forEach(td=>{
        td.addEventListener('blur', e=>{
          const tr = e.target.closest('tr');
          const idx = [...tbody.children].indexOf(tr);
          const row = state.tasks[idx];
          if(!row) return;
          const key = e.target.dataset.k;
          row[key] = e.target.textContent.trim();
          saveAll();
        });
      });
      
      tbody.querySelectorAll('select[data-kind=task]').forEach(sel=>{
        sel.addEventListener('change', e=>{
          const id = e.target.dataset.id;
          const row = state.tasks.find(x=>x.id===id);
          if(row){
            row.status = e.target.value;
            saveAll();
            
            // Log activity
            logActivity(`Changed status for task: ${row.task} -> ${row.status}`, 'task');
          }
        });
      });
      
      tbody.querySelectorAll('button[data-act=delTask]').forEach(btn=>{
        btn.addEventListener('click', e=>{
          const id = e.currentTarget.dataset.id;
          if(confirm('Delete task?')){
            const task = state.tasks.find(x=>x.id===id);
            state.tasks = state.tasks.filter(x=>x.id!==id);
            saveAll();
            
            // Log activity
            if(task) {
              logActivity(`Deleted task: ${task.task}`, 'task');
            }
          }
        });
      });

      // Update scope indicator if exists
      const scopeIndicator = document.getElementById('tasks-scope-indicator');
      if (scopeIndicator) {
        const scopeLabel = getScopeLabel(state.currentUser);
        scopeIndicator.innerHTML = `
          <span class="scope-badge ${state.currentUser.view_mode}">
            ${scopeLabel}
          </span>
          <span class="scope-count">Showing ${filteredTasks.length} of ${allTasks.length} tasks</span>
        `;
      }
    }

    // --- Dashboard ---
    function renderDashboard(){
      // Apply user's belonging filter to all data
      const myContacts = getFilteredData(state.contacts, state.currentUser);
      const myMeetings = getFilteredData(state.meetings, state.currentUser);
      const myTasks = getFilteredData(state.tasks, state.currentUser);

      // Update dashboard title with scope
      const dashTitle = document.getElementById('dashboard-title');
      if (dashTitle) {
        const scopeLabel = getScopeLabel(state.currentUser);
        dashTitle.innerHTML = `Dashboard <span class="scope-badge ${state.currentUser.view_mode}">${scopeLabel}</span>`;
      }

      const kpiContacts = document.getElementById('kpiContacts');
      if(kpiContacts) kpiContacts.textContent = myContacts.length;

      const openTasks = myTasks.filter(t=>t.status!=="Completed");
      const kpiTasksOpen = document.getElementById('kpiTasksOpen');
      if(kpiTasksOpen) kpiTasksOpen.textContent = openTasks.length;

      // Update upcomingMeetings to use filtered data
      const today = todayStr();
      const next7Days = new Date();
      next7Days.setDate(next7Days.getDate() + 7);
      const next7DaysStr = next7Days.toISOString().slice(0,10);
      const next7 = myMeetings.filter(m => m.date >= today && m.date <= next7DaysStr).sort((a,b) => a.date.localeCompare(b.date));

      const kpiMeetings7 = document.getElementById('kpiMeetings7');
      if(kpiMeetings7) kpiMeetings7.textContent = next7.length;

      // Estimated revenue (simple example) based on filtered contacts
      const kpiRevenue = document.getElementById('kpiRevenue');
      if(kpiRevenue) {
        const revenue = myContacts.length * 2500; // Example - $2500 average per contact
        kpiRevenue.textContent = revenue.toLocaleString();
      }

      const listUp = document.getElementById('listUpcoming');
      if(listUp){
        listUp.innerHTML='';
        next7.slice(0,8).forEach(m=>{
          const div = document.createElement('div');
          div.classList.add('fade-in');
          div.innerHTML = `<span class="badge">${esc(m.date)} ${esc(m.time||'')}</span> · <b>${esc(m.contact_name)}</b> — ${esc(m.subject||'')} <span class="muted">(${esc(m.location||'')})</span>`;
          listUp.appendChild(div);
        });
      }

      const listOd = document.getElementById('listOverdue');
      if(listOd){
        listOd.innerHTML='';
        const overdue = myTasks.filter(t=> t.status!=="Completed" && t.due && new Date(t.due) < startOfDay(new Date()));
        overdue.slice(0,8).forEach(t=>{
          const div = document.createElement('div');
          div.classList.add('fade-in');
          div.innerHTML = `<span class="badge" style="background:var(--bad);color:white">Overdue</span> · <b>${esc(t.task)}</b> — ${esc(t.contact_name||'')} <span class="muted">(Due: ${esc(t.due)})</span>`;
          listOd.appendChild(div);
        });
      }
      
      // Recent activity
      const recentActivity = document.getElementById('recentActivity');
      if(recentActivity) {
        recentActivity.innerHTML = '';
        // Example activity - in a real system this would come from an actual log
        const activities = [
          {action: 'Added new contact: Dana Smith', time: '2 hours ago', type: 'contact'},
          {action: 'Meeting completed: John Doe', time: '4 hours ago', type: 'meeting'},
          {action: 'Task completed: Prepare proposal', time: '6 hours ago', type: 'task'},
          {action: 'Updated project: Consulting - Sarah Johnson', time: 'Yesterday', type: 'contact'},
          {action: 'Added meeting: Michael Brown - Consultation', time: 'Yesterday', type: 'meeting'}
        ];
        
        activities.forEach(activity => {
          const div = document.createElement('div');
          div.classList.add('audit-item', 'fade-in');
          div.innerHTML = `
            <div><b>${activity.action}</b></div>
            <div class="muted" style="font-size:0.8rem">${activity.time}</div>
          `;
          recentActivity.appendChild(div);
        });
      }
      
      // Contact status chart (example)
      const chartContactStatus = document.getElementById('chartContactStatus');
      if(chartContactStatus) {
        // In a real system, this would be code to create a chart
        chartContactStatus.innerHTML = `
          <div style="display:flex;flex-direction:column;gap:8px;height:100%;justify-content:center">
            <div style="display:flex;align-items:center;gap:8px">
              <div style="width:12px;height:12px;background:#4CAF50;border-radius:2px"></div>
              <div>In Progress (${Math.floor(state.contacts.length * 0.6)})</div>
            </div>
            <div style="display:flex;align-items:center;gap:8px">
              <div style="width:12px;height:12px;background:#2196F3;border-radius:2px"></div>
              <div>New (${Math.floor(state.contacts.length * 0.2)})</div>
            </div>
            <div style="display:flex;align-items:center;gap:8px">
              <div style="width:12px;height:12px;background:#FFC107;border-radius:2px"></div>
              <div>Waiting for Contact (${Math.floor(state.contacts.length * 0.1)})</div>
            </div>
            <div style="display:flex;align-items:center;gap:8px">
              <div style="width:12px;height:12px;background:#9E9E9E;border-radius:2px"></div>
              <div>Closed (${Math.floor(state.contacts.length * 0.1)})</div>
            </div>
          </div>
        `;
      }
    }

    function upcomingMeetings(days){
      const now = startOfDay(new Date());
      const till = new Date(now);
      till.setDate(till.getDate()+days);
      return state.meetings.filter(m=> {
        if(!m.date) return false;
        const mDate = new Date(m.date);
        return mDate >= now && mDate <= till;
      }).sort((a,b)=> (a.date+(a.time||'')).localeCompare(b.date+(b.time||'')));
    }

    function startOfDay(d){
      const x = new Date(d);
      x.setHours(0,0,0,0);
      return x;
    }
    
    function logActivity(action, type) {
      // In a real system, this would save the activity to the database
      console.log(`Activity: ${action} (${type})`);
    }

    // --- Documents ---
    function renderDocuments() {
      const documentList = document.getElementById('documentList');
      if(!documentList) return;
      
      documentList.innerHTML = '';
      
      if(state.documents.length === 0) {
        documentList.innerHTML = '<div class="muted" style="text-align:center;padding:20px">No documents to display</div>';
        return;
      }
      
      state.documents.forEach(doc => {
        const div = document.createElement('div');
        div.classList.add('document-item', 'fade-in');
        
        let icon = 'fa-file';
        if(doc.type === 'contract') icon = 'fa-file-contract';
        else if(doc.type === 'proposal') icon = 'fa-file-alt';
        else if(doc.type === 'report') icon = 'fa-chart-bar';
        else if(doc.type === 'correspondence') icon = 'fa-envelope';
        
        div.innerHTML = `
          <div class="document-icon">
            <i class="fas ${icon}"></i>
          </div>
          <div class="document-details">
            <div><b>${esc(doc.name)}</b></div>
            <div class="muted" style="font-size:0.8rem">
              ${esc(doc.contact)} • ${fmtDate(doc.date)} • ${formatFileSize(doc.size)}
            </div>
          </div>
          <div class="document-actions">
            <button class="ghost" title="Download"><i class="fas fa-download"></i></button>
            <button class="ghost" title="Delete"><i class="fas fa-trash"></i></button>
          </div>
        `;
        
        documentList.appendChild(div);
      });
    }
    
    function formatFileSize(bytes) {
      if(bytes < 1024) return bytes + ' bytes';
      else if(bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
      else return (bytes / 1048576).toFixed(1) + ' MB';
    }

    // --- Team ---
    function renderTeam() {
      const teamGrid = document.getElementById('teamGrid');
      if(!teamGrid) return;
      
      teamGrid.innerHTML = '';
      
      // If no team, use default
      const teamMembers = state.team.length > 0 ? state.team : [
        {id: '1', name: 'John Smith', role: 'Manager', email: 'john@company.com', phone: '555-111-1111'},
        {id: '2', name: 'Sarah Johnson', role: 'Senior Consultant', email: 'sarah@company.com', phone: '555-222-2222'},
        {id: '3', name: 'Michael Brown', role: 'Consultant', email: 'michael@company.com', phone: '555-333-3333'},
        {id: '4', name: 'Emily Davis', role: 'Assistant', email: 'emily@company.com', phone: '555-444-4444'}
      ];
      
      teamMembers.forEach(member => {
        const div = document.createElement('div');
        div.classList.add('team-member', 'fade-in');
        
        const initials = member.name.split(' ').map(n => n[0]).join('').toUpperCase();
        
        div.innerHTML = `
          <div class="team-avatar">${initials}</div>
          <div><b>${esc(member.name)}</b></div>
          <div class="muted">${esc(member.role)}</div>
          <div style="font-size:0.8rem;margin-top:8px">
            <div>${esc(member.email)}</div>
            <div>${esc(member.phone)}</div>
          </div>
          <div class="toolbar" style="justify-content:center;margin-top:12px">
            <button class="ghost"><i class="fas fa-envelope"></i></button>
            <button class="ghost"><i class="fas fa-phone"></i></button>
            <button class="ghost"><i class="fas fa-edit"></i></button>
          </div>
        `;
        
        teamGrid.appendChild(div);
      });
    }

    // --- Calendar ---
    function renderCalendar() {
      const calendarGrid = document.getElementById('calendarGrid');
      const calendarTitle = document.getElementById('calendarTitle');
      if(!calendarGrid) return;
      
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth();
      
      // Title
      if(calendarTitle) {
        const monthNames = ["January", "February", "March", "April", "May", "June",
          "July", "August", "September", "October", "November", "December"];
        calendarTitle.textContent = `${monthNames[month]} ${year}`;
      }
      
      // Column headers (days of week)
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      calendarGrid.innerHTML = '';
      
      // Add column headers
      dayNames.forEach(day => {
        const dayHeader = document.createElement('div');
        dayHeader.classList.add('calendar-day-header');
        dayHeader.textContent = day;
        calendarGrid.appendChild(dayHeader);
      });
      
      // Fill the calendar
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const daysInMonth = lastDay.getDate();
      
      // Empty before first day
      for(let i = 0; i < firstDay.getDay(); i++) {
        const emptyDay = document.createElement('div');
        emptyDay.classList.add('calendar-day', 'other-month');
        calendarGrid.appendChild(emptyDay);
      }
      
      // Days of the month
      for(let day = 1; day <= daysInMonth; day++) {
        const dayDiv = document.createElement('div');
        dayDiv.classList.add('calendar-day');
        
        const dayHeader = document.createElement('div');
        dayHeader.classList.add('calendar-day-header');
        dayHeader.textContent = day;
        dayDiv.appendChild(dayHeader);
        
        // Add events for this day
        const dateStr = `${year}-${(month+1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        const dayEvents = state.meetings.filter(m => m.date === dateStr);
        
        dayEvents.forEach(event => {
          const eventDiv = document.createElement('div');
          eventDiv.classList.add('calendar-event');
          eventDiv.textContent = `${event.time || ''} ${event.contact_name}`;
          eventDiv.title = `${event.contact_name}: ${event.subject}`;
          dayDiv.appendChild(eventDiv);
        });
        
        calendarGrid.appendChild(dayDiv);
      }
    }

    // --- Reports ---
    function renderReports() {
      const tblReports = document.querySelector('#tblReports tbody');
      if(!tblReports) return;
      
      tblReports.innerHTML = '';
      
      // Get unique team members
      const teamMembers = [...new Set(state.contacts.map(c => c.owner).filter(Boolean))];
      if(state.team.length > 0) {
        teamMembers.push(...state.team.map(m => m.name));
      }
      const uniqueTeamMembers = [...new Set(teamMembers)];
      
      uniqueTeamMembers.forEach(member => {
        const memberContacts = state.contacts.filter(c => c.owner === member);
        const memberMeetings = state.meetings.filter(m => m.owner === member);
        const memberTasks = state.tasks.filter(t => t.owner === member);
        const completedTasks = memberTasks.filter(t => t.status === "Completed");
        const overdueTasks = memberTasks.filter(t => t.due && new Date(t.due) < startOfDay(new Date()) && t.status !== "Completed");
        const completionRate = memberTasks.length > 0 ? Math.round((completedTasks.length / memberTasks.length) * 100) : 0;
        
        const tr = document.createElement('tr');
        tr.classList.add('fade-in');
        tr.innerHTML = `
          <td>${esc(member)}</td>
          <td>${memberContacts.length}</td>
          <td>${memberMeetings.length}</td>
          <td>${completedTasks.length}</td>
          <td>${overdueTasks.length}</td>
          <td>${completionRate}%</td>
        `;
        tblReports.appendChild(tr);
      });
      
      // Charts (example)
      const chartByTeamMember = document.getElementById('chartByTeamMember');
      const chartByProjectType = document.getElementById('chartByProjectType');
      const chartTasksByStatus = document.getElementById('chartTasksByStatus');
      const chartMeetingsByMonth = document.getElementById('chartMeetingsByMonth');
      
      if(chartByTeamMember) {
        chartByTeamMember.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%" class="muted">Activity by Team Member chart</div>';
      }
      if(chartByProjectType) {
        chartByProjectType.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%" class="muted">Contacts by Project Type chart</div>';
      }
      if(chartTasksByStatus) {
        chartTasksByStatus.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%" class="muted">Tasks by Status chart</div>';
      }
      if(chartMeetingsByMonth) {
        chartMeetingsByMonth.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%" class="muted">Meetings by Month chart</div>';
      }
    }

    // --- Export contacts to CSV (Excel-friendly, UTF-8 BOM) ---
    function exportContactsCSV(){
      const headers = ["Created","Contact Name","Phone","Email","Project Type","Stage","Project ID","Location","Contact Person","Next Meeting","Assigned To","Source","Status","Important","Notes"];
      const rows = state.contacts.map(r=>[
        fmtDate(r.created_at),
        r.name,
        r.phone||'',
        r.email||'',
        r.project_type||'',
        r.stage||'',
        r.project_id||'',
        r.location||'',
        r.contact_person||'',
        r.next_meeting||'',
        r.owner||'',
        r.source||'',
        r.status||'',
        r.important?"Yes":"No",
        r.notes||''
      ]);
      const csv = toCSV([headers, ...rows]);
      const bom = new Uint8Array([0xEF,0xBB,0xBF]);
      const blob = new Blob([bom, csv], {type:'text/csv;charset=utf-8;'});
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      const stamp = new Date().toISOString().slice(0,10);
      a.download = `contacts_${stamp}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(a.href);
    }

    function toCSV(matrix){
      return matrix.map(row=> row.map(cell=>{
        const s = (cell??'').toString();
        if(/[",\n]/.test(s)){
          return '"'+s.replace(/"/g,'""')+'"';
        }
        return s;
      }).join(',')).join('\n');
    }

    // --- Import contacts from CSV ---
    function importContactsCSV(file){
      const reader = new FileReader();
      reader.onload = function(e) {
        try {
          const text = e.target.result;
          // Remove BOM if exists
          const csvText = text.replace(/^\uFEFF/, '');
          const lines = csvText.split('\n');
          const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
          
          const importedContacts = [];
          for(let i = 1; i < lines.length; i++) {
            if(!lines[i].trim()) continue;
            
            const values = parseCSVLine(lines[i]);
            if(values.length !== headers.length) continue;
            
            const contact = {
              id: uid(),
              created_at: new Date().toISOString(),
              name: values[1] || '',
              phone: values[2] || '',
              email: values[3] || '',
              project_type: values[4] || '',
              stage: values[5] || '',
              project_id: values[6] || '',
              location: values[7] || '',
              contact_person: values[8] || '',
              next_meeting: values[9] || '',
              owner: values[10] || '',
              source: values[11] || '',
              status: values[12] || state.statuses.contact[0],
              important: values[13] === 'Yes',
              notes: values[14] || ''
            };
            
            importedContacts.push(contact);
          }
          
          if(importedContacts.length > 0) {
            state.contacts = [...importedContacts, ...state.contacts];
            saveAll();
            alert(`Imported ${importedContacts.length} contacts successfully`);
            
            // Log activity
            logActivity(`Imported ${importedContacts.length} contacts from CSV file`, 'system');
          } else {
            alert('No contacts found for import in file');
          }
        } catch(error) {
          console.error('Error importing CSV:', error);
          alert('Error importing file. Make sure the format is correct.');
        }
      };
      reader.readAsText(file, 'UTF-8');
    }

    function parseCSVLine(line) {
      const result = [];
      let current = '';
      let inQuotes = false;
      
      for(let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if(char === '"') {
          inQuotes = !inQuotes;
        } else if(char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      
      result.push(current.trim());
      return result.map(cell => cell.replace(/^"|"$/g, ''));
    }

    // --- Backup and Restore ---
    function backupAllData(){
      const backupData = {
        contacts: state.contacts,
        meetings: state.meetings,
        tasks: state.tasks,
        documents: state.documents,
        team: state.team,
        statuses: state.statuses,
        users: state.users,
        settings: state.settings,
        backupDate: new Date().toISOString()
      };
      
      const dataStr = JSON.stringify(backupData, null, 2);
      const blob = new Blob([dataStr], {type: 'application/json'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `crm_backup_${new Date().toISOString().slice(0,10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      // Log activity
      logActivity('Created system backup', 'system');
    }

    function restoreAllData(file){
      const reader = new FileReader();
      reader.onload = function(e) {
        try {
          const backupData = JSON.parse(e.target.result);
          
          if(confirm('This will replace all existing data. Continue?')) {
            state.contacts = backupData.contacts || [];
            state.meetings = backupData.meetings || [];
            state.tasks = backupData.tasks || [];
            state.documents = backupData.documents || [];
            state.team = backupData.team || [];
            state.statuses = backupData.statuses || JSON.parse(JSON.stringify(DEFAULT_STATUSES));
            state.users = backupData.users || [];
            state.settings = backupData.settings || {};
            
            saveAll();
            alert('Data restored successfully');
            
            // Log activity
            logActivity('Restored system from backup', 'system');
          }
        } catch(error) {
          console.error('Error restoring backup:', error);
          alert('Error restoring backup. Make sure the file is valid.');
        }
      };
      reader.readAsText(file);
    }

    // --- Quick Create from Panel (from selected contacts) ---
    function openQuickModal(kind, contactIds){
      const modal = document.getElementById('modalQuick');
      const body = document.getElementById('modalBody');
      const title = document.getElementById('modalTitle');
      
      if(!modal || !body || !title) return;
      
      title.textContent = kind==='meeting' ? 'Create Meeting for Selected Contacts' : 'Create Task for Selected Contacts';
      body.innerHTML = '';
      
      if(kind==='meeting'){
        body.innerHTML = `
          <div class="grid cols-2">
            <div><label>Date</label><input id="qm_date" type="date" value="${todayStr()}" /></div>
            <div><label>Time</label><input id="qm_time" type="time" /></div>
            <div style="grid-column:1/-1"><label>Subject</label><input id="qm_subject" placeholder="e.g., Initial meeting"/></div>
            <div style="grid-column:1/-1"><label>Location</label><input id="qm_loc" placeholder="Office / Zoom"/></div>
            <div><label>Assigned To</label><select id="qm_owner"></select></div>
            <div><label>Status</label><select id="qm_status"></select></div>
            <div style="grid-column:1/-1"><label>Notes</label><input id="qm_notes"/></div>
          </div>`;
        fillOptions(document.getElementById('qm_status'), state.statuses.meeting);
        
        const owners = [...new Set(state.contacts.map(c => c.owner).filter(Boolean))];
        if(state.team.length > 0) {
          owners.push(...state.team.map(m => m.name));
        }
        fillOptions(document.getElementById('qm_owner'), [...new Set(owners)], true);
      }else{
        body.innerHTML = `
          <div class="grid cols-2">
            <div><label>Due Date</label><input id="qt_due" type="date" value="${todayStr()}" /></div>
            <div><label>Assigned To</label><select id="qt_owner"></select></div>
            <div style="grid-column:1/-1"><label>Task</label><input id="qt_task" placeholder="e.g., Prepare proposal"/></div>
            <div><label>Priority</label><select id="qt_pri"><option>High</option><option selected>Medium</option><option>Low</option></select></div>
            <div><label>Status</label><select id="qt_status"></select></div>
            <div style="grid-column:1/-1"><label>Notes</label><input id="qt_notes"/></div>
          </div>`;
        fillOptions(document.getElementById('qt_status'), state.statuses.task);
        
        const owners = [...new Set(state.contacts.map(c => c.owner).filter(Boolean))];
        if(state.team.length > 0) {
          owners.push(...state.team.map(m => m.name));
        }
        fillOptions(document.getElementById('qt_owner'), [...new Set(owners)], true);
      }
      
      modal.style.display='flex';

      const onOk = () => {
        const selected = contactIds && contactIds.length ? contactIds : Array.from(document.querySelectorAll('.ckContact:checked')).map(x=>x.dataset.id);
        if(!selected.length){
          alert('No contacts selected');
          return;
        }
        
        const chosen = state.contacts.filter(c=> selected.includes(c.id));
        
        if(kind==='meeting'){
          const date = val('qm_date');
          const time = val('qm_time');
          const subj = val('qm_subject');
          const loc = val('qm_loc');
          const owner = document.getElementById('qm_owner')?.value || '';
          const st = document.getElementById('qm_status')?.value || state.statuses.meeting[0] || '';
          const notes = val('qm_notes');
          
          chosen.forEach(c=> state.meetings.unshift({
            id:uid(),
            date,
            time,
            contact_name:c.name,
            phone:c.phone||'',
            email:c.email||'',
            subject:subj,
            location:loc,
            owner,
            status:st,
            notes
          }));
        } else {
          const due = val('qt_due');
          const owner = document.getElementById('qt_owner')?.value || '';
          const task = val('qt_task');
          const pri = document.getElementById('qt_pri')?.value || 'Medium';
          const st = document.getElementById('qt_status')?.value || state.statuses.task[0] || '';
          const notes = val('qt_notes');
          
          chosen.forEach(c=> state.tasks.unshift({
            id:uid(),
            due,
            contact_name:c.name,
            task,
            owner,
            priority:pri,
            status:st,
            notes
          }));
        }
        
        saveAll();
        closeQuickModal();
        
        // Log activity
        logActivity(`Created ${chosen.length} ${kind==='meeting' ? 'meetings' : 'tasks'} from selected contacts`, kind);
      };
      
      const okBtn = document.getElementById('modalOk');
      const cancelBtn = document.getElementById('modalCancel');
      
      if(okBtn) okBtn.onclick = onOk;
      if(cancelBtn) cancelBtn.onclick = closeQuickModal;
    }

    function closeQuickModal(){
      const modal = document.getElementById('modalQuick');
      if(modal) modal.style.display='none';
    }

    // --- Statuses: Save/Reset ---
    function saveStatusesFromUI(){
      state.statuses = {
        contact: parseList(document.getElementById('st_contact')?.value || '', DEFAULT_STATUSES.contact),
        meeting: parseList(document.getElementById('st_meeting')?.value || '', DEFAULT_STATUSES.meeting),
        task: parseList(document.getElementById('st_task')?.value || '', DEFAULT_STATUSES.task),
        project_types: parseList(document.getElementById('st_project_types')?.value || '', DEFAULT_STATUSES.project_types),
        locations: parseList(document.getElementById('st_locations')?.value || '', DEFAULT_STATUSES.locations),
        team: parseTeam(document.getElementById('st_team')?.value || '')
      };
      saveAll();
      applyStatusesToSelectors();
      refreshAll();
      
      // Log activity
      logActivity('Saved system settings', 'system');
    }
    
    function parseTeam(s) {
      if(!s.trim()) return [];
      return s.split(',').map(item => {
        const parts = item.split(':');
        return {
          id: uid(),
          name: parts[0]?.trim() || '',
          role: parts[1]?.trim() || '',
          email: parts[2]?.trim() || ''
        };
      });
    }

    function parseList(s, fallback){
      const a = (s||'').split(/\n|,/).map(x=>x.trim()).filter(Boolean);
      return a.length? Array.from(new Set(a)) : fallback;
    }

    function loadStatusesToUI(){
      const stContact = document.getElementById('st_contact');
      const stMeeting = document.getElementById('st_meeting');
      const stTask = document.getElementById('st_task');
      const stProjectTypes = document.getElementById('st_project_types');
      const stLocations = document.getElementById('st_locations');
      const stTeam = document.getElementById('st_team');
      
      if(stContact) stContact.value = state.statuses.contact.join('\n');
      if(stMeeting) stMeeting.value = state.statuses.meeting.join('\n');
      if(stTask) stTask.value = state.statuses.task.join('\n');
      if(stProjectTypes) stProjectTypes.value = state.statuses.project_types.join('\n');
      if(stLocations) stLocations.value = state.statuses.locations.join('\n');
      if(stTeam) {
        const teamStr = state.statuses.team.map(m => `${m.name}:${m.role}:${m.email}`).join(',\n');
        stTeam.value = teamStr;
      }
    }

    // --- DOM Helpers ---
    function val(id){
      const el = document.getElementById(id);
      return el ? el.value.trim() : '';
    }

    function esc(s){
      return (s??'').toString()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    // --- Tab Navigation ---
    document.querySelectorAll('.sidebar-menu a[data-tab]').forEach(link=>{
      link.addEventListener('click', e=>{
        e.preventDefault();
        const tab = e.currentTarget.dataset.tab;
        
        // Update menu
        document.querySelectorAll('.sidebar-menu a').forEach(a=> {
          a.classList.remove('active');
        });
        e.currentTarget.classList.add('active');
        
        // Update content
        document.querySelectorAll('section[id^=tab-]').forEach(sec=> {
          sec.classList.toggle('hidden', sec.id!==tab);
        });
        
        // Update page title
        const pageTitle = document.getElementById('pageTitle');
        if(pageTitle) {
          const titles = {
            'tab-dashboard': 'Dashboard',
            'tab-contacts': 'Contacts',
            'tab-meetings': 'Meetings',
            'tab-tasks': 'Tasks',
            'tab-documents': 'Documents',
            'tab-calendar': 'Calendar',
            'tab-team': 'Team',
            'tab-reports': 'Reports',
            'tab-status': 'Settings'
          };
          pageTitle.textContent = titles[tab] || 'Enterprise CRM';
        }
      });
    });

    // --- Event Handlers ---
    const btnAddContact = document.getElementById('btnAddContact');
    if(btnAddContact) btnAddContact.addEventListener('click', addContactFromForm);

    const btnExportContacts = document.getElementById('btnExportContacts');
    if(btnExportContacts) btnExportContacts.addEventListener('click', exportContactsCSV);

    const btnImportContacts = document.getElementById('btnImportContacts');
    if(btnImportContacts) btnImportContacts.addEventListener('click', ()=> document.getElementById('importFile').click());

    const importFile = document.getElementById('importFile');
    if(importFile) importFile.addEventListener('change', e=>{
      if(e.target.files.length > 0) {
        importContactsCSV(e.target.files[0]);
        e.target.value = '';
      }
    });

    const btnBackupAll = document.getElementById('btnBackupAll');
    if(btnBackupAll) btnBackupAll.addEventListener('click', backupAllData);

    const btnRestoreAll = document.getElementById('btnRestoreAll');
    if(btnRestoreAll) btnRestoreAll.addEventListener('click', ()=> document.getElementById('restoreFile').click());

    const restoreFile = document.getElementById('restoreFile');
    if(restoreFile) restoreFile.addEventListener('change', e=>{
      if(e.target.files.length > 0) {
        restoreAllData(e.target.files[0]);
        e.target.value = '';
      }
    });

    const contactSearch = document.getElementById('contactSearch');
    if(contactSearch) contactSearch.addEventListener('input', renderContacts);

    const ckAllContacts = document.getElementById('ckAllContacts');
      if(ckAllContacts){
        ckAllContacts.addEventListener('change', e=>{
          document.querySelectorAll('.ckContact').forEach(ck=> ck.checked = e.target.checked);
        });
      }

    const btnNotifications = document.getElementById('btnNotifications');
    if(btnNotifications){
      btnNotifications.addEventListener('click', () => {
        openNotificationPanel();
      });
    }

    const btnNewMeetingFromContact = document.getElementById('btnNewMeetingFromContact');
    if(btnNewMeetingFromContact){
      btnNewMeetingFromContact.addEventListener('click', ()=>openQuickModal('meeting'));
    }

    const btnNewTaskFromContact = document.getElementById('btnNewTaskFromContact');
    if(btnNewTaskFromContact){
      btnNewTaskFromContact.addEventListener('click', ()=>openQuickModal('task'));
    }

    const btnAddMeeting = document.getElementById('btnAddMeeting');
    if(btnAddMeeting) btnAddMeeting.addEventListener('click', addMeetingFromForm);

    const btnAddTask = document.getElementById('btnAddTask');
    if(btnAddTask) btnAddTask.addEventListener('click', addTaskFromForm);

    const btnSaveStatuses = document.getElementById('btnSaveStatuses');
    if(btnSaveStatuses) btnSaveStatuses.addEventListener('click', saveStatusesFromUI);

    const btnResetStatuses = document.getElementById('btnResetStatuses');
    if(btnResetStatuses){
      btnResetStatuses.addEventListener('click', ()=>{
        if(confirm('Reset settings to defaults?')){
          state.statuses = JSON.parse(JSON.stringify(DEFAULT_STATUSES));
          saveAll();
          applyStatusesToSelectors();
          loadStatusesToUI();
          alert('Settings reset to defaults.');
          
          // Log activity
          logActivity('Reset system settings to defaults', 'system');
        }
      });
    }

    // Sidebar - collapse/expand
    const sidebarToggle = document.getElementById('sidebarToggle');
    if(sidebarToggle) {
      sidebarToggle.addEventListener('click', () => {
        const sidebar = document.getElementById('sidebar');
        if(sidebar) {
          sidebar.classList.toggle('collapsed');
          const icon = sidebarToggle.querySelector('i');
          if(icon) {
            if(sidebar.classList.contains('collapsed')) {
              icon.className = 'fas fa-bars';
            } else {
              icon.className = 'fas fa-times';
            }
          }
        }
      });
    }

    // Advanced filtering
    const btnContactFilters = document.getElementById('btnContactFilters');
    if(btnContactFilters) {
      btnContactFilters.addEventListener('click', () => {
        const filters = document.getElementById('contactFilters');
        if(filters) {
          filters.classList.toggle('hidden');
        }
      });
    }

    const btnApplyFilters = document.getElementById('btnApplyFilters');
    if(btnApplyFilters) {
      btnApplyFilters.addEventListener('click', () => {
        state.filters.contact = {
          projectType: document.getElementById('filterProjectType').value,
          status: document.getElementById('filterStatus').value,
          owner: document.getElementById('filterOwner').value,
          important: document.getElementById('filterImportant').value,
          created: document.getElementById('filterCreated').value
        };
        renderContacts();
      });
    }

    const btnResetFilters = document.getElementById('btnResetFilters');
    if(btnResetFilters) {
      btnResetFilters.addEventListener('click', () => {
        state.filters.contact = {};
        document.getElementById('filterProjectType').value = '';
        document.getElementById('filterStatus').value = '';
        document.getElementById('filterOwner').value = '';
        document.getElementById('filterImportant').value = '';
        document.getElementById('filterCreated').value = '';
        renderContacts();
      });
    }

    // Help
    const helpModal = document.getElementById('modalHelp');
    const btnHelp = document.getElementById('btnHelp');
    const helpClose = document.getElementById('helpClose');

    if(btnHelp && helpModal){
      btnHelp.addEventListener('click', ()=>{
        helpModal.style.display='flex';
      });
    }

    if(helpClose && helpModal){
      helpClose.addEventListener('click', ()=>{
        helpModal.style.display='none';
      });
    }

    // Close modals when clicking on background
    document.querySelectorAll('.modal').forEach(modal=>{
      modal.addEventListener('click', e=>{
        if(e.target === modal){
          modal.style.display='none';
        }
      });
    });

    // --- Initialization ---
    (function init(){
      loadAll();
      applyStatusesToSelectors();
      loadStatusesToUI();
      
      if(state.contacts.length===0 && state.meetings.length===0 && state.tasks.length===0){
        // Small examples to see structure
        state.contacts.push({
          id:uid(),
          created_at:new Date().toISOString(),
          name:'Example - Sarah Johnson',
          phone:'555-123-4567',
          email:'sarah@example.com',
          project_type:'Consulting',
          stage:'Proposal',
          project_id:'PRJ-2023-001',
          location:'New York',
          contact_person:'John Smith',
          next_meeting:'',
          owner:'John Smith',
          source:'Referral',
          status:state.statuses.contact[0],
          important:false,
          notes:'Interested in consulting services'
        });
        
        state.meetings.push({
          id:uid(),
          date:todayStr(),
          time:'10:30',
          contact_name:'Example - Sarah Johnson',
          phone:'555-123-4567',
          email:'sarah@example.com',
          subject:'Initial meeting',
          location:'Office',
          owner:'John Smith',
          status:state.statuses.meeting[0],
          notes:''
        });
        
        state.tasks.push({
          id:uid(),
          due:todayStr(),
          contact_name:'Example - Sarah Johnson',
          task:'Prepare proposal',
          owner:'John Smith',
          priority:'Medium',
          status:state.statuses.task[0],
          notes:''
        });
        
        saveAll();
      } else {
        refreshAll();
      }

      // Setup view switcher
      const viewModeSelect = document.getElementById('view-mode-select');
      if (viewModeSelect && state.currentUser) {
        // Set initial value
        viewModeSelect.value = state.currentUser.view_mode || VIEW_MODES.ALL_DATA;

        // Update available options based on user permissions
        const availableOptions = Array.from(viewModeSelect.options).filter(opt =>
          canSwitchView(state.currentUser, opt.value)
        );

        // Disable options user can't access
        Array.from(viewModeSelect.options).forEach(opt => {
          if (!canSwitchView(state.currentUser, opt.value)) {
            opt.disabled = true;
            opt.textContent += ' (No access)';
          }
        });

        // Listen for changes
        viewModeSelect.addEventListener('change', (e) => {
          switchViewMode(e.target.value);
        });
      }
    })();

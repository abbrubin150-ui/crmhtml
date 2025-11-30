// User Belonging System - Roles, Permissions, and View Modes

export const USER_ROLES = {
  ADMIN: 'admin',
  REGIONAL_MANAGER: 'regional_manager',
  TEAM_LEAD: 'team_lead',
  SALES_REP: 'sales_rep',
  CONSULTANT: 'consultant',
  PROJECT_MANAGER: 'project_manager'
};

export const VIEW_MODES = {
  MY_DATA: 'my_data',
  TEAM_DATA: 'team_data',
  REGIONAL_DATA: 'regional_data',
  PROJECT_TYPE_DATA: 'project_type_data',
  ALL_DATA: 'all_data'
};

export const VIEW_MODE_LABELS = {
  my_data: 'My Work',
  team_data: 'My Team',
  regional_data: 'My Region',
  project_type_data: 'My Projects',
  all_data: 'All Data'
};

// Default permissions by role
export function getDefaultPermissions(role) {
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

// Default dashboard configuration by role
export function getDefaultDashboardConfig(role) {
  return {
    show_kpis: ['all'],
    show_charts: true,
    default_date_range: '7days'
  };
}

// Check if a user can switch to a specific view mode
export function canSwitchView(user, newMode) {
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

  // Sales reps and consultants can only see their own data
  return newMode === VIEW_MODES.MY_DATA;
}

// Get available view modes for a user
export function getAvailableViewModes(user) {
  if (!user) return [];

  const modes = [];

  if (user.role === 'admin') {
    return Object.values(VIEW_MODES);
  }

  if (user.role === 'regional_manager') {
    return [VIEW_MODES.MY_DATA, VIEW_MODES.TEAM_DATA, VIEW_MODES.REGIONAL_DATA];
  }

  if (user.role === 'team_lead') {
    return [VIEW_MODES.MY_DATA, VIEW_MODES.TEAM_DATA];
  }

  if (user.role === 'project_manager') {
    return [VIEW_MODES.MY_DATA, VIEW_MODES.PROJECT_TYPE_DATA];
  }

  return [VIEW_MODES.MY_DATA];
}

// Core filtering function - applies user's "world view"
export function getFilteredData(dataArray, currentUser) {
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
      if (currentUser.filter_preset && currentUser.filter_preset.owner?.length > 0) {
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
      if (currentUser.filter_preset && currentUser.filter_preset.locations?.length > 0) {
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
      if (currentUser.filter_preset && currentUser.filter_preset.project_types?.length > 0) {
        filtered = filtered.filter(item =>
          currentUser.filter_preset.project_types.includes(item.project_type)
        );
      } else {
        // Fallback to own data if no project type configured
        filtered = filtered.filter(item => item.owner === currentUser.name);
      }
      break;

    case VIEW_MODES.ALL_DATA:
    default:
      // No filtering
      break;
  }

  return filtered;
}

// Migrate existing users to include belonging system fields
export function migrateUsersToV2(users) {
  let migrated = false;
  const updatedUsers = users.map(user => {
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
  }

  return updatedUsers;
}

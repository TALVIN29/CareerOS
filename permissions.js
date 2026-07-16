(function (root) {
  const DEMO_USERS = Object.freeze([
    Object.freeze({ id: 'user-recruiter-alicia', userId: 'user-recruiter-alicia', name: 'Alicia Tan', email: 'recruiter@careeros.demo', password: 'demo123', role: 'recruiter', roleLabel: 'Recruiter', organisationId: 'vertex-digital', organisation: 'Vertex Digital', departmentId: 'technology', department: 'Technology' }),
    Object.freeze({ id: 'user-manager-daniel', userId: 'user-manager-daniel', name: 'Daniel Lee', email: 'manager@careeros.demo', password: 'demo123', role: 'hiring_manager', roleLabel: 'Hiring Manager', organisationId: 'vertex-digital', organisation: 'Vertex Digital', departmentId: 'technology', department: 'Technology' }),
    Object.freeze({ id: 'user-admin-mei', userId: 'user-admin-mei', name: 'Mei Wong', email: 'admin@careeros.demo', password: 'demo123', role: 'hr_admin', roleLabel: 'HR Administrator', organisationId: 'vertex-digital', organisation: 'Vertex Digital', departmentScope: 'Entire organisation' }),
  ]);

  const ROLE_PERMISSIONS = Object.freeze({
    recruiter: Object.freeze(['create_job', 'edit_own_job', 'run_validation', 'resolve_validation_warning', 'submit_for_approval', 'withdraw_submission', 'publish_approved_job', 'view_market_evidence', 'view_own_audit_history']),
    hiring_manager: Object.freeze(['view_assigned_jobs', 'review_validation_evidence', 'approve_assigned_job', 'request_changes', 'reject_assigned_job', 'reconfirm_active_vacancy', 'mark_team_job_filled', 'view_market_evidence', 'view_team_audit_history']),
    hr_admin: Object.freeze(['view_all_jobs', 'view_all_approvals', 'view_full_audit_log', 'view_governance_metrics', 'view_market_evidence', 'view_network_impact', 'pause_suspicious_job', 'manage_policy_settings', 'manage_users_and_roles', 'handle_escalations']),
  });

  const NAVIGATION = Object.freeze({
    recruiter: Object.freeze([
      { id: 'overview', label: 'Overview', icon: 'fa-chart-line' },
      { id: 'create', label: 'Create Job', icon: 'fa-plus-square' },
      { id: 'listings', label: 'My Job Listings', icon: 'fa-briefcase' },
      { id: 'approvals', label: 'Submitted for Approval', icon: 'fa-paper-plane' },
      { id: 'evidence', label: 'Market Evidence', icon: 'fa-chart-column' },
      { id: 'audit', label: 'My Audit History', icon: 'fa-file-lines' },
    ]),
    hiring_manager: Object.freeze([
      { id: 'overview', label: 'Overview', icon: 'fa-chart-line' },
      { id: 'approvals', label: 'Approval Queue', icon: 'fa-clipboard-check' },
      { id: 'listings', label: 'Team Vacancies', icon: 'fa-briefcase' },
      { id: 'evidence', label: 'Market Evidence', icon: 'fa-chart-column' },
      { id: 'audit', label: 'Team Audit History', icon: 'fa-file-lines' },
    ]),
    hr_admin: Object.freeze([
      { id: 'overview', label: 'Governance Overview', icon: 'fa-shield-halved' },
      { id: 'listings', label: 'All Job Listings', icon: 'fa-briefcase' },
      { id: 'approvals', label: 'Approval Oversight', icon: 'fa-clipboard-check' },
      { id: 'evidence', label: 'Market Evidence', icon: 'fa-chart-column' },
      { id: 'impact', label: 'Network Impact', icon: 'fa-network-wired' },
      { id: 'audit', label: 'Audit Log', icon: 'fa-file-lines' },
      { id: 'settings', label: 'Settings', icon: 'fa-gear' },
    ]),
  });

  const hasPermission = (userOrRole, permission) => {
    const role = typeof userOrRole === 'string' ? userOrRole : userOrRole?.role;
    return Boolean(role && ROLE_PERMISSIONS[role]?.includes(permission));
  };

  const canAccessRoute = (user, route) => Boolean(user && NAVIGATION[user.role]?.some((item) => item.id === route));
  const defaultRoute = () => 'overview';

  const canAccessJob = (user, job) => {
    if (!user || !job) return false;
    if (user.role === 'hr_admin') return true;
    if (user.role === 'recruiter') return job.recruiterId === user.userId || job.createdByUserId === user.userId;
    return job.hiringManagerId === user.userId || job.departmentId === user.departmentId;
  };

  // UI checks improve the prototype experience. Production must enforce the
  // same permissions and record-level rules in the backend/API.
  const canUser = (user, action, job) => {
    if (!hasPermission(user, action)) return false;
    if (!job) return true;
    if (action === 'edit_own_job') return canAccessJob(user, job) && ['draft', 'needs_changes', 'rejected', 'approved'].includes(job.status);
    if (action === 'publish_approved_job') return job.recruiterId === user.userId && job.status === 'approved';
    if (['approve_assigned_job', 'request_changes', 'reject_assigned_job'].includes(action)) {
      return job.hiringManagerId === user.userId && job.status === 'pending_approval' && job.recruiterId !== user.userId;
    }
    if (['reconfirm_active_vacancy', 'mark_team_job_filled'].includes(action)) return job.hiringManagerId === user.userId && ['published', 'confirmation_due', 'paused_stale'].includes(job.status);
    if (action === 'pause_suspicious_job') return ['published', 'confirmation_due'].includes(job.status);
    return canAccessJob(user, job);
  };

  root.CareerOSAuth = Object.freeze({ DEMO_USERS, ROLE_PERMISSIONS, NAVIGATION, hasPermission, canAccessRoute, defaultRoute, canAccessJob, canUser });
})(globalThis);

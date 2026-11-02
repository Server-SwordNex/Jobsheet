import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Wrench, 
  FileText, 
  Ticket, 
  Search, 
  X, 
  ExternalLink, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  FileCheck, 
  Calendar, 
  ChevronRight, 
  ShieldAlert, 
  Layers 
} from 'lucide-react';
import { toast } from 'react-toastify';
import { getSuperAdminUsersDetails } from '../../../api/endpoints';
import styles from './SuperAdminDashboard.module.css';

export default function SuperAdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [planFilter, setPlanFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchUsersDetails();
  }, []);

  const fetchUsersDetails = async () => {
    try {
      setLoading(true);
      const data = await getSuperAdminUsersDetails();
      setUsers(data || []);
    } catch (err) {
      console.error(err);
      toast.error(err.error || err.message || 'Failed to load user details');
    } finally {
      setLoading(false);
    }
  };

  // Helper: format dates
  const formatDate = (val) => {
    if (!val) return 'N/A';
    if (val._seconds) {
      return new Date(val._seconds * 1000).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    }
    if (val.seconds) {
      return new Date(val.seconds * 1000).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    }
    return new Date(val).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Metrics calculation
  const totalUsers = users.length;
  const totalSubUsers = users.reduce((acc, u) => acc + (u.subusers?.length || 0), 0);
  const totalTechnicians = users.reduce((acc, u) => acc + (u.technicians?.length || 0), 0);
  const totalJobsheets = users.reduce((acc, u) => acc + (u.jobsheets?.length || 0), 0);
  const activeTickets = users.reduce(
    (acc, u) => acc + (u.tickets?.filter((t) => t.status !== 'CLOSED').length || 0),
    0
  );

  // Dynamic lists of plans for filtering
  const plansList = ['all', ...new Set(users.map((u) => u.plan).filter(Boolean))];

  // Filtering users
  const filteredUsers = users.filter((u) => {
    const searchLower = searchQuery.toLowerCase();
    const matchSearch =
      (u.companyName || '').toLowerCase().includes(searchLower) ||
      (u.username || '').toLowerCase().includes(searchLower) ||
      (u.email || '').toLowerCase().includes(searchLower);

    const matchPlan = planFilter === 'all' || u.plan === planFilter;
    
    const status = u.subscriptionStatus || 'ACTIVE';
    const matchStatus = statusFilter === 'all' || status === statusFilter;

    return matchSearch && matchPlan && matchStatus;
  });

  const handleOpenDetails = (user) => {
    setSelectedUser(user);
    setActiveTab('overview');
  };

  const handleCloseDetails = () => {
    setSelectedUser(null);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.heading}>Super Admin Dashboard</h1>
          <p className={styles.subtitle}>Complete overview and details of all registered users and their activity.</p>
        </div>
        <button className={styles.refreshBtn} onClick={fetchUsersDetails} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className={styles.statsGrid}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>Total Users</span>
            <div className={`${styles.iconBg} ${styles.blue}`}>
              <Users size={20} />
            </div>
          </div>
          <div className={styles.cardValue}>{totalUsers}</div>
          <div className={styles.cardSub}>Registrations</div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>Sub-Users</span>
            <div className={`${styles.iconBg} ${styles.purple}`}>
              <Users size={20} />
            </div>
          </div>
          <div className={styles.cardValue}>{totalSubUsers}</div>
          <div className={styles.cardSub}>Staff & Employees</div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>Technicians</span>
            <div className={`${styles.iconBg} ${styles.green}`}>
              <Wrench size={20} />
            </div>
          </div>
          <div className={styles.cardValue}>{totalTechnicians}</div>
          <div className={styles.cardSub}>Field Workers</div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>Jobsheets</span>
            <div className={`${styles.iconBg} ${styles.amber}`}>
              <FileText size={20} />
            </div>
          </div>
          <div className={styles.cardValue}>{totalJobsheets}</div>
          <div className={styles.cardSub}>Total Generated</div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>Active Tickets</span>
            <div className={`${styles.iconBg} ${styles.red}`}>
              <Ticket size={20} />
            </div>
          </div>
          <div className={styles.cardValue}>{activeTickets}</div>
          <div className={styles.cardSub}>Requires Attention</div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className={styles.filterSection}>
        <div className={styles.searchWrapper}>
          <Search className={styles.searchIcon} size={18} />
          <input 
            type="text" 
            placeholder="Search by company name, username, or email..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <div className={styles.filtersGroup}>
          <div className={styles.selectWrapper}>
            <label>Plan:</label>
            <select value={planFilter} onChange={(e) => setPlanFilter(e.target.value)}>
              {plansList.map((plan) => (
                <option key={plan} value={plan}>
                  {plan.charAt(0).toUpperCase() + plan.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.selectWrapper}>
            <label>Status:</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="EXPIRED">Expired</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className={styles.tableWrapper}>
        {loading ? (
          <div className={styles.loadingState}>
            <div className={styles.spinner}></div>
            <p>Loading aggregated user details...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No users match the criteria.</p>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Company</th>
                <th>Primary Contact</th>
                <th>Plan & Status</th>
                <th>Metrics Summary</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.uid} className={styles.tableRow} onClick={() => handleOpenDetails(user)}>
                  <td>
                    <div className={styles.companyName}>{user.companyName || 'No Company Name'}</div>
                    <div className={styles.website}>
                      {user.website ? (
                        <a href={user.website.startsWith('http') ? user.website : `https://${user.website}`} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                          {user.website} <ExternalLink size={12} />
                        </a>
                      ) : (
                        'No Website'
                      )}
                    </div>
                  </td>
                  <td>
                    <div className={styles.contactName}>{user.username || 'N/A'}</div>
                    <div className={styles.contactEmail}>{user.email}</div>
                  </td>
                  <td>
                    <div className={styles.badgeGroup}>
                      <span className={`${styles.badgePlan} ${styles[user.plan?.toLowerCase() || 'free']}`}>
                        {user.plan || 'Free'}
                      </span>
                      <span className={`${styles.badgeStatus} ${styles[(user.subscriptionStatus || 'ACTIVE').toLowerCase()]}`}>
                        {user.subscriptionStatus || 'ACTIVE'}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className={styles.metricsGrid}>
                      <div className={styles.metricItem} title="Sub-users (Staff)">
                        <Users size={12} /> <span>{user.subusers?.length || 0}</span>
                      </div>
                      <div className={styles.metricItem} title="Technicians">
                        <Wrench size={12} /> <span>{user.technicians?.length || 0}</span>
                      </div>
                      <div className={styles.metricItem} title="Jobsheets">
                        <FileText size={12} /> <span>{user.jobsheets?.length || 0}</span>
                      </div>
                      <div className={styles.metricItem} title="Support Tickets">
                        <Ticket size={12} /> <span>{user.tickets?.length || 0}</span>
                      </div>
                    </div>
                  </td>
                  <td className={styles.createdCol}>
                    {formatDate(user.createdAt)}
                  </td>
                  <td>
                    <button className={styles.viewBtn} onClick={(e) => { e.stopPropagation(); handleOpenDetails(user); }}>
                      View Details <ChevronRight size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* User Details Sidebar (Drawer) */}
      {selectedUser && (
        <>
          <div className={styles.overlay} onClick={handleCloseDetails}></div>
          <div className={styles.drawer}>
            <div className={styles.drawerHeader}>
              <div>
                <h2 className={styles.drawerTitle}>{selectedUser.companyName || 'No Company Name'}</h2>
                <p className={styles.drawerSubtitle}>{selectedUser.email}</p>
              </div>
              <button className={styles.closeBtn} onClick={handleCloseDetails} aria-label="Close panel">
                <X size={20} />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className={styles.drawerTabs}>
              <button 
                className={`${styles.tabBtn} ${activeTab === 'overview' ? styles.tabBtnActive : ''}`} 
                onClick={() => setActiveTab('overview')}
              >
                Overview
              </button>
              <button 
                className={`${styles.tabBtn} ${activeTab === 'subusers' ? styles.tabBtnActive : ''}`} 
                onClick={() => setActiveTab('subusers')}
              >
                Sub-Users ({selectedUser.subusers?.length || 0})
              </button>
              <button 
                className={`${styles.tabBtn} ${activeTab === 'technicians' ? styles.tabBtnActive : ''}`} 
                onClick={() => setActiveTab('technicians')}
              >
                Technicians ({selectedUser.technicians?.length || 0})
              </button>
              <button 
                className={`${styles.tabBtn} ${activeTab === 'jobsheets' ? styles.tabBtnActive : ''}`} 
                onClick={() => setActiveTab('jobsheets')}
              >
                Jobsheets ({selectedUser.jobsheets?.length || 0})
              </button>
              <button 
                className={`${styles.tabBtn} ${activeTab === 'tickets' ? styles.tabBtnActive : ''}`} 
                onClick={() => setActiveTab('tickets')}
              >
                Tickets ({selectedUser.tickets?.length || 0})
              </button>
            </div>

            {/* Tab Contents */}
            <div className={styles.drawerContent}>
              
              {/* OVERVIEW TAB */}
              {activeTab === 'overview' && (
                <div className={styles.tabPane}>
                  <div className={styles.sectionHeader}>
                    <User size={18} /> <span>Account Profile</span>
                  </div>
                  <div className={styles.detailGrid}>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Username</span>
                      <span className={styles.detailValue}>{selectedUser.username || 'N/A'}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Email Address</span>
                      <span className={styles.detailValue}>{selectedUser.email}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Mobile Number</span>
                      <span className={styles.detailValue}>{selectedUser.mobileNo || 'N/A'}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>GSTIN</span>
                      <span className={styles.detailValue}>{selectedUser.gstin || 'N/A'}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Verification Status</span>
                      <span className={`${styles.detailValue} ${selectedUser.isVerified ? styles.verified : styles.unverified}`}>
                        {selectedUser.isVerified ? 'Verified' : 'Pending Verification'}
                      </span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Registration Date</span>
                      <span className={styles.detailValue}>{formatDate(selectedUser.createdAt)}</span>
                    </div>
                  </div>

                  <div className={styles.divider}></div>

                  <div className={styles.sectionHeader}>
                    <MapPin size={18} /> <span>Business Address</span>
                  </div>
                  <div className={styles.detailGrid}>
                    <div className={styles.detailItemFull}>
                      <span className={styles.detailLabel}>Address Line 1</span>
                      <span className={styles.detailValue}>{selectedUser.addressLine1 || 'N/A'}</span>
                    </div>
                    <div className={styles.detailItemFull}>
                      <span className={styles.detailLabel}>Address Line 2</span>
                      <span className={styles.detailValue}>{selectedUser.addressLine2 || 'N/A'}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>City</span>
                      <span className={styles.detailValue}>{selectedUser.city || 'N/A'}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>State</span>
                      <span className={styles.detailValue}>{selectedUser.state || 'N/A'}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Pincode</span>
                      <span className={styles.detailValue}>{selectedUser.pincode || 'N/A'}</span>
                    </div>
                  </div>

                  <div className={styles.divider}></div>

                  <div className={styles.sectionHeader}>
                    <Layers size={18} /> <span>Plan & Licensing</span>
                  </div>
                  <div className={styles.detailGrid}>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Current Plan</span>
                      <span className={`${styles.badgePlan} ${styles[selectedUser.plan?.toLowerCase() || 'free']}`}>
                        {selectedUser.plan || 'Free'}
                      </span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Plan Cost</span>
                      <span className={styles.detailValue}>₹{selectedUser.planPrice || 0} ({selectedUser.billingType || 'monthly'})</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Subscription Status</span>
                      <span className={`${styles.badgeStatus} ${styles[(selectedUser.subscriptionStatus || 'ACTIVE').toLowerCase()]}`}>
                        {selectedUser.subscriptionStatus || 'ACTIVE'}
                      </span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Jobsheet Creation Limit</span>
                      <span className={styles.detailValue}>{selectedUser.jobSheetLimit === 0 || selectedUser.jobSheetLimit === 'unlimited' ? 'Unlimited' : selectedUser.jobSheetLimit} ({selectedUser.totalJobSheetsCreated || 0} created)</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Staff Limit</span>
                      <span className={styles.detailValue}>{selectedUser.staffLimit || 0} limit ({selectedUser.subusers?.length || 0} active sub-users)</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Plan Validity</span>
                      <span className={styles.detailValue}>
                        {formatDate(selectedUser.planStartDate)} - {formatDate(selectedUser.planEndDate)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* SUBUSERS TAB */}
              {activeTab === 'subusers' && (
                <div className={styles.tabPane}>
                  {selectedUser.subusers?.length === 0 ? (
                    <div className={styles.panelEmptyState}>
                      <Users size={32} />
                      <p>No sub-users registered for this account.</p>
                    </div>
                  ) : (
                    <div className={styles.scrollContainer}>
                      <table className={styles.panelTable}>
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Email / Phone</th>
                            <th>Branch</th>
                            <th>Role</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedUser.subusers.map((sub) => (
                            <tr key={sub.uid}>
                              <td>
                                <div className={styles.boldText}>{sub.subUserName || sub.username || 'N/A'}</div>
                                <div className={styles.dimText}>Emp ID: {sub.empId || 'N/A'}</div>
                              </td>
                              <td>
                                <div>{sub.email}</div>
                                <div className={styles.dimText}>{sub.phone || 'No phone'}</div>
                              </td>
                              <td>{sub.subBranchName || 'Main'}</td>
                              <td>
                                <span className={styles.roleBadge}>{sub.role || 'team'}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* TECHNICIANS TAB */}
              {activeTab === 'technicians' && (
                <div className={styles.tabPane}>
                  {selectedUser.technicians?.length === 0 ? (
                    <div className={styles.panelEmptyState}>
                      <Wrench size={32} />
                      <p>No technicians created by this account.</p>
                    </div>
                  ) : (
                    <div className={styles.scrollContainer}>
                      <table className={styles.panelTable}>
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Email / Phone</th>
                            <th>Specialization</th>
                            <th>Jobs Summary</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedUser.technicians.map((tech) => (
                            <tr key={tech.id}>
                              <td>
                                <div className={styles.boldText}>{tech.name}</div>
                                <div className={styles.dimText}>ID: {tech.id?.slice(-6) || 'N/A'}</div>
                              </td>
                              <td>
                                <div>{tech.email}</div>
                                <div className={styles.dimText}>{tech.mobileNo || 'No phone'}</div>
                              </td>
                              <td>{tech.specialization || 'General'}</td>
                              <td>
                                <div className={styles.dimText}>
                                  Assigned: <strong>{tech.totalAssignedJobs || tech.assignedJobsheets?.length || 0}</strong>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* JOBSHEETS TAB */}
              {activeTab === 'jobsheets' && (
                <div className={styles.tabPane}>
                  {selectedUser.jobsheets?.length === 0 ? (
                    <div className={styles.panelEmptyState}>
                      <FileText size={32} />
                      <p>No jobsheets generated by this account.</p>
                    </div>
                  ) : (
                    <div className={styles.scrollContainer}>
                      <table className={styles.panelTable}>
                        <thead>
                          <tr>
                            <th>Jobsheet No</th>
                            <th>Client / Vehicle</th>
                            <th>Status</th>
                            <th>Created Date</th>
                            <th>Link</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedUser.jobsheets.map((js) => (
                            <tr key={js.id}>
                              <td>
                                <span className={styles.boldText}>{js.jobsheetNo}</span>
                              </td>
                              <td>
                                <div className={styles.boldText}>{js.clientName || 'N/A'}</div>
                                <div className={styles.dimText}>{js.vehicleBrand} {js.vehicleModel}</div>
                              </td>
                              <td>
                                <span className={`${styles.statusDot} ${styles[js.status || 'initiated']}`}>
                                  {js.status || 'Initiated'}
                                </span>
                              </td>
                              <td>{formatDate(js.createdAt)}</td>
                              <td>
                                {js.pdfLink ? (
                                  <a href={js.pdfLink} target="_blank" rel="noopener noreferrer" className={styles.linkIcon} title="Open PDF">
                                    <ExternalLink size={16} />
                                  </a>
                                ) : (
                                  'N/A'
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* TICKETS TAB */}
              {activeTab === 'tickets' && (
                <div className={styles.tabPane}>
                  {selectedUser.tickets?.length === 0 ? (
                    <div className={styles.panelEmptyState}>
                      <Ticket size={32} />
                      <p>No support tickets submitted by this account email.</p>
                    </div>
                  ) : (
                    <div className={styles.scrollContainer}>
                      <table className={styles.panelTable}>
                        <thead>
                          <tr>
                            <th>Ticket ID</th>
                            <th>Query Details</th>
                            <th>Status</th>
                            <th>Submitted At</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedUser.tickets.map((t) => (
                            <tr key={t.id || t.ticketId}>
                              <td>
                                <span className={styles.boldText}>{t.ticketId}</span>
                              </td>
                              <td>
                                <div className={styles.queryText} title={t.query}>{t.query}</div>
                              </td>
                              <td>
                                <span className={`${styles.ticketBadge} ${styles[t.status?.toLowerCase() || 'open']}`}>
                                  {t.status}
                                </span>
                              </td>
                              <td>{formatDate(t.createdAt)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </>
      )}
    </div>
  );
}

import { createContext, useContext, useState, useCallback } from 'react';
import {
  subcontractors as initialSubs,
  generalContractors,
  gcSubcontractors as initialGcSubs,
  certificates,
  insuranceAgents,
  subAgentAssignments,
  verificationRequests as initialVerifications,
  notifications as initialNotifications,
  emailLog as initialEmailLog,
  w9Documents,
} from '../data/mockData';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [subcontractors, setSubcontractors] = useState(initialSubs);
  const [gcSubs, setGcSubs] = useState(initialGcSubs);
  const [verifications, setVerifications] = useState(initialVerifications);
  const [notificationsList, setNotifications] = useState(initialNotifications);
  const [emails, setEmails] = useState(initialEmailLog);

  const addSubcontractor = useCallback((sub, gcId) => {
    const newId = Math.max(...subcontractors.map(s => s.id)) + 1;
    const newSub = {
      ...sub,
      id: newId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setSubcontractors(prev => [...prev, newSub]);

    if (gcId) {
      const newLinkId = Math.max(...gcSubs.map(gs => gs.id)) + 1;
      setGcSubs(prev => [...prev, { id: newLinkId, gc_id: gcId, subcontractor_id: newId, added_at: new Date().toISOString() }]);
    }

    return newSub;
  }, [subcontractors, gcSubs]);

  const getSubsForGC = useCallback((gcId) => {
    const subIds = gcSubs.filter(gs => gs.gc_id === gcId).map(gs => gs.subcontractor_id);
    return subcontractors.filter(s => subIds.includes(s.id));
  }, [gcSubs, subcontractors]);

  const getGCsForConsultant = useCallback((consultantId) => {
    return generalContractors.filter(gc => gc.consultant_id === consultantId);
  }, []);

  const getCertsForSub = useCallback((subId) => {
    return certificates.filter(c => c.subcontractor_id === subId);
  }, []);

  const getAgentForSub = useCallback((subId) => {
    const assignment = subAgentAssignments.find(a => a.subcontractor_id === subId);
    if (!assignment) return null;
    return insuranceAgents.find(a => a.id === assignment.agent_id) || null;
  }, []);

  const getW9ForSub = useCallback((subId) => {
    return w9Documents.find(w => w.subcontractor_id === subId) || null;
  }, []);

  const addNotification = useCallback((notification) => {
    const newId = Math.max(...notificationsList.map(n => n.id)) + 1;
    setNotifications(prev => [{ ...notification, id: newId, created_at: new Date().toISOString() }, ...prev]);
  }, [notificationsList]);

  const markNotificationRead = useCallback((id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const logEmail = useCallback((email) => {
    const newId = Math.max(...emails.map(e => e.id), 0) + 1;
    setEmails(prev => [...prev, { ...email, id: newId, sent_at: new Date().toISOString() }]);
  }, [emails]);

  const addVerification = useCallback((verification) => {
    const newId = Math.max(...verifications.map(v => v.id), 0) + 1;
    const token = 'vrf_' + Math.random().toString(36).slice(2, 14);
    const newV = {
      ...verification,
      id: newId,
      token,
      status: 'sent',
      sent_at: new Date().toISOString(),
      responded_at: null,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };
    setVerifications(prev => [...prev, newV]);
    return newV;
  }, [verifications]);

  return (
    <DataContext.Provider value={{
      subcontractors,
      generalContractors,
      gcSubs,
      certificates,
      insuranceAgents,
      w9Documents,
      verifications,
      notifications: notificationsList,
      emails,
      addSubcontractor,
      getSubsForGC,
      getGCsForConsultant,
      getCertsForSub,
      getAgentForSub,
      getW9ForSub,
      addNotification,
      markNotificationRead,
      markAllNotificationsRead,
      logEmail,
      addVerification,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}

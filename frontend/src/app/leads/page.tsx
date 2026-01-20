"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Mail, 
  MoreHorizontal, 
  RefreshCw, 
  X, 
  ChevronRight, 
  Filter, 
  Download, 
  ExternalLink,
  Calendar,
  Clock,
  Send,
  User,
  Trash2,
  CheckSquare,
  Square,
  Edit3
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Lead {
  id: string;
  name: string;
  emails: string[];
  phones: string[];
  company?: string;
  jobTitle?: string;
  city?: string;
  priority: string;
  status: string;
}

interface GmailMessage {
  id: string;
  internalDate: string;
  snippet: string;
  extractedBody?: string;
  payload: {
    headers: { name: string; value: string }[];
  };
}

interface GmailThread {
  id: string;
  threadId: string;
  subject: string;
  snippet: string;
  lastMessageDate: string;
  lead?: Lead;
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [threads, setThreads] = useState<GmailThread[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [leadThreads, setLeadThreads] = useState<GmailThread[]>([]);
  const [selectedThreadMessages, setSelectedThreadMessages] = useState<{id: string, messages: GmailMessage[]} | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [isFetchingMessages, setIsFetchingMessages] = useState<string | null>(null);
  const [menuOpenLeadId, setMenuOpenLeadId] = useState<string | null>(null);

  // Filter & Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterPriority, setFilterPriority] = useState<string>('All');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Selection & Export States
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [isEditingCompany, setIsEditingCompany] = useState(false);
  const [tempCompany, setTempCompany] = useState('');

  useEffect(() => {
    fetchData();
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      const res = await axios.get('http://localhost:3001/api/gmail/status');
      setIsConnected(res.data.isConnected);
    } catch (error) {
      console.error('Error checking Gmail status:', error);
    }
  };

  const connectGmail = async () => {
    if (isConnected) {
        try {
            await axios.post('http://localhost:3001/api/gmail/disconnect');
            setIsConnected(false);
        } catch (error) {
            console.error('Error disconnecting:', error);
        }
    } else {
        try {
            const res = await axios.get('http://localhost:3001/api/gmail/auth-url');
            window.open(res.data.url, '_blank');
        } catch (error) {
            console.error('Error getting auth URL:', error);
        }
    }
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [leadsRes, threadsRes] = await Promise.all([
        axios.get('http://localhost:3001/api/leads'),
        axios.get('http://localhost:3001/api/gmail/threads')
      ]);
      setLeads(leadsRes.data);
      setThreads(threadsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const syncGmail = async () => {
    setIsSyncing(true);
    try {
      await axios.post('http://localhost:3001/api/gmail/sync');
      await fetchData();
    } catch (error) {
      console.error('Error syncing Gmail:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const openLeadDetail = async (lead: Lead, initialThreadId?: string) => {
    setSelectedLead(lead);
    const filteredThreads = threads.filter(t => t.lead?.id === lead.id);
    setLeadThreads(filteredThreads);
    setSelectedThreadMessages(null);
    if (initialThreadId) {
        fetchThreadMessages(initialThreadId);
    }
  };

  const fetchThreadMessages = async (threadId: string) => {
    setIsFetchingMessages(threadId);
    try {
      const res = await axios.get(`http://localhost:3001/api/gmail/threads/${threadId}/messages`);
      setSelectedThreadMessages({ id: threadId, messages: res.data.messages || [] });
    } catch (error) {
      console.error('Error fetching thread messages:', error);
    } finally {
      setIsFetchingMessages(null);
    }
  };

  const sendReply = async (threadId: string) => {
    if (!replyText.trim()) return;
    setIsSendingReply(true);
    try {
      await axios.post(`http://localhost:3001/api/gmail/threads/${threadId}/reply`, { text: replyText });
      setReplyText('');
      await fetchThreadMessages(threadId); 
      // Refresh local leads to show new status
      fetchData();
    } catch (error) {
      console.error('Error sending reply:', error);
      alert('Failed to send reply.');
    } finally {
      setIsSendingReply(false);
    }
  };

  const updateLeadStatus = async (leadId: string, status: string) => {
    try {
      await axios.patch(`http://localhost:3001/api/leads/${leadId}`, { status });
      setLeads(leads.map(l => l.id === leadId ? { ...l, status } : l));
      if (selectedLead?.id === leadId) setSelectedLead({ ...selectedLead, status });
    } catch (error) {
      console.error('Error updating lead status:', error);
    }
  };

  const updateLeadPriority = async (leadId: string, priority: string) => {
    try {
      await axios.patch(`http://localhost:3001/api/leads/${leadId}`, { priority });
      setLeads(leads.map(l => l.id === leadId ? { ...l, priority } : l));
      if (selectedLead?.id === leadId) setSelectedLead({ ...selectedLead, priority: priority as any });
    } catch (error) {
      console.error('Error updating priority:', error);
    }
  };

  const updateLeadCompany = async (leadId: string) => {
    try {
      await axios.patch(`http://localhost:3001/api/leads/${leadId}`, { company: tempCompany });
      setLeads(leads.map(l => l.id === leadId ? { ...l, company: tempCompany } : l));
      if (selectedLead?.id === leadId) setSelectedLead({ ...selectedLead, company: tempCompany } as any);
      setIsEditingCompany(false);
    } catch (error) {
      console.error('Error updating company:', error);
    }
  };

  const deleteSelectedLeads = async () => {
    if (selectedLeadIds.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedLeadIds.length} leads?`)) return;
    
    try {
      await axios.post('http://localhost:3001/api/leads/bulk-delete', { ids: selectedLeadIds });
      setLeads(leads.filter(l => !selectedLeadIds.includes(l.id)));
      setSelectedLeadIds([]);
    } catch (error) {
      console.error('Error in bulk delete:', error);
      alert('Failed to delete selected leads.');
    }
  };

  const handleExport = async () => {
    const format = window.confirm("Export as JSON? (Click CANCEL for CSV)") ? 'json' : 'csv';
    setIsExporting(true);

    try {
      const exportData = [];
      const idsToExport = selectedLeadIds.length > 0 ? selectedLeadIds : filteredLeads.map(l => l.id);

      for (const id of idsToExport) {
        const lead = leads.find(l => l.id === id);
        if (!lead) continue;

        // Fetch all threads for this lead
        const leadThreads = threads.filter(t => t.lead?.id === lead.id);
        const threadDetails = [];

        for (const t of leadThreads) {
          const msgRes = await axios.get(`http://localhost:3001/api/gmail/threads/${t.threadId}/messages`);
          threadDetails.push({
            subject: t.subject,
            snippet: t.snippet,
            date: t.lastMessageDate,
            messages: msgRes.data.messages.map((m: GmailMessage) => ({
              from: m.payload.headers.find((h) => h.name?.toLowerCase() === 'from')?.value,
              date: new Date(Number(m.internalDate)).toLocaleString(),
              body: m.extractedBody
            }))
          });
        }

        exportData.push({
          lead: {
            name: lead.name,
            emails: lead.emails,
            company: lead.company,
            status: lead.status,
            priority: lead.priority
          },
          conversations: threadDetails
        });
      }

      const fileName = `leads_export_${new Date().toISOString().split('T')[0]}.${format}`;
      
      if (format === 'json') {
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click();
      } else {
        // Flat CSV for simple export (detailed threads in CSV is hard, so we provide lead info + summary)
        const headers = ['Name', 'Email', 'Company', 'Priority', 'Status', 'Thread Count'];
        const rows = exportData.map(d => [
          d.lead.name,
          d.lead.emails?.[0] || '',
          d.lead.company || '',
          d.lead.priority,
          d.lead.status,
          d.conversations.length
        ]);
        const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click();
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export leads.');
    } finally {
      setIsExporting(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedLeadIds.length === filteredLeads.length) {
      setSelectedLeadIds([]);
    } else {
      setSelectedLeadIds(filteredLeads.map(l => l.id));
    }
  };

  const toggleSelectLead = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (selectedLeadIds.includes(id)) {
      setSelectedLeadIds(selectedLeadIds.filter(i => i !== id));
    } else {
      setSelectedLeadIds([...selectedLeadIds, id]);
    }
  };

  const exportLeadsToCSV = () => {
    if (leads.length === 0) return;
    
    const headers = ['Name', 'Email', 'Company', 'Job Title', 'City', 'Priority', 'Status'];
    const rows = leads.map(l => [
      l.name,
      l.emails?.[0] || '',
      l.company || '',
      l.jobTitle || '',
      l.city || '',
      l.priority,
      l.status
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `leads_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         lead.emails?.some(e => e.toLowerCase().includes(searchQuery.toLowerCase())) ||
                         lead.company?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'All' || lead.status === filterStatus;
    const matchesPriority = filterPriority === 'All' || lead.priority === filterPriority;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Page Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Leads & Sync</h1>
          <p className="text-sm text-slate-500 font-medium">Manage incoming inquiries and sync Gmail conversations.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={connectGmail}
            className={`flex items-center gap-2 h-10 px-4 rounded-lg font-bold text-xs uppercase tracking-wider transition-all border ${
              isConnected 
                ? 'bg-red-50 text-red-600 border-red-100 hover:bg-red-100' 
                : 'bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-100'
            }`}
          >
            <Mail size={16} />
            {isConnected ? 'Disconnect' : 'Connect Gmail'}
          </button>
          
          <button 
            onClick={syncGmail}
            disabled={isSyncing || !isConnected}
            className="btn-primary h-10 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed group"
          >
            <RefreshCw size={16} className={isSyncing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Table Content */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <User size={14} className="text-indigo-500" /> Active Leads ({filteredLeads.length})
            </h2>
            <div className="flex items-center gap-2 relative">
              {selectedLeadIds.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 mr-2 pr-2 border-r border-slate-200"
                >
                  <button 
                    onClick={deleteSelectedLeads}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-red-100 transition-all border border-red-100"
                  >
                    <Trash2 size={12} /> Delete ({selectedLeadIds.length})
                  </button>
                  <button 
                    onClick={handleExport}
                    disabled={isExporting}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-indigo-100 transition-all border border-indigo-100"
                  >
                    <Download size={12} /> {isExporting ? 'Exporting...' : 'Export All'}
                  </button>
                </motion.div>
              )}

              <div className="relative">
                <input 
                  type="text"
                  placeholder="Quick search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 pl-8 pr-3 text-[11px] bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all outline-none w-40"
                />
                <motion.div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <User size={12} />
                </motion.div>
              </div>

              <div className="relative">
                <button 
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className={cn(
                    "p-1.5 rounded-lg transition-all border",
                    isFilterOpen || filterStatus !== 'All' || filterPriority !== 'All' 
                    ? "bg-indigo-50 text-indigo-600 border-indigo-100" 
                    : "text-slate-400 hover:text-indigo-600 hover:bg-slate-50 border-transparent"
                  )}
                >
                  <Filter size={16} />
                </button>

                <AnimatePresence>
                  {isFilterOpen && (
                    <>
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-30"
                        onClick={() => setIsFilterOpen(false)}
                      />
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 z-40 p-4 space-y-4"
                      >
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Status Filter</p>
                          <div className="flex flex-wrap gap-1.5">
                            {['All', 'New & Unread', 'Waiting for Response', 'Working', 'Successful'].map(s => (
                              <button 
                                key={s} 
                                onClick={() => setFilterStatus(s)}
                                className={cn(
                                  "px-2 py-1 rounded-md text-[10px] font-bold border transition-all",
                                  filterStatus === s ? "bg-indigo-600 text-white border-indigo-600" : "bg-slate-50 text-slate-500 border-slate-200 hover:border-indigo-200"
                                )}
                              >
                                {s}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Priority Filter</p>
                          <div className="flex gap-1.5">
                            {['All', 'High', 'Medium', 'Low'].map(p => (
                              <button 
                                key={p} 
                                onClick={() => setFilterPriority(p)}
                                className={cn(
                                  "px-2 py-1 rounded-md text-[10px] font-bold border transition-all",
                                  filterPriority === p ? "bg-indigo-600 text-white border-indigo-600" : "bg-slate-50 text-slate-500 border-slate-200 hover:border-indigo-200"
                                )}
                              >
                                {p}
                              </button>
                            ))}
                          </div>
                        </div>
                        <button 
                          onClick={() => {
                            setFilterStatus('All');
                            setFilterPriority('All');
                            setSearchQuery('');
                          }}
                          className="w-full py-2 bg-slate-50 rounded-xl text-[10px] font-black text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-all uppercase tracking-widest"
                        >
                          Reset Filters
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {isLoading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
                <RefreshCw size={32} className="animate-spin text-indigo-200" />
                <p className="text-sm font-medium">Crunching lead data...</p>
              </div>
            ) : leads.length === 0 ? (
              <div className="py-20 flex flex-col items-center justify-center gap-4 text-center px-4">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                    <User size={32} />
                </div>
                <div className="max-w-xs">
                    <p className="text-slate-900 font-bold">No leads found</p>
                    <p className="text-slate-500 text-sm mt-1">Connect your Gmail and sync to import potential leads from your inbox.</p>
                </div>
                <button onClick={syncGmail} className="btn-secondary mt-2">Sync Now</button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100">
                      <th className="px-6 py-4 w-10">
                        <button onClick={toggleSelectAll} className="text-slate-400 hover:text-indigo-600 transition-colors">
                          {selectedLeadIds.length === filteredLeads.length && filteredLeads.length > 0 ? <CheckSquare size={18} /> : <Square size={18} />}
                        </button>
                      </th>
                      <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-400">Lead Detail</th>
                      <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-400">Priority</th>
                      <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-400">Status</th>
                      <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-400">Contact</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeads.map((lead) => {
                      const isSelected = selectedLeadIds.includes(lead.id);
                      return (
                        <tr 
                          key={lead.id} 
                          onClick={() => openLeadDetail(lead)}
                          className={cn(
                            "group border-b border-slate-50 last:border-0 hover:bg-slate-50/80 cursor-pointer transition-all duration-200",
                            isSelected && "bg-indigo-50/30 hover:bg-indigo-50/50"
                          )}
                        >
                          <td className="px-6 py-4">
                            <button 
                              onClick={(e) => toggleSelectLead(e, lead.id)}
                              className={cn(
                                "transition-colors",
                                isSelected ? "text-indigo-600" : "text-slate-300 hover:text-indigo-400"
                              )}
                            >
                              {isSelected ? <CheckSquare size={18} /> : <Square size={18} />}
                            </button>
                          </td>
                          <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                              {lead.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900 leading-none mb-1 group-hover:text-indigo-600 transition-colors">{lead.name}</p>
                              <p className="text-[11px] text-slate-400 font-medium truncate max-w-[150px]">{lead.company || 'Private Lead'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            lead.priority === 'High' ? 'bg-red-50 text-red-600 border border-red-100' : 
                            lead.priority === 'Medium' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 
                            'bg-emerald-50 text-emerald-600 border border-emerald-100'
                          }`}>
                            {lead.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`${
                            lead.status === 'New & Unread' ? 'text-blue-600 bg-blue-50' : 
                            lead.status === 'Waiting for Response' ? 'text-amber-600 bg-amber-50' : 
                            lead.status === 'Working' ? 'text-indigo-600 bg-indigo-50' : 
                            'text-emerald-600 bg-emerald-50'
                          } text-[10px] font-bold px-2 py-1 rounded-md border border-current/10 whitespace-nowrap`}>
                            {lead.status || 'New & Unread'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-[12px] font-medium text-slate-600 hover:text-indigo-500 underline decoration-slate-200 underline-offset-4">{lead.emails?.[0]}</p>
                        </td>

                      </tr>
                    )})}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Threads Content */}
        <div className="lg:col-span-4 space-y-4">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 px-2">
            <Mail size={14} className="text-indigo-500" /> Recent Threads
          </h2>
          
          <div className="space-y-3">
            {!isLoading && threads.length === 0 && (
                <div className="p-12 text-center rounded-2xl border-2 border-dashed border-slate-200">
                    <Mail size={24} className="mx-auto text-slate-200 mb-2" />
                    <p className="text-xs font-bold text-slate-400">No conversations</p>
                </div>
            )}
            {threads.map((thread) => (
              <motion.div 
                whileHover={{ y: -2 }}
                key={thread.id} 
                onClick={() => {
                   const lead = leads.find(l => l.id === thread.lead?.id);
                   if (lead) openLeadDetail(lead, thread.threadId);
                }}
                className="group p-4 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-300 hover:shadow-md hover:shadow-indigo-500/5 transition-all cursor-pointer relative"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                        {thread.lead?.name.charAt(0) || '?'}
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate max-w-[120px]">
                        {thread.lead?.name || 'Inquiry'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">
                      {new Date(thread.lastMessageDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors truncate">{thread.subject}</h3>
                <p className="text-[12px] text-slate-500 line-clamp-2 leading-relaxed font-medium">{thread.snippet}</p>
                
                <div className="mt-2 flex items-center gap-1 text-[10px] text-indigo-600 font-bold uppercase tracking-tight opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>View Conversation</span>
                    <ChevronRight size={12} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Modern Side Drawer */}
      <AnimatePresence>
        {selectedLead && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-all"
              onClick={() => setSelectedLead(null)}
            />
            <motion.div 
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed right-0 top-0 bottom-0 w-full max-w-xl bg-white border-l border-slate-200 z-50 flex flex-col shadow-2-xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Drawer Header */}
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-indigo-100">
                            {selectedLead.name.charAt(0)}
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900 tracking-tight leading-none mb-1">{selectedLead.name}</h2>
                            <div className="flex items-center gap-2">
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{selectedLead.emails?.[0]}</span>
                                <div className="p-1 bg-white border border-slate-200 rounded cursor-pointer hover:text-indigo-600"><ExternalLink size={10} /></div>
                            </div>
                        </div>
                    </div>
                    <button 
                        onClick={() => setSelectedLead(null)}
                        className="p-2 text-slate-400 hover:text-slate-900 hover:bg-white rounded-xl transition-all border border-transparent hover:border-slate-200"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Drawer Content Area */}
                <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50 flex flex-col">
                    <div className="p-6 space-y-6">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-3 gap-3">
                            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                                <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Priority</p>
                                <div className="flex items-center gap-1.5">
                                    <div className={`w-2 h-2 rounded-full ${selectedLead.priority === 'High' ? 'bg-red-500' : selectedLead.priority === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                                    <select 
                                        value={selectedLead.priority}
                                        onChange={(e) => updateLeadPriority(selectedLead.id, e.target.value)}
                                        className="text-xs font-bold text-slate-900 bg-transparent border-none p-0 focus:ring-0 cursor-pointer w-full"
                                    >
                                        <option value="High">High</option>
                                        <option value="Medium">Medium</option>
                                        <option value="Low">Low</option>
                                    </select>
                                </div>
                            </div>
                            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm transition-all hover:border-indigo-100">
                                <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Lead Status</p>
                                <div className="flex items-center group/status">
                                    <select 
                                        value={selectedLead.status || 'New & Unread'}
                                        onChange={(e) => updateLeadStatus(selectedLead.id, e.target.value)}
                                        className="text-xs font-bold text-slate-900 bg-transparent border-none p-0 focus:ring-0 cursor-pointer w-full"
                                    >
                                        <option value="New & Unread">New & Unread</option>
                                        <option value="Waiting for Response">Waiting Response</option>
                                        <option value="Working">Working</option>
                                        <option value="Successful">Successful</option>
                                    </select>
                                </div>
                            </div>
                            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm relative group/company overflow-hidden">
                                <div className="flex justify-between items-start mb-1">
                                    <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">Company</p>
                                    {!isEditingCompany && (
                                        <button 
                                            onClick={() => {
                                                setTempCompany(selectedLead.company || '');
                                                setIsEditingCompany(true);
                                            }}
                                            className="text-slate-300 hover:text-indigo-600 opacity-0 group-hover/company:opacity-100 transition-all"
                                        >
                                            <Edit3 size={10} />
                                        </button>
                                    )}
                                </div>
                                {isEditingCompany ? (
                                    <div className="flex items-center gap-1">
                                        <input 
                                            autoFocus
                                            value={tempCompany}
                                            onChange={(e) => setTempCompany(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && updateLeadCompany(selectedLead.id)}
                                            className="text-xs font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 w-full outline-none focus:border-indigo-400"
                                        />
                                        <button onClick={() => updateLeadCompany(selectedLead.id)} className="text-indigo-600"><CheckSquare size={14} /></button>
                                    </div>
                                ) : (
                                    <span className="text-xs font-bold text-slate-900 truncate block">
                                        {selectedLead.company || 'Not Specified'}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Conversations Section */}
                        <div className="space-y-4">
                            <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-800 flex items-center gap-2">
                                <Mail size={14} className="text-indigo-500" /> Lead Conversations
                            </h3>
                            
                            {leadThreads.length === 0 ? (
                                <div className="bg-slate-100/50 border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center">
                                    <Mail size={32} className="mx-auto text-slate-300 mb-2 opacity-30" />
                                    <p className="text-slate-400 text-sm font-medium italic">No conversations linked yet.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {leadThreads.map(thread => {
                                        const isOpen = selectedThreadMessages?.id === thread.threadId;
                                        return (
                                            <div key={thread.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all">
                                                <div 
                                                    onClick={() => !isOpen ? fetchThreadMessages(thread.threadId) : setSelectedThreadMessages(null)}
                                                    className={`p-4 flex justify-between items-center cursor-pointer transition-colors ${isOpen ? 'bg-slate-50 py-3 border-b border-slate-100' : 'hover:bg-slate-50'}`}
                                                >
                                                    <div className="flex-1 min-w-0 pr-4">
                                                        <h4 className={`text-sm tracking-tight truncate ${isOpen ? 'font-black text-indigo-600' : 'font-bold text-slate-900 group-hover:text-indigo-600'}`}>
                                                            {thread.subject}
                                                        </h4>
                                                        <div className="flex items-center gap-3 mt-1">
                                                            <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                                                                <Calendar size={10} />
                                                                {new Date(thread.lastMessageDate).toLocaleDateString()}
                                                            </div>
                                                            <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                                                                <Clock size={10} />
                                                                {new Date(thread.lastMessageDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className={`p-1.5 rounded-lg transition-all ${isOpen ? 'bg-indigo-600 text-white rotate-180' : 'bg-slate-100 text-slate-400 rotate-0'}`}>
                                                        {isFetchingMessages === thread.threadId ? <RefreshCw size={14} className="animate-spin" /> : <ChevronRight size={14} />}
                                                    </div>
                                                </div>

                                                {/* Thread Messages Body */}
                                                {isOpen && (
                                                    <div className="bg-white flex flex-col h-[500px]">
                                                        {/* Messages Feed */}
                                                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30 custom-scrollbar">
                                                            {selectedThreadMessages.messages.map((msg) => {
                                                                const fromHeader = msg.payload.headers.find((h) => h.name?.toLowerCase() === 'from')?.value;
                                                                const date = new Date(Number(msg.internalDate)).toLocaleString();
                                                                
                                                                // Use the lead's email to determine if the message is FROM the lead (customer)
                                                                // If it's NOT from the lead's email, we assume it's from US (me)
                                                                const isFromLead = selectedLead.emails?.some(email => fromHeader?.toLowerCase().includes(email.toLowerCase()));
                                                                const isMe = !isFromLead;
                                                                
                                                                return (
                                                                    <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                                                        <div className={`max-w-[85%] group`}>
                                                                            {!isMe && (
                                                                                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest ml-2 mb-1 flex items-center gap-1">
                                                                                    <User size={10} /> {fromHeader?.split('<')[0].trim()}
                                                                                </p>
                                                                            )}
                                                                            {isMe && (
                                                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2 mb-1 text-right flex items-center justify-end gap-1">
                                                                                    You <Clock size={10} />
                                                                                </p>
                                                                            )}
                                                                            <div className={`p-4 rounded-2xl text-[13px] leading-[1.6] shadow-sm whitespace-pre-wrap ${
                                                                                isMe 
                                                                                ? 'bg-indigo-600 text-white rounded-tr-none' 
                                                                                : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none ring-4 ring-slate-100/50'
                                                                            }`}>
                                                                                {msg.extractedBody || msg.snippet}
                                                                            </div>
                                                                            <p className={`mt-1.5 text-[9px] font-bold text-slate-400 px-2 uppercase tracking-tight ${isMe ? 'text-right' : 'text-left'}`}>
                                                                                {date}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>

                                                        {/* Reply Compose Area */}
                                                        <div className="p-4 border-t border-slate-100 bg-white">
                                                            <div className="bg-slate-50 rounded-2xl border border-slate-200 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
                                                                <textarea 
                                                                    value={replyText}
                                                                    onChange={(e) => setReplyText(e.target.value)}
                                                                    placeholder="Type your response..."
                                                                    className="w-full bg-transparent border-none p-4 text-sm text-slate-900 placeholder-slate-400 focus:ring-0 resize-none h-24"
                                                                />
                                                                <div className="flex items-center justify-between px-4 pb-3">
                                                                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest hidden sm:block">
                                                                        Recipient: {selectedLead.name.split(' ')[0]}
                                                                    </div>
                                                                    <button 
                                                                        onClick={() => sendReply(thread.threadId)}
                                                                        disabled={isSendingReply || !replyText.trim()}
                                                                        className="flex items-center gap-2 bg-slate-900 hover:bg-black disabled:bg-slate-200 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg active:scale-95"
                                                                    >
                                                                        {isSendingReply ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
                                                                        <span>Send Reply</span>
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

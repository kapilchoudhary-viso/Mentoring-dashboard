import React, { useState, useMemo, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Search,
  Bell,
  Settings,
  Users,
  LayoutDashboard,
  FileText,
  History,
  Upload,
  Download,
  Filter,
  MoreHorizontal,
  ChevronDown,
  UserPlus,
  X,
  CheckCircle,
  AlertCircle,
  Menu,
  ExternalLink,
  ChevronRight,
  ArrowLeft,
  Briefcase,
  Mail,
  BadgeCheck,
  LogOut,
  BookOpen,
  MessageSquare,
  Video,
  Calendar,
  Phone,
  User,
  Shield,
  Award,
  Clock,
  Mic,
  FileCheck
} from 'lucide-react';

// --- Shared Types ---

import { Student, Mentor, AuditLog, KPI } from './types';
import { INITIAL_STUDENTS, MENTORS, AUDIT_LOGS } from './mockData';

// --- Admin Components ---

const Sidebar = ({ activeTab, setActiveTab, isOpen, setIsOpen, onLogout }: any) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'allocation-queue', label: 'Batchwise Student List', icon: Users },
    { id: 'mentor-directory', label: 'Mentor Directory', icon: UserPlus },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden" onClick={() => setIsOpen(false)} />}
      <div className={`fixed lg:static inset-y-0 left-0 z-30 w-[280px] bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex flex-col h-full">
          <div className="h-[72px] flex items-center px-6 border-b border-gray-100">
            <div>
              <div className="text-xl font-bold text-indigo-900 leading-tight">VisionIAS</div>
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Mentoring Portal</div>
            </div>
          </div>
          <div className="flex-1 py-6 space-y-1 px-3">
            <div className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase">Admin Menu</div>
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setIsOpen(false); }}
                className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${activeTab === item.id ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'}`}
              >
                {activeTab === item.id && <div className="absolute left-0 w-[3px] h-8 bg-indigo-600 rounded-r-full" />}
                <item.icon className={`w-5 h-5 mr-3 ${activeTab === item.id ? 'text-indigo-600' : 'text-gray-400'}`} />
                {item.label}
              </button>
            ))}
          </div>
          <div className="p-4 border-t border-gray-200">
            <button onClick={onLogout} className="flex items-center text-sm font-medium text-red-600 hover:text-red-800 w-full p-2 hover:bg-red-50 rounded-md">
              <LogOut className="w-4 h-4 mr-2" /> Back to Portals
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

const KPICard: React.FC<{ kpi: KPI }> = ({ kpi }) => (
  <div className={`bg-white rounded-lg p-4 border border-gray-200 shadow-sm flex flex-col justify-between min-w-[200px] ${kpi.alert ? 'border-l-4 border-l-red-500' : ''}`}>
    <div className="flex justify-between items-start mb-2"><h3 className="text-sm font-medium text-gray-500 truncate">{kpi.title}</h3></div>
    <div><div className={`text-2xl font-bold ${kpi.alert ? 'text-red-600' : 'text-gray-900'}`}>{kpi.value}</div><p className={`text-xs mt-1 ${kpi.alert ? 'text-red-600 font-medium' : 'text-gray-500'}`}>{kpi.subtext}</p></div>
  </div>
);

// --- Updated IntakeQueueTable with Filters ---
const IntakeQueueTable = ({ students, selectedIds, onToggleSelect, onAssign, onAssignSelected }: any) => {
  const [daysFilter, setDaysFilter] = useState<string>('all');
  const [programFilter, setProgramFilter] = useState<string>('all');
  const [batchFilter, setBatchFilter] = useState<string>('all');

  // Derive unique batches based on selected program
  const uniqueBatches = useMemo(() => {
    const filtered = programFilter === 'all'
      ? students
      : students.filter((s: any) => s.program === programFilter);
    return Array.from(new Set(filtered.map((s: any) => s.batch))).sort();
  }, [students, programFilter]);

  // Reset batch filter when program changes
  useEffect(() => {
    setBatchFilter('all');
  }, [programFilter]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  const filteredStudents = useMemo(() => {
    let result = students.filter((s: any) => {
      const matchDays = daysFilter === 'all' ||
        (daysFilter === 'gt7' ? s.daysWaiting > 7 :
          daysFilter === 'gt15' ? s.daysWaiting > 15 :
            daysFilter === 'gt30' ? s.daysWaiting > 30 : true);

      const matchProgram = programFilter === 'all' || s.program === programFilter;
      const matchBatch = batchFilter === 'all' || s.batch === batchFilter;
      return matchDays && matchProgram && matchBatch;
    });

    // Sorting: Most wait time first
    return result.sort((a: Student, b: Student) => b.daysWaiting - a.daysWaiting);
  }, [students, daysFilter, programFilter]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const paginatedStudents = filteredStudents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const isAllSelected = paginatedStudents.length > 0 && paginatedStudents.every((s: any) => selectedIds.has(s.id));

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      paginatedStudents.forEach((s: any) => onToggleSelect(s.id));
    } else {
      paginatedStudents.forEach((s: any) => onToggleSelect(s.id));
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [daysFilter, programFilter, batchFilter]);

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col h-full overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Student Intake Queue</h2>
          <p className="text-sm text-gray-500 mt-1">Showing {paginatedStudents.length} of {filteredStudents.length} pending allocations</p>
        </div>
        <button onClick={onAssignSelected} disabled={selectedIds.size === 0} className={`px-3 py-1.5 text-sm font-medium rounded-md ${selectedIds.size > 0 ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-400'}`}>Bulk Assign ({selectedIds.size})</button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 p-4 border-b border-gray-200">
        <div className="relative">
          <select
            value={daysFilter}
            onChange={(e) => setDaysFilter(e.target.value)}
            className="appearance-none bg-gray-50 border border-gray-300 text-gray-700 text-sm rounded-md py-1.5 pl-3 pr-8 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="all">Select Wait Time</option>
            <option value="gt7">Pending &gt; 7 Days</option>
            <option value="gt15">Pending &gt; 15 Days</option>
            <option value="gt30">Pending &gt; 30 Days</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500"><ChevronDown className="h-4 w-4" /></div>
        </div>

        <div className="relative">
          <select
            value={programFilter}
            onChange={(e) => setProgramFilter(e.target.value)}
            className="appearance-none bg-gray-50 border border-gray-300 text-gray-700 text-sm rounded-md py-1.5 pl-3 pr-8 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="all">All Programs</option>
            <option value="Foundation Course">Classroom (Foundation)</option>
            <option value="Lakshya">Lakshya</option>
            <option value="Dakshya">Dakshya</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500"><ChevronDown className="h-4 w-4" /></div>
        </div>

        <div className="relative">
          <select
            value={batchFilter}
            onChange={(e) => setBatchFilter(e.target.value)}
            className="appearance-none bg-gray-50 border border-gray-300 text-gray-700 text-sm rounded-md py-1.5 pl-3 pr-8 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="all">All Batches</option>
            {uniqueBatches.map((b: any) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500"><ChevronDown className="h-4 w-4" /></div>
        </div>

      </div>

      <div className="overflow-x-auto overflow-y-auto flex-1 max-h-[400px]">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th className="px-6 py-3 w-10">
                <input type="checkbox" checked={isAllSelected} onChange={handleSelectAll} className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reg ID / Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Batch / Program</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Waiting</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedStudents.map((s: any) => (
              <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <input type="checkbox" checked={selectedIds.has(s.id)} onChange={() => onToggleSelect(s.id)} className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                </td>
                <td className="px-6 py-4">
                  <div>
                    <span className="text-sm font-mono text-gray-500">{s.regId}</span><br />
                    <span className="text-sm font-medium text-gray-900">{s.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <span className="text-sm text-gray-900">{s.batch}</span><br />
                    <span className="text-xs text-gray-500">{s.program === 'Foundation Course' ? 'Classroom' : s.program}</span>
                    {s.assignedMentor && <div className="text-xs text-indigo-600 font-medium mt-0.5">Mentor: {s.assignedMentor}</div>}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.daysWaiting > 7 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                    {s.daysWaiting} days
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => onAssign(s)} className="text-indigo-600 hover:bg-indigo-50 px-3 py-1 rounded-md text-sm font-medium transition-colors">Assign</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredStudents.length === 0 && (
          <div className="p-8 text-center text-gray-500 bg-gray-50 m-4 rounded-lg border border-dashed border-gray-300">
            No students found matching the selected filters.
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between bg-gray-50">
          <div className="flex-1 flex justify-between sm:hidden">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400">Previous</button>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400">Next</button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredStudents.length)}</span> of <span className="font-medium">{filteredStudents.length}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100">Previous</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === page ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600' : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'}`}
                  >
                    {page}
                  </button>
                ))}
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100">Next</button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const MentorPanel = ({ mentors, selectedMentorId, onSelectMentor, selectedStudentCount, onAssign, onViewProfile }: any) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [programFilter, setProgramFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, programFilter, deptFilter]);

  const filteredMentors = (mentors || [])
    .filter((m: any) => {
      const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesProgram = programFilter === 'all' || (m.allocatedPrograms || []).includes(programFilter);
      const matchesDept = deptFilter === 'all' || m.department === deptFilter;
      return matchesSearch && matchesProgram && matchesDept;
    })
    .sort((a: any, b: any) => {
      // Sort by Availability (Capacity - Current Load) DESC
      const availA = a.capacity - a.currentLoad;
      const availB = b.capacity - b.currentLoad;
      return availB - availA;
    });

  const totalPages = Math.ceil(filteredMentors.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedMentors = filteredMentors.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col h-full overflow-hidden">
      <div className="px-4 py-4 border-b border-gray-200 bg-gray-50/50">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Mentor Availability</h2>
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Search mentor..."
            className="w-full text-xs border border-gray-300 rounded px-2 py-1.5 focus:ring-1 focus:ring-indigo-500"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-2">
            <select value={programFilter} onChange={e => setProgramFilter(e.target.value)} className="w-full text-xs border border-gray-300 rounded px-2 py-1.5 bg-white">
              <option value="all">All Programs</option>
              <option value="Foundation Course">Foundation</option>
              <option value="Lakshya">Lakshya</option>
              <option value="Dakshya">Dakshya</option>
              <option value="Optional">Optional</option>
            </select>
            <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)} className="w-full text-xs border border-gray-300 rounded px-2 py-1.5 bg-white">
              <option value="all">All Departments</option>
              <option value="General Studies">General Studies</option>
              <option value="Optional(Geography)">Optional(Geography)</option>
              <option value="Optional(Sociology)">Optional(Sociology)</option>
              <option value="Optional(PSIR)">Optional(PSIR)</option>
              <option value="Optional(History)">Optional(History)</option>
              <option value="Optional(Anthropology)">Optional(Anthropology)</option>
            </select>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto divide-y divide-gray-100 overscroll-contain max-h-[400px]">
        {paginatedMentors.map((m: any) => (
          <div key={m.id} className={`p-4 group ${selectedMentorId === m.id ? 'bg-indigo-50 ring-1 ring-inset ring-indigo-500' : 'hover:bg-gray-50'}`}>
            <div className="flex justify-between items-start">
              <div
                className="cursor-pointer flex-1"
                onClick={() => onSelectMentor(m.id)}
              >
                <h3 className="text-sm font-medium text-gray-900">{m.name}</h3>
                <div className="flex justify-between items-center mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded ${m.status === 'Available' ? 'bg-green-100 text-green-800' : m.status === 'Full' ? 'bg-gray-100' : 'bg-yellow-100 text-yellow-800'}`}>{m.status}</span>
                </div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); onViewProfile && onViewProfile(m.id); }}
                className="ml-2 text-gray-400 hover:text-indigo-600 p-1 rounded hover:bg-indigo-50 transition-colors"
                title="View Profile"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
            <div className="flex justify-between items-center mt-2 text-xs text-gray-500 cursor-pointer" onClick={() => onSelectMentor(m.id)}>
              <span>{m.department}</span>
              <span>{m.currentLoad}/{m.capacity}</span>
            </div>
          </div>
        ))}
        {filteredMentors.length === 0 && (
          <div className="p-8 text-center text-gray-400 text-sm">No mentors match filters</div>
        )}
      </div>

      {/* Pagination Controls */}
      <div className="px-4 py-2 border-t border-gray-100 bg-gray-50/30 flex justify-between items-center shrink-0">
        <button
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          className="px-2 py-1 border rounded text-xs bg-white hover:bg-gray-50 disabled:opacity-50"
        >
          Prev
        </button>
        <span className="text-xs text-gray-500">Page {currentPage} of {Math.max(1, totalPages)}</span>
        <button
          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages || totalPages === 0}
          className="px-2 py-1 border rounded text-xs bg-white hover:bg-gray-50 disabled:opacity-50"
        >
          Next
        </button>
      </div>

      <div className="p-4 border-t bg-gray-50 shrink-0">
        {selectedStudentCount > 0 && selectedMentorId && (
          <button onClick={onAssign} className="w-full bg-indigo-600 text-white py-2 rounded-md text-sm font-medium hover:bg-indigo-700">
            Assign {selectedStudentCount} Students
          </button>
        )}
      </div>
    </div>
  );
};

const MentorPanelOld = ({ mentors, selectedMentorId, onSelectMentor, selectedStudentCount, onAssign }: any) => {
  const [programFilter, setProgramFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const selectedMentor = mentors.find((m: any) => m.id === selectedMentorId);

  const filteredMentors = mentors.filter((m: any) => {
    const matchesProgram = programFilter === 'all' || m.allocatedPrograms.includes(programFilter);
    const matchesDept = deptFilter === 'all' || m.department === deptFilter;
    return matchesProgram && matchesDept;
  });

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [programFilter, deptFilter]);

  const totalPages = Math.ceil(filteredMentors.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedMentors = filteredMentors.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col h-full overflow-hidden">
      <div className="px-4 py-4 border-b border-gray-200 bg-gray-50/50">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Mentor Availability</h2>
        <div className="grid grid-cols-2 gap-2">
          <div className="relative">
            <select value={programFilter} onChange={e => setProgramFilter(e.target.value)} className="w-full text-xs border border-gray-300 rounded px-2 py-1.5 bg-white focus:ring-1 focus:ring-indigo-500">
              <option value="all">All Programs</option>
              <option value="Foundation Course">Foundation</option>
              <option value="Lakshya">Lakshya</option>
              <option value="Dakshya">Dakshya</option>
              <option value="Optional">Optional</option>
            </select>
          </div>
          <div className="relative">
            <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)} className="w-full text-xs border border-gray-300 rounded px-2 py-1.5 bg-white focus:ring-1 focus:ring-indigo-500">
              <option value="all">All Subjects</option>
              <option value="GS">GS</option>
              <option value="Optional">Optional</option>
              <option value="Essay">Essay</option>
            </select>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto divide-y divide-gray-100 overscroll-contain max-h-[400px]">
        {paginatedMentors.map((m: any) => (
          <div key={m.id} onClick={() => onSelectMentor(m.id)} className={`p-4 cursor-pointer hover:bg-gray-50 ${selectedMentorId === m.id ? 'bg-indigo-50 ring-1 ring-inset ring-indigo-500' : ''}`}>
            <div className="flex justify-between"><h3 className="text-sm font-medium text-gray-900">{m.name}</h3><span className={`text-xs px-2 py-0.5 rounded ${m.status === 'Available' ? 'bg-green-100 text-green-800' : m.status === 'Full' ? 'bg-gray-100' : 'bg-yellow-100 text-yellow-800'}`}>{m.status}</span></div>
            <div className="flex justify-between items-center mt-2 text-xs text-gray-500"><span>{m.department}</span><span>{m.currentLoad}/{m.capacity}</span></div>
          </div>
        ))}
        {filteredMentors.length === 0 && (
          <div className="p-8 text-center text-gray-400 text-sm">No mentors match filters</div>
        )}
      </div>

      {/* Footer: Pagination OR Assign Button */}
      <div className="p-4 border-t bg-gray-50">
        {selectedStudentCount > 0 && selectedMentor ? (
          <button onClick={onAssign} className="w-full bg-indigo-600 text-white py-2 rounded-md text-sm font-medium hover:bg-indigo-700">Assign {selectedStudentCount} to {selectedMentor.name.split(' ')[0]}</button>
        ) : (
          <div className="flex justify-between items-center">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-white border rounded text-xs hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Prev
            </button>
            <span className="text-xs text-gray-500">Page {currentPage} of {totalPages || 1}</span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 bg-white border rounded text-xs hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
};

const BatchAllocationView: React.FC<any> = ({ students, onAssign, selectedIds, onToggleSelect, onAssignBulk }) => {
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null);
  const [isBulkMode, setIsBulkMode] = useState(false);

  useEffect(() => setIsBulkMode(false), [selectedBatch]);

  // START: Top-level Filter State
  const [programFilter, setProgramFilter] = useState('all');
  const [mentorFilter, setMentorFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    setStatusFilter('all');
  }, [selectedBatch]);

  // Derive unique options
  const uniquePrograms = useMemo(() => Array.from(new Set(students.map((s: any) => s.program))), [students]);
  const uniqueMentors = useMemo(() => Array.from(new Set(students.map((s: any) => s.assignedMentor).filter(Boolean))), [students]);

  // Filter students based on top-level filters
  const filteredStudents = useMemo(() => {
    return students.filter((s: any) => {
      if (programFilter !== 'all' && s.program !== programFilter) return false;
      if (mentorFilter !== 'all') {
        if (mentorFilter === 'Unassigned' && s.assignedMentor) return false;
        if (mentorFilter !== 'Unassigned' && s.assignedMentor !== mentorFilter) return false;
      }
      return true;
    });
  }, [students, programFilter, mentorFilter]);

  const batchStats = useMemo(() => {
    const stats: any = {};
    filteredStudents.forEach((s: any) => {
      if (!stats[s.batch]) stats[s.batch] = { total: 0, allocated: 0, unallocated: 0, program: s.program };
      stats[s.batch].total++;
      s.assignedMentor ? stats[s.batch].allocated++ : stats[s.batch].unallocated++;
    });
    return Object.entries(stats).map(([batch, data]: any) => ({ batch, ...data }));
  }, [filteredStudents]);

  // Group batches by program when a mentor is selected
  const batchesByProgram = useMemo(() => {
    const grouped: any = {};
    batchStats.forEach((stat: any) => {
      const program = stat.program || 'Other';
      if (!grouped[program]) grouped[program] = [];
      grouped[program].push(stat);
    });
    return grouped;
  }, [batchStats]);

  const shouldGroupByProgram = mentorFilter !== 'all' && mentorFilter !== 'Unassigned' && programFilter === 'all';

  if (selectedBatch) {

    // Use filteredStudents directly and filter by batch + status
    const batchStudents = filteredStudents
      .filter((s: any) => {
        const matchesBatch = s.batch === selectedBatch;
        const matchesStatus = statusFilter === 'all' ||
          (statusFilter === 'Allocated' ? s.assignedMentor : !s.assignedMentor);
        return matchesBatch && matchesStatus;
      })
      .sort((a: any, b: any) => !a.assignedMentor && b.assignedMentor ? -1 : 0);

    const unallocatedBatchStudents = batchStudents.filter((s: any) => !s.assignedMentor);

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between"><div className="flex items-center space-x-4"><button onClick={() => setSelectedBatch(null)} className="p-2 hover:bg-gray-200 rounded-full"><ArrowLeft className="w-5 h-5" /></button><h2 className="text-xl font-bold">{selectedBatch}</h2></div>
          <div>{!isBulkMode ? <button onClick={() => setIsBulkMode(true)} className="px-3 py-2 border rounded-md text-sm">Bulk Assign</button> : <div className="flex space-x-2"><button onClick={() => setIsBulkMode(false)} className="px-3 py-2 border rounded-md text-sm">Cancel</button><button onClick={onAssignBulk} disabled={selectedIds.size === 0} className="px-3 py-2 bg-indigo-600 text-white rounded-md text-sm disabled:bg-gray-400">Assign Selected</button></div>}</div></div>

        <div className="bg-white rounded-lg border shadow-sm overflow-hidden"><table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr>
          {isBulkMode && <th className="px-6 py-3 w-10"><input type="checkbox" disabled={batchStudents.length === 0} onChange={(e) => e.target.checked ? batchStudents.forEach((s: any) => onToggleSelect(s.id)) : batchStudents.forEach((s: any) => onToggleSelect(s.id))} /></th>}
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reg ID / Name</th>
          <th className="px-6 py-0 w-40">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-xs font-bold text-gray-500 uppercase border-none focus:ring-0 cursor-pointer pl-0 pr-8"
              style={{ paddingLeft: 0 }}
            >
              <option value="all">STATUS (ALL)</option>
              <option value="Allocated">ALLOCATED</option>
              <option value="Unallocated">UNALLOCATED</option>
            </select>
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mentor</th>
        </tr></thead>
          <tbody className="bg-white divide-y divide-gray-200">{batchStudents.map((s: any) => (<tr key={s.id}>
            {isBulkMode && <td className="px-6 py-4"><input type="checkbox" checked={selectedIds.has(s.id)} onChange={() => onToggleSelect(s.id)} /></td>}
            <td className="px-6 py-4"><div><span className="text-sm font-mono text-gray-500">{s.regId}</span><br /><span className="text-sm font-medium">{s.name}</span></div></td>
            <td className="px-6 py-4"><span className={`px-2 py-0.5 rounded-full text-xs ${s.assignedMentor ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{s.assignedMentor ? 'Allocated' : 'Unallocated'}</span></td>
            <td className="px-6 py-4 text-sm font-medium">
              {s.assignedMentor ? (
                <div>
                  <div className="text-indigo-900 font-medium">{s.assignedMentor}</div>
                  <button onClick={() => onAssign(s)} className="text-indigo-600 text-xs hover:underline mt-1">Reassign</button>
                </div>
              ) : (
                <button onClick={() => onAssign(s)} className="text-indigo-600 hover:underline">Assign</button>
              )}
            </td>
          </tr>))}
            {batchStudents.length === 0 && (
              <tr><td colSpan={isBulkMode ? 4 : 3} className="px-6 py-8 text-center text-gray-500">No students found matching current filters.</td></tr>
            )}
          </tbody></table></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters at Batch List Level */}
      <div className="flex gap-4 items-center bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <span className="text-sm font-medium text-gray-700">Filters:</span>
        <select value={programFilter} onChange={(e) => setProgramFilter(e.target.value)} className="border rounded-md px-3 py-1.5 text-sm bg-gray-50">
          <option value="all">All Programs</option>
          {uniquePrograms.map((p: any) => <option key={p} value={p}>{p}</option>)}
        </select>
        <select value={mentorFilter} onChange={(e) => setMentorFilter(e.target.value)} className="border rounded-md px-3 py-1.5 text-sm bg-gray-50">
          <option value="all">All Mentors</option>
          <option value="Unassigned">Unassigned</option>
          {uniqueMentors.map((m: any) => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      {batchStats.length === 0 ? (
        <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border border-dashed">
          No batches found matching selected filters.
        </div>
      ) : shouldGroupByProgram ? (
        <div className="space-y-8">
          {Object.entries(batchesByProgram).map(([program, batches]: [string, any]) => (
            <div key={program}>
              <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-indigo-500">{program}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {batches.map((stat: any) => (
                  <div key={stat.batch} onClick={() => setSelectedBatch(stat.batch)} className="bg-white p-6 rounded-lg border shadow-sm hover:shadow-md cursor-pointer transition-all">
                    <h3 className="text-lg font-bold mb-4">{stat.batch}</h3>
                    <div className="w-full bg-gray-200 rounded-full h-1.5"><div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${(stat.allocated / stat.total) * 100}%` }} /></div>
                    <div className="flex justify-between mt-2 text-sm text-gray-500"><span>{stat.allocated} Allocated</span><span>{stat.unallocated} Pending</span></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">{batchStats.map((stat: any) => (
          <div key={stat.batch} onClick={() => setSelectedBatch(stat.batch)} className="bg-white p-6 rounded-lg border shadow-sm hover:shadow-md cursor-pointer transition-all">
            <h3 className="text-lg font-bold mb-4">{stat.batch}</h3>
            <div className="w-full bg-gray-200 rounded-full h-1.5"><div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${(stat.allocated / stat.total) * 100}%` }} /></div>
            <div className="flex justify-between mt-2 text-sm text-gray-500"><span>{stat.allocated} Allocated</span><span>{stat.unallocated} Pending</span></div>
          </div>
        ))}</div>
      )}
    </div>
  );
};

const AuditTable: React.FC<{ logs: AuditLog[] }> = ({ logs }) => (
  <div className="bg-white rounded-lg border border-gray-200 shadow-sm mt-6">
    <div className="px-6 py-4 border-b border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
    </div>
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {logs.map((log) => (
            <tr key={log.id}>
              <td className="px-6 py-4 text-sm text-gray-500">{log.timestamp}</td>
              <td className="px-6 py-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${log.actionType === 'Assigned' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                  {log.actionType}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">
                Student <span className="font-mono">{log.studentRegId}</span> {log.actionType === 'Assigned' ? 'assigned to' : 'reassigned to'} <strong>{log.toMentor}</strong>
                {log.fromMentor && <span className="text-gray-500"> (from {log.fromMentor})</span>}
                {log.reason && <div className="text-xs text-gray-500 mt-1">Reason: {log.reason}</div>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const MentorOffboardingModal = ({ isOpen, onClose, mentor, students, mentors, onConfirm }: any) => {
  if (!isOpen || !mentor) return null;

  // 1. Identify Students & Batches
  const assignedStudents = students.filter((s: any) => s.assignedMentor === mentor.name);

  // Group by Batch
  const studentsByBatch = useMemo(() => {
    const grouped: any = {};
    assignedStudents.forEach((s: any) => {
      if (!grouped[s.batch]) grouped[s.batch] = [];
      grouped[s.batch].push(s);
    });
    return grouped;
  }, [assignedStudents]);

  const batches = Object.keys(studentsByBatch);

  // 2. State for Actions
  // Map: Batch -> { action: 'unassign' | 'reassign', targetMentorId: '' }
  const [actionMap, setActionMap] = useState<any>({});

  useEffect(() => {
    // Initialize default actions
    const initial: any = {};
    batches.forEach(b => {
      initial[b] = { action: 'unassign', targetMentorId: '' };
    });
    setActionMap(initial);
  }, [isOpen, mentor]); // Reset when modal opens for a mentor

  const updateAction = (batch: string, field: string, value: string) => {
    setActionMap((prev: any) => ({
      ...prev,
      [batch]: { ...prev[batch], [field]: value }
    }));
  };

  const handleConfirm = () => {
    // Validate: If reassign selected, target mentor must be chosen
    const invalidBatch = batches.find(b => actionMap[b].action === 'reassign' && !actionMap[b].targetMentorId);
    if (invalidBatch) {
      alert(`Please select a mentor for batch ${invalidBatch}`);
      return;
    }
    onConfirm(actionMap);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b bg-red-50 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-red-800">Offboard Mentor: {mentor.name}</h2>
            <p className="text-sm text-red-600 mt-1">
              This mentor has {assignedStudents.length} active students. Please decide how to handle them.
            </p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">Close</button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <div className="space-y-4">
            {batches.map(batch => {
              const batchStudents = studentsByBatch[batch];
              const program = batchStudents[0]?.program;
              const currentAction = actionMap[batch] || { action: 'unassign' };

              // Find compatible mentors for this batch/program
              // Exclude current mentor
              const compatibleMentors = mentors.filter((m: any) =>
                m.id !== mentor.id &&
                m.status !== 'Full' &&
                m.status !== 'Left' &&
                (m.allocatedPrograms || []).includes(program) &&
                (!m.allocatedBatches || m.allocatedBatches.length === 0 || m.allocatedBatches.includes(batch))
              );

              return (
                <div key={batch} className="bg-white p-4 rounded-lg border shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-lg">{batch}</h3>
                      <p className="text-sm text-gray-500">{batchStudents.length} Students • {program}</p>
                    </div>
                    <div className="bg-gray-100 px-3 py-1 rounded text-xs font-mono">
                      {batchStudents.length} affected
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Action</label>
                      <select
                        className="w-full border rounded p-2 text-sm"
                        value={currentAction.action}
                        onChange={(e) => updateAction(batch, 'action', e.target.value)}
                      >
                        <option value="unassign">Unassign (Move to User Pool)</option>
                        <option value="reassign">Reassign to another Mentor</option>
                      </select>
                    </div>

                    {currentAction.action === 'reassign' && (
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">New Mentor</label>
                        <select
                          className="w-full border rounded p-2 text-sm"
                          value={currentAction.targetMentorId}
                          onChange={(e) => updateAction(batch, 'targetMentorId', e.target.value)}
                        >
                          <option value="">Select Mentor...</option>
                          {compatibleMentors.map((m: any) => (
                            <option key={m.id} value={m.id}>
                              {m.name} ({m.currentLoad}/{m.capacity})
                            </option>
                          ))}
                        </select>
                        {compatibleMentors.length === 0 && (
                          <p className="text-xs text-red-500 mt-1">No compatible mentors found.</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            {batches.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                This mentor has no assigned students. You can safely mark them as Left.
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-100">Cancel</button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-medium"
          >
            Confirm & Mark as Left
          </button>
        </div>
      </div>
    </div>
  );
};

const MentorDirectoryView: React.FC<{ mentors: Mentor[], students: Student[], initialSearchTerm?: string, initialSelectedMentorId?: string }> = ({ mentors, students, initialSearchTerm = '', initialSelectedMentorId = '' }) => {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [programFilter, setProgramFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [showAddMentorModal, setShowAddMentorModal] = useState(false);
  const [newMentor, setNewMentor] = useState({
    id: '',
    name: '',
    email: '',
    capacity: 50,
    status: 'Available' as 'Available' | 'Near Limit' | 'Full',
    departments: [] as string[],
    allocatedPrograms: [] as string[],
  });
  const [newDeptInput, setNewDeptInput] = useState('');
  const [newProgramInput, setNewProgramInput] = useState('');
  const itemsPerPage = 15;

  useEffect(() => {
    if (initialSearchTerm) setSearchTerm(initialSearchTerm);
  }, [initialSearchTerm]);

  useEffect(() => {
    if (initialSelectedMentorId) {
      const mentor = mentors.find(m => m.id === initialSelectedMentorId);
      if (mentor) setSelectedMentor(mentor);
    }
  }, [initialSelectedMentorId, mentors]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, programFilter, deptFilter]);

  // Derive unique options
  const uniquePrograms = useMemo(() => {
    const programs = new Set<string>();
    mentors.forEach(m => m.allocatedPrograms.forEach(p => programs.add(p)));
    return Array.from(programs);
  }, [mentors]);

  const uniqueDepartments = useMemo(() =>
    Array.from(new Set(mentors.map(m => m.department))),
    [mentors]
  );

  const filteredMentors = useMemo(() => {
    return mentors.filter(m => {
      const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.department.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesProgram = programFilter === 'all' || m.allocatedPrograms.includes(programFilter);
      const matchesDept = deptFilter === 'all' || m.department === deptFilter;
      return matchesSearch && matchesProgram && matchesDept;
    });
  }, [mentors, searchTerm, programFilter, deptFilter]);

  const totalPages = Math.ceil(filteredMentors.length / itemsPerPage);
  const paginatedMentors = filteredMentors.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Group students by program and batch for selected mentor
  const mentorStudents = useMemo(() => {
    if (!selectedMentor) return {};

    const grouped: any = {};
    students
      .filter(s => s.assignedMentor === selectedMentor.name)
      .filter(s => selectedMentor.allocatedPrograms.includes(s.program)) // Only show students in allocated programs
      .forEach(s => {
        const program = s.program || 'Other';
        const batch = s.batch || 'Unassigned';

        if (!grouped[program]) grouped[program] = {};
        if (!grouped[program][batch]) grouped[program][batch] = [];
        grouped[program][batch].push(s);
      });

    return grouped;
  }, [selectedMentor, students]);

  const [expandedBatches, setExpandedBatches] = useState<Set<string>>(new Set());
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedDepartments, setEditedDepartments] = useState<string[]>([]);
  const [editedCapacity, setEditedCapacity] = useState<number>(0);
  const [editedStatus, setEditedStatus] = useState<string>('');
  const [newDepartment, setNewDepartment] = useState('');

  // Offboarding State
  const [showOffboardingModal, setShowOffboardingModal] = useState(false);

  const toggleBatch = (batchKey: string) => {
    setExpandedBatches(prev => {
      const newSet = new Set(prev);
      if (newSet.has(batchKey)) {
        newSet.delete(batchKey);
      } else {
        newSet.add(batchKey);
      }
      return newSet;
    });
  };

  const startEdit = () => {
    if (selectedMentor) {
      setEditedDepartments([selectedMentor.department]);
      setEditedCapacity(selectedMentor.capacity);
      setEditedStatus(selectedMentor.status);
      setIsEditMode(true);
    }
  };

  const cancelEdit = () => {
    setIsEditMode(false);
    setNewDepartment('');
  };

  const saveEdit = () => {
    if (selectedMentor) {
      // Check if status changed to 'Left'
      if (editedStatus === 'Left' && selectedMentor.status !== 'Left') {
        setShowOffboardingModal(true);
        // Don't close edit mode yet, wait for confirmation
        return;
      }

      // Normal Update
      selectedMentor.department = editedDepartments.join(', ');
      selectedMentor.capacity = editedCapacity;
      selectedMentor.status = editedStatus as any;
      setIsEditMode(false);
      setNewDepartment('');
      console.log('Updated mentor:', selectedMentor);
    }
  };

  const handleOffboardingConfirm = (actionMap: any) => {
    if (!selectedMentor) return;

    console.log('Offboarding confirmed with actions:', actionMap);

    // Execute Actions (Mock implementation)
    // In real app, this would dispatch actions to update students
    Object.entries(actionMap).forEach(([batch, actionData]: any) => {
      const batchStudents = students.filter(s => s.assignedMentor === selectedMentor.name && s.batch === batch);

      if (actionData.action === 'unassign') {
        batchStudents.forEach(s => { s.assignedMentor = null; s.daysWaiting = 0; }); // Reset wait time?
      } else if (actionData.action === 'reassign' && actionData.targetMentorId) {
        const targetMentorName = mentors.find(m => m.id === actionData.targetMentorId)?.name;
        if (targetMentorName) {
          batchStudents.forEach(s => {
            s.assignedMentor = targetMentorName;
            // s.reassignmentReason = "Mentor Left Organization"; // Optional
          });
        }
      }
    });

    // Update Mentor Status
    selectedMentor.department = editedDepartments.join(', ');
    selectedMentor.capacity = 0; // Set capacity to 0
    selectedMentor.status = 'Left';

    setIsEditMode(false);
    setShowOffboardingModal(false);
    setNewDepartment('');

    // Optional: Auto-close profile?
    // setSelectedMentor(null);
  };

  const addDepartment = () => {
    if (newDepartment.trim() && !editedDepartments.includes(newDepartment.trim())) {
      setEditedDepartments([...editedDepartments, newDepartment.trim()]);
      setNewDepartment('');
    }
  };

  const removeDepartment = (dept: string) => {
    setEditedDepartments(editedDepartments.filter(d => d !== dept));
  };

  // If viewing a mentor's profile, show that view
  if (selectedMentor) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button onClick={() => setSelectedMentor(null)} className="p-2 hover:bg-gray-200 rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Mentor Profile</h2>
            </div>
          </div>
          {!isEditMode ? (
            <button
              onClick={startEdit}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 flex items-center"
            >
              <Settings className="w-4 h-4 mr-2" />
              Edit Profile
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={cancelEdit}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700"
              >
                Save Changes
              </button>
            </div>
          )}
        </div>

        {/* Mentor Details Card */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-500">Mentor Name</label>
              <p className="text-lg font-semibold text-gray-900 mt-1">{selectedMentor.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Expert ID</label>
              <p className="text-lg font-semibold text-gray-900 mt-1">{selectedMentor.id}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Department(s)</label>
              {!isEditMode ? (
                <p className="text-lg font-semibold text-gray-900 mt-1">{selectedMentor.department}</p>
              ) : (
                <div className="mt-2 space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {editedDepartments.map((dept, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full font-medium flex items-center"
                      >
                        {dept}
                        <button
                          onClick={() => removeDepartment(dept)}
                          className="ml-2 text-red-500 hover:text-red-700"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex space-x-2">
                    <select
                      value={newDepartment}
                      onChange={(e) => setNewDepartment(e.target.value)}
                      className="flex-1 px-3 py-2 border rounded-md text-sm bg-white"
                    >
                      <option value="">Select a department...</option>
                      <option value="General Studies">General Studies</option>
                      <option value="Optional(Geography)">Optional(Geography)</option>
                      <option value="Optional(Sociology)">Optional(Sociology)</option>
                      <option value="Optional(PSIR)">Optional(PSIR)</option>
                      <option value="Optional(History)">Optional(History)</option>
                      <option value="Optional(Anthropology)">Optional(Anthropology)</option>
                    </select>
                    <button
                      onClick={addDepartment}
                      disabled={!newDepartment}
                      className="px-3 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      Add
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Mentor Capacity</label>
              {!isEditMode ? (
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  {selectedMentor.currentLoad} / {selectedMentor.capacity}
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    ({selectedMentor.capacity - selectedMentor.currentLoad} available)
                  </span>
                </p>
              ) : (
                <div className="mt-2">
                  <input
                    type="number"
                    value={editedCapacity}
                    onChange={(e) => setEditedCapacity(parseInt(e.target.value) || 0)}
                    min={selectedMentor.currentLoad}
                    className="w-full px-3 py-2 border rounded-md text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Current load: {selectedMentor.currentLoad} (cannot set capacity below current load)
                  </p>
                </div>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Status</label>
              {!isEditMode ? (
                <div className="mt-1">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${selectedMentor.status === 'Available' ? 'bg-green-100 text-green-800' :
                    selectedMentor.status === 'Near Limit' ? 'bg-yellow-100 text-yellow-800' :
                      selectedMentor.status === 'Full' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                    {selectedMentor.status}
                  </span>
                </div>
              ) : (
                <div className="mt-2">
                  <select
                    value={editedStatus}
                    onChange={(e) => setEditedStatus(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md text-sm bg-white"
                  >
                    <option value="Available">Available</option>
                    <option value="Near Limit">Near Limit</option>
                    <option value="Full">Full</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Left" className="text-red-600 font-bold">Left Organization</option>
                  </select>
                </div>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-500">Allocated Programs</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedMentor.allocatedPrograms.map((prog, i) => (
                  <span key={i} className="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm rounded-full font-medium">
                    {prog}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Programs and Batches */}
        {Object.keys(mentorStudents).length === 0 ? (
          <div className="bg-white p-12 rounded-lg border border-gray-200 text-center">
            <p className="text-gray-500">No students assigned to this mentor yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(mentorStudents).map(([program, batches]: [string, any]) => (
              <div key={program} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 bg-indigo-50 border-b border-indigo-100">
                  <h3 className="text-lg font-bold text-indigo-900">{program}</h3>
                </div>
                <div className="p-6 space-y-3">
                  {Object.entries(batches).map(([batch, batchStudents]: [string, any]) => {
                    const batchKey = `${program}-${batch}`;
                    const isExpanded = expandedBatches.has(batchKey);

                    return (
                      <div key={batch} className="border border-gray-200 rounded-lg overflow-hidden">
                        <div
                          className="px-4 py-3 bg-gray-50 flex justify-between items-center cursor-pointer hover:bg-gray-100"
                          onClick={() => toggleBatch(batchKey)}
                        >
                          <div className="flex items-center space-x-3">
                            <h4 className="font-semibold text-gray-900">{batch}</h4>
                            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs rounded-full font-medium">
                              {batchStudents.length} students
                            </span>
                          </div>
                          <button className="text-indigo-600 text-sm font-medium hover:text-indigo-800">
                            {isExpanded ? 'Hide Student List' : 'Show Student List'}
                          </button>
                        </div>

                        {isExpanded && (
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reg ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {batchStudents.map((student: Student) => (
                                <tr key={student.id} className="hover:bg-gray-50">
                                  <td className="px-6 py-4 text-sm font-mono text-gray-500">{student.regId}</td>
                                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{student.name}</td>
                                  <td className="px-6 py-4">
                                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Allocated</span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
        <MentorOffboardingModal
          isOpen={showOffboardingModal}
          onClose={() => setShowOffboardingModal(false)}
          mentor={selectedMentor}
          students={students}
          mentors={mentors}
          onConfirm={handleOffboardingConfirm}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Mentor Directory</h2>
        <button
          onClick={() => setShowAddMentorModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center hover:bg-indigo-700"
        >
          <UserPlus className="w-4 h-4 mr-2" /> Add Mentor
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search mentors..."
            className="pl-9 pr-4 py-2 border rounded-md text-sm w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          value={programFilter}
          onChange={(e) => setProgramFilter(e.target.value)}
          className="border rounded-md px-3 py-2 text-sm bg-gray-50"
        >
          <option value="all">All Programs</option>
          {uniquePrograms.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="border rounded-md px-3 py-2 text-sm bg-gray-50"
        >
          <option value="all">All Departments</option>
          {uniqueDepartments.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {/* List View */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mentor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Programs</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Capacity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedMentors.map(mentor => (
              <tr key={mentor.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold">
                      {mentor.name.charAt(0)}
                    </div>
                    <div className="font-medium text-gray-900">{mentor.name}</div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{mentor.department}</td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {mentor.allocatedPrograms.slice(0, 2).map((prog, i) => (
                      <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                        {prog}
                      </span>
                    ))}
                    {mentor.allocatedPrograms.length > 2 && (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                        +{mentor.allocatedPrograms.length - 2}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="w-32">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-500">Load</span>
                      <span className="font-medium text-gray-900">{mentor.currentLoad}/{mentor.capacity}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full ${mentor.currentLoad >= mentor.capacity ? 'bg-red-500' : 'bg-indigo-500'}`}
                        style={{ width: `${Math.min((mentor.currentLoad / mentor.capacity) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${mentor.status === 'Available' ? 'bg-green-100 text-green-800' :
                    mentor.status === 'Full' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                    {mentor.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => setSelectedMentor(mentor)}
                    className="text-sm text-indigo-600 font-medium hover:text-indigo-800"
                  >
                    View Profile
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredMentors.length === 0 && (
          <div className="p-8 text-center text-gray-500">No mentors found matching filters.</div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white px-6 py-3 rounded-lg border border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
            <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredMentors.length)}</span> of{' '}
            <span className="font-medium">{filteredMentors.length}</span> mentors
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded text-sm bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded text-sm bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Add Mentor Modal */}
      {showAddMentorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Add New Mentor</h2>
              <button onClick={() => setShowAddMentorModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expert ID *</label>
                  <input
                    type="text"
                    value={newMentor.id}
                    onChange={(e) => setNewMentor({ ...newMentor, id: e.target.value })}
                    placeholder="e.g., EXP001"
                    className="w-full px-3 py-2 border rounded-md text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mentor Name *</label>
                  <input
                    type="text"
                    value={newMentor.name}
                    onChange={(e) => setNewMentor({ ...newMentor, name: e.target.value })}
                    placeholder="Full name"
                    className="w-full px-3 py-2 border rounded-md text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    value={newMentor.email}
                    onChange={(e) => setNewMentor({ ...newMentor, email: e.target.value })}
                    placeholder="email@visionias.in"
                    className="w-full px-3 py-2 border rounded-md text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Capacity *</label>
                  <input
                    type="number"
                    value={newMentor.capacity}
                    onChange={(e) => setNewMentor({ ...newMentor, capacity: parseInt(e.target.value) || 0 })}
                    min="0"
                    className="w-full px-3 py-2 border rounded-md text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={newMentor.status}
                    onChange={(e) => setNewMentor({ ...newMentor, status: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-md text-sm bg-white"
                  >
                    <option value="Available">Available</option>
                    <option value="Near Limit">Near Limit</option>
                    <option value="Full">Full</option>
                    <option value="On Leave">On Leave</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Departments</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {newMentor.departments.map((dept, i) => (
                    <span key={i} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full flex items-center">
                      {dept}
                      <button
                        onClick={() => setNewMentor({ ...newMentor, departments: newMentor.departments.filter((_, idx) => idx !== i) })}
                        className="ml-2 text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <select
                    value={newDeptInput}
                    onChange={(e) => setNewDeptInput(e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-md text-sm bg-white"
                  >
                    <option value="">Select department...</option>
                    <option value="General Studies">General Studies</option>
                    <option value="Optional(Geography)">Optional(Geography)</option>
                    <option value="Optional(Sociology)">Optional(Sociology)</option>
                    <option value="Optional(PSIR)">Optional(PSIR)</option>
                    <option value="Optional(History)">Optional(History)</option>
                    <option value="Optional(Anthropology)">Optional(Anthropology)</option>
                  </select>
                  <button
                    onClick={() => {
                      if (newDeptInput && !newMentor.departments.includes(newDeptInput)) {
                        setNewMentor({ ...newMentor, departments: [...newMentor.departments, newDeptInput] });
                        setNewDeptInput('');
                      }
                    }}
                    disabled={!newDeptInput}
                    className="px-3 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700 disabled:bg-gray-400"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Allocated Programs</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {newMentor.allocatedPrograms.map((prog, i) => (
                    <span key={i} className="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm rounded-full flex items-center">
                      {prog}
                      <button
                        onClick={() => setNewMentor({ ...newMentor, allocatedPrograms: newMentor.allocatedPrograms.filter((_, idx) => idx !== i) })}
                        className="ml-2 text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <select
                    value={newProgramInput}
                    onChange={(e) => setNewProgramInput(e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-md text-sm bg-white"
                  >
                    <option value="">Select program...</option>
                    <option value="Foundation Course">Foundation Course</option>
                    <option value="Lakshya">Lakshya</option>
                    <option value="Dakshya">Dakshya</option>
                  </select>
                  <button
                    onClick={() => {
                      if (newProgramInput && !newMentor.allocatedPrograms.includes(newProgramInput)) {
                        setNewMentor({ ...newMentor, allocatedPrograms: [...newMentor.allocatedPrograms, newProgramInput] });
                        setNewProgramInput('');
                      }
                    }}
                    disabled={!newProgramInput}
                    className="px-3 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700 disabled:bg-gray-400"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex justify-end space-x-3 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowAddMentorModal(false);
                  setNewMentor({
                    id: '',
                    name: '',
                    email: '',
                    capacity: 50,
                    status: 'Available',
                    departments: [],
                    allocatedPrograms: [],
                  });
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (newMentor.id && newMentor.name && newMentor.email) {
                    const mentor: Mentor = {
                      ...newMentor,
                      department: newMentor.departments.join(', '),
                      currentLoad: 0,
                    };
                    console.log('Adding new mentor:', mentor);
                    // In a real app, this would call an API to save the mentor
                    setShowAddMentorModal(false);
                    setNewMentor({
                      id: '',
                      name: '',
                      email: '',
                      capacity: 50,
                      status: 'Available',
                      departments: [],
                      allocatedPrograms: [],
                    });
                    alert('Mentor added successfully! (In production, this would save to the database)');
                  } else {
                    alert('Please fill in all required fields (Expert ID, Name, Email)');
                  }
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700"
              >
                Add Mentor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Mentor Portal Components ---

const MentorSidebar = ({ activeModule, setActiveModule, isOpen, setIsOpen, onLogout }: any) => {
  const modules = [
    { id: 'dashboard', label: 'Notice Board', icon: LayoutDashboard },
    { id: 'batch-details', label: 'Batch Details', icon: Users },
    { id: 'one-on-one', label: 'One-on-One Sessions', icon: User },
    { id: 'resources', label: 'Mentoring Resources', icon: BookOpen },
    { id: 'communication', label: 'Communication', icon: MessageSquare },
    { id: 'group-sessions', label: 'Weekly Group Session', icon: Calendar },
  ];

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden" onClick={() => setIsOpen(false)} />}
      <div className={`fixed lg:static inset-y-0 left-0 z-30 w-[280px] bg-indigo-900 text-white transform transition-transform duration-200 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex flex-col h-full">
          <div className="h-[72px] flex items-center px-6 border-b border-indigo-800">
            <div>
              <div className="text-xl font-bold leading-tight">VisionIAS</div>
              <div className="text-xs font-medium text-indigo-300 uppercase">Mentor Portal</div>
            </div>
          </div>
          <div className="flex-1 py-6 space-y-1 px-3">
            {modules.map((item) => (
              <button
                key={item.id}
                onClick={() => { setActiveModule(item.id); setIsOpen(false); }}
                className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${activeModule === item.id ? 'bg-indigo-800 text-white' : 'text-indigo-200 hover:bg-indigo-800 hover:text-white'}`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.label}
              </button>
            ))}
          </div>
          <div className="p-4 border-t border-indigo-800">
            <button onClick={onLogout} className="flex items-center text-sm font-medium text-indigo-300 hover:text-white w-full p-2 hover:bg-indigo-800 rounded-md">
              <LogOut className="w-4 h-4 mr-2" /> Sign Out
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

const MentorDashboard = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-gray-900">Mentoring Notice Board</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-indigo-700 mb-4 flex items-center"><Shield className="w-5 h-5 mr-2" /> Institutional Values</h3>
        <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600">
          <li>Communication Protocols: Always maintain professional boundaries.</li>
          <li>Message from Director's Desk: Focus on holistic student development.</li>
          <li>Organization Values: Integrity, Excellence, and Empathy.</li>
        </ul>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-indigo-700 mb-4 flex items-center"><FileCheck className="w-5 h-5 mr-2" /> Codes & Conduct</h3>
        <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600">
          <li>Mentor's Code of Professional Conduct.</li>
          <li>Student Fundamental Rights within the program.</li>
          <li>Mentor's Fundamental Duties and Code of Ethics.</li>
        </ul>
      </div>
    </div>
    <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
      <div className="flex">
        <div className="flex-shrink-0"><AlertCircle className="h-5 w-5 text-blue-400" /></div>
        <div className="ml-3"><p className="text-sm text-blue-700">Reminder: Submit your Weekly Group Session logs by Friday, 5 PM.</p></div>
      </div>
    </div>
  </div>
);

const MentorBatchDetails = ({ students }: { students: Student[] }) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Batch Details</h2>
        <div className="flex space-x-2">
          <select className="border border-gray-300 rounded-md text-sm p-2"><option>2025</option><option>2026</option></select>
          <select className="border border-gray-300 rounded-md text-sm p-2"><option>Foundation Course</option><option>Lakshya</option></select>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[150px]"><label className="block text-xs font-medium text-gray-500 mb-1">Mode</label><select className="w-full border rounded-md p-1.5 text-sm"><option>All</option><option>Online</option><option>Offline</option></select></div>
        <div className="flex-1 min-w-[150px]"><label className="block text-xs font-medium text-gray-500 mb-1">Category</label><select className="w-full border rounded-md p-1.5 text-sm"><option>All</option><option>Full Time</option><option>Working</option><option>College</option></select></div>
        <div className="flex-1 min-w-[150px]"><label className="block text-xs font-medium text-gray-500 mb-1">Performance</label><select className="w-full border rounded-md p-1.5 text-sm"><option>All</option><option>Excellent</option><option>Poor</option></select></div>
        <div className="flex-1 min-w-[150px]"><label className="block text-xs font-medium text-gray-500 mb-1">Status</label><select className="w-full border rounded-md p-1.5 text-sm"><option>All</option><option>Active</option><option>Inactive</option></select></div>
        <div className="flex items-center space-x-2 pb-2">
          <div className="h-4 w-4 rounded border border-gray-300 bg-red-50 flex items-center justify-center text-[10px] text-red-600 font-bold">7</div>
          <span className="text-sm text-gray-600">Inactive Multiple of 7</span>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Performance</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Activity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {students.map(s => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div><p className="text-sm font-medium text-gray-900">{s.name}</p><p className="text-xs text-gray-500">{s.regId} ({s.mode})</p></div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{s.email}<br />{s.contactNo}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{s.category}</td>
                <td className="px-6 py-4"><span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${s.performance === 'Excellent' ? 'bg-green-100 text-green-800' : s.performance === 'Poor' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>{s.performance}</span></td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className={`text-xs font-medium ${s.activityStatus === 'Active' ? 'text-green-600' : 'text-red-600'}`}>{s.activityStatus}</span>
                    {s.inactiveDays && s.inactiveDays > 0 && <span className="text-xs text-red-500">{s.inactiveDays} days inactive</span>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const MentorOneOnOne = ({ students }: { students: Student[] }) => {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  if (selectedStudent) {
    return (
      <div className="space-y-6">
        <button onClick={() => setSelectedStudent(null)} className="flex items-center text-indigo-600 hover:underline"><ArrowLeft className="w-4 h-4 mr-1" /> Back to List</button>

        {/* Student Header */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex justify-between items-start">
          <div className="flex space-x-4">
            <div className="h-16 w-16 bg-gray-200 rounded-full flex items-center justify-center text-xl font-bold text-gray-500">{selectedStudent.name.charAt(0)}</div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{selectedStudent.name}</h2>
              <p className="text-sm text-gray-500">Reg: {selectedStudent.regId} | Batch: {selectedStudent.batch}</p>
              <div className="flex space-x-2 mt-2">
                <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">{selectedStudent.category}</span>
                <span className="px-2 py-0.5 bg-gray-100 text-gray-800 text-xs rounded-full">{selectedStudent.mode}</span>
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            <button className="flex items-center px-3 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700"><PlusCircleIcon className="w-4 h-4 mr-2" /> Add Session Details</button>
            <button className="p-2 border rounded-md hover:bg-gray-50 text-gray-600"><Video className="w-5 h-5" /></button>
            <button className="p-2 border rounded-md hover:bg-gray-50 text-gray-600"><Phone className="w-5 h-5" /></button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Performance Indicators */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">Overall Performance</h3>
              <div className="space-y-3">
                {['Class Attendance', 'Class Completion', 'Prelims Mini Tests', 'Mains Mini Tests', 'Assignments', 'Weekly Group Sessions'].map(metric => (
                  <div key={metric}>
                    <div className="flex justify-between text-xs mb-1"><span>{metric}</span><span className="font-medium">85%</span></div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5"><div className="bg-green-500 h-1.5 rounded-full" style={{ width: '85%' }} /></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Interaction Record */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h3 className="font-semibold text-gray-900">Interaction History</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex space-x-4 border-b pb-4">
                  <div className="flex-shrink-0 mt-1"><Phone className="w-5 h-5 text-gray-400" /></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Telephonic Call Record</p>
                    <p className="text-xs text-gray-500">Yesterday, 4:30 PM • 15 mins</p>
                    <p className="text-sm text-gray-600 mt-1">Discussed strategy for upcoming Prelims Mini Test. Student feeling confident in Polity but needs work on Economy.</p>
                  </div>
                </div>
                <div className="flex space-x-4 border-b pb-4">
                  <div className="flex-shrink-0 mt-1"><User className="w-5 h-5 text-gray-400" /></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Profiling Call Record</p>
                    <p className="text-xs text-gray-500">Dec 10, 2025 • 45 mins</p>
                    <p className="text-sm text-gray-600 mt-1">Initial goal setting. Student is working professional, needs flexible schedule.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">One-on-One Sessions</h2>
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Interaction</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {students.map(s => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div><p className="text-sm font-medium text-gray-900 cursor-pointer hover:text-indigo-600" onClick={() => setSelectedStudent(s)}>{s.name}</p><p className="text-xs text-gray-500">{s.regId}</p></div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{s.category}</td>
                <td className="px-6 py-4 text-sm text-gray-500">2 days ago</td>
                <td className="px-6 py-4 text-sm font-medium space-x-3">
                  <button onClick={() => setSelectedStudent(s)} className="text-indigo-600 hover:underline">View Details</button>
                  <button className="text-gray-600 hover:text-gray-900">Schedule</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const PlusCircleIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const MentorResources = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-gray-900">Mentoring Resources</h2>
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-medium mb-4">Assign Resource</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Select Module</label>
          <select className="w-full border rounded-md p-2"><option>Module 1</option><option>Module 2</option><option>Module 3</option></select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Select Batch Bucket</label>
          <select className="w-full border rounded-md p-2"><option>RB1</option><option>RB2</option><option>RB3</option></select>
        </div>
      </div>
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-1 text-sm text-gray-600">Drag and drop files here, or click to upload</p>
        <p className="text-xs text-gray-500">PDF, DOC up to 10MB</p>
      </div>
      <div className="mt-4 flex items-center">
        <input type="checkbox" className="rounded text-indigo-600 mr-2" id="mail" />
        <label htmlFor="mail" className="text-sm text-gray-700">Mail communication to students along with session plans</label>
      </div>
      <button className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700">Assign Resource</button>
    </div>
  </div>
);

const MentorCommunication = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-gray-900">Communication Console</h2>
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="flex border-b">
        <button className="px-6 py-3 text-sm font-medium text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50">Compose</button>
        <button className="px-6 py-3 text-sm font-medium text-gray-500 hover:text-gray-700">Inbox</button>
      </div>
      <div className="p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Target Group</label>
          <div className="flex space-x-4">
            <label className="flex items-center"><input type="checkbox" className="mr-2" /> Students</label>
            <label className="flex items-center"><input type="checkbox" className="mr-2" /> Coordinator</label>
            <label className="flex items-center"><input type="checkbox" className="mr-2" /> HR Team</label>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Channel</label>
          <div className="flex space-x-2">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium flex items-center"><Mail className="w-3 h-3 mr-1" /> Mail</span>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium flex items-center"><MessageSquare className="w-3 h-3 mr-1" /> Chat</span>
            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium flex items-center"><Video className="w-3 h-3 mr-1" /> Video Call</span>
          </div>
        </div>
        <textarea className="w-full border rounded-md p-2 h-32" placeholder="Type your message here..."></textarea>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700">Send Message</button>
      </div>
    </div>
  </div>
);

const MentorGroupSessions = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-gray-900">Weekly Group Session Log Book</h2>
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-medium mb-4">Log New Session</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Session Type</label>
          <select className="w-full border rounded-md p-2"><option>Introductory Session</option><option>Current Affairs</option><option>Answer Writing</option></select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Session Date</label>
          <input type="date" className="w-full border rounded-md p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
          <input type="time" className="w-full border rounded-md p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
          <input type="time" className="w-full border rounded-md p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Total Invitees</label>
          <input type="number" className="w-full border rounded-md p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Attendance</label>
          <input type="number" className="w-full border rounded-md p-2" />
        </div>
      </div>
      <button className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700">Submit Log</button>
    </div>
  </div>
);

const MentorAssignmentModal = ({ isOpen, onClose, students = [], mentors = [], onAssign }: any) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [reassignmentReason, setReassignmentReason] = useState('');
  const [error, setError] = useState('');

  // Reset state on open
  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setReassignmentReason('');
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // 1. Safe Analysis of Students
  // Filter out any invalid student objects immediately
  const validStudents = (students || []).filter((s: any) => s && s.program);

  // Determine unique programs required
  const requiredPrograms = new Set(validStudents.map((s: any) => s.program));
  const requiredProgramsList = Array.from(requiredPrograms).join(', ');

  const requiredBatches = new Set(validStudents.filter((s: any) => s.batch).map((s: any) => s.batch));
  const requiredBatchesList = Array.from(requiredBatches).join(', ');

  // Check if reassignment
  const isReassignment = validStudents.some((s: any) => s.assignedMentor);

  const title = validStudents.length > 1
    ? `Assign Mentor to ${validStudents.length} Students`
    : `Assign Mentor to ${validStudents[0]?.name || 'Student'}`;

  // 2. Filter Mentors Contextually
  const availableMentors = (mentors || []).filter((m: any) => {
    if (!m) return false;

    // Search Filter
    const nameMatch = (m.name || '').toLowerCase().includes(searchTerm.toLowerCase());

    // Program Filter
    const programMatch = requiredPrograms.size === 0 ||
      (m.allocatedPrograms || []).some((p: string) => requiredPrograms.has(p));

    // Batch Filter
    let batchMatch = true;
    if (requiredBatches.size > 0) {
      if (m.allocatedBatches && m.allocatedBatches.length > 0) {
        batchMatch = m.allocatedBatches.some((b: string) => requiredBatches.has(b));
      } else {
        // Mentor has no specific batches assigned. Treat as 'All Batches'.
        batchMatch = true;
      }
    }

    return nameMatch && programMatch && batchMatch;
  });

  const handleAssign = (mentorId: string) => {
    if (isReassignment && !reassignmentReason.trim()) {
      setError('Please provide a reason for reassignment.');
      return;
    }
    onAssign(mentorId, reassignmentReason);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl h-[80vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50 shrink-0">
          <div>
            <h2 className="text-xl font-bold">{title}</h2>
            {(requiredPrograms.size > 0 || requiredBatches.size > 0) && (
              <div className="text-xs text-gray-500 mt-1 space-y-0.5">
                {requiredPrograms.size > 0 && <p>Program: <span className="font-semibold text-indigo-600">{requiredProgramsList}</span></p>}
                {requiredBatches.size > 0 && <p>Batch: <span className="font-semibold text-indigo-600">{requiredBatchesList}</span></p>}
              </div>
            )}
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">Close</button>
        </div>

        {/* Controls */}
        <div className="p-4 bg-gray-50 border-b space-y-3 shrink-0">
          {isReassignment && (
            <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
              <label className="block text-sm font-bold text-yellow-800 mb-1">
                Reason for Reassignment <span className="text-red-500">*</span>
              </label>
              <input
                className="w-full border border-yellow-300 rounded p-2 text-sm outline-none focus:border-yellow-500"
                placeholder="Required for audit logs..."
                value={reassignmentReason}
                onChange={e => { setReassignmentReason(e.target.value); setError(''); }}
              />
              {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
            </div>
          )}

          <input
            type="text"
            placeholder="Search mentor by name..."
            className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Mentor List */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50">
          <div className="space-y-3">
            {availableMentors.map((m: any) => (
              <div key={m.id} className="bg-white border p-4 rounded-lg flex justify-between items-center hover:shadow-md transition-shadow">
                <div>
                  <div className="font-bold text-gray-900">{m.name}</div>
                  <div className="text-sm text-gray-500">
                    {m.department} • <span className={m.status === 'Full' ? 'text-red-500' : 'text-green-600'}>
                      {m.currentLoad}/{m.capacity} Load
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    Programs: {(m.allocatedPrograms || []).join(', ')}
                  </div>
                </div>
                <button
                  onClick={() => handleAssign(m.id)}
                  disabled={m.status === 'Full'}
                  className={`px-4 py-2 rounded text-sm font-medium transition-colors ${m.status === 'Full'
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                >
                  Assign
                </button>
              </div>
            ))}

            {availableMentors.length === 0 && (
              <div className="text-center py-10">
                <p className="text-gray-500">No matching mentors found.</p>
                <p className="text-xs text-gray-400 mt-1">Ensure mentors are allocated to the "{requiredProgramsList}" program.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};











// --- Portals ---

const AdminPortal = ({ onBack }: { onBack: () => void }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());
  const [selectedMentorId, setSelectedMentorId] = useState<string | null>(null);
  const [assignmentModalOpen, setAssignmentModalOpen] = useState(false);
  const [studentsForAssignment, setStudentsForAssignment] = useState<Student[]>([]);
  const [directorySearchTerm, setDirectorySearchTerm] = useState('');
  const [selectedMentorIdForDirectory, setSelectedMentorIdForDirectory] = useState<string | null>(null);

  const handleNavigateToMentor = (mentorId: string) => {
    setSelectedMentorIdForDirectory(mentorId);
    setActiveTab('mentor-directory');
  };

  const handleAssignClick = (student: Student) => {
    setStudentsForAssignment([student]);
    setAssignmentModalOpen(true);
  };

  const handleConfirmAssignment = (mentorId: string, reason?: string) => {
    if (studentsForAssignment.length === 0) return;

    const studentIds = new Set(studentsForAssignment.map(s => s.id));
    const mentorName = (MENTORS || []).find(m => m.id === mentorId)?.name;

    setStudents(prev => prev.map(s => {
      if (studentIds.has(s.id)) {
        return {
          ...s,
          assignedMentor: mentorName,
          daysWaiting: 0,
          reassignmentReason: reason || s.reassignmentReason
        };
      }
      return s;
    }));

    // Add audit log for each student
    const mentor = (MENTORS || []).find(m => m.id === mentorId);
    if (mentor) {
      studentsForAssignment.forEach(student => {
        console.log(`Assigned ${student.name} to ${mentor.name} with reason: ${reason}`);
      });
    }

    setAssignmentModalOpen(false);
    setStudentsForAssignment([]);
    setSelectedStudentIds(new Set()); // Clear bulk selection if any
  };

  const handleBulkAssign = () => {
    if (selectedStudentIds.size === 0) return;

    const selectedStudents = students.filter(s => selectedStudentIds.has(s.id));
    setStudentsForAssignment(selectedStudents);
    setAssignmentModalOpen(true);
  };

  console.log('AdminPortal MENTORS:', MENTORS?.length);
  const safeMentors = MENTORS || [];

  const kpis: KPI[] = [
    { title: 'Unallocated Students', value: students.filter(s => !s.assignedMentor).length, subtext: 'Requires assignment', alert: true },
    { title: 'Available Mentor Capacity', value: safeMentors.reduce((acc, m) => acc + (m.capacity - m.currentLoad), 0), subtext: 'Slots available' },
    { title: 'Total Students', value: students.length, subtext: 'Registered' },
    { title: 'Total Mentors', value: safeMentors.length, subtext: 'Active' },
  ];

  return (
    <div className="h-screen overflow-hidden bg-gray-50 flex font-sans text-gray-900">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isOpen={mobileMenuOpen} setIsOpen={setMobileMenuOpen} onLogout={onBack} />
      <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* Simple Header for Admin */}
        <header className="h-[72px] bg-white border-b px-6 flex items-center justify-between shrink-0 z-10">
          <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden p-2"><Menu className="w-6 h-6" /></button>
          <h1 className="text-xl font-semibold hidden md:block">Admin Dashboard</h1>
          <div className="flex space-x-3">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 scroll-smooth">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">{kpis.map((kpi, index) => <KPICard key={index} kpi={kpi} />)}</div>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[600px]">
                <div className="lg:col-span-8 h-full"><IntakeQueueTable students={students} selectedIds={selectedStudentIds} onToggleSelect={(id: string) => setSelectedStudentIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; })} onAssign={handleAssignClick} onAssignSelected={handleBulkAssign} /></div>
                <div className="lg:col-span-4 h-full"><MentorPanel mentors={safeMentors} selectedMentorId={selectedMentorId} onSelectMentor={setSelectedMentorId} selectedStudentCount={selectedStudentIds.size} onAssign={handleBulkAssign} onViewProfile={handleNavigateToMentor} /></div>
              </div>
            </div>
          )}
          {activeTab === 'allocation-queue' && <BatchAllocationView students={students} onAssign={handleAssignClick} selectedIds={selectedStudentIds} onToggleSelect={(id: string) => setSelectedStudentIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; })} onAssignBulk={handleBulkAssign} />}
          {activeTab === 'mentor-directory' && <MentorDirectoryView mentors={safeMentors} students={students} initialSearchTerm={directorySearchTerm} initialSelectedMentorId={selectedMentorIdForDirectory || ''} />}
        </main>

        <MentorAssignmentModal
          isOpen={assignmentModalOpen}
          onClose={() => setAssignmentModalOpen(false)}
          students={studentsForAssignment}
          mentors={MENTORS}
          onAssign={handleConfirmAssignment}
        />
      </div>
    </div>
  );
};

const MentorPortal = ({ onBack }: { onBack: () => void }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeModule, setActiveModule] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [students] = useState<Student[]>(INITIAL_STUDENTS); // Use existing mock data enriched with Mentor fields

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-md max-w-md w-full">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-indigo-900">VisionIAS</h2>
            <p className="text-gray-500 mt-2">Mentor Portal Login</p>
          </div>
          <div className="space-y-4">
            <div><label className="block text-sm font-medium text-gray-700">Login ID</label><input type="text" className="mt-1 w-full border rounded-md p-2" placeholder="Enter your ID" /></div>
            <div><label className="block text-sm font-medium text-gray-700">Password</label><input type="password" className="mt-1 w-full border rounded-md p-2" placeholder="••••••••" /></div>
            <button onClick={() => setIsLoggedIn(true)} className="w-full bg-indigo-600 text-white py-2 rounded-md font-medium hover:bg-indigo-700">Sign In</button>
            <button onClick={onBack} className="w-full text-gray-500 text-sm hover:text-gray-800">Back to Portal Selection</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans text-gray-900">
      <MentorSidebar activeModule={activeModule} setActiveModule={setActiveModule} isOpen={mobileMenuOpen} setIsOpen={setMobileMenuOpen} onLogout={() => setIsLoggedIn(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-[72px] bg-white border-b px-6 flex items-center justify-between sticky top-0 z-10">
          <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden p-2"><Menu className="w-6 h-6" /></button>
          <h1 className="text-xl font-semibold hidden md:block">Welcome, Arjun Mehta</h1>
          <div className="flex items-center space-x-3">
            <div className="text-right hidden sm:block"><p className="text-sm font-medium">Arjun Mehta</p><p className="text-xs text-gray-500">Senior Mentor (GS)</p></div>
            <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold">AM</div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {activeModule === 'dashboard' && <MentorDashboard />}
          {activeModule === 'batch-details' && <MentorBatchDetails students={students} />}
          {activeModule === 'one-on-one' && <MentorOneOnOne students={students} />}
          {activeModule === 'resources' && <MentorResources />}
          {activeModule === 'communication' && <MentorCommunication />}
          {activeModule === 'group-sessions' && <MentorGroupSessions />}
        </main>
      </div>
    </div>
  );
};

// --- Portal Selection Screen ---

const PortalSelection = ({ onSelect }: { onSelect: (portal: string) => void }) => {
  const portals = [
    { id: 'admin', title: 'Mentoring Admin Dashboard', icon: LayoutDashboard, desc: 'Allocation, Directory & System Settings', color: 'bg-blue-600' },
    { id: 'mentor', title: 'Mentor Portal', icon: User, desc: 'Student Management, Sessions & Resources', color: 'bg-indigo-600' },
    { id: 'coordinator', title: 'Mentor Coordinator Portal', icon: Users, desc: 'Team Coordination & Reporting', color: 'bg-purple-600' },
    { id: 'student', title: "Student's Mentoring Portal", icon: BookOpen, desc: 'Track Progress & Connect with Mentors', color: 'bg-emerald-600' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">VisionIAS Mentoring System</h1>
          <p className="text-lg text-gray-600">Select your portal to continue</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {portals.map((p) => (
            <div
              key={p.id}
              onClick={() => onSelect(p.id)}
              className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 p-8 cursor-pointer border border-gray-100 group flex items-start"
            >
              <div className={`${p.color} p-4 rounded-lg text-white mr-6 group-hover:scale-110 transition-transform`}>
                <p.icon className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-700 transition-colors">{p.title}</h3>
                <p className="text-gray-500">{p.desc}</p>
              </div>
              <ChevronRight className="ml-auto w-6 h-6 text-gray-300 group-hover:text-gray-600 self-center" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- Coordinator Portal Components ---

const CoordinatorSidebar = ({ activeTab, setActiveTab, isOpen, setIsOpen, onLogout }: any) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'mentors', label: 'Mentor Performance', icon: Users },
    { id: 'students', label: 'Student Monitoring', icon: User },
    { id: 'feedback', label: 'Feedback', icon: MessageSquare },
    { id: 'resources', label: 'Resources', icon: BookOpen },
    { id: 'communication', label: 'Communication', icon: Mail },
    { id: 'reports', label: 'Reports', icon: FileText },
  ];

  return (
    <>
      <div className={`fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsOpen(false)} />
      <aside className={`fixed lg:static inset-y-0 left-0 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-200 ease-in-out bg-gradient-to-br from-purple-700 to-indigo-800 text-white w-64 shrink-0 z-50 flex flex-col`}>
        <div className="px-6 py-6 border-b border-white/10">
          <h2 className="text-2xl font-bold">VisionIAS</h2>
          <p className="text-sm text-white/70 mt-1">Coordinator Portal</p>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setIsOpen(false); }}
              className={`w-full flex items-center px-4 py-3 rounded-lg transition text-left ${activeTab === item.id ? 'bg-white/20 shadow-sm' : 'hover:bg-white/10'}`}
            >
              <item.icon className="w-5 h-5 mr-3" />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10">
          <button onClick={onLogout} className="w-full flex items-center px-4 py-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition">
            <LogOut className="w-5 h-5 mr-3" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

const CoordinatorPortal = ({ onBack }: { onBack: () => void }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [students] = useState<Student[]>(INITIAL_STUDENTS);
  const safeMentors = MENTORS || [];

  // Calculate KPIs
  const totalStudents = students.length;
  const activeStudents = students.filter(s => s.activityStatus === 'Active').length;
  const inactiveStudents = students.filter(s => s.activityStatus === 'Inactive').length;
  const assignedStudents = students.filter(s => s.assignedMentor).length;
  const unassignedStudents = students.filter(s => !s.assignedMentor).length;
  const aging7Days = students.filter(s => !s.assignedMentor && s.daysWaiting >= 7).length;
  const aging10Days = students.filter(s => !s.assignedMentor && s.daysWaiting >= 10).length;
  const aging14Days = students.filter(s => !s.assignedMentor && s.daysWaiting >= 14).length;
  const totalMentors = safeMentors.length;
  const mentorsNeedingAttention = safeMentors.filter(m => m.currentLoad >= m.capacity * 0.9).length;

  const kpis = [
    { title: 'Total Students', value: totalStudents, subtext: `${activeStudents} active / ${inactiveStudents} inactive`, color: 'bg-blue-500' },
    { title: 'Assigned Students', value: assignedStudents, subtext: `${unassignedStudents} unassigned`, color: 'bg-green-500' },
    { title: 'Pending Assignments', value: unassignedStudents, subtext: `7d: ${aging7Days} | 10d: ${aging10Days} | 14d: ${aging14Days}`, color: 'bg-orange-500', alert: unassignedStudents > 0 },
    { title: 'Total Mentors', value: totalMentors, subtext: `${mentorsNeedingAttention} need attention`, color: 'bg-purple-500' },
  ];

  return (
    <div className="h-screen overflow-hidden bg-gray-50 flex font-sans text-gray-900">
      <CoordinatorSidebar activeTab={activeTab} setActiveTab={setActiveTab} isOpen={mobileMenuOpen} setIsOpen={setMobileMenuOpen} onLogout={onBack} />
      <div className="flex-1 flex flex-col min-w-0 h-full">
        <header className="h-[72px] bg-white border-b px-6 flex items-center justify-between shrink-0 z-10">
          <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden p-2"><Menu className="w-6 h-6" /></button>
          <h1 className="text-xl font-semibold hidden md:block">Coordinator Dashboard</h1>
          <div className="flex space-x-3">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 sc roll-smooth">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Overview</h2>
                <p className="text-gray-600">Monitor students, mentors, and assignments at a glance</p>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {kpis.map((kpi, index) => (
                  <div key={index} className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-gray-600">{kpi.title}</p>
                      <div className={`w-2 h-2 rounded-full ${kpi.alert ? 'bg-red-500' : kpi.color}`} />
                    </div>
                    <div className="flex items-baseline justify-between">
                      <p className="text-3xl font-bold text-gray-900">{kpi.value}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">{kpi.subtext}</p>
                  </div>
                ))}
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <button
                    onClick={() => setActiveTab('mentors')}
                    className="flex items-center justify-center space-x-2 px-4 py-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition"
                  >
                    <Users className="w-5 h-5" />
                    <span className="font-medium">Monitor Mentors</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('feedback')}
                    className="flex items-center justify-center space-x-2 px-4 py-3 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition"
                  >
                    <MessageSquare className="w-5 h-5" />
                    <span className="font-medium">View Feedback</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('reports')}
                    className="flex items-center justify-center space-x-2 px-4 py-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition"
                  >
                    <Download className="w-5 h-5" />
                    <span className="font-medium">Export Reports</span>
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-3 text-center">
                  Note: Student-mentor assignments are handled by the Admin team
                </p>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3 text-sm">
                    <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-gray-900">New student assignment request</p>
                      <p className="text-gray-500 text-xs">5 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 text-sm">
                    <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-gray-900">Mentor performance review completed</p>
                      <p className="text-gray-500 text-xs">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 text-sm">
                    <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-gray-900">Feedback received from 5 students</p>
                      <p className="text-gray-500 text-xs">Yesterday</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'mentors' && (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 text-center">
              <div className="mx-auto h-16 w-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Mentor Management</h3>
              <p className="text-gray-500 mb-4">Coming soon - Enhanced mentor management with performance tracking</p>
            </div>
          )}

          {activeTab === 'students' && (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 text-center">
              <div className="mx-auto h-16 w-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <User className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Student Monitoring</h3>
              <p className="text-gray-500 mb-2">Coming soon - View student progress and performance</p>
              <p className="text-sm text-gray-400">Note: Student assignments are handled by Admin only</p>
            </div>
          )}

          {activeTab === 'feedback' && (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 text-center">
              <div className="mx-auto h-16 w-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <MessageSquare className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Feedback Management</h3>
              <p className="text-gray-500 mb-4">Coming soon - Student feedback dashboard and analytics</p>
            </div>
          )}

          {activeTab === 'resources' && (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 text-center">
              <div className="mx-auto h-16 w-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <BookOpen className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Resources Management</h3>
              <p className="text-gray-500 mb-4">Coming soon - Upload and manage mentoring resources</p>
            </div>
          )}

          {activeTab === 'communication' && (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 text-center">
              <div className="mx-auto h-16 w-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <Mail className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Communication Console</h3>
              <p className="text-gray-500 mb-4">Coming soon - Message mentors and students</p>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 text-center">
              <div className="mx-auto h-16 w-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Reports & Exports</h3>
              <p className="text-gray-500 mb-4">Coming soon - Generate and export reports</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

// --- Student Portal Components ---

const StudentSidebar = ({ activeTab, setActiveTab, isOpen, setIsOpen, onLogout }: any) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'mentor', label: 'My Mentor', icon: User },
    { id: 'sessions', label: 'Sessions', icon: Video },
    { id: 'resources', label: 'Resources', icon: BookOpen },
    { id: 'communication', label: 'Messages', icon: Mail },
    { id: 'feedback', label: 'Feedback', icon: MessageSquare },
    { id: 'profile', label: 'My Profile', icon: Settings },
  ];

  return (
    <>
      <div className={`fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsOpen(false)} />
      <aside className={`fixed lg:static inset-y-0 left-0 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-200 ease-in-out bg-gradient-to-br from-green-600 to-teal-700 text-white w-64 shrink-0 z-50 flex flex-col`}>
        <div className="px-6 py-6 border-b border-white/10">
          <h2 className="text-2xl font-bold">VisionIAS</h2>
          <p className="text-sm text-white/70 mt-1">Student Portal</p>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setIsOpen(false); }}
              className={`w-full flex items-center px-4 py-3 rounded-lg transition text-left ${activeTab === item.id ? 'bg-white/20 shadow-sm' : 'hover:bg-white/10'}`}
            >
              <item.icon className="w-5 h-5 mr-3" />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10">
          <button onClick={onLogout} className="w-full flex items-center px-4 py-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition">
            <LogOut className="w-5 h-5 mr-3" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

const StudentPortal = ({ onBack }: { onBack: () => void }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Mock student data - in real app would come from logged-in user
  const studentData = {
    name: "Rahul Sharma",
    regId: "45954860",
    email: "rahul.sharma@example.com",
    program: "Foundation Course",
    batch: "RB01_2026",
    mentor: "Arjun Mehta",
    mentorEmail: "arjun@visionias.in",
    mentorPhone: "+91 9876543210",
    callingTimeSlot: "Mon-Fri, 6:00 PM - 7:00 PM",
    assigned: true,
  };

  const performanceData = [
    { title: 'Class Attendance', value: '85%', status: 'good', icon: CheckCircle },
    { title: 'Assignments Completed', value: '12/15', status: 'warning', icon: FileCheck },
    { title: 'Prelims AITS Rank', value: '245', status: 'good', icon: Award },
    { title: 'Weekly Sessions', value: '4/4', status: 'excellent', icon: Video },
  ];

  return (
    <div className="h-screen overflow-hidden bg-gray-50 flex font-sans text-gray-900">
      <StudentSidebar activeTab={activeTab} setActiveTab={setActiveTab} isOpen={mobileMenuOpen} setIsOpen={setMobileMenuOpen} onLogout={onBack} />
      <div className="flex-1 flex flex-col min-w-0 h-full">
        <header className="h-[72px] bg-white border-b px-6 flex items-center justify-between shrink-0 z-10">
          <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden p-2"><Menu className="w-6 h-6" /></button>
          <h1 className="text-xl font-semibold hidden md:block">Welcome, {studentData.name}</h1>
          <div className="flex space-x-3">
            <button onClick={onBack} className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors">
              <LogOut className="w-5 h-5" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">My Dashboard</h2>
                <p className="text-gray-600">Track your progress and performance</p>
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {performanceData.map((item, index) => (
                  <div key={index} className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-3">
                      <item.icon className={`w-8 h-8 ${item.status === 'excellent' ? 'text-green-500' :
                        item.status === 'good' ? 'text-blue-500' : 'text-orange-500'
                        }`} />
                    </div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{item.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{item.value}</p>
                  </div>
                ))}
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button onClick={() => setActiveTab('mentor')} className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition text-left">
                  <User className="w-8 h-8 text-green-600 mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-1">Contact Mentor</h3>
                  <p className="text-sm text-gray-500">View mentor details</p>
                </button>
                <button onClick={() => setActiveTab('sessions')} className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition text-left">
                  <Video className="w-8 h-8 text-blue-600 mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-1">Join Session</h3>
                  <p className="text-sm text-gray-500">Upcoming sessions</p>
                </button>
                <button onClick={() => setActiveTab('resources')} className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition text-left">
                  <BookOpen className="w-8 h-8 text-purple-600 mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-1">View Resources</h3>
                  <p className="text-sm text-gray-500">Study materials</p>
                </button>
              </div>

              {/* Upcoming Sessions */}
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Sessions</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium text-gray-900">Weekly Group Session</p>
                        <p className="text-sm text-gray-600">Today, 5:00 PM</p>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700">Join</button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="font-medium text-gray-900">One-on-One Session</p>
                        <p className="text-sm text-gray-600">Tomorrow, 6:30 PM</p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">Scheduled</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'mentor' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">My Mentor</h2>
              {studentData.assigned ? (
                <>
                  <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                    <div className="flex items-start space-x-4">
                      <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold text-2xl">
                        {studentData.mentor.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900">{studentData.mentor}</h3>
                        <p className="text-gray-600">{studentData.program} Mentor</p>
                        <div className="mt-4 space-y-2">
                          <div className="flex items-center space-x-2 text-sm">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span>{studentData.mentorEmail}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span>{studentData.mentorPhone}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span>Calling Time: {studentData.callingTimeSlot}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-6 flex space-x-3">
                      <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center justify-center">
                        <Phone className="w-4 h-4 mr-2" />
                        Call Mentor
                      </button>
                      <button onClick={() => setActiveTab('communication')} className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center justify-center">
                        <Mail className="w-4 h-4 mr-2" />
                        Send Message
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-12 text-center">
                  <div className="mx-auto h-16 w-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                    <AlertCircle className="w-8 h-8 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No Mentor Assigned Yet</h3>
                  <p className="text-gray-500">You will be notified once a mentor is assigned to you.</p>
                </div>
              )}
            </div>
          )}

          {["sessions", "resources", "communication", "feedback", "profile"].map(tab => (
            activeTab === tab && (
              <div key={tab} className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 text-center">
                <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <Clock className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 capitalize">{tab}</h3>
                <p className="text-gray-500">Coming soon - {tab} module</p>
              </div>
            )
          ))}
        </main>
      </div>
    </div>
  );
};

const PlaceholderPortal = ({ title, onBack }: { title: string, onBack: () => void }) => (
  <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
    <div className="text-center p-8 bg-white rounded-lg shadow-sm max-w-md">
      <div className="mx-auto h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4"><Clock className="w-8 h-8 text-gray-400" /></div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
      <p className="text-gray-500 mb-6">This portal is currently under development.</p>
      <button onClick={onBack} className="text-indigo-600 hover:text-indigo-800 font-medium">Back to Selection</button>
    </div>
  </div>
);

// --- Root App ---

const App = () => {
  const [currentPortal, setCurrentPortal] = useState<string | null>(null);

  if (!currentPortal) {
    return <PortalSelection onSelect={setCurrentPortal} />;
  }

  switch (currentPortal) {
    case 'admin':
      return <AdminPortal onBack={() => setCurrentPortal(null)} />;
    case 'mentor':
      return <MentorPortal onBack={() => setCurrentPortal(null)} />;
    case 'coordinator':
      return <CoordinatorPortal onBack={() => setCurrentPortal(null)} />;
    case 'student':
      return <StudentPortal onBack={() => setCurrentPortal(null)} />;
    default:
      return <PortalSelection onSelect={setCurrentPortal} />;
  }
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
import { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '../../layouts/AdminLayout';
import GlobalDashboard from '../../components/GlobalDashboard';
import DepartmentWorkspace from '../../components/DepartmentWorkspace';
import ModuleManagement from '../../components/ModuleManagement';
import MasterResultSheet from '../../components/MasterResultSheet';
import ExaminerManagement from '../../components/ExaminerManagement';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function AdminDashboard() {
  const [activeView, setActiveView] = useState('GLOBAL');
  const [activeTab, setActiveTab] = useState('GLOBAL_ALLOCATION');
  const [batches, setBatches] = useState([]);
  const [selectedBatchId, setSelectedBatchId] = useState(null);
  const [activeSubTab, setActiveSubTab] = useState(null);
  const [departmentStats, setDepartmentStats] = useState(null);
  const [highlightedModuleCode, setHighlightedModuleCode] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Fetch department stats whenever tab or batch changes
  useEffect(() => {
    if (selectedBatchId && activeTab !== 'GLOBAL_ALLOCATION') {
      const fetchStats = async () => {
        try {
          const res = await axios.get(`/api/admin/batches/${selectedBatchId}/departments/${activeTab}/stats`);
          setDepartmentStats(res.data);
        } catch (e) {
          console.error(e);
        }
      };
      fetchStats();
    } else {
      setDepartmentStats(null);
    }
  }, [selectedBatchId, activeTab]);

  // Fetch batches for the sidebar globally
  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      const res = await axios.get('/api/admin/batches');
      setBatches(res.data);
      setBatches(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    if (newTab === 'GENERAL') setActiveSubTab(1);
    else if (['COMPUTER', 'ELECTRICAL', 'MECHANICAL', 'CIVIL'].includes(newTab)) setActiveSubTab(3);
    else setActiveSubTab(null);
  };

  const renderSubTabs = () => {
    if (activeTab === 'GLOBAL_ALLOCATION') return null;

    let semesters = [];
    if (activeTab === 'GENERAL') semesters = [1, 2, 3, 4, 5, 6, 7, 8];
    else semesters = [3, 4, 5, 6, 7, 8];

    return (
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        {semesters.map(sem => (
          <Button
            key={sem}
            variant={activeSubTab === sem ? 'default' : 'outline'}
            onClick={() => {
              setActiveSubTab(sem);
              setHighlightedModuleCode(null);
            }}
            className={`rounded-full px-6 tracking-wide whitespace-nowrap transition-all ${
              activeSubTab === sem 
                ? 'bg-brand-gold text-brand-900 shadow-md hover:bg-yellow-400' 
                : 'bg-white text-brand-900/60 border-brand-900/20 hover:border-brand-900/40 hover:bg-brand-gold/10 hover:text-brand-900'
            }`}
          >
            Semester {sem}
          </Button>
        ))}
      </div>
    );
  };

  const handleModuleAdded = (department, semester, moduleCode) => {
    setActiveTab(department);
    setActiveSubTab(semester);
    setHighlightedModuleCode(moduleCode);
  };

  const handleBatchSelect = (id) => {
    setSelectedBatchId(id);
    setActiveView('WORKSPACE');
    setActiveTab('GLOBAL_ALLOCATION');
  };

  const handleBackToBatches = () => {
    setActiveView('GLOBAL');
    setActiveTab('GLOBAL_ALLOCATION');
  };

  return (
    <AdminLayout 
      activeTab={activeTab} 
      setActiveTab={handleTabChange} 
      onBackToBatches={handleBackToBatches}
      activeView={activeView}
    >
      {activeTab === 'EXAMINERS' ? (
        <ExaminerManagement />
      ) : activeView === 'GLOBAL' ? (
        <GlobalDashboard 
          batches={batches} 
          fetchBatches={fetchBatches}
          onBatchSelect={handleBatchSelect}
        />
      ) : (
        <div className="max-w-6xl mx-auto flex flex-col pb-12">
        
        {/* Dynamic Batch Title for Department Views */}
        {activeTab !== 'GLOBAL_ALLOCATION' && selectedBatchId && (
          <div className="mb-6 flex flex-col">
            <div className="flex items-center gap-4">
              <h2 className="text-3xl font-extrabold text-brand-900 tracking-tight">
                {batches.find(b => b.id === selectedBatchId)?.name || 'Selected Batch'}
              </h2>
              {departmentStats && departmentStats.studentCount > 0 && (
                <span className="px-3 py-1 bg-brand-900/10 text-brand-900 text-sm font-bold rounded-full border border-brand-900/20 flex items-center gap-1.5 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-brand-900 animate-pulse"></span>
                  Selection Sheet Uploaded ({departmentStats.studentCount} Students)
                </span>
              )}
            </div>
            <p className="text-brand-900/60 mt-1 font-medium">
              Manage modules and publish results for this batch
            </p>
          </div>
        )}

        {renderSubTabs()}

        {/* 1. Global Allocation View (Placeholder for now, or could show something else) */}
        {activeTab === 'GLOBAL_ALLOCATION' && (
          <Card className="border-brand-gold/20 shadow-sm">
            <CardHeader className="pb-6">
              <CardTitle className="text-xl text-brand-900">Global Department Allocation</CardTitle>
              <CardDescription className="text-brand-900/60 text-base">
                Assign students to their specialization departments for the <strong>{batches.find(b => b.id === selectedBatchId)?.name}</strong>. 
                This only needs to be done once per batch. The students will remain in these departments for Semesters 3 through 8.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {['COMPUTER', 'ELECTRICAL', 'MECHANICAL', 'CIVIL'].map(dept => (
                  <DepartmentWorkspace 
                    key={dept} 
                    batchId={selectedBatchId} 
                    department={dept} 
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        )}



        {/* 2. Department / General Views */}
        {activeTab !== 'GLOBAL_ALLOCATION' && activeTab !== 'EXAMINERS' && (
          <>
            {!selectedBatchId ? (
              <div className="p-8 bg-amber-50 text-amber-700 rounded-xl border border-amber-200 font-medium">
                Please select an Active Batch from the Sidebar to view modules and results.
              </div>
            ) : (
              <div className="flex flex-col gap-6 animate-in slide-in-from-right-4 duration-300">
                <ModuleManagement 
                  department={activeTab} 
                  semester={activeSubTab} 
                  batchId={selectedBatchId} 
                  highlightedModuleCode={highlightedModuleCode}
                  setHighlightedModuleCode={setHighlightedModuleCode}
                  onRefresh={() => setRefreshTrigger(prev => prev + 1)}
                />
                <MasterResultSheet 
                  batchId={selectedBatchId} 
                  semester={activeSubTab} 
                  department={activeTab} 
                  refreshTrigger={refreshTrigger}
                />
              </div>
            )}
          </>
        )}

      </div>
      )}
    </AdminLayout>
  );
}


import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Asset, User, Log, AppConfig, Permission, Theme } from './types';
import { INITIAL_CONFIG } from './constants';
import Dashboard from './components/Dashboard';
import AssetManager from './components/AssetManager';
import AdminPanel from './components/AdminPanel';
import { LayoutDashboard, Box, Settings, LogOut, Menu, Palette, Check, Moon, Sun, Leaf, Monitor, Briefcase, UserCircle, Lock, Mail, ChevronRight } from 'lucide-react';

// --- Default Admin User ---
const DEFAULT_ADMIN: User = {
  id: 'admin-001',
  firstName: 'Admin',
  lastName: 'System',
  email: 'admin@edc.cm',
  password: 'admin12345',
  permissions: {
    canViewDashboard: true, canReadList: true, canCreate: true,
    canUpdate: true, canDelete: true, canExport: true, isAdmin: true
  },
  preferences: {
    theme: 'enterprise'
  }
};

const THEMES: { id: Theme; name: string; icon: React.ReactNode; color: string }[] = [
  { id: 'enterprise', name: 'Entreprise', icon: <Briefcase size={14}/>, color: '#003366' },
  { id: 'dark', name: 'Dark Mode', icon: <Moon size={14}/>, color: '#1F2937' },
  { id: 'material', name: 'Material', icon: <Box size={14}/>, color: '#6200EE' },
  { id: 'green', name: 'RSE / Green', icon: <Leaf size={14}/>, color: '#2D6A4F' },
  { id: 'modern', name: 'Modern SaaS', icon: <Monitor size={14}/>, color: '#0F172A' },
];

const App: React.FC = () => {
  // --- State ---
  const [user, setUser] = useState<User | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [config, setConfig] = useState<AppConfig>(INITIAL_CONFIG);
  
  const [currentView, setCurrentView] = useState<'dashboard' | 'assets' | 'admin'>('dashboard');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Theme State
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const themeMenuRef = useRef<HTMLDivElement>(null);

  // --- Persistence ---
  useEffect(() => {
    const savedAssets = localStorage.getItem('edc_assets');
    const savedUsers = localStorage.getItem('edc_users');
    const savedLogs = localStorage.getItem('edc_logs');
    const savedConfig = localStorage.getItem('edc_config');

    if (savedAssets) setAssets(JSON.parse(savedAssets));
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    } else {
      setUsers([DEFAULT_ADMIN]); // Initialize with Admin
    }
    if (savedLogs) setLogs(JSON.parse(savedLogs));
    
    if (savedConfig) {
      const parsedConfig = JSON.parse(savedConfig);
      // Ensure coreFields are present even if loading from old config
      if (!parsedConfig.coreFields || parsedConfig.coreFields.length === 0) {
        parsedConfig.coreFields = INITIAL_CONFIG.coreFields;
      }
      setConfig(parsedConfig);
    }
  }, []);

  useEffect(() => {
    if (assets.length > 0) localStorage.setItem('edc_assets', JSON.stringify(assets));
    if (users.length > 0) localStorage.setItem('edc_users', JSON.stringify(users));
    if (logs.length > 0) localStorage.setItem('edc_logs', JSON.stringify(logs));
    localStorage.setItem('edc_config', JSON.stringify(config));
  }, [assets, users, logs, config]);

  // --- Click Outside for Theme Menu ---
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (themeMenuRef.current && !themeMenuRef.current.contains(event.target as Node)) {
        setThemeMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // --- THEME LOGIC ---
  const applyTheme = (theme: Theme) => {
     document.documentElement.setAttribute('data-theme', theme);
  };

  // Restore theme on login
  useEffect(() => {
    if (user && user.preferences?.theme) {
      applyTheme(user.preferences.theme);
    } else {
      applyTheme('enterprise');
    }
  }, [user]);

  const handleThemeChange = (newTheme: Theme) => {
    if (!user) return;

    // 1. Apply immediately
    applyTheme(newTheme);

    // 2. Update Local State
    const updatedUser = { 
      ...user, 
      preferences: { ...user.preferences, theme: newTheme } 
    };
    setUser(updatedUser);

    // 3. Persist to "Backend" (users array)
    setUsers(prevUsers => prevUsers.map(u => u.id === user.id ? updatedUser : u));
    
    setThemeMenuOpen(false);
  };

  // --- Logic Helpers ---

  const addLog = (action: Log['action'], description: string, targetCode?: string, changes?: any[]) => {
    if (!user) return;
    const newLog: Log = {
      id: Date.now().toString() + Math.random(),
      timestamp: Date.now(),
      userId: user.id,
      userEmail: user.email,
      action,
      description,
      targetCode,
      changes
    };
    setLogs(prev => [...prev, newLog]);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const foundUser = users.find(u => u.email === loginEmail && u.password === loginPass);
    if (foundUser) {
      setUser(foundUser);
      addLog('LOGIN', 'User logged in'); 
      setCurrentView('dashboard');
    } else {
      alert("Identifiants incorrects");
    }
  };

  const handleSaveAsset = (assetData: Asset, isNew: boolean, reason?: string) => {
    if (isNew) {
      // The code is already generated by AssetManager before sending here
      const newAsset = { ...assetData, id: Date.now().toString(), isArchived: false };
      setAssets(prev => [...prev, newAsset]);
      addLog('CREATE', 'Création actif', newAsset.code);
    } else {
      // Find old asset for Diff
      const oldAsset = assets.find(a => a.id === assetData.id);
      if (!oldAsset) return;

      const changes = [];
      for (const key in assetData) {
        if (assetData[key as keyof Asset] !== oldAsset[key as keyof Asset]) {
           changes.push({ field: key, before: oldAsset[key as keyof Asset], after: assetData[key as keyof Asset] });
        }
      }

      setAssets(prev => prev.map(a => a.id === assetData.id ? assetData : a));
      addLog('UPDATE', reason ? `Modification (Motif: ${reason})` : 'Modification actif', assetData.code, changes);
    }
  };

  // --- Bulk Import Merge Logic ---
  const handleBulkImport = (importedAssets: Partial<Asset>[]) => {
      let createdCount = 0;
      let updatedCount = 0;

      const currentAssetsMap = new Map<string, Asset>(assets.map(a => [a.code, a] as [string, Asset]));
      
      const updatesMap = new Map<string, Asset>();
      const assetsToCreate: Asset[] = [];

      importedAssets.forEach((imported) => {
          if (!imported.code) return; // Skip if no code

          if (currentAssetsMap.has(imported.code)) {
              // UPDATE EXISTING
              const existing = currentAssetsMap.get(imported.code)!;
              
              const mergedCustomAttributes = {
                 ...(existing.customAttributes || {}),
                 ...(imported.customAttributes || {})
              };

              const updatedAsset = { 
                ...existing, 
                ...imported,
                customAttributes: mergedCustomAttributes
              } as Asset;
              
              updatesMap.set(updatedAsset.id, updatedAsset);
              updatedCount++;
          } else {
              // CREATE NEW
              const newAsset: Asset = {
                  ...imported,
                  id: Date.now().toString() + Math.random(),
                  isArchived: false,
                  customAttributes: imported.customAttributes || {}
              } as Asset;
              assetsToCreate.push(newAsset);
              createdCount++;
          }
      });

      const newAssetsList = assets.map(a => {
        if (updatesMap.has(a.id)) {
          return updatesMap.get(a.id)!;
        }
        return a;
      });

      const finalAssetsList = [...newAssetsList, ...assetsToCreate];

      setAssets(finalAssetsList);
      addLog('CONFIG', `Import Excel : ${createdCount} créés, ${updatedCount} mis à jour.`);
      alert(`Import terminé avec succès !\n\nCréations : ${createdCount}\nMises à jour : ${updatedCount}`);
  };

  const handleDeleteAsset = (id: string) => {
    const asset = assets.find(a => a.id === id);
    if (asset) {
      setAssets(prev => prev.map(a => a.id === id ? { ...a, isArchived: true, state: 'Retiré' } : a));
      addLog('DELETE', 'Archivage actif', asset.code);
    }
  };

  // --- Render ---

  if (!user) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center font-sans bg-[#f5f7fa]">
        {/* CENTERED LOGIN CARD */}
        <div className="w-full max-w-sm px-4 animate-fade-in">
             
             {/* COMPACT CARD - SOLID BLUE #00509e */}
             <div className="bg-[#00509e] rounded-xl p-8 shadow-2xl relative overflow-hidden group">
                
                {/* Decorative Shine (Subtle) */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50"></div>

                {/* TITLE ONLY */}
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-white tracking-widest uppercase mb-1">
                        Authentification
                    </h2>
                    <div className="h-1 w-12 bg-edc-gold mx-auto rounded-full"></div>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-blue-200 uppercase tracking-wider flex items-center gap-2">
                         <Mail size={12}/> Email Professionnel
                      </label>
                      <input 
                         type="email" 
                         required
                         placeholder="nom@edc.cm"
                         className="w-full bg-white border border-blue-400 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-edc-gold transition-all"
                         value={loginEmail}
                         onChange={e => setLoginEmail(e.target.value)}
                      />
                   </div>

                   <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-blue-200 uppercase tracking-wider flex items-center gap-2">
                         <Lock size={12}/> Mot de passe
                      </label>
                      <input 
                         type="password" 
                         required
                         placeholder="••••••••"
                         className="w-full bg-white border border-blue-400 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-edc-gold transition-all"
                         value={loginPass}
                         onChange={e => setLoginPass(e.target.value)}
                      />
                   </div>

                   <button 
                      type="submit" 
                      className="w-full bg-edc-gold hover:bg-yellow-500 text-[#003366] font-bold py-3.5 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center gap-2 mt-6"
                   >
                      ACCÉDER <ChevronRight size={18} strokeWidth={3}/>
                   </button>
                </form>

                <div className="mt-6 text-center text-[10px] text-blue-200/60 font-medium pt-4 border-t border-blue-800/30">
                   &copy; EDC Cameroun. Accès réservé.
                </div>
             </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-edc-light font-sans transition-colors duration-300">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-edc-blue text-[var(--edc-sidebar-text)] shadow-xl transition-colors duration-300">
        <div className="p-6 flex items-center gap-3 border-b border-white/10">
          <img src={config.companyLogo} alt="Logo" className="w-10 h-10 rounded bg-white object-contain p-1" />
          <span className="font-bold text-lg leading-tight">{config.companyName}</span>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {user.permissions.canViewDashboard && (
            <button 
              onClick={() => setCurrentView('dashboard')}
              className={`flex items-center w-full px-4 py-3 rounded transition-colors ${currentView === 'dashboard' ? 'bg-edc-orange text-white font-semibold' : 'hover:bg-white/10'}`}
            >
              <LayoutDashboard className="mr-3" size={20} /> Tableau de Bord
            </button>
          )}
          {user.permissions.canReadList && (
            <button 
              onClick={() => setCurrentView('assets')}
              className={`flex items-center w-full px-4 py-3 rounded transition-colors ${currentView === 'assets' ? 'bg-edc-orange text-white font-semibold' : 'hover:bg-white/10'}`}
            >
              <Box className="mr-3" size={20} /> Immobilisations
            </button>
          )}
          {user.permissions.isAdmin && (
             <button 
              onClick={() => setCurrentView('admin')}
              className={`flex items-center w-full px-4 py-3 rounded transition-colors ${currentView === 'admin' ? 'bg-edc-orange text-white font-semibold' : 'hover:bg-white/10'}`}
            >
              <Settings className="mr-3" size={20} /> Paramètre
            </button>
          )}
        </nav>
        
        {/* User Profile & Theme Switcher */}
        <div className="p-4 border-t border-white/10 relative">
          <div className="flex items-center justify-between gap-2 mb-4">
             <div className="flex items-center gap-2 overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-edc-orange flex items-center justify-center font-bold text-white shrink-0">
                  {user.firstName[0]}
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-medium truncate">{user.firstName} {user.lastName}</p>
                  <p className="text-xs opacity-70 truncate">{user.permissions.isAdmin ? 'Administrateur' : 'Utilisateur'}</p>
                </div>
             </div>
             
             {/* THEME SWITCHER BUTTON */}
             <div className="relative" ref={themeMenuRef}>
               <button 
                  onClick={() => setThemeMenuOpen(!themeMenuOpen)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                  title="Changer de thème"
                >
                  <Palette size={18} />
               </button>

               {/* THEME POPOVER */}
               {themeMenuOpen && (
                 <div className="absolute bottom-10 left-0 ml-10 w-48 bg-white text-gray-800 rounded-lg shadow-xl border border-gray-200 py-1 z-50">
                    <p className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b">
                      Choisir un thème
                    </p>
                    {THEMES.map(t => (
                      <button
                        key={t.id}
                        onClick={() => handleThemeChange(t.id)}
                        className={`w-full text-left px-3 py-2 text-sm flex items-center gap-3 hover:bg-gray-50 transition-colors
                          ${(user.preferences?.theme || 'enterprise') === t.id ? 'bg-blue-50 text-blue-700 font-medium' : ''}`}
                      >
                        <span className="w-4 h-4 rounded-full border border-gray-300" style={{ backgroundColor: t.color }}></span>
                        <span className="flex-1">{t.name}</span>
                        {(user.preferences?.theme || 'enterprise') === t.id && <Check size={14} className="text-blue-600"/>}
                      </button>
                    ))}
                 </div>
               )}
             </div>
          </div>

          <button onClick={() => setUser(null)} className="flex items-center text-red-300 hover:text-white w-full text-sm mt-2 pt-2 border-t border-white/10">
            <LogOut size={16} className="mr-2" /> Déconnexion
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-edc-light/50">
         {/* Mobile Header */}
         <div className="md:hidden bg-edc-blue text-white p-3 flex justify-between items-center sticky top-0 z-20 shadow-md">
            <div className="flex items-center gap-2">
              <img src={config.companyLogo} alt="Logo" className="w-8 h-8 rounded bg-white object-contain p-1" />
              <span className="font-bold text-lg leading-tight">
                 <span className="hidden sm:inline">{config.companyName}</span>
                 <span className="sm:hidden">EDC</span>
              </span>
            </div>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-1 rounded hover:bg-white/10">
              <Menu size={28} />
            </button>
         </div>
         {/* Mobile Menu */}
         {mobileMenuOpen && (
           <div className="md:hidden bg-blue-900 text-white absolute w-full z-30 shadow-xl flex flex-col">
              {/* Profile Section in Mobile Menu */}
              <div className="p-4 bg-blue-950 border-b border-white/10 flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-edc-orange flex items-center justify-center text-white font-bold text-lg shrink-0 border-2 border-blue-800">
                    {user.firstName[0]}
                 </div>
                 <div className="min-w-0">
                    <p className="font-bold text-white truncate">{user.firstName} {user.lastName}</p>
                    <p className="text-xs text-blue-200 truncate">{user.email}</p>
                 </div>
              </div>

              <div className="p-2">
                  <button onClick={() => { setCurrentView('dashboard'); setMobileMenuOpen(false); }} className="flex items-center px-4 py-3 w-full text-left hover:bg-white/5 rounded">
                     <LayoutDashboard size={18} className="mr-3 opacity-70"/> Dashboard
                  </button>
                  <button onClick={() => { setCurrentView('assets'); setMobileMenuOpen(false); }} className="flex items-center px-4 py-3 w-full text-left hover:bg-white/5 rounded">
                     <Box size={18} className="mr-3 opacity-70"/> Immobilisations
                  </button>
                  {user.permissions.isAdmin && (
                    <button onClick={() => { setCurrentView('admin'); setMobileMenuOpen(false); }} className="flex items-center px-4 py-3 w-full text-left hover:bg-white/5 rounded">
                       <Settings size={18} className="mr-3 opacity-70"/> Paramètre
                    </button>
                  )}
              </div>
              
              <div className="p-4 border-t border-white/10 bg-blue-900/50">
                <p className="text-xs text-gray-400 mb-2 uppercase font-semibold">Thèmes</p>
                <div className="flex gap-3 overflow-x-auto pb-2">
                   {THEMES.map(t => (
                      <button 
                        key={t.id} 
                        onClick={() => { handleThemeChange(t.id); setMobileMenuOpen(false); }}
                        className={`w-10 h-10 rounded-full border-2 flex items-center justify-center shrink-0 shadow-sm
                          ${(user.preferences?.theme || 'enterprise') === t.id ? 'border-white scale-110' : 'border-transparent opacity-80'}`}
                        style={{ backgroundColor: t.color }}
                        title={t.name}
                      >
                         {(user.preferences?.theme || 'enterprise') === t.id && <Check size={16} className="text-white"/>}
                      </button>
                   ))}
                </div>
              </div>

              <button onClick={() => setUser(null)} className="p-4 w-full text-left text-red-300 hover:text-red-200 bg-red-900/20 flex items-center justify-center font-semibold">
                 <LogOut size={18} className="mr-2"/> Déconnexion
              </button>
           </div>
         )}

         {/* View Router */}
         <div className="animate-fade-in h-full">
            {currentView === 'dashboard' && <Dashboard assets={assets} />}
            {currentView === 'assets' && (
                <AssetManager 
                  assets={assets} 
                  config={config} 
                  user={user} 
                  onSave={handleSaveAsset} 
                  onImport={handleBulkImport}
                  onDelete={handleDeleteAsset} 
                />
              )}
            {currentView === 'admin' && user.permissions.isAdmin && (
              <AdminPanel 
                users={users} 
                logs={logs} 
                config={config}
                onUpdateConfig={setConfig}
                onAddUser={(u) => setUsers([...users, u])}
                onUpdateUser={(u) => setUsers(prev => prev.map(user => user.id === u.id ? u : user))}
                onDeleteUser={(id) => setUsers(prev => prev.filter(u => u.id !== id))}
              />
            )}
         </div>
      </main>
    </div>
  );
};

export default App;

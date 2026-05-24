import React from "react";
import { Search, Sun, Moon, Command as CmdIcon, ChevronDown } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { ADMIN_NAV, CLIENT_NAV } from "./Sidebar";
import { NotificationBell } from "./NotificationBell";
import { Dropdown, DropdownItem, DropdownSection } from "./ui/Dropdown";
import { MOCK_ADMIN_USER, MOCK_CLIENT_USER } from "../lib/mockData";
import { LogOut, Settings, User } from "lucide-react";
import { signOut } from "../lib/auth";
import { fmt } from "../lib/format";

interface CurrentUser {
  name: string;
  email: string;
  role: string;
}

interface TopbarProps {
  type: "admin" | "client";
  active: string;
  pendingCount?: number;
  clientName?: string;
  onOpenCommand?: () => void;
  currentUser?: CurrentUser;
}

export function Topbar({ type, active, pendingCount = 0, onOpenCommand, currentUser }: TopbarProps) {
  const { theme, setTheme } = useTheme();

  const allNav = type === "admin" ? ADMIN_NAV : CLIENT_NAV;
  const current = allNav.find((n) => n.id === active);
  const title = current?.label || "Dashboard";

  const subtitle =
    type === "admin"
      ? "Painel Administrativo — Food Métricas"
      : `Visão detalhada de performance · Maio 2025`;

  const fallback = type === "admin"
    ? MOCK_ADMIN_USER
    : { name: MOCK_CLIENT_USER.ownerName, role: "Cliente", avatar: MOCK_CLIENT_USER.avatar, email: "carlos@bksp.com.br" };

  const user = currentUser
    ? { ...currentUser, avatar: fmt.initials(currentUser.name) }
    : fallback;

  async function logout() {
    await signOut();
    sessionStorage.clear();
    window.location.href = "/login.html";
  }

  return (
    <header className="h-20 flex-shrink-0 flex items-center justify-between px-10 bg-white dark:bg-[#0F172A] border-b border-slate-200 dark:border-slate-800 z-10 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
      <div className="flex-1 min-w-0">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight truncate">
          {title}
        </h1>
        <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium mt-1">{subtitle}</p>
      </div>

      <div className="flex items-center gap-4">
        {/* Command palette trigger */}
        <button
          onClick={onOpenCommand}
          className="hidden lg:flex items-center gap-2.5 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-full px-4 py-2.5 w-64 hover:border-slate-300 dark:hover:border-slate-700 transition-all group"
        >
          <Search size={15} className="text-slate-400 group-hover:text-slate-600" />
          <span className="text-[13px] text-slate-400 font-medium flex-1 text-left">Buscar...</span>
          <kbd className="text-[10px] font-bold text-slate-400 px-1.5 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-0.5">
            <CmdIcon size={9} /> K
          </kbd>
        </button>

        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"
          title="Alternar tema"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <NotificationBell />

        <div className="pl-4 border-l border-slate-200 dark:border-slate-800">
          <Dropdown
            align="right"
            width="w-60"
            trigger={
              <button className="flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors rounded-xl py-1.5 pl-2 pr-3 group">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-bold bg-gradient-to-br from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 text-white dark:text-slate-900 shadow-md">
                  {user.avatar}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-[13px] font-bold text-slate-900 dark:text-white leading-none">{user.name}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1">{user.role}</p>
                </div>
                <ChevronDown size={14} className="text-slate-400 group-hover:text-slate-600" />
              </button>
            }
          >
            <DropdownSection>
              <div className="px-4 py-3">
                <p className="text-[13px] font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
              </div>
            </DropdownSection>
            <DropdownSection>
              <DropdownItem icon={<User size={15} />}>Meu perfil</DropdownItem>
              <DropdownItem icon={<Settings size={15} />}>Configurações</DropdownItem>
            </DropdownSection>
            <DropdownSection>
              <DropdownItem icon={<LogOut size={15} />} destructive onClick={logout}>
                Sair
              </DropdownItem>
            </DropdownSection>
          </Dropdown>
        </div>
      </div>
    </header>
  );
}

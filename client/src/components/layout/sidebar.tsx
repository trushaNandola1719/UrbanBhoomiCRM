import { Link, useLocation } from "wouter";
import { Building, LayoutDashboard, Users, Home, CalendarCheck, UserRoundCheck, MessageSquare, Settings } from "lucide-react";
import { cn, getInitials } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Customers", href: "/customers", icon: Users },
  { name: "Properties", href: "/properties", icon: Home },
  { name: "Interactions", href: "/interactions", icon: MessageSquare },
  { name: "Visit History", href: "/visits", icon: CalendarCheck },
  { name: "Brokers", href: "/brokers", icon: UserRoundCheck },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="w-64 bg-white shadow-lg border-r border-gray-200 flex flex-col">
      {/* Logo Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-urban-primary rounded-lg flex items-center justify-center">
            <Building className="text-white text-lg" size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-urban-text">Urban Bhoomi</h1>
            <p className="text-xs text-gray-500">Real Estate CRM</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;
          
          return (
            <Link key={item.name} href={item.href}>
              <a className={cn(
                "sidebar-nav-item",
                isActive && "active"
              )}>
                <Icon size={20} />
                <span className="font-medium">{item.name}</span>
              </a>
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-urban-secondary rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">
              {getInitials("Admin User")}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-urban-text truncate">Admin User</p>
            <p className="text-xs text-gray-500">admin@urbanbhoomi.com</p>
          </div>
          <Settings className="text-gray-400 hover:text-urban-text cursor-pointer" size={16} />
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  User, Calendar, DollarSign, Settings, 
  ChevronRight, ChevronLeft, Menu 
} from "lucide-react";

const menuItems = [
  { icon: User, label: "الملف الشخصي", href: "#profile" },
  { icon: Calendar, label: "حجوزات", href: "#bookings" },
  { icon: Calendar, label: "المواعيد", href: "#appointments" },
  { icon: DollarSign, label: "الارباح", href: "#earnings" },
  { icon: Settings, label: "الإعدادات", href: "#settings" },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 right-4 z-50 md:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div
        className={cn(
          "fixed top-0 right-0 h-screen bg-white border-l transition-all duration-300 ease-in-out z-40",
          collapsed ? "w-16" : "w-64",
          mobileOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"
        )}
      >
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 -left-4 bg-white border rounded-full shadow-md hidden md:flex"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>

        <div className="flex flex-col gap-2 p-4 mt-16 md:mt-4">
          {menuItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary transition-colors group"
              onClick={() => setMobileOpen(false)}
            >
              <item.icon className="h-5 w-5 text-gray-500 group-hover:text-primary" />
              {!collapsed && (
                <span className="text-gray-700 group-hover:text-primary">
                  {item.label}
                </span>
              )}
            </a>
          ))}
        </div>
      </div>
    </>
  );
}
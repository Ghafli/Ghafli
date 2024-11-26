import { Search, Bell } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="h-16 border-b bg-white/80 backdrop-blur-sm fixed top-0 left-0 right-0 z-10">
      <div className="h-full flex items-center justify-between px-4 sm:px-6 gap-4 max-w-[1400px] mx-auto">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-md hidden sm:block">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="بحث..."
              className="pl-4 pr-10 bg-secondary border-0"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4">
          <Button variant="ghost" size="icon" className="hidden sm:inline-flex">
            <Bell className="h-5 w-5" />
          </Button>
          <Button
            className="w-8 h-8 rounded-full bg-primary text-white"
          >
            ع
          </Button>
        </div>
      </div>
    </header>
  );
}
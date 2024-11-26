import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { DollarSign, Users, Calendar, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { useState } from "react";

// Sample data for booked dates - in a real app, this would come from your backend
const bookedDates = [
  new Date(2024, 2, 15),
  new Date(2024, 2, 16),
  new Date(2024, 2, 20),
  new Date(2024, 2, 21),
];

export default function Index() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  // Custom modifiers for the calendar
  const modifiers = {
    booked: bookedDates,
  };

  // Custom styles for different date states
  const modifiersStyles = {
    booked: {
      color: "#EF4444",
      fontWeight: "bold",
    },
  };

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50">
      <Header />
      <Sidebar />
      
      <main className="pt-24 px-4 md:pr-72 md:pl-8 pb-8">
        <div className="max-w-[1400px] mx-auto">
          <h1 className="text-2xl md:text-3xl font-semibold mb-8">لوحة التحكم</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <StatsCard
              title="إجمالي الإيرادات"
              value="٤٥,٢٣٤ ريال"
              description="زيادة بنسبة ١٢٪ عن الشهر الماضي"
              icon={<DollarSign className="h-6 w-6" />}
            />
            <StatsCard
              title="الحجوزات النشطة"
              value="١٢٣"
              description="٨ حجوزات جديدة اليوم"
              icon={<Calendar className="h-6 w-6" />}
            />
            <StatsCard
              title="العملاء الجدد"
              value="٤٥"
              description="زيادة بنسبة ٥٪ عن الأسبوع الماضي"
              icon={<Users className="h-6 w-6" />}
            />
            <StatsCard
              title="متوسط التقييم"
              value="٤.٨"
              description="٢٣ تقييم جديد هذا الأسبوع"
              icon={<Star className="h-6 w-6" />}
            />
          </div>

          {/* Calendar Section */}
          <div className="lg:col-span-3 bg-white rounded-xl shadow-lg p-6 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold mb-4 md:mb-0">تقويم الحجوزات</h2>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-red-100 border border-red-300"></div>
                  <span>محجوز</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-white border-2 border-primary"></div>
                  <span>متاح</span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center">
              <CalendarComponent
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-lg border-0 p-4 w-full max-w-4xl shadow-sm"
                modifiers={modifiers}
                modifiersStyles={modifiersStyles}
                disabled={[{ before: new Date() }]}
                classNames={{
                  months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                  month: "space-y-4 w-full",
                  caption: "flex justify-between items-center mb-6 px-2",
                  caption_label: "text-2xl font-bold text-gray-900",
                  nav: "flex items-center space-x-2",
                  nav_button: "h-10 w-10 bg-primary/5 hover:bg-primary/10 rounded-full text-primary transition-colors",
                  nav_button_previous: "flex items-center justify-center",
                  nav_button_next: "flex items-center justify-center",
                  table: "w-full border-collapse",
                  head_row: "flex w-full",
                  head_cell: "text-primary rounded-md w-[14.28%] font-medium text-sm py-2",
                  row: "flex w-full mt-1",
                  cell: "relative w-[14.28%] h-14 p-0 text-center focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-primary/5 rounded-md",
                  day: "h-14 w-full p-0 font-normal hover:bg-primary/5 rounded-md transition-colors flex items-center justify-center",
                  day_range_end: "day-range-end",
                  day_selected: "bg-primary text-white hover:bg-primary hover:text-white focus:bg-primary focus:text-white font-bold",
                  day_today: "bg-accent text-accent-foreground font-bold border-2 border-primary",
                  day_outside: "text-gray-400 opacity-50",
                  day_disabled: "text-gray-400 opacity-50 cursor-not-allowed",
                  day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                  day_hidden: "invisible",
                }}
              />
            </div>
          </div>

          {/* Events Section */}
          <div className="lg:col-span-1 bg-primary rounded-xl shadow-lg p-6 text-white">
            <div className="flex flex-col h-full">
              <div className="text-6xl font-bold mb-2">{date?.getDate()}</div>
              <div className="text-xl mb-8">{date?.toLocaleDateString('ar-SA', { weekday: 'long' })}</div>
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">الأحداث الحالية</h3>
                <ul className="space-y-2 text-sm">
                  {bookedDates.some(booked => 
                    booked.toDateString() === date?.toDateString()
                  ) ? (
                    <li className="bg-white/10 p-3 rounded-lg">محجوز</li>
                  ) : (
                    <li className="bg-white/10 p-3 rounded-lg">متاح للحجز</li>
                  )}
                </ul>
              </div>

              <button className="mt-auto bg-white/10 hover:bg-white/20 text-white rounded-lg py-2 px-4 transition-colors">
                إضافة حجز جديد
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

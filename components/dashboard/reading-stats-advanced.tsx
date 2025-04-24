"use client"

import { useState, useEffect } from "react"

import { Clock, BookOpen, Lightbulb, BarChart3, PieChartIcon, LineChartIcon } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/client"




interface ReadingStatsAdvancedProps {
  userId: string
}

export function ReadingStatsAdvanced({ userId }: ReadingStatsAdvancedProps) {
  const [timeStats, setTimeStats] = useState<any[]>([])
  const [bookStats, setBookStats] = useState<any[]>([])
  const [wordStats, setWordStats] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("time")
  const [activeChart, setActiveChart] = useState("bar")
  const supabase = createClient()

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"]

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true)

        // آمار زمان مطالعه
        const { data: timeData, error: timeError } = await supabase.rpc("get_reading_time_stats", {
          user_id_param: userId,
        })

        if (timeError) throw timeError

        // آمار کتاب‌ها
        const { data: bookData, error: bookError } = await supabase.rpc("get_book_stats", { user_id_param: userId })

        if (bookError) throw bookError

        // آمار واژگان
        const { data: wordData, error: wordError } = await supabase.rpc("get_vocabulary_stats", {
          user_id_param: userId,
        })

        if (wordError) throw wordError

        setTimeStats(timeData || [])
        setBookStats(bookData || [])
        setWordStats(wordData || [])
      } catch (error) {
        console.error("خطا در دریافت آمار:", error)
        toast.error("خطا در دریافت آمار. لطفاً دوباره تلاش کنید.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [supabase, userId])

  // تبدیل داده‌ها برای نمودار دایره‌ای
  const getPieData = (data: any[]) => {
    if (activeTab === "time") {
      return data.map((item) => ({
        name: item.day_name,
        value: item.total_minutes,
      }))
    } else if (activeTab === "books") {
      return data.map((item) => ({
        name: item.genre || "نامشخص",
        value: item.count,
      }))
    } else {
      return data.map((item) => ({
        name:
          item.difficulty_level === "beginner"
            ? "مبتدی"
            : item.difficulty_level === "intermediate"
              ? "متوسط"
              : "پیشرفته",
        value: item.count,
      }))
    }
  }

  // نمایش وضعیت بارگذاری
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>آمار مطالعه</CardTitle>
          <CardDescription>در حال بارگذاری آمار...</CardDescription>
        </CardHeader>
        <CardContent className="flex h-80 items-center justify-center">
          <div className="border-primary size-12 animate-spin rounded-full border-4 border-t-transparent"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <BarChart3 className="mr-2 size-5" />
          آمار مطالعه پیشرفته
        </CardTitle>
        <CardDescription>تحلیل جامع فعالیت‌های مطالعه و یادگیری شما</CardDescription>

        <Tabs defaultValue="time" value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="time">
              <Clock className="mr-2 size-4" />
              زمان مطالعه
            </TabsTrigger>
            <TabsTrigger value="books">
              <BookOpen className="mr-2 size-4" />
              کتاب‌ها
            </TabsTrigger>
            <TabsTrigger value="words">
              <Lightbulb className="mr-2 size-4" />
              واژگان
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="mt-2 flex">
          <Button
            variant={activeChart === "bar" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveChart("bar")}
            className="mr-2"
          >
            <BarChart3 className="mr-1 size-4" />
            نمودار ستونی
          </Button>
          <Button
            variant={activeChart === "pie" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveChart("pie")}
            className="mr-2"
          >
            <PieChartIcon className="mr-1 size-4" />
            نمودار دایره‌ای
          </Button>
          <Button
            variant={activeChart === "line" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveChart("line")}
          >
            <LineChartIcon className="mr-1 size-4" />
            نمودار خطی
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <TabsContent value="time" className="mt-0">
          <div className="h-80">
            {activeChart === "bar" && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={timeStats} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day_name" />
                  <YAxis />
                  <Tooltip
                    formatter={(value: any) => [`${value} دقیقه`, "زمان مطالعه"]}
                    labelFormatter={(label) => `روز: ${label}`}
                  />
                  <Bar dataKey="total_minutes" name="زمان مطالعه (دقیقه)" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            )}

            {activeChart === "pie" && (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={getPieData(timeStats)}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {getPieData(timeStats).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value} دقیقه`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}

            {activeChart === "line" && (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeStats} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day_name" />
                  <YAxis />
                  <Tooltip
                    formatter={(value: any) => [`${value} دقیقه`, "زمان مطالعه"]}
                    labelFormatter={(label) => `روز: ${label}`}
                  />
                  <Line type="monotone" dataKey="total_minutes" name="زمان مطالعه (دقیقه)" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </TabsContent>

        <TabsContent value="books" className="mt-0">
          <div className="h-80">
            {activeChart === "bar" && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bookStats} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="genre" />
                  <YAxis />
                  <Tooltip
                    formatter={(value: any) => [`${value} کتاب`, "تعداد"]}
                    labelFormatter={(label) => `ژانر: ${label || "نامشخص"}`}
                  />
                  <Bar dataKey="count" name="تعداد کتاب" fill="#00C49F" />
                </BarChart>
              </ResponsiveContainer>
            )}

            {activeChart === "pie" && (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={getPieData(bookStats)}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name || "نامشخص"} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#00C49F"
                    dataKey="value"
                  >
                    {getPieData(bookStats).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value} کتاب`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}

            {activeChart === "line" && (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={bookStats} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="genre" />
                  <YAxis />
                  <Tooltip
                    formatter={(value: any) => [`${value} کتاب`, "تعداد"]}
                    labelFormatter={(label) => `ژانر: ${label || "نامشخص"}`}
                  />
                  <Line type="monotone" dataKey="count" name="تعداد کتاب" stroke="#00C49F" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </TabsContent>

        <TabsContent value="words" className="mt-0">
          <div className="h-80">
            {activeChart === "bar" && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={wordStats} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="difficulty_level"
                    tickFormatter={(value) =>
                      value === "beginner" ? "مبتدی" : value === "intermediate" ? "متوسط" : "پیشرفته"
                    }
                  />
                  <YAxis />
                  <Tooltip
                    formatter={(value: any) => [`${value} واژه`, "تعداد"]}
                    labelFormatter={(label) =>
                      `سطح: ${label === "beginner" ? "مبتدی" : label === "intermediate" ? "متوسط" : "پیشرفته"}`
                    }
                  />
                  <Bar dataKey="count" name="تعداد واژه" fill="#FFBB28" />
                </BarChart>
              </ResponsiveContainer>
            )}

            {activeChart === "pie" && (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={getPieData(wordStats)}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#FFBB28"
                    dataKey="value"
                  >
                    {getPieData(wordStats).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value} واژه`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}

            {activeChart === "line" && (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={wordStats} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="difficulty_level"
                    tickFormatter={(value) =>
                      value === "beginner" ? "مبتدی" : value === "intermediate" ? "متوسط" : "پیشرفته"
                    }
                  />
                  <YAxis />
                  <Tooltip
                    formatter={(value: any) => [`${value} واژه`, "تعداد"]}
                    labelFormatter={(label) =>
                      `سطح: ${label === "beginner" ? "مبتدی" : label === "intermediate" ? "متوسط" : "پیشرفته"}`
                    }
                  />
                  <Line type="monotone" dataKey="count" name="تعداد واژه" stroke="#FFBB28" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </TabsContent>
      </CardContent>
    </Card>
  )
}

"use client"

import { useState } from "react"

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useQuery } from "@tanstack/react-query"
import { Search, Plus, MoreHorizontal, Pencil, Trash, Filter } from "lucide-react"

import { Pagination } from "@/components/admin/pagination"
import { ErrorBoundary } from "@/components/error-boundary"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useRealtimeUpdates } from "@/hooks/use-realtime-updates"
import { getWordDifficultyColor } from "@/lib/utils"
import { trackAdminAction } from "@/lib/utils/admin-analytics"
import type { Database } from "@/types/supabase"

const ITEMS_PER_PAGE = 10

type Word = Database["public"]["Tables"]["vocabulary"]["Row"]

export default function WordsManagement() {
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const supabase = createClientComponentClient<Database>()

  const { data: totalCount = 0 } = useQuery({
    queryKey: ["words-count", searchQuery],
    queryFn: async () => {
      const query = supabase
        .from("vocabulary")
        .select("id", { count: "exact" })
      
      if (searchQuery) {
        query.or(`word.ilike.%${searchQuery}%,definition.ilike.%${searchQuery}%`)
      }

      const { count, error } = await query

      if (error) {
        console.error("Error fetching words count:", error)
        return 0
      }

      return count || 0
    }
  })

  const { data: words = [], isLoading, refetch } = useQuery({
    queryKey: ["words", currentPage, searchQuery],
    queryFn: async () => {
      const query = supabase
        .from("vocabulary")
        .select()
        .order("mastery_level", { ascending: false })
        .range((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE - 1)
      
      if (searchQuery) {
        query.or(`word.ilike.%${searchQuery}%,definition.ilike.%${searchQuery}%`)
      }

      const { data, error } = await query

      if (error) {
        console.error("Error fetching words:", error)
        return []
      }

      return data
    }
  })

  // Set up real-time updates
  useRealtimeUpdates({
    table: "vocabulary",
    onInsert: () => refetch(),
    onUpdate: () => refetch(),
    onDelete: () => refetch()
  })

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)
  const startItem = (currentPage - 1) * ITEMS_PER_PAGE + 1
  const endItem = Math.min(currentPage * ITEMS_PER_PAGE, totalCount)

  const handleDelete = async (wordId: string) => {
    const { error } = await supabase
      .from("vocabulary")
      .delete()
      .eq("id", wordId)

    if (error) {
      console.error("Error deleting word:", error)
      return
    }

    await trackAdminAction({
      action: "delete_word",
      adminId: (await supabase.auth.getUser()).data.user?.id || "",
      details: { wordId },
      targetId: wordId,
      targetType: "word"
    })

    refetch()
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setCurrentPage(1)
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">مدیریت واژگان</h1>
          <Button className="bg-[#D29E64] text-white hover:bg-[#BE8348]">
            <Plus className="ml-2 size-4" />
            افزودن واژه جدید
          </Button>
        </div>

        <div className="flex items-center space-x-2 space-x-reverse">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-gray-500" />
            <Input
              placeholder="جستجوی واژه یا معنی..."
              className="pl-3 pr-10"
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
          <Button variant="outline">
            <Filter className="ml-2 size-4" />
            فیلترها
          </Button>
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12 text-center">#</TableHead>
                <TableHead>واژه</TableHead>
                <TableHead>معنی</TableHead>
                <TableHead className="text-center">سطح تسلط</TableHead>
                <TableHead className="text-center">کتاب مرتبط</TableHead>
                <TableHead className="text-center">بافت متنی</TableHead>
                <TableHead className="text-left">عملیات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center">
                    در حال بارگذاری...
                  </TableCell>
                </TableRow>
              ) : words.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center">
                    هیچ واژه‌ای یافت نشد.
                  </TableCell>
                </TableRow>
              ) : (
                words.map((word, index) => (
                  <TableRow key={word.id}>
                    <TableCell className="text-center font-medium">
                      {startItem + index}
                    </TableCell>
                    <TableCell className="font-medium">{word.word}</TableCell>
                    <TableCell>{word.definition}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className={getWordDifficultyColor(word.mastery_level)}>
                        {word.mastery_level}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">{word.book_id || "-"}</TableCell>
                    <TableCell className="text-center">{word.context || "-"}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end space-x-2 space-x-reverse">
                        <Button variant="ghost" size="icon">
                          <Pencil className="size-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Pencil className="ml-2 size-4" />
                              ویرایش
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => handleDelete(word.id)}
                            >
                              <Trash className="ml-2 size-4" />
                              حذف
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={ITEMS_PER_PAGE}
              totalItems={totalCount}
              startItem={startItem}
              endItem={endItem}
            />
          )}
        </div>
      </div>
    </ErrorBoundary>
  )
}

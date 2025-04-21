"use server"

import { revalidatePath } from "next/cache"

import { createServerClient } from "@/lib/supabase/server"

/**
 * ذخیره پیشرفت مطالعه کاربر
 * @param bookId شناسه کتاب
 * @param currentPage صفحه فعلی
 * @param readingTime زمان مطالعه (ثانیه)
 */
export async function saveReadingProgress(bookId: string, currentPage: number, readingTime = 0) {
  try {
    const supabase = createServerClient()

    // دریافت اطلاعات کاربر
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, message: "کاربر وارد نشده است" }
    }

    const now = new Date().toISOString()

    // بررسی وجود رکورد پیشرفت
    const { data: existingProgress } = await supabase
      .from("reading_progress")
      .select("id, currentPage, readingTime, bookmarks")
      .eq("user_id", user.id)
      .eq("book_id", bookId)
      .maybeSingle()

    if (existingProgress) {
      // به‌روزرسانی رکورد موجود
      await supabase
        .from("reading_progress")
        .update({
          currentPage,
          lastReadAt: now,
          readingTime: existingProgress.readingTime + Math.floor(readingTime / 60), // تبدیل ثانیه به دقیقه
        })
        .eq("id", existingProgress.id)
    } else {
      // ایجاد رکورد جدید
      await supabase.from("reading_progress").insert({
        user_id: user.id,
        book_id: bookId,
        currentPage,
        lastReadAt: now,
        readingTime: Math.floor(readingTime / 60), // تبدیل ثانیه به دقیقه
        bookmarks: [],
        createdAt: now,
      })
    }

    // ثبت جلسه مطالعه اگر زمان مطالعه بیشتر از 30 ثانیه باشد
    if (readingTime > 30) {
      await supabase.from("reading_sessions").insert({
        user_id: user.id,
        book_id: bookId,
        pages_read: currentPage - (existingProgress?.currentPage || 0),
        reading_time: Math.floor(readingTime / 60), // تبدیل ثانیه به دقیقه
        session_date: now,
      })
    }

    // ثبت در تاریخچه مطالعه
    await supabase.from("reading_history").insert({
      user_id: user.id,
      book_id: bookId,
      page: currentPage,
      readAt: now,
    })

    // به‌روزرسانی آمار کاربر
    await updateUserStats(user.id)

    // به‌روزرسانی صفحه داشبورد
    revalidatePath("/dashboard")
    revalidatePath(`/books/${bookId}`)

    return { success: true }
  } catch (error) {
    console.error("خطا در به‌روزرسانی پیشرفت مطالعه:", error)
    return { success: false, message: "خطا در به‌روزرسانی پیشرفت مطالعه" }
  }
}

/**
 * به‌روزرسانی آمار کاربر
 * @param userId شناسه کاربر
 */
async function updateUserStats(userId: string) {
  try {
    const supabase = createServerClient()

    // محاسبه آمار مطالعه
    const { data: readingStats } = await supabase.rpc("calculate_user_reading_stats", { user_id_param: userId })

    if (!readingStats || readingStats.length === 0) return

    const stats = readingStats[0]

    // بررسی وجود رکورد آمار
    const { data: existingStats } = await supabase.from("user_stats").select("id").eq("userId", userId).maybeSingle()

    if (existingStats) {
      // به‌روزرسانی رکورد موجود
      await supabase
        .from("user_stats")
        .update({
          totalBooksStarted: stats.total_books_started,
          totalBooksCompleted: stats.total_books_completed,
          totalPagesRead: stats.total_pages_read,
          totalReadingTime: stats.total_reading_time,
          lastUpdatedAt: new Date().toISOString(),
        })
        .eq("id", existingStats.id)
    } else {
      // ایجاد رکورد جدید
      await supabase.from("user_stats").insert({
        userId,
        totalBooksStarted: stats.total_books_started,
        totalBooksCompleted: stats.total_books_completed,
        totalPagesRead: stats.total_pages_read,
        totalReadingTime: stats.total_reading_time,
        reviewStreak: 0,
        quizStreak: 0,
        createdAt: new Date().toISOString(),
        lastUpdatedAt: new Date().toISOString(),
      })
    }
  } catch (error) {
    console.error("خطا در به‌روزرسانی آمار کاربر:", error)
  }
}

/**
 * دریافت پیشرفت مطالعه کاربر
 * @param bookId شناسه کتاب
 */
export async function getReadingProgress(bookId: string) {
  try {
    const supabase = createServerClient()

    // دریافت اطلاعات کاربر
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { currentPage: 1, lastReadAt: null, bookmarks: [] }
    }

    // دریافت پیشرفت مطالعه
    const { data } = await supabase
      .from("reading_progress")
      .select("currentPage, lastReadAt, readingTime, bookmarks")
      .eq("user_id", user.id)
      .eq("book_id", bookId)
      .maybeSingle()

    return data || { currentPage: 1, lastReadAt: null, bookmarks: [] }
  } catch (error) {
    console.error("خطا در دریافت پیشرفت مطالعه:", error)
    return { currentPage: 1, lastReadAt: null, bookmarks: [] }
  }
}

/**
 * ذخیره بوکمارک
 * @param bookId شناسه کتاب
 * @param page شماره صفحه
 * @param add اضافه کردن یا حذف کردن
 */
export async function saveBookmark(bookId: string, page: number, add: boolean) {
  try {
    const supabase = createServerClient()

    // دریافت اطلاعات کاربر
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, message: "کاربر وارد نشده است" }
    }

    // دریافت بوکمارک‌های موجود
    const { data: progress } = await supabase
      .from("reading_progress")
      .select("id, bookmarks")
      .eq("user_id", user.id)
      .eq("book_id", bookId)
      .maybeSingle()

    if (!progress) {
      // اگر رکورد پیشرفت وجود ندارد، ایجاد کن
      await supabase.from("reading_progress").insert({
        user_id: user.id,
        book_id: bookId,
        currentPage: page,
        lastReadAt: new Date().toISOString(),
        readingTime: 0,
        bookmarks: add ? [page] : [],
        createdAt: new Date().toISOString(),
      })
    } else {
      // به‌روزرسانی بوکمارک‌ها
      let bookmarks = progress.bookmarks || []

      if (add) {
        // اضافه کردن بوکمارک
        if (!bookmarks.includes(page)) {
          bookmarks.push(page)
        }
      } else {
        // حذف بوکمارک
        bookmarks = bookmarks.filter((p: number) => p !== page)
      }

      await supabase.from("reading_progress").update({ bookmarks }).eq("id", progress.id)
    }

    // به‌روزرسانی صفحه
    revalidatePath(`/books/${bookId}/read`)

    return { success: true }
  } catch (error) {
    console.error("خطا در ذخیره بوکمارک:", error)
    return { success: false, message: "خطا در ذخیره بوکمارک" }
  }
}

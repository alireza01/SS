import { NextResponse } from "next/server"

import { createServerClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient()
    const formData = await request.formData()
    
    // Get form data
    const title = formData.get("title") as string
    const author = formData.get("author") as string
    const description = formData.get("description") as string
    const language = formData.get("language") as string
    const difficulty_level = formData.get("difficulty_level") as string
    const is_published = formData.get("is_published") === "true"
    const cover = formData.get("cover") as File

    // Validate required fields
    if (!title || !language || !difficulty_level) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Upload cover image if provided
    let cover_url = null
    if (cover) {
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("book-covers")
        .upload(`${Date.now()}-${cover.name}`, cover)

      if (uploadError) throw uploadError
      
      const { data: { publicUrl } } = await supabase.storage
        .from("book-covers")
        .getPublicUrl(uploadData.path)
        
      cover_url = publicUrl
    }

    // Insert book data
    const { data: book, error } = await supabase
      .from("books")
      .insert({
        title,
        author,
        description,
        language,
        difficulty_level,
        is_published,
        cover_url,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(book)
  } catch (error) {
    console.error("Error creating book:", error)
    return NextResponse.json(
      { error: "Failed to create book" },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const supabase = await createServerClient()
    const { searchParams } = new URL(request.url)
    
    let query = supabase
      .from("books")
      .select(`
        *,
        book_statistics (
          total_readers,
          completed_readers,
          average_progress
        )
      `)

    // Apply filters
    const search = searchParams.get("search")
    if (search) {
      query = query.ilike("title", `%${search}%`)
    }

    const language = searchParams.get("language")
    if (language) {
      query = query.eq("language", language)
    }

    const difficulty = searchParams.get("difficulty")
    if (difficulty) {
      query = query.eq("difficulty_level", difficulty)
    }

    const published = searchParams.get("published")
    if (published !== null) {
      query = query.eq("is_published", published === "true")
    }

    // Apply sorting
    const sort = searchParams.get("sort") || "created_at"
    const order = searchParams.get("order") || "desc"
    query = query.order(sort, { ascending: order === "asc" })

    // Apply pagination
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const start = (page - 1) * limit
    query = query.range(start, start + limit - 1)

    const { data: books, error, count } = await query

    if (error) throw error

    return NextResponse.json({
      books,
      total: count,
      page,
      limit
    })
  } catch (error) {
    console.error("Error fetching books:", error)
    return NextResponse.json(
      { error: "Failed to fetch books" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createServerClient()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { error: "Book ID is required" },
        { status: 400 }
      )
    }

    // Get book cover URL before deletion
    const { data: book } = await supabase
      .from("books")
      .select("cover_url")
      .eq("id", id)
      .single()

    // Delete book cover if exists
    if (book?.cover_url) {
      const fileName = book.cover_url.split("/").pop()
      await supabase.storage
        .from("book-covers")
        .remove([fileName])
    }

    // Delete book
    const { error } = await supabase
      .from("books")
      .delete()
      .eq("id", id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting book:", error)
    return NextResponse.json(
      { error: "Failed to delete book" },
      { status: 500 }
    )
  }
}
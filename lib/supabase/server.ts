/**
 * @deprecated Use specific clients instead:
 * - For App Router (app/): import { createAppClient } from './app-client'
 * - For Pages Router (pages/): import { createPagesClient } from './pages-client'
 */
export { createAppClient as createServerClient } from "./app-client"
export { createPagesClient } from "./pages-client"

// Export types
export type { Database } from "@/types/supabase" 
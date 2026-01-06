import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.error('No authorization header provided')
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create a Supabase client with the user's token to get their ID
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    })

    // Get the user from the token
    const { data: { user }, error: userError } = await userClient.auth.getUser()
    
    if (userError || !user) {
      console.error('Failed to get user:', userError)
      return new Response(
        JSON.stringify({ error: 'Invalid user token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Deleting account for user: ${user.id}`)

    // Create admin client to delete user data and auth record
    const adminClient = createClient(supabaseUrl, supabaseServiceKey)

    // Delete user data from all tables (RLS won't apply with service role)
    const tables = ['tip_entries', 'goals', 'achievements', 'achievement_progress']
    
    for (const table of tables) {
      const { error: deleteError } = await adminClient
        .from(table)
        .delete()
        .eq('user_id', user.id)
      
      if (deleteError) {
        console.error(`Error deleting from ${table}:`, deleteError)
      } else {
        console.log(`Deleted user data from ${table}`)
      }
    }

    // Delete the user from auth.users
    const { error: authDeleteError } = await adminClient.auth.admin.deleteUser(user.id)
    
    if (authDeleteError) {
      console.error('Error deleting auth user:', authDeleteError)
      return new Response(
        JSON.stringify({ error: 'Failed to delete account' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Successfully deleted account for user: ${user.id}`)

    return new Response(
      JSON.stringify({ success: true, message: 'Account deleted successfully' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

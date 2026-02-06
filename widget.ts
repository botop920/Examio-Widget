
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

// Declare Deno to fix TS error in non-Deno environment
declare const Deno: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // 1. Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 2. Parse Request
    const { key, domain, userAgent } = await req.json()
    
    if (!key) throw new Error("Missing API Key")

    // 3. Init Supabase Admin Client (Service Role)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 4. Validate Key & Fetch Config
    const { data: keyData, error: keyError } = await supabaseAdmin
      .from('widget_api_keys')
      .select(`
        id, 
        batch_token, 
        is_active,
        widget_clients!inner(is_active)
      `)
      .eq('key_value', key)
      .single()

    if (keyError || !keyData) {
      return new Response(
        JSON.stringify({ error: 'Invalid API Key' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!keyData.is_active || !keyData.widget_clients.is_active) {
      return new Response(
        JSON.stringify({ error: 'Account or Key is inactive' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 5. Validate Domain (Origin)
    // In production, 'domain' passed from client is spoofable, 
    // so we also check the Origin header if available.
    const origin = req.headers.get('origin')
    const originHostname = origin ? new URL(origin).hostname : domain;

    const { data: domainData, error: domainError } = await supabaseAdmin
      .from('widget_allowed_domains')
      .select('id')
      .eq('api_key_id', keyData.id)
      .eq('domain', originHostname)
      .maybeSingle()

    if (!domainData) {
      return new Response(
        JSON.stringify({ error: `Domain not allowed: ${originHostname}` }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 6. Log Usage (Async - don't await strictly to speed up response)
    supabaseAdmin
      .from('widget_usage_logs')
      .insert({
        api_key_id: keyData.id,
        domain: originHostname,
        user_agent: userAgent,
        ip_address: req.headers.get('x-forwarded-for') || 'unknown'
      })
      .then(({ error }) => { if (error) console.error('Log error:', error) })

    // 7. Return Success & Exam URL
    // Construct the actual URL your React app uses
    // Assuming your main app is hosted at the SUPABASE_URL origin or a specific domain
    const appUrl = "https://www.examio.xyz"; // Replace with your actual production URL
    const examUrl = `${appUrl}/?batch_token=${keyData.batch_token}&embed=true`;

    return new Response(
      JSON.stringify({ 
        success: true, 
        examUrl: examUrl 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

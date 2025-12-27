import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface FeedbackRequest {
  rating: number;
  message: string;
  userEmail?: string;
  screenshots?: string[];
}

// HTML escape function to prevent XSS
const escapeHtml = (str: string): string => {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.log("Missing authorization header");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Verify the JWT token
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      console.log("Auth error:", authError?.message);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Authenticated user:", user.id);

    const { rating, message, userEmail, screenshots }: FeedbackRequest = await req.json();

    // Input validation
    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      return new Response(
        JSON.stringify({ error: "Invalid rating. Must be between 1 and 5." }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!message || typeof message !== 'string') {
      return new Response(
        JSON.stringify({ error: "Message is required." }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Limit message length to prevent abuse
    if (message.length > 2000) {
      return new Response(
        JSON.stringify({ error: "Message is too long. Maximum 2000 characters." }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Received feedback:", { rating, messageLength: message.length, userEmail, screenshotCount: screenshots?.length || 0 });

    // Escape all user-provided content
    const safeMessage = escapeHtml(message);
    const safeUserEmail = userEmail ? escapeHtml(userEmail) : null;

    const screenshotSection = screenshots && screenshots.length > 0 
      ? `<h3>Screenshots:</h3><p>${screenshots.length} screenshot(s) attached</p>`
      : '';

    const emailResponse = await resend.emails.send({
      from: "Tip Tracker App <onboarding@resend.dev>",
      to: ["tips.plus.app.feedback@gmail.com"],
      subject: `New Feedback - ${rating} Star${rating !== 1 ? 's' : ''}`,
      html: `
        <h1>New Feedback Received</h1>
        <h2>Rating: ${rating}/5 Stars</h2>
        <h3>Message:</h3>
        <p>${safeMessage}</p>
        ${safeUserEmail ? `<h3>User Email:</h3><p>${safeUserEmail}</p>` : ''}
        ${screenshotSection}
        <hr>
        <p><small>Sent from Tip Tracker App by user ${user.id}</small></p>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailId: emailResponse.data?.id }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-feedback function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

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

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { rating, message, userEmail, screenshots }: FeedbackRequest = await req.json();

    console.log("Received feedback:", { rating, message, userEmail, screenshotCount: screenshots?.length || 0 });

    const screenshotSection = screenshots && screenshots.length > 0 
      ? `<h3>Screenshots:</h3><p>${screenshots.length} screenshot(s) attached</p>`
      : '';

    const emailResponse = await resend.emails.send({
      from: "Tip Tracker App <onboarding@resend.dev>",
      to: ["tips.plus.app.feedback@gmail.com"], // Your email address for receiving feedback
      subject: `New Feedback - ${rating} Star${rating !== 1 ? 's' : ''}`,
      html: `
        <h1>New Feedback Received</h1>
        <h2>Rating: ${rating}/5 Stars</h2>
        <h3>Message:</h3>
        <p>${message}</p>
        ${userEmail ? `<h3>User Email:</h3><p>${userEmail}</p>` : ''}
        ${screenshotSection}
        <hr>
        <p><small>Sent from Tip Tracker App</small></p>
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
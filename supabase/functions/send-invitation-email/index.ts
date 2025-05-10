
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface InvitationEmailRequest {
  inviteeEmail: string;
  boardName: string;
  inviterName: string;
  inviterEmail: string;
  role: string;
  invitationId: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { inviteeEmail, boardName, inviterName, inviterEmail, role, invitationId }: InvitationEmailRequest = await req.json();
    
    const baseUrl = req.headers.get("origin") || "http://localhost:3000";
    const acceptUrl = `${baseUrl}/invitations/${invitationId}/accept`;
    const declineUrl = `${baseUrl}/invitations/${invitationId}/decline`;
    
    const roleLabel = role === "member" ? "edit" : "view only";

    const emailResponse = await resend.emails.send({
      from: "TaskForge <onboarding@resend.dev>",
      to: [inviteeEmail],
      subject: `You've been invited to collaborate on "${boardName}"`,
      html: `
        <div style="font-family: sans-serif; margin: 0 auto; max-width: 600px; padding: 20px;">
          <h2 style="color: #3b82f6; margin-bottom: 20px;">TaskForge Board Invitation</h2>
          <p>Hello,</p>
          <p><strong>${inviterName}</strong> (${inviterEmail}) has invited you to collaborate on the board <strong>"${boardName}"</strong> with <strong>${roleLabel}</strong> access.</p>
          
          <div style="margin: 30px 0;">
            <a href="${acceptUrl}" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin-right: 10px;">Accept Invitation</a>
            <a href="${declineUrl}" style="background-color: #e5e7eb; color: #4b5563; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Decline</a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 40px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
            If you're having trouble with the buttons above, copy and paste these URLs into your browser:
            <br><br>
            <strong>Accept:</strong> ${acceptUrl}
            <br>
            <strong>Decline:</strong> ${declineUrl}
          </p>
        </div>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-invitation-email function:", error);
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

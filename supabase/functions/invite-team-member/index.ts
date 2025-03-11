import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Create Supabase client with admin privileges
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // Get the JWT from the request headers
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing Authorization header");
    }

    // Verify the JWT and get the user
    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    // Parse request body
    const { email, role, companyId } = await req.json();

    if (!email || !role || !companyId) {
      throw new Error("Missing required fields");
    }

    // Check if the inviter is a member of the company with appropriate permissions
    const { data: inviterMembership, error: membershipError } =
      await supabaseAdmin
        .from("company_members")
        .select("role")
        .eq("user_id", user.id)
        .eq("company_id", companyId)
        .single();

    if (membershipError || !inviterMembership) {
      throw new Error(
        "You do not have permission to invite members to this company",
      );
    }

    // Only Owner/Admin or Manager can invite new members
    if (!["Owner/Admin", "Manager"].includes(inviterMembership.role)) {
      throw new Error("You do not have permission to invite members");
    }

    // Check if user with this email already exists
    const { data: existingUser } = await supabaseAdmin
      .from("user_profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    let userId = existingUser?.id;

    // If user doesn't exist, create a placeholder user profile
    if (!userId) {
      // Generate a random UUID for the pending user
      userId = crypto.randomUUID();

      // Create a placeholder user profile
      await supabaseAdmin.from("user_profiles").insert({
        id: userId,
        email: email,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    // Check if user is already a member of this company
    const { data: existingMember } = await supabaseAdmin
      .from("company_members")
      .select("id")
      .eq("user_id", userId)
      .eq("company_id", companyId)
      .maybeSingle();

    if (existingMember) {
      throw new Error("This user is already a member of your company");
    }

    // Add user to company_members
    await supabaseAdmin.from("company_members").insert({
      user_id: userId,
      company_id: companyId,
      role: role,
      created_at: new Date().toISOString(),
      is_active: true,
    });

    // TODO: Send invitation email using a service like SendGrid or Mailgun
    // This would typically involve calling another API

    return new Response(
      JSON.stringify({
        success: true,
        message: "Invitation sent successfully",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    console.error("Error processing invitation:", error);

    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      },
    );
  }
});

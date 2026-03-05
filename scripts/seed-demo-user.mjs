/**
 * Creates a demo/admin user and seeds sample data.
 * Requires: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in env.
 *
 * Demo login: demo@example.com / DemoAdmin1!
 * Run: SUPABASE_SERVICE_ROLE_KEY=your-service-role-key node scripts/seed-demo-user.mjs
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const DEMO_EMAIL = "demo@example.com";
const DEMO_PASSWORD = "DemoAdmin1!";

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    "Missing env. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (from Supabase Dashboard → Settings → API → service_role secret)."
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  const { data: existing } = await supabase.auth.admin.listUsers();
  const found = existing?.users?.find((u) => u.email === DEMO_EMAIL);

  let userId;
  if (found) {
    userId = found.id;
    console.log("Demo user already exists:", DEMO_EMAIL);
  } else {
    const { data: created, error } = await supabase.auth.admin.createUser({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
      email_confirm: true,
    });
    if (error) {
      console.error("Failed to create demo user:", error.message);
      process.exit(1);
    }
    userId = created.user.id;
    console.log("Created demo user:", DEMO_EMAIL);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", userId)
    .single();

  if (profile) {
    await supabase.from("profiles").update({ role: "admin" }).eq("user_id", userId);
    console.log("Updated profile to admin");
  } else {
    await supabase.from("profiles").insert({ user_id: userId, role: "admin" });
    console.log("Inserted profile as admin");
  }

  const { data: companies } = await supabase.from("companies").select("id").eq("user_id", userId);
  if (companies?.length) {
    console.log("Sample data already present, skipping seed.");
    printLogin();
    return;
  }

  const { data: c1 } = await supabase
    .from("companies")
    .insert({ user_id: userId, name: "Acme Corp", website: "https://acme.example.com" })
    .select("id")
    .single();
  const { data: c2 } = await supabase
    .from("companies")
    .insert({ user_id: userId, name: "TechStart Inc" })
    .select("id")
    .single();

  const company1 = c1?.id;
  const company2 = c2?.id;
  if (company1) {
    await supabase.from("jobs").insert([
      {
        user_id: userId,
        company_id: company1,
        title: "Senior Software Engineer",
        status: "interview",
        source: "LinkedIn",
        applied_at: new Date().toISOString().slice(0, 10),
      },
      {
        user_id: userId,
        company_id: company1,
        title: "Staff Engineer",
        status: "applied",
        source: "Company website",
        applied_at: new Date().toISOString().slice(0, 10),
      },
    ]);
  }
  if (company2) {
    await supabase.from("jobs").insert({
      user_id: userId,
      company_id: company2,
      title: "Full Stack Developer",
      status: "offer",
      source: "Referral",
      applied_at: new Date().toISOString().slice(0, 10),
    });
  }

  console.log("Seeded sample companies and jobs.");
  printLogin();
}

function printLogin() {
  console.log("\n--- Demo / Admin login ---");
  console.log("Email:", DEMO_EMAIL);
  console.log("Password:", DEMO_PASSWORD);
  console.log("Log in at http://localhost:3000/login");
  console.log("--------------------------\n");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

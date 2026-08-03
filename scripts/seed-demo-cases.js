import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// Parse backend/.env manually if process.env is not fully set
let supabaseUrl = process.env.SUPABASE_URL;
let supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  try {
    const envPath = path.resolve("backend/.env");
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf8");
      content.split("\n").forEach((line) => {
        const [k, v] = line.split("=");
        if (k && v) {
          const key = k.trim();
          const val = v.trim();
          if (key === "SUPABASE_URL") supabaseUrl = val;
          if (key === "SUPABASE_SERVICE_ROLE_KEY") supabaseKey = val;
        }
      });
    }
  } catch (err) {
    // Ignore error
  }
}

if (!supabaseUrl || !supabaseKey) {
  console.error("Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in backend/.env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log("Starting KatarunganHub Demo Cases Seeding...");

async function seed() {
  // 1. Ensure Categories
  const categoriesList = ["Neighborhood Dispute", "Unpaid Debt", "Property Damage", "Physical Injury", "Public Disturbance"];
  const categoryMap = {};

  for (const catName of categoriesList) {
    const { data: existing } = await supabase.from("complaint_categories").select("id").eq("name", catName).single();
    if (existing) {
      categoryMap[catName] = existing.id;
    } else {
      const { data: inserted } = await supabase.from("complaint_categories").insert({ name: catName }).select().single();
      if (inserted) categoryMap[catName] = inserted.id;
    }
  }

  // 2. Ensure Priority Levels
  const priorityList = [
    { name: "High", rank: 1 },
    { name: "Medium", rank: 2 },
    { name: "Low", rank: 3 },
  ];
  const priorityMap = {};

  for (const p of priorityList) {
    const { data: existing } = await supabase.from("priority_levels").select("id").eq("name", p.name).single();
    if (existing) {
      priorityMap[p.name] = existing.id;
    } else {
      const { data: inserted } = await supabase.from("priority_levels").insert(p).select().single();
      if (inserted) priorityMap[p.name] = inserted.id;
    }
  }

  // 3. Fetch existing profiles to link complainants & respondents
  const { data: profiles } = await supabase.from("profiles").select("id, full_name, role");

  const punong = profiles?.find((p) => p.role === "punong") || profiles?.[0];
  const secretary = profiles?.find((p) => p.role === "secretary") || profiles?.[0];
  const luponMember = profiles?.find((p) => p.role === "lupon") || profiles?.[0];
  const complainant = profiles?.find((p) => p.role === "complainant") || profiles?.[0];
  const respondent = profiles?.find((p) => p.role === "respondent") || profiles?.[0];

  // Helper date generators
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const tomorrowMorning = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  tomorrowMorning.setHours(9, 0, 0, 0);

  const DEMO_CASES = [
    {
      reference_number: "KH-2026-001",
      case_number: "KP-2026-001",
      type: "Lupon",
      title: "Boundary Line & Fencing Property Dispute",
      category_id: categoryMap["Neighborhood Dispute"],
      priority_id: priorityMap["High"],
      complainant_id: complainant?.id,
      respondent_id: respondent?.id,
      status: "Closed",
      workflow_stage: "Closed",
      narrative: "Complainant claims respondent constructed a concrete perimeter fence encroaching 0.5 meters into complainant's lot boundary in Sitio Sampaguita.",
      relief: "Removal of encroaching fence and amicable settlement on exact property line based on survey.",
      created_by: secretary?.id,
      filed_at: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      schedules: [
        {
          type: "Punong Barangay Hearing",
          scheduled_at: yesterday.toISOString(),
          venue: "Barangay Hall Conference Room",
          facilitator_id: punong?.id,
          status: "Completed",
        },
      ],
      logs: [
        { previous_stage: null, outcome: "Case Encoded", next_stage: "Summons issued", authorized_by: secretary?.id, notes: "Officially filed in person at Barangay Hall." },
        { previous_stage: "Summons issued", outcome: "Amicable settlement reached", next_stage: "Closed", authorized_by: punong?.id, notes: "Both parties agreed to adjust fence boundaries amicably. KP Form 16 signed." },
      ],
      document: { type: "Amicable settlement", status: "Approved" },
    },
    {
      reference_number: "KH-2026-002",
      case_number: "KP-2026-002",
      type: "Lupon",
      title: "Unpaid Personal Loan of ₱25,000",
      category_id: categoryMap["Unpaid Debt"],
      priority_id: priorityMap["Medium"],
      complainant_id: complainant?.id,
      respondent_id: respondent?.id,
      status: "Closed",
      workflow_stage: "Closed",
      narrative: "Respondent borrowed ₱25,000 in January 2026 with agreement to repay in 3 months. Overdue by 6 months despite repeated written demands.",
      relief: "Full settlement of ₱25,000 principal amount.",
      created_by: secretary?.id,
      filed_at: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      schedules: [
        {
          type: "Punong Barangay Hearing",
          scheduled_at: yesterday.toISOString(),
          venue: "Barangay Hall Session Room",
          facilitator_id: punong?.id,
          status: "Completed",
        },
      ],
      attendance: {
        complainant_attendance: "Present",
        respondent_attendance: "Absent",
        remarks: "Respondent failed to appear despite due notice of summons without valid justification.",
      },
      logs: [
        { previous_stage: null, outcome: "Case Encoded", next_stage: "Summons issued", authorized_by: secretary?.id, notes: "Encoded upon physical filing." },
        { previous_stage: "Summons issued", outcome: "Respondent failed to appear without valid reason", next_stage: "Closed", authorized_by: punong?.id, notes: "Willful refusal to appear. Certificate to File Action (KP Form 20) issued." },
      ],
      document: { type: "Certification to File Action", status: "Approved" },
    },
    {
      reference_number: "KH-2026-003",
      case_number: "KP-2026-003",
      type: "Lupon",
      title: "Neighborhood Damage to Property & Vandalism",
      category_id: categoryMap["Property Damage"],
      priority_id: priorityMap["High"],
      complainant_id: complainant?.id,
      respondent_id: respondent?.id,
      status: "Under Mediation",
      workflow_stage: "Pangkat hearing 3",
      narrative: "Damage caused to complainant's steel gate and front porch lamps during an argument between neighbors.",
      relief: "Reimbursement of ₱8,500 repair costs.",
      created_by: secretary?.id,
      filed_at: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      schedules: [
        {
          type: "Pangkat Hearing",
          scheduled_at: tomorrowMorning.toISOString(),
          venue: "Barangay Session Hall",
          facilitator_id: luponMember?.id,
          status: "Scheduled",
        },
      ],
      logs: [
        { previous_stage: null, outcome: "Case Encoded", next_stage: "Summons issued", authorized_by: secretary?.id, notes: "Encoded at office." },
        { previous_stage: "Summons issued", outcome: "Unsettled", next_stage: "Pangkat hearing 1", authorized_by: punong?.id, notes: "Referred to Pangkat Tagapamayapa." },
        { previous_stage: "Pangkat hearing 1", outcome: "Unsettled", next_stage: "Pangkat hearing 2", authorized_by: secretary?.id, notes: "2nd session conducted, ongoing conciliation." },
      ],
    },
    {
      reference_number: "KH-2026-004",
      case_number: "KP-2026-004",
      type: "Non-Lupon",
      title: "Commercial Breach of Corporate Contract",
      category_id: categoryMap["Neighborhood Dispute"],
      priority_id: priorityMap["Low"],
      complainant_id: complainant?.id,
      respondent_id: respondent?.id,
      status: "Active",
      workflow_stage: "Referred to Court",
      narrative: "Contractual dispute involving corporate business entities and commercial lease agreement.",
      relief: "Immediate referral to City Trial Court (Exempted from Barangay Conciliation).",
      created_by: secretary?.id,
      filed_at: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      logs: [
        { previous_stage: null, outcome: "Case Encoded", next_stage: "Jurisdiction Review", authorized_by: secretary?.id, notes: "Encoded." },
        { previous_stage: "Jurisdiction Review", outcome: "Potentially not covered", next_stage: "Referred to Court", authorized_by: punong?.id, notes: "Exempted under RA 7160 (Juridical entity). Direct referral issued." },
      ],
    },
    {
      reference_number: "KH-2026-005",
      case_number: "KP-2026-005",
      type: "Lupon",
      title: "Nighttime Loud Karaoke & Public Nuisance",
      category_id: categoryMap["Public Disturbance"],
      priority_id: priorityMap["Medium"],
      complainant_id: complainant?.id,
      respondent_id: respondent?.id,
      status: "Under Mediation",
      workflow_stage: "Summons issued",
      narrative: "Persistent loud sound system and karaoke sessions past 11:00 PM disturbing neighbors on weeknights.",
      relief: "Adherence to Barangay quiet hours curfew (10:00 PM) and public peace agreement.",
      created_by: secretary?.id,
      filed_at: new Date().toISOString(),
      schedules: [
        {
          type: "Punong Barangay Hearing",
          scheduled_at: tomorrowMorning.toISOString(),
          venue: "Barangay Hall Main Hearing Office",
          facilitator_id: punong?.id,
          status: "Scheduled",
        },
      ],
      logs: [
        { previous_stage: null, outcome: "Case Encoded", next_stage: "Summons issued", authorized_by: secretary?.id, notes: "Summons issued for tomorrow morning at 9:00 AM." },
      ],
    },
  ];

  for (const c of DEMO_CASES) {
    const { schedules, logs, attendance, document, ...complaintPayload } = c;

    // Check if case exists by reference_number
    const { data: existingCase } = await supabase.from("complaints").select("id").eq("reference_number", c.reference_number).single();

    let complaintId = existingCase?.id;

    if (!existingCase) {
      const { data: insertedCase, error: caseErr } = await supabase.from("complaints").insert(complaintPayload).select().single();
      if (caseErr) {
        console.error(`Failed to insert case ${c.reference_number}:`, caseErr.message);
        continue;
      }
      complaintId = insertedCase.id;
      console.log(`✓ Seeded Case: ${c.reference_number} - "${c.title}"`);
    } else {
      console.log(`ℹ Case ${c.reference_number} already exists.`);
    }

    // Insert schedules if any
    if (schedules && complaintId) {
      for (const s of schedules) {
        await supabase.from("mediation_schedules").insert({
          complaint_id: complaintId,
          ...s,
        });
      }
    }

    // Insert status logs if any
    if (logs && complaintId) {
      for (const log of logs) {
        await supabase.from("case_status_logs").insert({
          complaint_id: complaintId,
          ...log,
        });
      }
    }

    // Insert attendance if any
    if (attendance && complaintId) {
      await supabase.from("attendance_records").insert({
        complaint_id: complaintId,
        ...attendance,
        recorded_by: secretary?.id,
      });
    }

    // Insert document if any
    if (document && complaintId) {
      await supabase.from("documents").insert({
        complaint_id: complaintId,
        type: document.type,
        status: document.status,
        version: "v1.0",
        prepared_by: secretary?.id,
      });
    }
  }

  console.log("\n🎉 Demo Cases Seeding Complete! All 5 scenarios are now populated in your database.");
}

seed().catch((err) => console.error("Seeding error:", err));

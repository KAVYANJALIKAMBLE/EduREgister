import { NextResponse } from "next/server";

let dbModule = null;

async function getQuery() {
  if (!dbModule) {
    try {
      dbModule = await import("@/lib/db");
    } catch (e) {
      console.error("[DB] Failed to import db module:", e.message);
      return null;
    }
  }
  return dbModule.query;
}

// GET all students with their class/division info via enrollments
export async function GET() {
  try {
    const query = await getQuery();
    if (!query) {
      return NextResponse.json([]);
    }

    const result = await query(`
      SELECT
        s.id,
        s.gr_number,
        s.admission_number,
        s.roll_number,
        s.first_name_en,
        s.middle_name_en,
        s.last_name_en,
        s.first_name_mr,
        s.middle_name_mr,
        s.last_name_mr,
        s.gender,
        s.dob,
        s.blood_group,
        s.caste,
        s.category,
        s.religion,
        s.aadhaar_number,
        s.mother_tongue,
        s.nationality,
        s.address_line1,
        s.city,
        s.state,
        s.pincode,
        s.photo_url,
        s.admission_date,
        s.is_active,
        s.created_at,
        c.class_name,
        d.division_name
      FROM public.students s
      LEFT JOIN public.student_enrollments se ON se.student_id = s.id
      LEFT JOIN public.classes c ON c.id = se.class_id
      LEFT JOIN public.divisions d ON d.id = se.division_id
      WHERE s.is_active = true
      ORDER BY s.created_at DESC
    `);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("[API /students GET] Error:", error.message);
    return NextResponse.json([]);
  }
}

// Helper: get or create school
async function getOrCreateSchool(query) {
  const res = await query("SELECT id FROM public.schools LIMIT 1");
  if (res.rows.length > 0) return res.rows[0].id;
  const newSchool = await query(
    "INSERT INTO public.schools (school_name) VALUES ($1) RETURNING id",
    ["Default School"]
  );
  return newSchool.rows[0].id;
}

// Helper: get or create class by name
async function getOrCreateClass(query, schoolId, className) {
  if (!className) return null;
  const res = await query(
    "SELECT id FROM public.classes WHERE school_id = $1 AND class_name = $2",
    [schoolId, className]
  );
  if (res.rows.length > 0) return res.rows[0].id;
  // Determine class order from name
  const orderMap = { '1st': 1, '2nd': 2, '3rd': 3, '4th': 4, '5th': 5, '6th': 6, '7th': 7, '8th': 8, '9th': 9, '10th': 10, '11th': 11, '12th': 12 };
  const order = orderMap[className] || null;
  const newClass = await query(
    "INSERT INTO public.classes (school_id, class_name, class_order) VALUES ($1, $2, $3) RETURNING id",
    [schoolId, className, order]
  );
  return newClass.rows[0].id;
}

// Helper: get or create division
async function getOrCreateDivision(query, classId, divisionName) {
  if (!classId || !divisionName) return null;
  const res = await query(
    "SELECT id FROM public.divisions WHERE class_id = $1 AND division_name = $2",
    [classId, divisionName]
  );
  if (res.rows.length > 0) return res.rows[0].id;
  const newDiv = await query(
    "INSERT INTO public.divisions (class_id, division_name) VALUES ($1, $2) RETURNING id",
    [classId, divisionName]
  );
  return newDiv.rows[0].id;
}

// Helper: get or create academic year
async function getOrCreateAcademicYear(query, schoolId) {
  const res = await query(
    "SELECT id FROM public.academic_years WHERE school_id = $1 AND is_current = true LIMIT 1",
    [schoolId]
  );
  if (res.rows.length > 0) return res.rows[0].id;
  const newAy = await query(
    "INSERT INTO public.academic_years (school_id, year_label, start_date, end_date, is_current) VALUES ($1, $2, $3, $4, true) RETURNING id",
    [schoolId, '2025-26', '2025-06-01', '2026-04-30']
  );
  return newAy.rows[0].id;
}

// POST - add a new student
export async function POST(request) {
  try {
    const query = await getQuery();
    if (!query) {
      return NextResponse.json({ error: "Database not available" }, { status: 503 });
    }

    const body = await request.json();
    const {
      first_name_en, middle_name_en, last_name_en,
      first_name_mr, middle_name_mr, last_name_mr,
      gender, dob, blood_group, caste, category, religion,
      aadhaar_number, mother_tongue, nationality,
      address_line1, city, state, pincode,
      gr_number, admission_number, roll_number,
      class_name, division_name
    } = body;

    if (!first_name_en || !gr_number) {
      return NextResponse.json(
        { error: "first_name_en and gr_number are required" },
        { status: 400 }
      );
    }

    // Get or create school
    const schoolId = await getOrCreateSchool(query);

    // Insert student
    const result = await query(
      `INSERT INTO public.students (
        school_id, gr_number, admission_number, roll_number,
        first_name_en, middle_name_en, last_name_en,
        first_name_mr, middle_name_mr, last_name_mr,
        gender, dob, blood_group, caste, category, religion,
        aadhaar_number, mother_tongue, nationality,
        address_line1, city, state, pincode
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23
      ) RETURNING *`,
      [
        schoolId, gr_number, admission_number || null, roll_number || null,
        first_name_en, middle_name_en || null, last_name_en || null,
        first_name_mr || null, middle_name_mr || null, last_name_mr || null,
        gender || null, dob || null, blood_group || null,
        caste || null, category || null, religion || null,
        aadhaar_number || null, mother_tongue || null, nationality || 'Indian',
        address_line1 || null, city || null, state || null, pincode || null
      ]
    );

    const studentId = result.rows[0].id;

    // Create enrollment with class and division
    if (class_name) {
      const classId = await getOrCreateClass(query, schoolId, class_name);
      const divisionId = await getOrCreateDivision(query, classId, division_name);
      const ayId = await getOrCreateAcademicYear(query, schoolId);

      await query(
        "INSERT INTO public.student_enrollments (student_id, academic_year_id, class_id, division_id, roll_number) VALUES ($1, $2, $3, $4, $5)",
        [studentId, ayId, classId, divisionId, roll_number || null]
      );
    }

    return NextResponse.json({ message: "Student Added", student: result.rows[0] }, { status: 201 });
  } catch (error) {
    console.error("[API /students POST] Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

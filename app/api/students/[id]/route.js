import { NextResponse } from "next/server";

export async function DELETE(_request, { params }) {
  try {
    const { query } = await import("@/lib/db");
    const paramsResolved = await params;
    const id = paramsResolved.id;

    if (!id) {
      return new Response("Invalid student id", { status: 400 });
    }

    // Soft delete (set is_active = false) instead of hard delete
    await query("UPDATE public.students SET is_active = false, updated_at = now() WHERE id = $1", [id]);
    return new Response("Deleted", { status: 200 });
  } catch (error) {
    console.error("[API /students/[id] DELETE] Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(_request, { params }) {
  try {
    const { query } = await import("@/lib/db");
    const paramsResolved = await params;
    const id = paramsResolved.id;

    const result = await query(`
      SELECT
        s.*,
        c.class_name,
        d.division_name
      FROM public.students s
      LEFT JOIN public.student_enrollments se ON se.student_id = s.id
      LEFT JOIN public.classes c ON c.id = se.class_id
      LEFT JOIN public.divisions d ON d.id = se.division_id
      WHERE s.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("[API /students/[id] GET] Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

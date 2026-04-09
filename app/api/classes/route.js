import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { query } = await import("@/lib/db");

    const result = await query(`
      SELECT
        c.id as class_id,
        c.class_name,
        c.class_order,
        json_agg(
          json_build_object('id', d.id, 'division_name', d.division_name)
          ORDER BY d.division_name
        ) FILTER (WHERE d.id IS NOT NULL) as divisions
      FROM public.classes c
      LEFT JOIN public.divisions d ON d.class_id = c.id
      GROUP BY c.id, c.class_name, c.class_order
      ORDER BY c.class_order NULLS LAST, c.class_name
    `);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("[API /classes GET] Error:", error.message);
    return NextResponse.json([]);
  }
}

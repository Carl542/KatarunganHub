import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { getSupabaseClient } from "../lib/supabaseClient.js";

const router = Router();

router.get(
  "/summary",
  requireAuth,
  requireRole("admin", "punong", "secretary", "lupon"),
  async (req, res) => {
    const supabase = getSupabaseClient();
    const { dateFrom, dateTo, filedBy } = req.query;

    let query = supabase.from("complaints").select("status, type");
    if (dateFrom) query = query.gte("filed_at", dateFrom);
    if (dateTo) query = query.lte("filed_at", dateTo);
    if (filedBy) query = query.eq("created_by", filedBy);

    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });

    const byStatus = {};
    const byType = {};
    let closed = 0;

    for (const row of data) {
      byStatus[row.status] = (byStatus[row.status] || 0) + 1;
      byType[row.type] = (byType[row.type] || 0) + 1;
      if (row.status === "Closed") closed += 1;
    }

    res.json({
      total: data.length,
      active: data.length - closed,
      closed,
      byStatus,
      byType,
    });
  }
);

export default router;

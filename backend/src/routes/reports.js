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
    const { dateFrom, dateTo, filedBy, type, status, search } = req.query;

    let query = supabase
      .from("complaints")
      .select(
        "id, title, reference_number, status, type, category:complaint_categories(name), priority:priority_levels(name), complainant:profiles!complainant_id(full_name)"
      );
    if (dateFrom) query = query.gte("filed_at", dateFrom);
    if (dateTo) query = query.lte("filed_at", dateTo);
    if (filedBy) query = query.eq("created_by", filedBy);
    if (type && type !== "All") query = query.eq("type", type);
    if (status && status !== "All") query = query.eq("status", status);
    if (search) query = query.or(`title.ilike.%${search}%,reference_number.ilike.%${search}%`);

    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });

    const byStatus = {};
    const byType = {};
    const byCategory = {};
    const byPriority = {};
    const byProponent = {};
    let closed = 0;

    for (const row of data) {
      byStatus[row.status] = (byStatus[row.status] || 0) + 1;
      byType[row.type] = (byType[row.type] || 0) + 1;
      const categoryName = row.category?.name || "Uncategorized";
      const priorityName = row.priority?.name || "Unset";
      byCategory[categoryName] = (byCategory[categoryName] || 0) + 1;
      byPriority[priorityName] = (byPriority[priorityName] || 0) + 1;
      const proponentName = row.complainant?.full_name || "Unknown";
      byProponent[proponentName] = (byProponent[proponentName] || 0) + 1;
      if (row.status === "Closed") closed += 1;
    }

    const byLupon = {};
    const complaintIds = data.map((row) => row.id);
    if (complaintIds.length > 0) {
      const { data: formations, error: pangkatError } = await supabase
        .from("pangkat_formations")
        .select(
          "complaint_id, chairperson:profiles!chairperson_id(full_name), secretary:profiles!secretary_id(full_name), member:profiles!member_id(full_name)"
        )
        .in("complaint_id", complaintIds);

      if (pangkatError) return res.status(500).json({ error: pangkatError.message });

      for (const formation of formations) {
        for (const person of [formation.chairperson, formation.secretary, formation.member]) {
          const name = person?.full_name;
          if (!name) continue;
          byLupon[name] = (byLupon[name] || 0) + 1;
        }
      }
    }

    res.json({
      total: data.length,
      active: data.length - closed,
      closed,
      byStatus,
      byType,
      byCategory,
      byPriority,
      byProponent,
      byLupon,
    });
  }
);

export default router;

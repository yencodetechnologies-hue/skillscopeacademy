/**
 * One booking (payment + course) should expose at most one employee link.
 * Keeps the link with the most usage; if tied, keeps the oldest.
 */
function dedupeCourseLinks(links) {
  if (!Array.isArray(links) || links.length === 0) return [];

  const byKey = new Map();

  for (const link of links) {
    const paymentId = String(link.companyPaymentId || "");
    const courseId = String(link.courseId || "");
    const key = `${paymentId}::${courseId}`;
    const existing = byKey.get(key);

    if (!existing) {
      byKey.set(key, link);
      continue;
    }

    const keepCurrent =
      link.usedCount > existing.usedCount ||
      (link.usedCount === existing.usedCount &&
        new Date(link.createdAt) < new Date(existing.createdAt));

    byKey.set(key, keepCurrent ? link : existing);
  }

  return Array.from(byKey.values()).sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
}

module.exports = { dedupeCourseLinks };

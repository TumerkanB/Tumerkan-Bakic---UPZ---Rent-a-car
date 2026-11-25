import type { RowDataPacket } from 'mysql2/promise';
import { pool, withDbSession } from '../../db/pool.js';
import { NotFoundError } from '../../errors/AppError.js';

interface CountRow extends RowDataPacket {
  total: number;
}

export async function listPayments(params: {
  page: number;
  pageSize: number;
  q?: string;
  paymentType?: string;
  userBranchId: number | null;
}) {
  const conditions: string[] = [];
  const values: unknown[] = [];

  if (params.userBranchId !== null) {
    conditions.push('r.pickupBranchID = ?');
    values.push(params.userBranchId);
  }
  if (params.paymentType) {
    conditions.push('vp.paymentType = ?');
    values.push(params.paymentType);
  }
  if (params.q) {
    conditions.push('(vp.receiptNumber LIKE ? OR vp.reference LIKE ? OR CAST(vp.reservationID AS CHAR) = ?)');
    const p = `%${params.q}%`;
    values.push(p, p, params.q);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const offset = (params.page - 1) * params.pageSize;

  const [countRows] = await pool.query<CountRow[]>(
    `SELECT COUNT(*) AS total
     FROM view_payment vp
     JOIN reservation r ON r.reservationID = vp.reservationID
     ${where}`,
    values,
  );
  const [data] = await pool.query<RowDataPacket[]>(
    `SELECT vp.*
     FROM view_payment vp
     JOIN reservation r ON r.reservationID = vp.reservationID
     ${where}
     ORDER BY vp.paidAt DESC, vp.paymentID DESC
     LIMIT ? OFFSET ?`,
    [...values, params.pageSize, offset],
  );

  return { data, total: countRows[0]?.total ?? 0, page: params.page, pageSize: params.pageSize };
}

export async function listPendingRefunds(userBranchId: number | null) {
  const where = userBranchId !== null ? 'WHERE r.pickupBranchID = ?' : '';
  const params = userBranchId !== null ? [userBranchId] : [];
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT vpr.*
     FROM view_pendingrefunds vpr
     JOIN reservation r ON r.reservationID = vpr.reservationID
     ${where}
     ORDER BY vpr.reservationID DESC`,
    params,
  );
  return rows;
}

export async function refundOverpayment(userId: number, reservationID: number, method: string) {
  await withDbSession(userId, async (conn) => {
    await conn.query(`CALL sp_refund_overpayment(?, ?)`, [reservationID, method]);
  });
}

export async function listInvoices(params: {
  page: number;
  pageSize: number;
  q?: string;
  invoiceStatus?: string;
  userBranchId: number | null;
}) {
  const conditions: string[] = [];
  const values: unknown[] = [];

  if (params.userBranchId !== null) {
    conditions.push('r.pickupBranchID = ?');
    values.push(params.userBranchId);
  }
  if (params.invoiceStatus) {
    conditions.push('vi.status = ?');
    values.push(params.invoiceStatus);
  }
  if (params.q) {
    conditions.push('(vi.invoiceNumber LIKE ? OR vi.customerName LIKE ? OR CAST(vi.reservationID AS CHAR) = ?)');
    const p = `%${params.q}%`;
    values.push(p, p, params.q);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const offset = (params.page - 1) * params.pageSize;

  const [countRows] = await pool.query<CountRow[]>(
    `SELECT COUNT(*) AS total
     FROM view_invoice vi
     JOIN reservation r ON r.reservationID = vi.reservationID
     ${where}`,
    values,
  );
  const [data] = await pool.query<RowDataPacket[]>(
    `SELECT vi.*
     FROM view_invoice vi
     JOIN reservation r ON r.reservationID = vi.reservationID
     ${where}
     ORDER BY vi.issuedAt DESC, vi.invoiceID DESC
     LIMIT ? OFFSET ?`,
    [...values, params.pageSize, offset],
  );

  return { data, total: countRows[0]?.total ?? 0, page: params.page, pageSize: params.pageSize };
}

export async function listUninvoicedReservations(userBranchId: number | null) {
  const branchCond = userBranchId !== null ? 'AND r.pickupBranchID = ?' : '';
  const params = userBranchId !== null ? [userBranchId] : [];
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT vis.*
     FROM view_invoicestatus vis
     JOIN reservation r ON r.reservationID = vis.reservationID
     WHERE vis.invoiceState IN ('NotInvoiced', 'Outdated') ${branchCond}
     ORDER BY vis.reservationID DESC`,
    params,
  );
  return rows;
}

export async function getInvoiceDetail(invoiceID: number) {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT i.*, u.username AS issuedBy
     FROM invoice i
     LEFT JOIN \`user\` u ON u.userID = i.issuedByUserID
     WHERE i.invoiceID = ?
     LIMIT 1`,
    [invoiceID],
  );
  const invoice = rows[0];
  if (!invoice) throw new NotFoundError('Invoice not found');

  const [lines] = await pool.query<RowDataPacket[]>(
    `SELECT * FROM invoiceline WHERE invoiceID = ? ORDER BY lineNo ASC`,
    [invoiceID],
  );

  return { invoice, lines };
}

export async function voidInvoice(userId: number, invoiceID: number, reason: string) {
  return withDbSession(userId, async (conn) => {
    await conn.query(`CALL sp_void_invoice(?, ?, @out_crn_id)`, [invoiceID, reason]);
    const [out] = await conn.query<RowDataPacket[]>(`SELECT @out_crn_id AS creditNoteID`);
    return { creditNoteID: Number(out[0]?.creditNoteID) };
  });
}

export async function issueInvoice(userId: number, reservationID: number) {
  return withDbSession(userId, async (conn) => {
    await conn.query(`CALL sp_issue_invoice(?, @out_inv_id)`, [reservationID]);
    const [out] = await conn.query<RowDataPacket[]>(`SELECT @out_inv_id AS invoiceID`);
    return { invoiceID: Number(out[0]?.invoiceID) };
  });
}

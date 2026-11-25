import type { RowDataPacket } from 'mysql2/promise';
import { pool, withDbSession, withTransaction } from '../../db/pool.js';
import { BadRequestError, NotFoundError } from '../../errors/AppError.js';
import type {
  CreateReservationInput,
  ListReservationsQuery,
  RecordConditionInput,
  RecordPaymentInput,
} from './reservations.schema.js';

interface CountRow extends RowDataPacket {
  total: number;
}

const RES_SORT_COLS: Record<string, string> = {
  reservationID: 'r.reservationID',
  startDate: 'r.startDate',
  endDate: 'r.endDate',
  status: 'r.status',
  totalDue: 'vb.totalDue',
  balance: 'vb.balance',
};

function toMysqlDateTime(value: string): string {
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value)) return value;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) throw new BadRequestError(`Invalid date/time: ${value}`);
  return d.toISOString().slice(0, 19).replace('T', ' ');
}

export async function listReservations(query: ListReservationsQuery, userBranchId: number | null) {
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (userBranchId !== null) {
    conditions.push('r.pickupBranchID = ?');
    params.push(userBranchId);
  } else if (query.branchID) {
    conditions.push('r.pickupBranchID = ?');
    params.push(query.branchID);
  }
  if (query.status) {
    conditions.push('r.status = ?');
    params.push(query.status);
  }
  if (query.fromDate) {
    conditions.push('DATE(r.startDate) >= ?');
    params.push(query.fromDate);
  }
  if (query.toDate) {
    conditions.push('DATE(r.endDate) <= ?');
    params.push(query.toDate);
  }
  if (query.overdue === 'true') {
    conditions.push(`r.status = 'Active' AND r.endDate < NOW()`);
  }
  if (query.unpaid === 'true') {
    conditions.push('vb.balance > 0');
  }
  if (query.q) {
    conditions.push(
      `(CAST(r.reservationID AS CHAR) = ? OR CONCAT(cl.name, ' ', cl.surname) LIKE ? OR cl.email LIKE ? OR c.plate LIKE ?)`,
    );
    const p = `%${query.q}%`;
    params.push(query.q, p, p, p);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const sortCol = RES_SORT_COLS[query.sort ?? ''] ?? 'r.reservationID';
  const dir = query.order === 'asc' ? 'ASC' : 'DESC';
  const offset = (query.page - 1) * query.pageSize;

  const [countRows] = await pool.query<CountRow[]>(
    `SELECT COUNT(*) AS total
     FROM reservation r
     JOIN \`client\` cl ON cl.clientID = r.clientID
     JOIN car c ON c.carID = r.carID
     LEFT JOIN view_reservationbalance vb ON vb.reservationID = r.reservationID
     ${where}`,
    params,
  );

  const [data] = await pool.query<RowDataPacket[]>(
    `SELECT r.reservationID, r.clientID, r.carID, r.startDate, r.endDate, r.status,
            CONCAT(cl.name, ' ', cl.surname) AS clientName, cl.email AS clientEmail,
            c.plate, b.brandName, mo.modelName,
            (SELECT i.fileReference FROM carimage i WHERE i.carID = c.carID AND i.isPrimary = 1 LIMIT 1) AS thumbnail,
            pb.branchName AS pickupBranch,
            COALESCE(dl.locationName, pb.branchName) AS dropoffPlace,
            vb.totalDue, vb.paid, vb.balance, vb.paymentStatus, vb.depositHeld, vb.depositRequired,
            (r.status = 'Active' AND r.endDate < NOW()) AS isOverdue
     FROM reservation r
     JOIN \`client\` cl ON cl.clientID = r.clientID
     JOIN car c ON c.carID = r.carID
     JOIN model mo ON mo.modelID = c.modelID
     JOIN brand b ON b.brandID = mo.brandID
     JOIN branch pb ON pb.branchID = r.pickupBranchID
     LEFT JOIN dropofflocation dl ON dl.locationID = r.dropoffLocationID
     LEFT JOIN view_reservationbalance vb ON vb.reservationID = r.reservationID
     ${where}
     ORDER BY ${sortCol} ${dir}
     LIMIT ? OFFSET ?`,
    [...params, query.pageSize, offset],
  );

  return { data, total: countRows[0]?.total ?? 0, page: query.page, pageSize: query.pageSize };
}

export async function getAvailableCarsForBooking(
  startDate: string,
  endDate: string,
  branchID: number | null,
) {
  const start = toMysqlDateTime(startDate);
  const end = toMysqlDateTime(endDate);
  const [rows] = await pool.query<RowDataPacket[][]>(`CALL sp_get_available_cars(?, ?, ?)`, [
    start,
    end,
    branchID,
  ]);
  return rows[0] ?? [];
}

export async function createReservation(userId: number, input: CreateReservationInput) {
  const start = toMysqlDateTime(input.startDate);
  const end = toMysqlDateTime(input.endDate);

  const reservationID = await withTransaction(userId, async (conn) => {
    await conn.query(`CALL sp_create_reservation(?, ?, ?, ?, ?, ?, @out_res_id)`, [
      input.clientID,
      input.carID,
      start,
      end,
      input.pickupBranchID,
      input.dropoffLocationID ?? null,
    ]);
    const [outRows] = await conn.query<RowDataPacket[]>(`SELECT @out_res_id AS reservationID`);
    const resID = Number(outRows[0]?.reservationID);

    if (input.promoCode) {
      await conn.query(`CALL sp_apply_promo(?, ?)`, [resID, input.promoCode]);
    }
    if (input.extras) {
      for (const ex of input.extras) {
        await conn.query(`CALL sp_add_extra(?, ?, ?)`, [resID, ex.extraID, ex.quantity]);
      }
    }
    if (input.additionalDriverIds) {
      for (const driverId of input.additionalDriverIds) {
        await conn.query(`CALL sp_add_driver(?, ?)`, [resID, driverId]);
      }
    }
    return resID;
  });

  return { reservationID };
}

export async function getReservationWorkspace(reservationID: number) {
  const [resRows] = await pool.query<RowDataPacket[]>(
    `SELECT r.*,
            CONCAT(cl.name, ' ', cl.surname) AS clientName, cl.email AS clientEmail, cl.phone AS clientPhone,
            c.plate, c.fuelType, c.transmission, c.currentMileage,
            b.brandName, mo.modelName, cc.categoryName,
            pb.branchName AS pickupBranch,
            COALESCE(dl.locationName, pb.branchName) AS dropoffPlace,
            pc.code AS promoCode,
            u1.username AS createdBy, u2.username AS cancelledBy
     FROM reservation r
     JOIN \`client\` cl ON cl.clientID = r.clientID
     JOIN car c ON c.carID = r.carID
     JOIN model mo ON mo.modelID = c.modelID
     JOIN brand b ON b.brandID = mo.brandID
     JOIN carcategory cc ON cc.categoryID = c.categoryID
     JOIN branch pb ON pb.branchID = r.pickupBranchID
     LEFT JOIN dropofflocation dl ON dl.locationID = r.dropoffLocationID
     LEFT JOIN promocode pc ON pc.promoCodeID = r.promoCodeID
     LEFT JOIN \`user\` u1 ON u1.userID = r.createdByUserID
     LEFT JOIN \`user\` u2 ON u2.userID = r.cancelledByUserID
     WHERE r.reservationID = ?
     LIMIT 1`,
    [reservationID],
  );
  const reservation = resRows[0];
  if (!reservation) throw new NotFoundError(`Reservation #${reservationID} not found`);

  const [balanceRows] = await pool.query<RowDataPacket[]>(
    `SELECT * FROM view_reservationbalance WHERE reservationID = ? LIMIT 1`,
    [reservationID],
  );
  const [charges] = await pool.query<RowDataPacket[]>(
    `SELECT * FROM view_reservationcharge WHERE reservationID = ? ORDER BY chargeID ASC`,
    [reservationID],
  );
  const [drivers] = await pool.query<RowDataPacket[]>(
    `SELECT * FROM view_additionaldriver WHERE reservationID = ? ORDER BY addedAt ASC`,
    [reservationID],
  );
  const [payments] = await pool.query<RowDataPacket[]>(
    `SELECT * FROM view_payment WHERE reservationID = ? ORDER BY paidAt DESC`,
    [reservationID],
  );
  const [invoices] = await pool.query<RowDataPacket[]>(
    `SELECT * FROM view_invoice WHERE reservationID = ? ORDER BY issuedAt DESC`,
    [reservationID],
  );
  const [conditions] = await pool.query<RowDataPacket[]>(
    `SELECT vc.*, u.username AS recordedBy
     FROM vehiclecondition vc
     LEFT JOIN \`user\` u ON u.userID = vc.recordedByUserID
     WHERE vc.reservationID = ?
     ORDER BY vc.conditionID ASC`,
    [reservationID],
  );
  const [photos] = await pool.query<RowDataPacket[]>(
    `SELECT cp.*
     FROM conditionphoto cp
     JOIN vehiclecondition vc ON vc.conditionID = cp.conditionID
     WHERE vc.reservationID = ?
     ORDER BY cp.photoID ASC`,
    [reservationID],
  );
  const [compareRows] = await pool.query<RowDataPacket[]>(
    `SELECT * FROM view_conditioncompare WHERE reservationID = ? LIMIT 1`,
    [reservationID],
  );
  const [extras] = await pool.query<RowDataPacket[]>(
    `SELECT extraID, extraName, pricingType, unitPrice FROM rentalextra WHERE isActive = 1 ORDER BY extraName ASC`,
  );
  const [currencies] = await pool.query<RowDataPacket[]>(
    `SELECT currencyCode, currencyName, exchangeRateToBase, isBase FROM currency WHERE isActive = 1 ORDER BY isBase DESC, currencyCode ASC`,
  );

  return {
    reservation,
    balance: balanceRows[0] ?? null,
    charges,
    drivers,
    payments,
    invoices,
    conditions,
    photos,
    conditionCompare: compareRows[0] ?? null,
    availableExtras: extras,
    currencies,
  };
}

export async function updateReservationDates(
  userId: number,
  reservationID: number,
  startDate: string,
  endDate: string,
) {
  await withDbSession(userId, async (conn) => {
    await conn.query(
      `UPDATE reservation SET startDate = ?, endDate = ? WHERE reservationID = ?`,
      [toMysqlDateTime(startDate), toMysqlDateTime(endDate), reservationID],
    );
  });
}

export async function startRental(userId: number, reservationID: number) {
  await withDbSession(userId, async (conn) => {
    await conn.query(`CALL sp_start_rental(?)`, [reservationID]);
  });
}

export async function completeRental(
  userId: number,
  reservationID: number,
  endMileage: number,
  returnedAt: string,
) {
  await withDbSession(userId, async (conn) => {
    await conn.query(`CALL sp_complete_rental(?, ?, ?)`, [
      reservationID,
      endMileage,
      toMysqlDateTime(returnedAt),
    ]);
  });
}

export async function cancelReservation(userId: number, reservationID: number, reason: string) {
  await withDbSession(userId, async (conn) => {
    await conn.query(`CALL sp_cancel_reservation(?, ?)`, [reservationID, reason]);
  });
}

export async function applyPromo(userId: number, reservationID: number, code: string) {
  await withDbSession(userId, async (conn) => {
    await conn.query(`CALL sp_apply_promo(?, ?)`, [reservationID, code]);
  });
}

export async function removePromo(userId: number, reservationID: number) {
  await withDbSession(userId, async (conn) => {
    await conn.query(`CALL sp_remove_promo(?)`, [reservationID]);
  });
}

export async function addExtra(userId: number, reservationID: number, extraID: number, quantity: number) {
  await withDbSession(userId, async (conn) => {
    await conn.query(`CALL sp_add_extra(?, ?, ?)`, [reservationID, extraID, quantity]);
  });
}

export async function addCharge(
  userId: number,
  reservationID: number,
  chargeType: string,
  description: string,
  quantity: number,
  unitAmount: number,
) {
  await withDbSession(userId, async (conn) => {
    await conn.query(`CALL sp_add_charge(?, ?, ?, ?, ?, @out_charge_id)`, [
      reservationID,
      chargeType,
      description,
      quantity,
      unitAmount,
    ]);
  });
}

export async function addDriver(userId: number, reservationID: number, clientID: number) {
  await withDbSession(userId, async (conn) => {
    await conn.query(`CALL sp_add_driver(?, ?)`, [reservationID, clientID]);
  });
}

export async function removeDriver(userId: number, reservationID: number, clientID: number) {
  await withDbSession(userId, async (conn) => {
    await conn.query(`CALL sp_remove_driver(?, ?)`, [reservationID, clientID]);
  });
}

export async function recordCondition(
  userId: number,
  reservationID: number,
  input: RecordConditionInput,
) {
  await withTransaction(userId, async (conn) => {
    await conn.query(`CALL sp_record_condition(?, ?, ?, ?, ?, ?, ?, @out_cond_id)`, [
      reservationID,
      input.stage,
      input.mileage,
      input.fuelPercent,
      input.isClean ? 1 : 0,
      input.existingDamage || null,
      input.notes || null,
    ]);
    const [outRows] = await conn.query<RowDataPacket[]>(`SELECT @out_cond_id AS conditionID`);
    const conditionID = Number(outRows[0]?.conditionID);

    if (input.photos) {
      for (const ph of input.photos) {
        await conn.query(`CALL sp_add_condition_photo(?, ?, ?)`, [
          conditionID,
          ph.fileReference,
          ph.caption || null,
        ]);
      }
    }
  });
}

export async function recordPayment(userId: number, reservationID: number, input: RecordPaymentInput) {
  await withDbSession(userId, async (conn) => {
    await conn.query(`CALL sp_record_payment_ccy(?, ?, ?, ?, ?, ?, @out_pay_id)`, [
      reservationID,
      input.paymentType,
      input.amount,
      input.currencyCode,
      input.method,
      input.reference || null,
    ]);
  });
}

export async function settleDeposit(userId: number, reservationID: number, method: string) {
  await withDbSession(userId, async (conn) => {
    await conn.query(`CALL sp_settle_deposit(?, ?)`, [reservationID, method]);
  });
}

export async function refundOverpayment(userId: number, reservationID: number, method: string) {
  await withDbSession(userId, async (conn) => {
    await conn.query(`CALL sp_refund_overpayment(?, ?)`, [reservationID, method]);
  });
}

export async function issueInvoice(userId: number, reservationID: number) {
  await withDbSession(userId, async (conn) => {
    await conn.query(`CALL sp_issue_invoice(?, @out_inv_id)`, [reservationID]);
  });
}

export async function listConditionReports(q?: string) {
  const where = q
    ? `WHERE c.plate LIKE ? OR CAST(vc.reservationID AS CHAR) = ?`
    : '';
  const params = q ? [`%${q}%`, q] : [];
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT vc.conditionID, vc.reservationID, vc.stage, vc.recordedAt, vc.mileage, vc.fuelPercent,
            vc.isClean, vc.existingDamage, vc.notes, c.plate, b.brandName, mo.modelName,
            u.username AS recordedBy,
            (SELECT COUNT(*) FROM conditionphoto cp WHERE cp.conditionID = vc.conditionID) AS photoCount
     FROM vehiclecondition vc
     JOIN reservation r ON r.reservationID = vc.reservationID
     JOIN car c ON c.carID = r.carID
     JOIN model mo ON mo.modelID = c.modelID
     JOIN brand b ON b.brandID = mo.brandID
     LEFT JOIN \`user\` u ON u.userID = vc.recordedByUserID
     ${where}
     ORDER BY vc.recordedAt DESC
     LIMIT 100`,
    params,
  );
  return rows;
}

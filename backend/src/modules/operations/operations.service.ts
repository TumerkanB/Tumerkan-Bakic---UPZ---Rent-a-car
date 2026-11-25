import type { RowDataPacket } from 'mysql2/promise';
import { pool, withDbSession } from '../../db/pool.js';
import { BadRequestError } from '../../errors/AppError.js';

function toMysqlDateTime(value: string): string {
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value)) return value;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) throw new BadRequestError(`Invalid date/time: ${value}`);
  return d.toISOString().slice(0, 19).replace('T', ' ');
}

export async function listDamages(userBranchId: number | null) {
  const where = userBranchId !== null ? 'WHERE c.branchID = ?' : '';
  const params = userBranchId !== null ? [userBranchId] : [];
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT d.damageID, d.carID, c.plate, mo.modelName, b.brandName, d.reservationID,
            d.reportDate, d.description, d.repairCost, d.isRepaired, d.billedChargeID,
            u.username AS reportedBy
     FROM damagereport d
     JOIN car c ON c.carID = d.carID
     JOIN model mo ON mo.modelID = c.modelID
     JOIN brand b ON b.brandID = mo.brandID
     LEFT JOIN \`user\` u ON u.userID = d.reportedByUserID
     ${where}
     ORDER BY d.reportDate DESC, d.damageID DESC`,
    params,
  );
  return rows;
}

export async function reportDamage(
  userId: number,
  input: { carID: number; reservationID?: number | null; description: string; repairCost?: number | null },
) {
  await withDbSession(userId, async (conn) => {
    await conn.query(`CALL sp_report_damage(?, ?, ?, ?, @out_dmg_id)`, [
      input.carID,
      input.reservationID ?? null,
      input.description,
      input.repairCost ?? null,
    ]);
  });
}

export async function billDamage(userId: number, damageID: number, amount: number) {
  await withDbSession(userId, async (conn) => {
    await conn.query(`CALL sp_bill_damage(?, ?)`, [damageID, amount]);
  });
}

export async function markDamageRepaired(userId: number, damageID: number, repairCost: number) {
  await withDbSession(userId, async (conn) => {
    await conn.query(`CALL sp_mark_damage_repaired(?, ?)`, [damageID, repairCost]);
  });
}

export async function listFines(userBranchId: number | null) {
  const where = userBranchId !== null ? 'WHERE c.branchID = ?' : '';
  const params = userBranchId !== null ? [userBranchId] : [];
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT vf.*, f.carID, f.billedChargeID, f.description
     FROM view_fine vf
     JOIN trafficfine f ON f.fineID = vf.fineID
     JOIN car c ON c.carID = f.carID
     ${where}
     ORDER BY vf.occurredAt DESC, vf.fineID DESC`,
    params,
  );
  return rows;
}

export async function createFine(
  userId: number,
  input: {
    carID: number;
    fineType: string;
    occurredAt: string;
    amount: number;
    referenceNo?: string | null;
    description?: string | null;
  },
) {
  await withDbSession(userId, async (conn) => {
    await conn.query(
      `INSERT INTO trafficfine (carID, fineType, occurredAt, amount, referenceNo, description)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        input.carID,
        input.fineType,
        toMysqlDateTime(input.occurredAt),
        input.amount,
        input.referenceNo || null,
        input.description || null,
      ],
    );
  });
}

export async function billFine(userId: number, fineID: number) {
  await withDbSession(userId, async (conn) => {
    await conn.query(`CALL sp_bill_fine(?)`, [fineID]);
  });
}

export async function setFineStatus(userId: number, fineID: number, status: string) {
  await withDbSession(userId, async (conn) => {
    await conn.query(`CALL sp_set_fine_status(?, ?)`, [fineID, status]);
  });
}

export async function listAllMaintenance(userBranchId: number | null) {
  const where = userBranchId !== null ? 'WHERE c.branchID = ?' : '';
  const params = userBranchId !== null ? [userBranchId] : [];
  const [records] = await pool.query<RowDataPacket[]>(
    `SELECT vm.*
     FROM view_maintenance vm
     JOIN maintenancerecord m ON m.maintenanceID = vm.maintenanceID
     JOIN car c ON c.carID = m.carID
     ${where}
     ORDER BY vm.serviceDate DESC, vm.maintenanceID DESC`,
    params,
  );

  const [serviceDue] = await pool.query<RowDataPacket[]>(
    `SELECT vc.*
     FROM view_carcompliance vc
     JOIN car c ON c.carID = vc.carID
     WHERE vc.issues IS NOT NULL AND vc.issues <> '' ${userBranchId !== null ? 'AND c.branchID = ?' : ''}
     ORDER BY vc.plate ASC`,
    params,
  );

  return { records, serviceDue };
}

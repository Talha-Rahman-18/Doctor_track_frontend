"use client";

import Link from "next/link";
import { ROUTES } from "../../lib/constants.js";
import { formatDate } from "../../lib/utils.js";
import RowActions from "../common/RowActions.jsx";
import Badge from "../ui/Badge.jsx";
import DataTable from "./DataTable.jsx";

const genderLabel = { male: "Male", female: "Female", other: "Other" };

/** Shared by the Patients page (with a Doctor column) and a doctor's detail page (without). */
export default function PatientsTable({ patients, showDoctor = false, showEdit = true, onDelete, isFetching }) {
  const columns = [
    {
      key: "name", header: "Patient",
      cell: (p) => (
        <div>
          <Link href={ROUTES.patient(p._id)} className="font-medium text-slate-900 hover:text-brand-700 hover:underline">{p.name}</Link>
          <p className="text-xs text-slate-500">{p.age} yrs · {genderLabel[p.gender] ?? p.gender}</p>
        </div>
      ),
    },
    ...(showDoctor
      ? [{
          key: "doctor", header: "Doctor",
          cell: (p) =>
            p.doctor?._id ? (
              <Link href={ROUTES.doctor(p.doctor._id)} className="hover:text-brand-700 hover:underline">{p.doctor.name}</Link>
            ) : (
              <span className="text-slate-500">Unavailable</span>
            ),
        }]
      : []),
    { key: "condition", header: "Condition", cell: (p) => <Badge tone="brand">{p.condition}</Badge> },
    { key: "phone", header: "Phone", cell: (p) => p.phone },
    { key: "createdAt", header: "Added", cell: (p) => formatDate(p.createdAt) },
    {
      key: "actions", header: <span className="sr-only">Actions</span>,
      cell: (p) => <RowActions name={p.name} viewTo={ROUTES.patient(p._id)} editTo={showEdit ? ROUTES.editPatient(p._id) : undefined} onDelete={() => onDelete(p)} />,
    },
  ];
  return <DataTable columns={columns} rows={patients} isFetching={isFetching} caption="Patients" />;
}

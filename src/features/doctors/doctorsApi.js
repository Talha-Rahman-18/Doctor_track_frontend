import { compactParams } from "../../lib/utils.js";
import { baseApi } from "../../services/baseApi.js";

// Changing a doctor or their patients affects: doctor lists/details (patient counts), patient lists
// (embedded doctor name), filter dropdowns and dashboard analytics.
const patientChangeTags = (doctorId) => [
  "PatientList",
  "PatientOptions",
  "DoctorList",
  "Dashboard",
  doctorId ? { type: "Doctor", id: doctorId } : "Doctor",
];

export const doctorsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getDoctors: build.query({
      query: (params) => ({ url: "/doctors", params: compactParams(params) }),
      transformResponse: (response) => ({ doctors: response.data.doctors, pagination: response.pagination }),
      providesTags: (result) => [
        "DoctorList",
        ...(result?.doctors ?? []).map(({ _id }) => ({ type: "Doctor", id: _id })),
      ],
    }),
    getDoctor: build.query({
      query: (id) => ({ url: `/doctors/${id}` }),
      transformResponse: (response) => response.data.doctor,
      providesTags: (_result, _error, id) => [{ type: "Doctor", id }],
    }),
    getDoctorOptions: build.query({
      query: () => ({ url: "/doctors/options" }),
      transformResponse: (response) => response.data,
      providesTags: ["DoctorOptions"],
    }),
    createDoctor: build.mutation({
      query: (body) => ({ url: "/doctors", method: "POST", data: body }),
      transformResponse: (response) => response.data.doctor,
      invalidatesTags: ["DoctorList", "DoctorOptions", "Dashboard"],
    }),
    updateDoctor: build.mutation({
      query: ({ id, body }) => ({ url: `/doctors/${id}`, method: "PATCH", data: body }),
      transformResponse: (response) => response.data.doctor,
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Doctor", id },
        "DoctorList",
        "DoctorOptions",
        "PatientList",
        "Dashboard",
      ],
    }),
    deleteDoctor: build.mutation({
      query: (id) => ({ url: `/doctors/${id}`, method: "DELETE" }),
      invalidatesTags: (_result, _error, id) => [{ type: "Doctor", id }, "DoctorList", "DoctorOptions", "Dashboard"],
    }),
    getDoctorPatients: build.query({
      query: ({ id, ...params }) => ({ url: `/doctors/${id}/patients`, params: compactParams(params) }),
      transformResponse: (response) => ({ patients: response.data.patients, pagination: response.pagination }),
      providesTags: (result) => [
        "PatientList",
        ...(result?.patients ?? []).map(({ _id }) => ({ type: "Patient", id: _id })),
      ],
    }),
    createDoctorPatient: build.mutation({
      query: ({ doctorId, body }) => ({ url: `/doctors/${doctorId}/patients`, method: "POST", data: body }),
      transformResponse: (response) => response.data.patient,
      invalidatesTags: (_result, _error, { doctorId }) => patientChangeTags(doctorId),
    }),
  }),
});

export const {
  useGetDoctorsQuery,
  useGetDoctorQuery,
  useGetDoctorOptionsQuery,
  useCreateDoctorMutation,
  useUpdateDoctorMutation,
  useDeleteDoctorMutation,
  useGetDoctorPatientsQuery,
  useCreateDoctorPatientMutation,
} = doctorsApi;

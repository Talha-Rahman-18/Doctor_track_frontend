import { compactParams } from "../../lib/utils.js";
import { baseApi } from "../../services/baseApi.js";

export const patientsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getPatients: build.query({
      query: (params) => ({ url: "/patients", params: compactParams(params) }),
      transformResponse: (response) => ({ patients: response.data.patients, pagination: response.pagination }),
      providesTags: (result) => [
        "PatientList",
        ...(result?.patients ?? []).map(({ _id }) => ({ type: "Patient", id: _id })),
      ],
    }),
    getPatient: build.query({
      query: (id) => ({ url: `/patients/${id}` }),
      transformResponse: (response) => response.data.patient,
      providesTags: (_result, _error, id) => [{ type: "Patient", id }],
    }),
    getPatientOptions: build.query({
      query: () => ({ url: "/patients/options" }),
      transformResponse: (response) => response.data,
      providesTags: ["PatientOptions"],
    }),
    updatePatient: build.mutation({
      query: ({ id, body }) => ({ url: `/patients/${id}`, method: "PATCH", data: body }),
      transformResponse: (response) => response.data.patient,
      // Reassigning changes patient counts on two doctors, so all doctor data is invalidated.
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Patient", id },
        "PatientList",
        "PatientOptions",
        "DoctorList",
        "Doctor",
        "Dashboard",
      ],
    }),
    deletePatient: build.mutation({
      query: (id) => ({ url: `/patients/${id}`, method: "DELETE" }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Patient", id },
        "PatientList",
        "PatientOptions",
        "DoctorList",
        "Doctor",
        "Dashboard",
      ],
    }),
  }),
});

export const {
  useGetPatientsQuery,
  useGetPatientQuery,
  useGetPatientOptionsQuery,
  useUpdatePatientMutation,
  useDeletePatientMutation,
} = patientsApi;

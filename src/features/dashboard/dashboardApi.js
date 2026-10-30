import { compactParams } from "../../lib/utils.js";
import { baseApi } from "../../services/baseApi.js";

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getOverview: build.query({
      query: (params) => ({ url: "/dashboard/overview", params: compactParams(params) }),
      transformResponse: (response) => response.data,
      providesTags: ["Dashboard"],
    }),
    getPatientsPerDoctor: build.query({
      query: (params) => ({ url: "/dashboard/patients-per-doctor", params: compactParams(params) }),
      transformResponse: (response) => response.data.items,
      providesTags: ["Dashboard"],
    }),
    getTrends: build.query({
      query: (params) => ({ url: "/dashboard/trends", params: compactParams(params) }),
      transformResponse: (response) => response.data,
      providesTags: ["Dashboard"],
    }),
  }),
});

export const { useGetOverviewQuery, useGetPatientsPerDoctorQuery, useGetTrendsQuery } = dashboardApi;

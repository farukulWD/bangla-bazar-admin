import { baseApi } from "@/store/api/baseApi";
import { tagTypes } from "@/store/api/tagTypes";

import type {
  CatalogResponse,
  CommercialResponse,
  DashboardRange,
  GrowthResponse,
  OperationsResponse,
} from "../types";

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getDashboardCommercial: build.query<CommercialResponse, DashboardRange>({
      query: (params) => ({ url: "/dashboard/commercial", method: "GET", params }),
      providesTags: [{ type: tagTypes.dashboard, id: "COMMERCIAL" }, tagTypes.order],
    }),

    getDashboardOperations: build.query<OperationsResponse, void>({
      query: () => ({ url: "/dashboard/operations", method: "GET" }),
      providesTags: [
        { type: tagTypes.dashboard, id: "OPERATIONS" },
        tagTypes.order,
        tagTypes.product,
        tagTypes.contact,
      ],
    }),

    getDashboardGrowth: build.query<GrowthResponse, DashboardRange>({
      query: (params) => ({ url: "/dashboard/growth", method: "GET", params }),
      providesTags: [{ type: tagTypes.dashboard, id: "GROWTH" }, tagTypes.user],
    }),

    getDashboardCatalog: build.query<CatalogResponse, void>({
      query: () => ({ url: "/dashboard/catalog", method: "GET" }),
      providesTags: [{ type: tagTypes.dashboard, id: "CATALOG" }, tagTypes.product],
    }),
  }),
});

export const {
  useGetDashboardCommercialQuery,
  useGetDashboardOperationsQuery,
  useGetDashboardGrowthQuery,
  useGetDashboardCatalogQuery,
} = dashboardApi;

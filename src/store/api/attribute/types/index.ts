import type { ID, ISODate } from "@/types/api";

export type AttributeStatus = "show" | "hide";
export type AttributeOption = "dropdown" | "radio" | "checkbox";
export type AttributeType = "attribute" | "extra";

export type AttributeValue = {
  _id: ID;
  name: string;
  status: AttributeStatus;
};

export type Attribute = {
  _id: ID;
  name: string;
  slug: string;
  option: AttributeOption;
  type: AttributeType;
  status: AttributeStatus;
  values: AttributeValue[];
  createdAt: ISODate;
  updatedAt: ISODate;
};

export type AttributeValuePayload = {
  name: string;
  status?: AttributeStatus;
};

export type AttributePayload = {
  name: string;
  slug?: string;
  option: AttributeOption;
  type?: AttributeType;
  status?: AttributeStatus;
  values?: AttributeValuePayload[];
};

export type AttributeListQuery = {
  searchTerm?: string;
  option?: AttributeOption;
  type?: AttributeType;
  status?: AttributeStatus;
  page?: number;
  limit?: number;
  sort?: string;
};

export type AttributeBulkUpdatePayload = {
  ids: ID[];
  status?: AttributeStatus;
  option?: AttributeOption;
  type?: AttributeType;
};

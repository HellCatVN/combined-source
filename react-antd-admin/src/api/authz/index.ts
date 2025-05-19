import {
  CreateRolePayload,
  Role,
  UpdateRolePayload,
  Resource,
  CreateResourcePayload,
  UpdateResourcePayload,
  EndpointPermission,
  CreateEndpointPermissionPayload,
  UpdateEndpointPermissionPayload
} from '@interfaces/authz';
import { ISuccessResponse, IPaginationSuccessResponse } from '@interfaces/response';
import { axiosInstance } from '../axiosClient';

export const roleApi = {
  getRole: (id: string) => {
    const url = `/authz/roles/${id}`;
    return axiosInstance.get<ISuccessResponse<Role>>(url);
  },

  getRoles: (params?: any) => {
    const url = '/authz/roles';
    return axiosInstance.get<IPaginationSuccessResponse<Role[]>>(url, { params });
  },

  createRole: (data: CreateRolePayload) => {
    const url = '/authz/roles';
    return axiosInstance.post<ISuccessResponse<Role>>(url, data);
  },

  updateRole: (id: string, data: UpdateRolePayload) => {
    const url = `/authz/roles/${id}`;
    return axiosInstance.put<ISuccessResponse<Role>>(url, data);
  },

  deleteRole: (id: string) => {
    const url = `/authz/roles/${id}`;
    return axiosInstance.delete<ISuccessResponse<Role>>(url);
  },
};

export const resourceApi = {
  getResource: (id: string) => {
    const url = `/authz/resources/${id}`;
    return axiosInstance.get<ISuccessResponse<Resource>>(url);
  },

  getResources: (params?: any) => {
    const url = '/authz/resources';
    return axiosInstance.get<IPaginationSuccessResponse<Resource[]>>(url, { params });
  },

  createResource: (data: CreateResourcePayload) => {
    const url = '/authz/resources';
    return axiosInstance.post<ISuccessResponse<Resource>>(url, data);
  },

  updateResource: (id: string, data: UpdateResourcePayload) => {
    const url = `/authz/resources/${id}`;
    return axiosInstance.put<ISuccessResponse<Resource>>(url, data);
  },

  deleteResource: (id: string) => {
    const url = `/authz/resources/${id}`;
    return axiosInstance.delete<ISuccessResponse<Resource>>(url);
  },
};

export const endpointPermissionApi = {
  getEndpointPermission: (id: string) => {
    const url = `/authz/endpoints/${id}`;
    return axiosInstance.get<ISuccessResponse<EndpointPermission>>(url);
  },

  getEndpointPermissions: (params?: any) => {
    const url = '/authz/endpoints';
    return axiosInstance.get<IPaginationSuccessResponse<EndpointPermission[]>>(url, { params });
  },

  createEndpointPermission: (data: CreateEndpointPermissionPayload) => {
    const url = '/authz/endpoints';
    return axiosInstance.post<ISuccessResponse<EndpointPermission>>(url, data);
  },

  updateEndpointPermission: (id: string, data: UpdateEndpointPermissionPayload) => {
    const url = `/authz/endpoints/${id}`;
    return axiosInstance.put<ISuccessResponse<EndpointPermission>>(url, data);
  },

  deleteEndpointPermission: (id: string) => {
    const url = `/authz/endpoints/${id}`;
    return axiosInstance.delete<ISuccessResponse<EndpointPermission>>(url);
  },
};
import { useMutation, useQuery } from 'react-query';

import { roleApi, resourceApi, endpointPermissionApi } from '@api/authz';
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

export const useGetRole = (id?: string) => {
  return useQuery({
    queryKey: ['role', id],
    queryFn: ({ signal }) => roleApi.getRole(id!),
    enabled: Boolean(id),
    refetchOnWindowFocus: false,
  });
};

export const useGetRoles = (params: any) => {
  return useQuery({
    queryKey: ['roles', params],
    queryFn: ({ signal }) => roleApi.getRoles(params),
    refetchOnWindowFocus: false,
    keepPreviousData: true,
  });
};

export const useCreateRole = () => {
  return useMutation({
    mutationFn: (data: CreateRolePayload) => roleApi.createRole(data),
  });
};

export const useUpdateRole = () => {
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateRolePayload }) =>
      roleApi.updateRole(id, payload),
  });
};

export const useDeleteRole = () => {
  return useMutation({
    mutationFn: (id: string) => roleApi.deleteRole(id),
  });
};

export const useGetResource = (id?: string) => {
  return useQuery({
    queryKey: ['resource', id],
    queryFn: ({ signal }) => resourceApi.getResource(id!),
    enabled: Boolean(id),
    refetchOnWindowFocus: false,
  });
};

export const useGetResources = (params: any) => {
  return useQuery({
    queryKey: ['resources', params],
    queryFn: ({ signal }) => resourceApi.getResources(params),
    refetchOnWindowFocus: false,
    keepPreviousData: true,
  });
};

export const useCreateResource = () => {
  return useMutation({
    mutationFn: (data: CreateResourcePayload) => resourceApi.createResource(data),
  });
};

export const useUpdateResource = () => {
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateResourcePayload }) =>
      resourceApi.updateResource(id, payload),
  });
};

export const useDeleteResource = () => {
  return useMutation({
    mutationFn: (id: string) => resourceApi.deleteResource(id),
  });
};

export const useGetEndpointPermission = (id?: string) => {
  return useQuery({
    queryKey: ['endpointPermission', id],
    queryFn: ({ signal }) => endpointPermissionApi.getEndpointPermission(id!),
    enabled: Boolean(id),
    refetchOnWindowFocus: false,
  });
};

export const useGetEndpointPermissions = (params: any) => {
  return useQuery({
    queryKey: ['endpointPermissions', params],
    queryFn: ({ signal }) => endpointPermissionApi.getEndpointPermissions(params),
    refetchOnWindowFocus: false,
    keepPreviousData: true,
  });
};

export const useCreateEndpointPermission = () => {
  return useMutation({
    mutationFn: (data: CreateEndpointPermissionPayload) =>
      endpointPermissionApi.createEndpointPermission(data),
  });
};

export const useUpdateEndpointPermission = () => {
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateEndpointPermissionPayload }) =>
      endpointPermissionApi.updateEndpointPermission(id, payload),
  });
};

export const useDeleteEndpointPermission = () => {
  return useMutation({
    mutationFn: (id: string) => endpointPermissionApi.deleteEndpointPermission(id),
  });
};
import PermissionService from './permission.service';
import RoleService from './role.service';
import RolePermissionService from './rolePermission.service';

const providers = [PermissionService, RolePermissionService, RoleService];

export { PermissionService, RolePermissionService, RoleService };
export default providers;

const db = require("../models");

async function getParentRoles(roleId, orgId) {
  const Role = db.roles;
  let parents = [];
  let role = await Role.findOne({ where: { id: roleId, org_id: orgId } });

  while (role && role.parent_role_id) {
    parents.push(role.parent_role_id);
    role = await Role.findOne({
      where: { id: role.parent_role_id, org_id: orgId },
    });
  }

  return parents;
}

module.exports = { getParentRoles };

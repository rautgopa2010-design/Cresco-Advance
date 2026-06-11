export const hasModulePermission = (permissions, moduleName) => {
    if (!permissions || !permissions[moduleName]) return false;
    const modulePerm = permissions[moduleName];
    return Object.values(modulePerm).some(value => value === true);
  };
  
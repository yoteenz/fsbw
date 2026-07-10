/** Structured errors for Department Package Registry lookups and registration. */

export class DepartmentPackageNotRegisteredError extends Error {
  readonly departmentId: string;
  readonly availableDepartmentIds: readonly string[];
  readonly registryInstanceId: string;

  constructor(departmentId: string, availableDepartmentIds: readonly string[], registryInstanceId: string) {
    super(
      `Department package not registered: ${departmentId}. Available department IDs: ${availableDepartmentIds.join(', ')}`
    );
    this.name = 'DepartmentPackageNotRegisteredError';
    this.departmentId = departmentId;
    this.availableDepartmentIds = availableDepartmentIds;
    this.registryInstanceId = registryInstanceId;
  }
}

export class DuplicateDepartmentPackageError extends Error {
  readonly departmentId: string;
  readonly packageId: string;
  readonly existingPackageId: string;
  readonly registryInstanceId: string;

  constructor(
    departmentId: string,
    packageId: string,
    existingPackageId: string,
    registryInstanceId: string
  ) {
    super(
      `Duplicate department package registration: ${departmentId} (${packageId}) conflicts with existing ${existingPackageId}`
    );
    this.name = 'DuplicateDepartmentPackageError';
    this.departmentId = departmentId;
    this.packageId = packageId;
    this.existingPackageId = existingPackageId;
    this.registryInstanceId = registryInstanceId;
  }
}

export class DuplicatePackageIdError extends Error {
  readonly packageId: string;
  readonly departmentId: string;
  readonly existingDepartmentId: string;
  readonly registryInstanceId: string;

  constructor(
    packageId: string,
    departmentId: string,
    existingDepartmentId: string,
    registryInstanceId: string
  ) {
    super(
      `Duplicate package ID registration: ${packageId} for ${departmentId} conflicts with ${existingDepartmentId}`
    );
    this.name = 'DuplicatePackageIdError';
    this.packageId = packageId;
    this.departmentId = departmentId;
    this.existingDepartmentId = existingDepartmentId;
    this.registryInstanceId = registryInstanceId;
  }
}

export class DepartmentPackageValidationError extends Error {
  readonly failures: readonly string[];
  readonly registryInstanceId: string;

  constructor(failures: readonly string[], registryInstanceId: string) {
    super(`Department package registry validation failed:\n${failures.map((f) => `  - ${f}`).join('\n')}`);
    this.name = 'DepartmentPackageValidationError';
    this.failures = failures;
    this.registryInstanceId = registryInstanceId;
  }
}

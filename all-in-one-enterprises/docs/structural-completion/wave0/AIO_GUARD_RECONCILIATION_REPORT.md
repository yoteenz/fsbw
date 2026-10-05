# Guard reconciliation (Wave 0)

| Guard | Routes | Status |
|-------|--------|--------|
| CustomerRouteGuard | portal, shipper (customer) | Existing |
| OfficeRouteGuard | office/* | Existing |
| ProviderRouteGuard | provider/fleetcare/* | **Added** |
| DriverRouteGuard | driver/driverlink/* | **Added** |

Backend: membership via `aio_service_provider_users`, `aio_driver_profiles`. RLS remains partial — server boundaries still required.

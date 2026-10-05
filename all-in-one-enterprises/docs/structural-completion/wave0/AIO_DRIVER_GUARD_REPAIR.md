# Driver guard repair

`DriverRouteGuard` requires authentication (supabase mode), linked `aio_driver_profiles` row for `auth.uid()`, denies office-only users without driver profile.

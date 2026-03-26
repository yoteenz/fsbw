-- Normalize placeholder/sentinel profile values that should be NULL.
-- Safe to run repeatedly.

update public.profiles
set
  first_name = nullif(trim(first_name), ''),
  last_name = nullif(trim(last_name), ''),
  profile_image = nullif(trim(profile_image), '')
where true;

update public.profiles
set first_name = null
where upper(coalesce(trim(first_name), '')) in ('EMPTY', 'NULL', 'N/A', 'NA');

update public.profiles
set last_name = null
where upper(coalesce(trim(last_name), '')) in ('EMPTY', 'NULL', 'N/A', 'NA');

update public.profiles
set profile_image = null
where upper(coalesce(trim(profile_image), '')) in ('EMPTY', 'NULL', 'N/A', 'NA');

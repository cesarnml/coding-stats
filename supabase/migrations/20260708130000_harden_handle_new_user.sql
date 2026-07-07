-- handle_new_user() only needs to run as the SECURITY DEFINER trigger on
-- auth.users insert; trigger execution does not require an EXECUTE grant,
-- so revoking anon/authenticated/public closes the public RPC surface at
-- /rest/v1/rpc/handle_new_user without affecting signup. PUBLIC must be
-- revoked too since Postgres grants EXECUTE to PUBLIC by default and
-- anon/authenticated inherit through it.
revoke execute on function public.handle_new_user() from anon, authenticated, public;

-- Pin search_path so the function can't be tricked by a role-mutable
-- search_path into resolving public.profiles (or its own objects) from an
-- attacker-controlled schema.
alter function public.handle_new_user() set search_path = public, pg_temp;

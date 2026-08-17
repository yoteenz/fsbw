type Props = {
  password: string;
  confirmPassword?: string;
};

export function PasswordRequirements({ password, confirmPassword }: Props) {
  const minLength = password.length >= 8;
  const matches = confirmPassword === undefined || (confirmPassword.length > 0 && password === confirmPassword);

  return (
    <div className="aio-auth-premium__requirements" aria-live="polite">
      <p className="aio-auth-premium__requirements-title">Password requirements</p>
      <ul className="aio-auth-premium__requirements-list">
        <li className={minLength ? 'is-met' : undefined}>
          <span aria-hidden="true">{minLength ? '✓' : '○'}</span> 8+ characters
        </li>
        {confirmPassword !== undefined ? (
          <li className={matches && confirmPassword.length > 0 ? 'is-met' : undefined}>
            <span aria-hidden="true">{matches && confirmPassword.length > 0 ? '✓' : '○'}</span> Passwords match
          </li>
        ) : null}
      </ul>
    </div>
  );
}

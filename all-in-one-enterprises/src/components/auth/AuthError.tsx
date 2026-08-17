type Props = {
  title?: string;
  message: string;
};

export function AuthError({ title = "We couldn't log you in", message }: Props) {
  return (
    <div className="aio-auth-premium__error" role="alert">
      <p className="aio-auth-premium__error-title">{title}</p>
      <p className="aio-auth-premium__error-message">{message}</p>
    </div>
  );
}

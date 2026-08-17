type Props = {
  notice: string;
  disclosure?: string | null;
};

export function MobileServiceNotice({ notice, disclosure }: Props) {
  return (
    <footer className="aio-msvc-notice">
      {disclosure ? <p>{disclosure}</p> : null}
      <p>{notice}</p>
    </footer>
  );
}

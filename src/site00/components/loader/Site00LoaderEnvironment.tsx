type Site00LoaderEnvironmentProps = {
  backgroundUrl: string;
};

/** Full-viewport architectural environment — the world behind the loader UI. */
export function Site00LoaderEnvironment({ backgroundUrl }: Site00LoaderEnvironmentProps) {
  return (
    <div
      className="site00-loader-env"
      aria-hidden="true"
      style={{ backgroundImage: `url("${backgroundUrl.replace(/"/g, '\\"')}")` }}
    />
  );
}

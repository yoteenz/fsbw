type RoseBulletProps = {
  size?: number;
};

export default function RoseBullet({ size = 16 }: RoseBulletProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="shrink-0"
    >
      <path
        d="M13 4C12.4094 4.13281 11.85 4.27937 11.3219 4.43594C10.0562 4.81094 8.9625 5.28438 8.02812 5.7375C7.425 6.03031 7.20937 6.15969 6.41875 6.61969C4.59375 7.6725 3.5 9.03844 3.5 11.0825C3.5 13.3922 5.2375 15 8 15C10.7625 15 12.5 13.2559 12.5 10.9462C12.5 8.63656 10.5938 7.03875 13 4Z"
        stroke="#EB1C24"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.25 5.63094C7.63469 4.78719 7.05625 4.42188 6.60313 4.175C5.08125 3.34688 3 3 3 3C4.29688 4.36563 4.1625 5.81562 4 7C4 7 3.87906 8.0275 4.05969 8.82531"
        stroke="#EB1C24"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11.6248 4.34844C11.142 3.20625 10.4998 2 10.4998 2C10.4998 2 8.52109 2 6.25953 4M7.92109 2.73656C6.91391 1.43156 5.49984 1 5.49984 1C5.02172 1.65 4.60016 2.61187 4.41016 3.31781"
        stroke="#EB1C24"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

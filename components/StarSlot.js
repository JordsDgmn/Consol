'use client';

const StarSlot = ({ filled = false, size = "1em" }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="inline-block"
      style={{ fontSize: 'inherit' }}
    >
      <path
        d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
        fill={filled ? "#fbbf24" : "#e5e7eb"}
        stroke={filled ? "#f59e0b" : "#d1d5db"}
        strokeWidth="1"
      />
    </svg>
  );
};

export default StarSlot;
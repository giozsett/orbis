import React from "react";

const LinuxTuxIcon = ({ size = 24, className = "", ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
    {...props}
  >
    <ellipse cx="32" cy="44" rx="18" ry="16" fill="#1a1a1a" />
    <ellipse cx="32" cy="30" rx="14" ry="16" fill="#1a1a1a" />
    <ellipse cx="32" cy="30" rx="11" ry="14" fill="#f5f5f5" />
    <ellipse cx="32" cy="32" rx="9" ry="10" fill="#f5f5f5" />
    <circle cx="28" cy="26" r="3" fill="#1a1a1a" />
    <circle cx="36" cy="26" r="3" fill="#1a1a1a" />
    <circle cx="28" cy="25.5" r="1" fill="#ffffff" />
    <circle cx="36" cy="25.5" r="1" fill="#ffffff" />
    <ellipse cx="32" cy="31" rx="4" ry="2.5" fill="#ff8c00" />
    <path d="M28 31 L32 28 L36 31" fill="#ff8c00" />
    <ellipse cx="22" cy="38" rx="6" ry="3" fill="#1a1a1a" transform="rotate(-20 22 38)" />
    <ellipse cx="42" cy="38" rx="6" ry="3" fill="#1a1a1a" transform="rotate(20 42 38)" />
    <ellipse cx="28" cy="56" rx="5" ry="2" fill="#ff8c00" />
    <ellipse cx="36" cy="56" rx="5" ry="2" fill="#ff8c00" />
  </svg>
);

export default LinuxTuxIcon;

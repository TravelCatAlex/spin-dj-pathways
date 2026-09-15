'use client';

/**
 * ATOM — Avatar
 * Falls back to the name's initial until avatarUrl is supplied by the API.
 */
export default function Avatar({ name = '', src = null, size = 30 }) {
  return (
    <div
      className="avatar"
      style={{ width: size, height: size, flexBasis: size }}
      aria-hidden="true"
    >
      {src ? (
        <img
          src={src}
          alt=""
          style={{ width: '100%', height: '100%', borderRadius: '50%' }}
        />
      ) : (
        name.charAt(0).toUpperCase()
      )}
    </div>
  );
}

import * as React from 'react';
import { css } from '../../../styled-system/css/index.mjs';

export default function NavLink({
  to,
  children,
}: {
  to: string;
  children: React.ReactNode;
}) {
  const [active, setActive] = React.useState(false);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname;
      setActive(pathname === to || pathname.startsWith(to + '/'));
    }
  }, [to]);

  return (
    <a
      href={to}
      className={css({
        color: active ? 'blue.700' : 'gray.600',
        fontWeight: active ? 'semibold' : 'normal',
        textDecoration: 'none',
        _hover: { color: 'blue.700' },
      })}
    >
      {children}
    </a>
  );
}

'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { MenuBar } from '@/lib/constants';
import { handleLogout } from '@/services/auth';
import { useSocket } from '@/providers/socket-provider';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/providers/auth-provider';
import React from 'react';
import { useActiveTabStore } from '@/stores/active-tab-message.store';

interface MenubarProps {
  className?: string;
}

const Menubar = ({ className }: MenubarProps) => {
  const router = useRouter();
  const socket = useSocket();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const { updateAuthUser, user } = useAuth();
  const { activeTab } = useActiveTabStore();

  const getMenuItemHref = (href: string) => {
    switch (href) {
      case '/message':
        return `/message/${activeTab}`;
      case '/profile':
        return `/profile/${user?.username}`;
      default:
        return href;
    }
  };

  const isActive = (basePath: string) => {
    if (basePath === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(basePath);
  };

  const handleLogoutClick = async () => {
    try {
      await handleLogout();
      socket?.disconnect();
      queryClient.clear();
      updateAuthUser(null);
      localStorage.removeItem('user');
      router.push('/login');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  const handleClick = (
    event: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    if (isActive(href)) {
      event.preventDefault();
    }
  };

  const renderMenuItem = (item: (typeof MenuBar)[0]) => {
    const Icon = item.icon;
    const commonButtonProps = {
      key: item.href,
      variant: 'ghost' as const,
      className: cn(
        'flex items-center justify-start gap-5 px-5 py-3',
        isActive(item.href) &&
          'bg-gray-800 text-background hover:bg-gray-800 hover:text-background',
      ),
      title: item.title,
    };

    if (item.href === '/logout') {
      return (
        <Button
          {...commonButtonProps}
          key={item.href}
          className={cn(commonButtonProps.className, 'w-full')}
          onClick={handleLogoutClick}
        >
          <Icon />
          <span className="hidden lg:inline">{item.label}</span>
        </Button>
      );
    }

    return (
      <Button {...commonButtonProps} key={item.href} asChild>
        <Link
          href={getMenuItemHref(item.href)}
          onClick={(event) => handleClick(event, item.href)}
        >
          <Icon />
          <span className="hidden lg:inline">{item.label}</span>
        </Link>
      </Button>
    );
  };

  return <div className={className}>{MenuBar.map(renderMenuItem)}</div>;
};

export default Menubar;

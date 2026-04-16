import { checkPlatform } from '@/base/browser/checkPlatform';
import { LeftIcon, RightIcon } from '@/components/icons';
import { desktopStyles } from '@/desktop/theme/main';
import classNames from 'classnames';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';

const getHistoryIdx = () => (window.history.state?.idx as number | undefined) ?? 0;

const readNavState = () => {
  const idx = getHistoryIdx();
  return {
    canGoBack: idx > 0,
    canGoForward: idx < window.history.length - 1,
  };
};

export const MacTopBar: React.FC = () => {
  const { isElectron, isMac } = checkPlatform();
  const navigate = useNavigate();
  const location = useLocation();
  const [{ canGoBack, canGoForward }, setNavState] = useState(readNavState);

  useEffect(() => {
    setNavState(readNavState());
    const update = () => setNavState(readNavState());
    window.addEventListener('popstate', update);
    return () => window.removeEventListener('popstate', update);
  }, [location]);

  if (!(isElectron && isMac)) {
    return null;
  }

  return (
    <div className="flex items-center h-8 px-2 flex-shrink-0">
      <div className="flex-1 h-full" style={{ WebkitAppRegion: 'drag' } as React.CSSProperties} />
      <div className="flex items-center gap-0.5" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
        <button
          type="button"
          onClick={() => canGoBack && navigate(-1)}
          disabled={!canGoBack}
          className={classNames(desktopStyles.SidebarHeaderIconButton, !canGoBack && 'opacity-40 pointer-events-none')}
        >
          <LeftIcon className={desktopStyles.SidebarHeaderIconButtonIcon} />
        </button>
        <button
          type="button"
          onClick={() => canGoForward && navigate(1)}
          disabled={!canGoForward}
          className={classNames(
            desktopStyles.SidebarHeaderIconButton,
            !canGoForward && 'opacity-40 pointer-events-none'
          )}
        >
          <RightIcon className={desktopStyles.SidebarHeaderIconButtonIcon} />
        </button>
      </div>
    </div>
  );
};

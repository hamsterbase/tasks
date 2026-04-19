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
    <div className={desktopStyles.MacTopBarContainer}>
      <div className={desktopStyles.MacTopBarDragRegion} style={{ WebkitAppRegion: 'drag' } as React.CSSProperties} />
      <div
        className={desktopStyles.MacTopBarControlRegion}
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        <button
          type="button"
          onClick={() => canGoBack && navigate(-1)}
          disabled={!canGoBack}
          className={classNames(
            desktopStyles.SidebarHeaderIconButton,
            !canGoBack && desktopStyles.MacTopBarButtonDisabled
          )}
        >
          <LeftIcon className={desktopStyles.SidebarHeaderIconButtonIcon} />
        </button>
        <button
          type="button"
          onClick={() => canGoForward && navigate(1)}
          disabled={!canGoForward}
          className={classNames(
            desktopStyles.SidebarHeaderIconButton,
            !canGoForward && desktopStyles.MacTopBarButtonDisabled
          )}
        >
          <RightIcon className={desktopStyles.SidebarHeaderIconButtonIcon} />
        </button>
      </div>
    </div>
  );
};

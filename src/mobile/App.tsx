import { useService } from '@/hooks/use-service';
import { useCloudSync } from '@/hooks/useCloudSync';
import { DatePickerActionSheet } from '@/mobile/overlay/datePicker/DatePickerActionSheet.tsx';
import { Dialog } from '@/mobile/overlay/dialog/Dialog';
import { PopupActionSheet } from '@/mobile/overlay/popupAction/PopupActionSheet';
import { TagEditorActionSheet } from '@/mobile/overlay/tagEditor/TagEditorActionSheet';
import { TaskDisplaySettings } from '@/mobile/overlay/taskDisplaySettings/TaskDisplaySettings';
import { pages } from '@/mobile/pages.tsx';
import { INavigationService } from '@/services/navigationService/common/navigationService';
import { SafeArea } from 'capacitor-plugin-safe-area';
import React, { useEffect, useRef } from 'react';
import { BrowserRouter, Navigate, Outlet, Route, Routes, useNavigate } from 'react-router';
import { Toast } from './overlay/toast/Toast';
import { ProjectAreaSelector } from './overlay/projectAreaSelector/ProjectAreaSelector';
import { ISwitchService } from '@/services/switchService/common/switchService';
import { PRIVACY_AGREEMENT_KEY } from './components/PrivacyAgreementOverlay';

const ContentNavigation = () => {
  const navigate = useNavigate();
  const navigationService = useService(INavigationService);
  useEffect(() => {
    const listener = navigationService.listenBackButton(() => {
      navigate(-1);
    });
    return () => {
      listener.dispose();
    };
  }, [navigate, navigationService]);
  const wewe = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const xx = navigationService.onNavigate((e) => {
      if (e.path === '/create_task') {
        wewe.current?.focus();
        navigate(e.path, { replace: e.replace });
      } else {
        navigate(e.path, { replace: e.replace });
      }
    });
    return () => {
      xx.dispose();
    };
  }, [navigationService, navigate]);
  return (
    <div>
      <div style={{ maxHeight: 0, overflow: 'hidden' }}>
        <input ref={wewe}></input>
      </div>
      <Outlet></Outlet>
    </div>
  );
};

export const App = () => {
  useCloudSync();
  const switchService = useService(ISwitchService);

  useEffect(() => {
    (async function () {
      if (switchService.getLocalSwitch('showPrivacyAgreementOverlay')) {
        const hasShown = localStorage.getItem(PRIVACY_AGREEMENT_KEY);
        if (!hasShown) {
          return;
        }
      }
      const safeAreaData = await SafeArea.getSafeAreaInsets();
      const { insets } = safeAreaData;
      for (const [key, value] of Object.entries(insets)) {
        document.documentElement.style.setProperty(`--safe-area-inset-${key}`, `${value}px`);
        if (switchService.getLocalSwitch('shouldIgnoreSafeBottom') && key === 'bottom') {
          document.documentElement.style.setProperty(`--safe-area-inset-${key}`, `0px`);
        }
      }
    })();
  }, [switchService]);

  return (
    <div>
      <DatePickerActionSheet></DatePickerActionSheet>
      <Dialog></Dialog>
      <Toast></Toast>
      <TagEditorActionSheet></TagEditorActionSheet>
      <PopupActionSheet></PopupActionSheet>
      <TaskDisplaySettings></TaskDisplaySettings>
      <ProjectAreaSelector></ProjectAreaSelector>
      <BrowserRouter>
        <Routes>
          <Route element={<ContentNavigation></ContentNavigation>}>
            {pages.map((page) => (
              <Route key={page.url} path={page.url} element={page.content} />
            ))}
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
};

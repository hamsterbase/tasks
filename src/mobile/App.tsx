import { useService } from '@/hooks/use-service';
import { useCloudSync } from '@/hooks/useCloudSync';
import { useSafeArea } from '@/hooks/useSafeArea';
import { DatePickerActionSheet } from '@/mobile/overlay/datePicker/DatePickerActionSheet.tsx';
import { Dialog } from '@/mobile/overlay/dialog/Dialog';
import { PopupActionSheet } from '@/mobile/overlay/popupAction/PopupActionSheet';
import { TagEditorActionSheet } from '@/mobile/overlay/tagEditor/TagEditorActionSheet';
import { TaskDisplaySettings } from '@/mobile/overlay/taskDisplaySettings/TaskDisplaySettings';
import { pages } from '@/mobile/pages.tsx';
import { INavigationService } from '@/services/navigationService/common/navigationService';
import React, { useEffect, useRef } from 'react';
import { BrowserRouter, Navigate, Outlet, Route, Routes, useNavigate } from 'react-router';
import { Toast } from './overlay/toast/Toast';
import { ProjectAreaSelector } from './overlay/projectAreaSelector/ProjectAreaSelector';

const ContentNavigation = () => {
  const navigate = useNavigate();
  const navigationService = useService(INavigationService);
  useEffect(() => {
    const listener = navigationService.listenBackButton(() => {
      if (window.history.state && window.history.state.idx > 0) {
        navigate(-1);
      } else {
        import('@capacitor/app').then(({ App }) => {
          App.exitApp();
        });
      }
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
  useSafeArea();

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

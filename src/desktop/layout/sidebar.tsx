import React from 'react';
import { Outlet } from 'react-router';

export const SidebarLayout = () => {
  return (
    <div>
      <div></div>
      <div>
        <Outlet></Outlet>
      </div>
    </div>
  );
};

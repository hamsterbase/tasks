import React from 'react';

export const FutureProjects = () => {
  return (
    <div className="h-full w-full bg-bg1">
      <div className="h-full flex flex-col">
        <div className="h-12 flex items-center justify-between px-4 border-b border-line-light bg-bg1">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-medium text-t1">Future Projects</h1>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">{/* Future tasks content will go here */}</div>
      </div>
    </div>
  );
};

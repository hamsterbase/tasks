import React, { ReactNode } from 'react';

interface TitleContentSectionProps {
  title: string;
  children: ReactNode;
}

export const TitleContentSection: React.FC<TitleContentSectionProps> = ({ title, children }) => {
  return (
    <div className="flex flex-col pt-5">
      <div className="flex flex-row justify-center items-center px-3 gap-2 w-full h-11 flex-none">
        <h2 className="flex-1 text-base leading-5 font-normal text-t1 truncate">{title}</h2>
      </div>
      <div>{children}</div>
    </div>
  );
};

export const projectPageTitleInputId = (projectId: string) => {
  return `INPUT_ID:project-${projectId}-title`;
};

export const areaPageTitleInputId = (areaId: string) => {
  return `INPUT_ID:area-${areaId}-title`;
};

export const viewPageTitleInputId = (viewUid: string) => {
  return `INPUT_ID:view-${viewUid}-title`;
};

export function isInputId(inputId: string) {
  return inputId.startsWith('INPUT_ID:');
}

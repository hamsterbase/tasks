import React from 'react';
import { NotesMarkdown } from '@/desktop/components/NotesMarkdown';
import { CliExplanation } from '@/base/common/cliApproval/explanation';
import { useImagePreviewOverlay } from '@/desktop/overlay/imagePreview/useImagePreviewOverlay';
import { localize } from '@/nls';
import { TestIds } from '@/testIds';

export const CliApprovalExplanation: React.FC<{ explanation: CliExplanation }> = ({ explanation }) => {
  const preview = useImagePreviewOverlay();
  return (
    <div className="col-span-2 grid min-w-0 grid-cols-subgrid gap-x-5" data-test-id={TestIds.CliApproval.Explanation}>
      <div className="text-xs leading-5 text-t3">{localize('cliApproval.explanation', 'Explanation')}</div>
      <div className="min-w-0">
        {explanation.text && (
          <div className="text-xs leading-5 break-words text-t1">
            <NotesMarkdown>{explanation.text}</NotesMarkdown>
          </div>
        )}
        {explanation.images.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {explanation.images.map((image, index) => {
              const url = `data:${image.mimetype};base64,${image.base64}`;
              return (
                <button
                  key={index}
                  type="button"
                  data-test-id={TestIds.CliApproval.ExplanationImage}
                  className="size-25 shrink-0 cursor-pointer overflow-hidden rounded-md border border-line-light"
                  aria-label={localize('cliApproval.previewEvidence', 'Preview {0}', image.filename)}
                  onClick={() => preview({ image: { url, filename: image.filename } })}
                >
                  <img src={url} alt={image.filename} className="size-full object-contain" />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

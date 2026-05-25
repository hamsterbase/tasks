import { MenuIcon, ViewIcon } from '@/components/icons';
import { compileTaskRule } from '@/core/filter/taskRuleCompiler';
import { getView } from '@/core/state/views/getView';
import { EntityHeader } from '@/desktop/components/common/EntityHeader';
import { NotesField } from '@/desktop/components/selectionPanel/components/NotesField';
import { useDesktopDialog } from '@/desktop/overlay/desktopDialog/useDesktopDialog';
import { DesktopMenuController } from '@/desktop/overlay/desktopMenu/DesktopMenuController';
import { RuleErrorDisplay } from '@/desktop/pages/views/RuleErrorDisplay';
import { desktopStyles } from '@/desktop/theme/main';
import { useService } from '@/hooks/use-service';
import { useWatchEvent } from '@/hooks/use-watch-event';
import { localize } from '@/nls';
import { ITodoService, VIEW_SCHEMA_VERSION } from '@/services/todo/common/todoService';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { IInstantiationService } from 'vscf/platform/instantiation/common';

interface ViewEditPanelProps {
  /** When provided, panel edits the existing view. When null, panel creates a new view on first valid save. */
  viewUid: string | null;
}

export const ViewEditPanel: React.FC<ViewEditPanelProps> = ({ viewUid }) => {
  const todoService = useService(ITodoService);
  const instantiationService = useService(IInstantiationService);
  const dialog = useDesktopDialog();
  const navigate = useNavigate();
  useWatchEvent(todoService.onStateChange);

  const existing = viewUid ? getView(todoService.modelState, viewUid) : null;
  // Block edits when the persisted view was written by a newer client —
  // letting the user type would either silently downgrade the rule's
  // schemaVersion or wipe out fields this build doesn't know about.
  const unsupportedVersion = !!existing && existing.schemaVersion > VIEW_SCHEMA_VERSION;

  // Local draft state. Initialised from the existing view (edit) or empty (create).
  const [name, setName] = useState(existing?.name ?? '');
  const [desc, setDesc] = useState(existing?.desc ?? '');
  const [rule, setRule] = useState(existing?.rule ?? '');

  // Re-sync local state when the route's view changes (or when a new view first appears).
  useEffect(() => {
    setName(existing?.name ?? '');
    setDesc(existing?.desc ?? '');
    setRule(existing?.rule ?? '');
  }, [viewUid, existing?.name, existing?.desc, existing?.rule]);

  const ruleResult = useMemo(() => (rule.trim() === '' ? null : compileTaskRule(rule)), [rule]);

  // For create mode we hold off creating the view until the user has produced
  // at least a non-empty name AND a valid rule, then we commit on the first
  // blur of any field. The new view id is held in a ref so subsequent edits
  // route to updateView() instead of repeatedly addView().
  const createdUidRef = useRef<string | null>(null);
  const isCreateMode = viewUid === null && createdUidRef.current === null;

  const persistOrCreate = (next: { name: string; desc: string; rule: string }) => {
    const trimmedName = next.name.trim();
    const trimmedRule = next.rule.trim();
    const compiledNow = trimmedRule === '' ? null : compileTaskRule(next.rule);
    const canPersist = trimmedName !== '' && trimmedRule !== '' && compiledNow?.success === true;

    // Resolve which view we're targeting: explicit uid (edit), or a previously
    // auto-created uid (create mode after first save), or new addView().
    const targetUid = viewUid ?? createdUidRef.current;

    if (targetUid) {
      todoService.updateView(targetUid, {
        name: trimmedName,
        desc: next.desc,
        rule: next.rule,
      });
      return;
    }

    if (!canPersist) return;

    const uid = todoService.addView({ name: trimmedName, desc: next.desc, rule: next.rule });
    createdUidRef.current = uid;
    navigate(`/desktop/views/${uid}`, { replace: true });
  };

  const handleNameSave = (value: string) => {
    setName(value);
    persistOrCreate({ name: value, desc, rule });
  };

  const handleRuleBlur = () => {
    persistOrCreate({ name, desc, rule });
  };

  const handleDelete = () => {
    const targetUid = viewUid ?? createdUidRef.current;
    if (!targetUid) {
      // Nothing persisted yet — just go back.
      navigate(-1);
      return;
    }
    dialog({
      title: localize('view.delete.title', 'Delete view'),
      description: localize(
        'view.delete.description',
        'Are you sure you want to delete this view? This cannot be undone.'
      ),
      onConfirm: () => {
        todoService.deleteView(targetUid);
        navigate('/desktop/inbox');
      },
    });
  };

  const handleMenuClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    DesktopMenuController.create(
      {
        menuConfig: [
          {
            label: localize('view.menu.delete', 'Delete view'),
            onSelect: handleDelete,
            icon: 'trash',
            danger: true,
          },
        ],
        x: rect.right,
        y: rect.bottom,
      },
      instantiationService
    );
  };

  const headerActions = [
    {
      icon: <MenuIcon />,
      handleClick: handleMenuClick,
      title: localize('common.more', 'More'),
    },
  ];

  // Unsupported-version views: render a stripped-down panel with just the
  // title and the action menu — the user must still be able to delete the
  // view from here, but editing rule/desc is hidden so they can't
  // accidentally clobber fields a newer client wrote.
  if (unsupportedVersion && existing) {
    return (
      <div className={desktopStyles.DetailViewContainer}>
        <EntityHeader
          variant="detail"
          editable={false}
          renderIcon={() => <ViewIcon />}
          title={existing.name}
          placeholder={localize('view.detail.untitled', 'Untitled view')}
          extraActions={headerActions}
        />
      </div>
    );
  }

  return (
    <div className={desktopStyles.DetailViewContainer}>
      <EntityHeader
        editable
        disableNewLine
        variant="detail"
        inputKey={`view-name:${viewUid ?? 'new'}`}
        renderIcon={() => <ViewIcon />}
        title={name}
        placeholder={
          isCreateMode
            ? localize('view.create.placeholder', 'New view')
            : localize('view.detail.untitled', 'Untitled view')
        }
        onSave={handleNameSave}
        extraActions={headerActions}
      />

      <div className={desktopStyles.DetailViewContent}>
        <div className={desktopStyles.DetailViewContentInner}>
          <NotesField
            value={desc}
            onSave={(value) => {
              setDesc(value);
              persistOrCreate({ name, desc: value, rule });
            }}
            placeholder={localize('view.field.descPlaceholder', 'Add description...')}
            className={desktopStyles.DetailViewNotesTextarea}
          />

          <div className={desktopStyles.DetailViewDivider} />

          <div className={desktopStyles.ViewRuleHeader}>
            <span className={desktopStyles.ViewRuleHeaderTitle}>{localize('view.field.rule', 'Rule')}</span>
          </div>
          <textarea
            value={rule}
            onChange={(e) => setRule(e.target.value)}
            onBlur={handleRuleBlur}
            placeholder="item.status === 'created'"
            className={desktopStyles.ViewFieldRuleInput}
            rows={5}
            spellCheck={false}
          />
          <RuleErrorDisplay source={rule} result={ruleResult} />
        </div>
      </div>
    </div>
  );
};

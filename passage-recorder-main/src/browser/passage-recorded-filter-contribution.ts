import { MonacoFrontendApplicationContribution } from '@theia/monaco/lib/browser/monaco-frontend-application-contribution';
import { FilterContribution, ContributionFilterRegistry } from '@theia/core/lib/common';
import { MonacoOutlineContribution } from '@theia/monaco/lib/browser/monaco-outline-contribution';
import { OutlineViewContribution } from '@theia/outline-view/lib/browser/outline-view-contribution';

import { injectable, interfaces } from 'inversify';
import { OutlineViewService } from '@theia/outline-view/lib/browser/outline-view-service';

@injectable()
export class PassageRecordedFilterContribution implements FilterContribution {

    registerContributionFilters(registry: ContributionFilterRegistry): void {
        registry.addFilters("*", [
          contrib => !(contrib instanceof MonacoFrontendApplicationContribution),
          contrib => !(contrib instanceof MonacoOutlineContribution),
          contrib => !(contrib instanceof OutlineViewContribution),
          contrib => !(contrib instanceof OutlineViewService)
        ]);
    }
}

export function bindSampleFilteredCommandContribution(bind: interfaces.Bind): void {
  bind(PassageRecordedFilterContribution).toSelf().inSingletonScope();
  bind(FilterContribution).to(PassageRecordedFilterContribution).inSingletonScope();
}
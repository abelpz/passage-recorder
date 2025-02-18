import { ContainerModule } from '@theia/core/shared/inversify';
import { PassageRecorderMainWidget } from './passage-recorder-main-widget';
import { PassageRecorderMainContribution } from './passage-recorder-main-contribution';
import { bindViewContribution, FrontendApplicationContribution, WidgetFactory } from '@theia/core/lib/browser';
import '../../src/browser/style/index.css';
import { bindSampleFilteredCommandContribution } from './passage-recorded-filter-contribution';
// import { PassageRecordedFilterContribution } from './passage-recorded-filter-contribution';
// import { FilterContribution } from '@theia/core';

export default new ContainerModule((bind) => {
    bindViewContribution(bind, PassageRecorderMainContribution);
    bind(FrontendApplicationContribution).toService(PassageRecorderMainContribution);
    bind(PassageRecorderMainWidget).toSelf();
    bind(WidgetFactory).toDynamicValue(ctx => ({
        id: PassageRecorderMainWidget.ID,
        createWidget: () => ctx.container.get<PassageRecorderMainWidget>(PassageRecorderMainWidget),
        
    })).inSingletonScope();
    bindSampleFilteredCommandContribution(bind);
});

import { ContainerModule } from '@theia/core/shared/inversify';
import { PassageRecorderMainWidget } from './passage-recorder-main-widget';
import { PassageRecorderMainContribution } from './passage-recorder-main-contribution';
import { bindViewContribution, FrontendApplicationContribution, WidgetFactory } from '@theia/core/lib/browser';
import '../../src/browser/style/index.css';
import '../../src/browser/style/recordings-list.css';
import { bindSampleFilteredCommandContribution } from './passage-recorded-filter-contribution';
import { ResponsiveCssContribution } from './responsive-css-contribution';
import { RecordingsListWidget } from './recordings-list-widget';
import { RecordingsListContribution } from './recordings-list-contribution';
import { FileSystemService, TauriFileSystemService } from './filesystem/file-system-service';
// import { PassageRecordedFilterContribution } from './passage-recorded-filter-contribution';
// import { FilterContribution } from '@theia/core';

export default new ContainerModule((bind) => {
    // Bind the recordings list widget and contribution first
    bind(RecordingsListWidget).toSelf().inSingletonScope();
    bindViewContribution(bind, RecordingsListContribution);
    bind(FrontendApplicationContribution).toService(RecordingsListContribution);
    bind(WidgetFactory).toDynamicValue(ctx => ({
        id: RecordingsListWidget.ID,
        createWidget: () => ctx.container.get<RecordingsListWidget>(RecordingsListWidget)
    })).inSingletonScope();

    // Then bind the main widget that depends on it
    bindViewContribution(bind, PassageRecorderMainContribution);
    bind(FrontendApplicationContribution).toService(PassageRecorderMainContribution);
    bind(PassageRecorderMainWidget).toSelf().inSingletonScope();
    bind(WidgetFactory).toDynamicValue(ctx => ({
        id: PassageRecorderMainWidget.ID,
        createWidget: () => ctx.container.get<PassageRecorderMainWidget>(PassageRecorderMainWidget)
    })).inSingletonScope();

    bindSampleFilteredCommandContribution(bind);

    // Bind the responsive CSS contribution
    bind(FrontendApplicationContribution).to(ResponsiveCssContribution).inSingletonScope();

    // Bind the file system service
    bind(FileSystemService).to(TauriFileSystemService).inSingletonScope();
});

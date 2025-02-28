import { injectable } from '@theia/core/shared/inversify';
import { FrontendApplicationContribution } from '@theia/core/lib/browser';

@injectable()
export class ResponsiveCssContribution implements FrontendApplicationContribution {
    
    initialize(): void {
        this.applyResponsiveStyles();
    }

    private applyResponsiveStyles(): void {
        // Create a style element
        const style = document.createElement('style');
        style.type = 'text/css';
        
        // Define responsive CSS rules
        const css = `
            /* Make the main container responsive */
            .theia-main-container {
                display: flex;
                flex-direction: column;
                min-height: 100vh;
                width: 100%;
            }

            /* Make the app shell responsive */
            .theia-app-shell {
                display: flex;
                flex-direction: column;
                height: 100vh;
                width: 100vw;
            }

            /* Responsive sidebar */
            .theia-sidebar {
                min-width: 200px;
                max-width: 300px;
                flex-shrink: 0;
            }

            /* Responsive editor area */
            .theia-editor-container {
                flex: 1;
                min-width: 0;
                height: 100%;
            }

            /* Responsive panels */
            .theia-panel-container {
                max-height: 35vh;
                resize: vertical;
            }

            /* Responsive tabs */
            .p-TabBar-content {
                flex-wrap: wrap;
            }

            /* Media query for small screens */
            @media (max-width: 768px) {
                .theia-sidebar {
                    min-width: 50px;
                    max-width: 200px;
                }

                .theia-horizontal .theia-SplitPanel-handle {
                    display: none;
                }

                .theia-dock-panel {
                    flex-direction: column;
                }
            }

            /* Media query for extra small screens */
            @media (max-width: 480px) {
                .theia-sidebar {
                    min-width: 40px;
                    max-width: 150px;
                }

                .theia-tab-icon-label {
                    max-width: 100px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
            }
        `;

        // Add the CSS rules to the style element
        style.appendChild(document.createTextNode(css));
        
        // Add the style element to the document head
        document.head.appendChild(style);
    }
} 
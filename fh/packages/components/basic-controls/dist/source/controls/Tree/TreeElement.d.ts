import { HTMLFormComponent } from "fh-forms-handler";
declare class TreeElement extends HTMLFormComponent {
    private readonly label;
    private readonly onIconClick;
    private readonly nextLevelExpandable;
    private techIconElement;
    private iconElement;
    private collapsed;
    private subTree;
    private readonly onLabelClick;
    private currentTechIconClasses;
    private currentIconClasses;
    private icons;
    private readonly selectable;
    private readonly icon;
    private selected;
    private spanWithLabel;
    parent: TreeElement;
    private ul;
    constructor(componentObj: any, parent: HTMLFormComponent);
    create(): void;
    addNodes(nodesList: any): void;
    createUlElement(): void;
    createLiElement(): HTMLLIElement;
    update(change: any): void;
    lazyLoadIfNeeded(): void;
    expandAllToSelectedElement(): void;
    collapse(): void;
    expand(): void;
    findTree(): any;
    toggleCollaped(): void;
    updateTreeCollapsed(): void;
    updateIcon(): void;
    updateTechIcon(): void;
    updateAnyIcon(icon: any, currentIconClasses: any, newIconClasses: any): any;
    destroy(removeFromParent: any): void;
    isContainingNestedNodes(): number;
    iconClicked(event: any): boolean;
    labelClicked(event: any): boolean;
}
export { TreeElement };
import 'imports-loader?moment,define=>false,exports=>false!../../external/inputmask';
import 'imports-loader?moment,define=>false,exports=>false!../../external/bootstrap-datepicker';
import { InputText } from "./InputText";
import { HTMLFormComponent } from 'fh-forms-handler';
import { LanguageChangeObserver } from "fh-forms-handler";
declare class InputDate extends InputText implements LanguageChangeObserver {
    protected backendFormat: string;
    protected format: string;
    protected maskEnabled: boolean;
    protected datepickerEnabled: boolean;
    protected highlightToday: boolean;
    protected inputDateHeight: any;
    protected maskPlugin: any;
    /**
     * Czy uzywac trybu scislego biblioteki momentjs
     * Na przykład  czy data 2016-12-24T00:00:00.000+00:00 będzie nieprawidłowa dla maski YYYY-MM-DD
     * @type {boolean}
     */
    private static MOMENT_JS_STRICT_MODE;
    constructor(componentObj: any, parent: HTMLFormComponent);
    create(): void;
    applyDatepicker(): void;
    disableDatepicker(): void;
    inputBlurEvent(): void;
    inputChangeEvent(): void;
    createAddon(): void;
    setAccessibility(accessibility: any): void;
    protected makePlaceholder(format: string): string;
    update(change: any): void;
    onValueInput(): void;
    updateModel(): void;
    static isDateValid(date: any, sourceFormat: any): boolean;
    static toDateOrLeave(text: any, sourceFormat: any, targetFormat: any): any;
    static toDateOrClear(text: any, sourceFormat: any, targetFormat: any): string;
    extractChangedAttributes(): {};
    protected disableMask(): void;
    protected applyMask(): void;
    languageChanged(code: string): void;
    wrap(skipLabel: any, isInputElement: any): void;
    getDefaultWidth(): string;
    destroy(removeFromParent: boolean): void;
}
export { InputDate };
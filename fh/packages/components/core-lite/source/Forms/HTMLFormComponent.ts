import 'bootstrap/js/dist/tooltip';
import {FormComponent} from "./FormComponent";
import {FhContainer} from "../FhContainer";
import getDecorators from "inversify-inject-decorators";
import {I18n} from "../I18n/I18n";
import {FHML} from "../FHML";
import {AdditionalButton} from "./AdditionalButton";
import * as $ from 'jquery';

let {lazyInject} = getDecorators(FhContainer);

abstract class HTMLFormComponent extends FormComponent {
    @lazyInject("FHML")
    protected fhml: FHML;

    @lazyInject("I18n")
    protected i18n: I18n;

    protected container: HTMLElement;
    protected hintElement: HTMLElement;
    public htmlElement: any;
    public accessibility: string;
    public invisible: string;
    protected presentationStyle: string;
    protected requiredField: string;
    protected component: any;
    protected toolbox: HTMLElement;
    protected inputGroupElement: HTMLElement;
    protected labelElement: HTMLElement;
    protected requiredElement: HTMLElement;
    protected requiredHidden: boolean;
    private readonly translationItems: any;
    private inputSize: any;
    public width: string[];
    protected styleClasses: any;
    protected readonly inlineStyle: string;
    protected readonly wrapperStyle: string;
    private readonly language: any;
    protected hint: any;
    protected hintPlacement: string;
    protected hintInitialized: boolean = false;
    protected rawValue: any;
    private areSubcomponentsRendered: boolean;
    protected oldValue: any;
    protected components: HTMLFormComponent[];
    private readonly push: boolean;
    private static bootstrapColRegexp: RegExp = /^(xs|sm|md|lg|xl)-([1-9]|1[0-2])$/i;
    private static bootstrapColWidthRegexp: RegExp = /^\d+(px|%)$/i;
    private static bootstrapColSeparateCahrsRegexp: RegExp = /(,|;|\|\/|\|)/g;
    protected focusableComponent: HTMLElement;
    public type: string;

    protected constructor(componentObj: any, parent: FormComponent) {
        super(componentObj, parent);



        if (this.parent != null) {
            this.container = this.parent.contentWrapper;
        } else { // FORM
            this.container = document.getElementById(this.parentId);
            if (this.container == null && this.parentId != 'MODAL_VIRTUAL_CONTAINER') {
                throw "Container '" + this.parentId + "' not found";
            }
        }
        this.combinedId = this.parentId + '_' + this.id;

        this.accessibility = this.componentObj.accessibility;
        this.invisible = this.componentObj.invisible;
        this.presentationStyle = this.componentObj.presentationStyle;
        this.requiredField = this.componentObj.required;
        this.designMode = this.componentObj.designMode || (this.parent != null && this.parent.designMode);
        if (this.designMode) {
            this.buildDesingerToolbox();
        }

        this.handleWidth();

        if (typeof this.oldValue === 'undefined') {
            if (this.componentObj.rawValue != null) {
                this.oldValue = this.componentObj.rawValue;
            } else {
                this.oldValue = this.componentObj.value;
            }
        }
        this.inlineStyle = this.componentObj.inlineStyle;
        this.wrapperStyle = this.componentObj.wrapperStyle;
        this.push = this.componentObj.push;
        this.rawValue = this.oldValue;
        this.htmlElement = null;
        this.component = this.htmlElement;
        this.contentWrapper = this.component;
        this.styleClasses = (this.componentObj.styleClasses || '').split(/[, ]/);

        this.hint = this.componentObj.hint || null;
        this.hintPlacement = this.componentObj.hintPlacement || 'auto';
        this.hintElement = null;

        if (this.formId === 'designerComponents' || this.formId === 'designerToolbox') {
            let a: any = this;
            while ((a = a.parent) != null) {
                if (a.component != null && a.component.classList.contains('designerToolbox')) {
                    (<any>FhContainer.get('Designer')).onDesignerToolboxComponentCreated(a);
                    break;
                }
            }
        }

        this.requiredElement = null;
        this.areSubcomponentsRendered = false;

        /* Languages */
        this.language = this.componentObj.language || null;
        this.translationItems = [];

        this.labelElement = null;
    }

    /* Create component and assign it's HTML to this.htmlElement */
    create() {
        this.component = document.createElement('div');
        this.htmlElement = this.component;
        this.contentWrapper = this.htmlElement;
        this.hintElement = this.component;

        this.display();

        /* Add subcomponents */
        super.create();
    }

    /* Append component to container */
    display() {
        this.setAccessibility(this.accessibility);
        this.setPresentationStyle(this.presentationStyle);
        this.enableStyleClasses();
        this.setRequiredField(this.requiredField);

        if (this.designMode) {
            this.htmlElement.appendChild(this.toolbox);
            this.htmlElement.addEventListener('mouseover', function () {
                this.showToolbox();
            }.bind(this));
            this.htmlElement.addEventListener('mouseout', function () {
                this.hideToolbox();
            }.bind(this));
            if (this.component.classList.contains('tabContainer')) {
                this.component.addEventListener('click', function (e) {
                    e.stopImmediatePropagation();
                    e.preventDefault();

                    // get the tab's id and click on the tab to edit its properties
                    const clickedTabId = e.target.getAttribute('data-tab-id');
                    const clickedTab = document.getElementById(clickedTabId);
                    if (clickedTab !== null) {
                        clickedTab.click();
                    }
                });
            }
            this.htmlElement.addEventListener('click', function (e) {
                e.stopImmediatePropagation();
                e.preventDefault();
                this.fireEvent('onformedit_elementedit', 'elementedit');
            }.bind(this));
            if (this.contentWrapper.classList.contains('button')) {
                this.component.addEventListener('click', function (e) {
                    e.stopImmediatePropagation();
                    e.preventDefault();
                    this.fireEvent('onformedit_elementedit', 'elementedit');
                }.bind(this));
            }
            if (this.contentWrapper.classList.contains('selectOneMenu')) {
                this.component.addEventListener('click', function (e) {
                    e.stopImmediatePropagation();
                    this.fireEvent('onformedit_elementedit', 'elementedit');
                }.bind(this));
            }
        }
        if (this.hint && this.hintElement) {
            // this.hintElement.dataset.toggle = 'tooltip';
            // this.hintElement.dataset.placement = 'auto right';
            // this.hintElement.dataset.trigger = 'hover';
            // // this.hintElement.dataset.container = 'body';
            // this.hintElement.dataset.title = this.hint;
        }
        this.container.appendChild(this.htmlElement);
        if (this.hint !== null) {
            this.initHint();
        }
    }

    render() {
        if (this.htmlElement) {
            this.display();
        }
        if (!this.areSubcomponentsRendered) {
            this.renderSubcomponents();
            this.areSubcomponentsRendered = true;
        }
    }

    renderSubcomponents() {
        this.components.forEach(function (component) {
            component.render();
        });
    }

    initHint() {
        if (this.hintElement && !this.hintInitialized && this.hint) {
            let tooltipOptions: any = {
                placement: this.hintPlacement,
                title: this.hint,
                html: true,
                boundary: 'viewport'
            };

            $(this.hintElement).tooltip(tooltipOptions);

            this.hintInitialized = true;
        }
    }

    destroyHint() {
        if (this.hintElement && this.hintInitialized) {
            $(this.hintElement).tooltip('hide');
            $(this.hintElement).tooltip('disable');
            $(this.hintElement).tooltip('dispose');

            this.hintInitialized = false;
        }
    }

    /* Destroy component */
    destroy(removeFromParent) {
        this.destroyHint();

        if (removeFromParent && this.parent != null && this.parent.contentWrapper != null && this.htmlElement != null) {
            try {
                if (this.htmlElement.parentNode === this.parent.contentWrapper) {
                    this.parent.contentWrapper.removeChild(this.htmlElement);
                }
            } catch (e) {
                console.log("Error while destroying ", this, e);
            }
        }

        if (this.toolbox != null) {
            $(this.toolbox).unbind().remove();
            this.toolbox = null;
        }
        if (this.labelElement != null) {
            $(this.labelElement).unbind().remove();
            this.labelElement = null;
        }
        if (this.inputGroupElement != null) {
            $(this.inputGroupElement).unbind().remove();
            this.inputGroupElement = null;
        }
        if (this.focusableComponent != null) {
            $(this.focusableComponent).unbind().remove();
            this.focusableComponent = null;
        }
        if (this.hintElement != null) {
            $(this.hintElement).unbind().remove();
            this.hintElement = null;
        }
        if (this.component != null) {
            $(this.component).unbind().remove();
            this.component = null;
        }
        if (this.htmlElement != null) {
            $(this.htmlElement).unbind().remove();
            this.htmlElement = null;
        }

        super.destroy(removeFromParent);
    }

    /* Update component */
    update(change) {
        super.update(change);

        this.processAddedComponents(change);

        if (change.changedAttributes) {

            $.each(change.changedAttributes, function (name, newValue) {
                switch (name) {
                    case 'accessibility':
                        this.setAccessibility(newValue);
                        break;
                    case 'presentationStyle':
                        this.setPresentationStyle(newValue);
                        break;
                    case 'messageForField':
                        this.component.title = newValue || '';
                        break;
                    case 'width':
                        this.setWrapperWidth(this.htmlElement, this.width, newValue);
                        this.width = newValue;
                        break;
                    case 'language':
                        this.language = newValue;
                        this.changeLanguage(this.language);
                        break;
                    case 'required':
                        this.requiredField = newValue;
                        this.setRequiredField(this.requiredField);
                        break;
                    case 'label':
                        if (this.labelElement != null) {
                            this.labelElement.innerHTML = this.fhml.resolveValueTextOrEmpty(newValue);
                            this.updateLabelClass(newValue);
                        }
                        break;
                    case 'hint':
                        this.hint = newValue;
                        if (this.hintElement) {
                            this.hintElement.dataset.title = this.hint;
                        }
                        this.destroyHint();
                        this.initHint();
                        break;
                }
            }.bind(this));
        }
    }

    updateLabelClass(newLabel) {
        if (this.labelElement != null) {
            if (newLabel != null && newLabel != '') {
                this.labelElement.classList.remove('empty-label');
            } else {
                this.labelElement.classList.add('empty-label');
            }
        }
    }

    processAddedComponents(change) {
        if (change.addedComponents) {
            Object.keys(change.addedComponents).forEach(function (afterId) {
                let referenceNode = null;
                if (afterId === '-') {
                    referenceNode = this.contentWrapper.firstChild || null;
                } else if (this.findComponent(afterId)) {
                    let elem = this.findComponent(afterId).htmlElement;
                    referenceNode = typeof elem !== 'undefined' ? elem.nextSibling || null : null;
                }

                change.addedComponents[afterId].forEach(function (componentObj) {
                    let component = this.findComponent(componentObj.id);
                    if (component instanceof HTMLFormComponent) {
                        if (referenceNode) {
                            if (component.htmlElement.id != referenceNode.id) {
                                this.contentWrapper.insertBefore(component.htmlElement,
                                    referenceNode);
                            }
                            let thisNodeComponent = this.findComponent(component.htmlElement.id);
                            if (thisNodeComponent.htmlElement &&
                                thisNodeComponent.htmlElement.nextSibling) {
                                referenceNode = thisNodeComponent.htmlElement.nextSibling;
                            }
                        } else {
                            this.contentWrapper.appendChild(component.htmlElement);
                        }
                    } else if (referenceNode) {
                        component.referenceNode = referenceNode.nextSibling || null;
                    }
                }.bind(this));
            }.bind(this));
        }
    }

    updateModel() {
        this.rawValue = this.component.value;
    }

    public accessibilityResolve(node: HTMLElement, access: string) {
        switch (node.nodeName) {
            case 'BUTTON':
            case 'INPUT':
            case 'TEXTAREA':
            case 'SELECT':
            case 'OPTION':
            case 'OPTGROUP':
            case 'FIELDSET':
                if (access !== 'EDIT') {
                    node.setAttribute('disabled', 'disabled');
                } else {
                    node.removeAttribute('disabled');
                }
                node.classList.add('fc-editable');
                break;
            default:
                if (access !== 'EDIT') {
                    node.classList.add('fc-disabled');
                    node.classList.add('disabled');
                } else {
                    node.classList.add('fc-editable');
                }
        }
    }

    setAccessibility(accessibility) {
        if (accessibility !== 'HIDDEN') {
            this.htmlElement.classList.remove('d-none');
            this.htmlElement.classList.remove('invisible');

        }
        if (accessibility !== 'DEFECTED' || accessibility !== 'VIEW') {
            this.component.classList.remove('fc-disabled');
            this.component.classList.remove('disabled');
        }
        if (accessibility !== 'EDIT') {
            this.component.classList.remove('fc-editable');
        }
        if (accessibility !== 'VIEW') {
            this.component.classList.remove('disabledElement');
        }

        switch (accessibility) {
            case 'EDIT':
                this.accessibilityResolve(this.component, 'EDIT');
                break;
            case 'VIEW':
                this.accessibilityResolve(this.component, 'VIEW');
                break;
            case 'HIDDEN':
                if (!this.designMode) {
                    if (this.invisible) {
                        this.htmlElement.classList.add('invisible');
                    } else {
                        this.htmlElement.classList.add('d-none');
                    }
                }
                break;
            case 'DEFECTED':
                this.accessibilityResolve(this.component, 'DEFECTED');
                this.component.title = 'Broken control';
                break;
        }

        this.accessibility = accessibility;
    }

    setPresentationStyle(presentationStyle) {
        if (this.parent != null) {
            // @ts-ignore
            this.parent.setPresentationStyle(presentationStyle);
        }

        ['border', 'border-success', 'border-info', 'border-warning', 'border-danger', 'is-invalid'].forEach(function (cssClass) {
            this.getMainComponent().classList.remove(cssClass);
        }.bind(this));

        switch (presentationStyle) {
            case 'BLOCKER':
            case 'ERROR':
                ['is-invalid', 'border', 'border-danger'].forEach(function (cssClass) {
                    this.getMainComponent().classList.add(cssClass);
                }.bind(this));
                break;
            case 'OK':
                ['border', 'border-success'].forEach(function (cssClass) {
                    this.getMainComponent().classList.add(cssClass);
                }.bind(this));
                break;
            case 'INFO':
                ['border', 'border-info'].forEach(function (cssClass) {
                    this.getMainComponent().classList.add(cssClass);
                }.bind(this));
                break;
            case 'WARNING':
                ['border', 'border-warning'].forEach(function (cssClass) {
                    this.getMainComponent().classList.add(cssClass);
                }.bind(this));
                break;
        }

        this.presentationStyle = presentationStyle;
    }

    protected getMainComponent() {
        return this.component;
    }


    addStyles() {

        this.handleHeight();
        this.resolveLabelPosition();
        this.addAlignStyles();
        this.handlemarginAndPAddingStyles();
    }

    handleHeight(){
        if (this.componentObj.height != undefined) {
            let height = this.componentObj.height;
            if (height.indexOf('%') !== -1) {
                height = height.replace('px', '');
                this.htmlElement.style.height = height;
                height = '100%';
            }
            this.component.classList.add('hasHeight');
            this.component.classList.add('container' + this.componentObj.type);
            this.component.style.height = height;
            this.component.style['overflow-y'] = 'auto';
        }
        if (this.componentObj.inputSize != undefined) {
            this.component.style.width = this.inputSize + '%';
        }
    }

    addAlignStyles() {
        if (this.componentObj.horizontalAlign && this.htmlElement) {
            this.htmlElement.classList.add('align-' + this.componentObj.horizontalAlign.toLowerCase());
        }
        if (this.componentObj.verticalAlign && this.htmlElement) {
            this.htmlElement.classList.add('valign-' + this.componentObj.verticalAlign.toLowerCase());
            switch (this.componentObj.verticalAlign.toLowerCase()) {
                case 'bottom':
                    this.htmlElement.classList.add('align-self-end');
                    break;
                case 'top':
                    this.htmlElement.classList.add('align-self-start');
                    break;
                case 'middle':
                    this.htmlElement.classList.add('align-self-center');
                    break;
            }
        }
    }

    resolveLabelPosition() {
        if (this.componentObj.labelPosition != undefined) {
            let labelPosition = this.componentObj.labelPosition.toLowerCase();
            if (labelPosition != 'up') {
                $(this.component).closest('.fc.wrapper').addClass('positioned');
                $(this.component).closest('.fc.wrapper').addClass(labelPosition);
            }
            if (labelPosition === 'left' || labelPosition === 'right') {
                this.resolveInputSize();
            }
        }
    }

    setInputAndLabelPosition(property: string, labelElement: HTMLElement, inputElement: HTMLElement) {
        if (property.toString().indexOf('px', property.length - 2) !== -1) {
            if (labelElement !== null) {
                labelElement.style.width = property;
            }

            let group = this.htmlElement.querySelector('.input-group');
            if (group != null) {
                inputElement = group;
            }

            if (inputElement) {
                inputElement.classList.add('stretched');
                inputElement.style.width = 'calc(100% - ' + property + ')';
            }
        } else {
            let labelWidth = Math.max(0, Math.min(99, parseInt(property)));
            labelElement.style.width = labelWidth + '%';

            let inputWidth = 100 - labelWidth;
            if (inputElement) {
                inputElement.style.width = inputWidth + '%';
            }
        }
    }

    resolveInputSize() {
        if (this.componentObj.labelSize != undefined) {
            if (this.componentObj.labelPosition == 'LEFT') {
                this.setInputAndLabelPosition(
                    this.componentObj.labelSize,
                    this.htmlElement.querySelector('.col-form-label'),
                    this.getQueryForInputSize()
                );
            } else if (this.componentObj.labelPosition == 'RIGHT') {
                this.setInputAndLabelPosition(
                    this.componentObj.labelSize,
                    this.htmlElement.querySelector('.col-form-label'),
                    this.getQueryForInputSize()
                );
            }
            return; // jesli labelSize jest zdefiniowane, to inputSize nie dziala
        }
        if (this.componentObj.inputSize != undefined) {
            let inputWidth = Math.max(0, Math.min(99, parseInt(this.componentObj.inputSize)));
            let labelWidth = 100 - inputWidth;
            let label = this.htmlElement.querySelector('.col-form-label');
            if (label) {
                label.style.width = labelWidth + '%';
            }
            let input = this.getQueryForInputSize();
            if (input) {
                input.style.width = inputWidth + '%';
            }
        }
    }

    getQueryForInputSize() {
        if (this.inputGroupElement != null) {
            return this.htmlElement.querySelector('.input-group');
        } else {
            return this.component.querySelector('.form-control');
        }
    }

    enableStyleClasses() {
        if (this.styleClasses.length && this.styleClasses[0] != '') {
            this.styleClasses.forEach(function (cssClass) {
                this.component.classList.add(cssClass);
            }.bind(this));
        }
    }

    setWrapperWidth(wrapper: HTMLDivElement, oldWidth: string[], newWidth: string[]) {
        if (oldWidth) {
            oldWidth.forEach(function (width) {
                if (HTMLFormComponent.bootstrapColRegexp.test(width)) {
                    //In bootstrap 4 "co-xs-12" was replaced with "col-12" so we need to delete it from string.
                    wrapper.classList.remove('col-' + width.replace('xs-','-'));
                } else if (HTMLFormComponent.bootstrapColWidthRegexp.test(width)) {
                    wrapper.classList.remove('exactWidth');
                    wrapper.style.width = undefined;
                } else {
                    console.error(`Invalid width '${width}' for component '${this.id}'.`);
                }
            }.bind(this));
        }

        newWidth.forEach(function (width) {
            if (HTMLFormComponent.bootstrapColRegexp.test(width)) {
                //In bootstrap 4 "co-xs-12" was replaced with "col-12" so we need to delete it from string.
                wrapper.classList.add('col-' + width.replace('xs-','-'));
            } else if (HTMLFormComponent.bootstrapColWidthRegexp.test(width)) {
                wrapper.classList.add('exactWidth');
                wrapper.style.width = width;
            } else {
                console.error(`Invalid width '${width}' for component '${this.id}'.`);
            }
        }.bind(this));
    }

    protected wrap(skipLabel: boolean = false, isInputElement: boolean = false) {
        let wrappedComponent = this.innerWrap();
        let wrapper = document.createElement('div');
        ['fc', 'wrapper'].forEach(function (cssClass) {
            wrapper.classList.add(cssClass);
        });

        this.wrapInner(wrapper, wrappedComponent, skipLabel, isInputElement);
    }

    protected wrapInner(wrapper, wrappedComponent, skipLabel: boolean = false, isInputElement: boolean = false) {
        if (this.width) {
            // @ts-ignore
            this.setWrapperWidth(wrapper, undefined, this.width);
        } else {
            wrapper.classList.add('inline');
        }

        if (!skipLabel) {
            let label = document.createElement('label');
            label.classList.add('col-form-label');
            // label.classList.add('card-title');
            label.htmlFor = this.id;
            label.innerHTML = this.fhml.resolveValueTextOrEmpty(this.componentObj.label);
            wrapper.appendChild(label);
            this.labelElement = label;
        }

        if (isInputElement) {
            let inputGroup = document.createElement('div');
            // this.component.classList.add('input-group');
            inputGroup.classList.add('input-group');
            wrapper.appendChild(inputGroup);
            inputGroup.appendChild(wrappedComponent);

            if (this.component.classList.contains('inputTimestamp')) {
                inputGroup.id = this.componentObj.id;
            }

            this.inputGroupElement = inputGroup;
        } else {
            wrapper.appendChild(wrappedComponent);
        }

        if (this.inlineStyle) {
            this.component.setAttribute('style', this.inlineStyle);
        }

        if (this.wrapperStyle) {
            let existingStyleClasses = wrapper.getAttribute('style') || "";
            wrapper.setAttribute('style', existingStyleClasses + this.wrapperStyle);
        }

        if (this.push && this.push == true) {
            wrapper.classList.add('mr-auto');
        }


        this.htmlElement = wrapper;
        this.contentWrapper = this.component;

        if (!skipLabel) {
            this.updateLabelClass(this.componentObj.label);
        }
    }

    protected innerWrap() {
        return this.component;
    }

    showToolbox() {
        this.toolbox.classList.remove('d-none');
    }

    hideToolbox() {
        this.toolbox.classList.add('d-none');
    }

    public focusCurrentComponent(deferred, options) {
        if (this.designMode) {
            let form = document.getElementById(this.formId);
            let activeComponents = form.querySelectorAll('.designerFocusedElement');
            let isUserAgentIE = this.fh.isIE();
            if (activeComponents.length) {

                if (isUserAgentIE && !NodeList.prototype.forEach) {
                    NodeList.prototype.forEach = function (callback, thisArg) {
                        thisArg = thisArg || window;
                        for (let i = 0; i < this.length; i++) {
                            callback.call(thisArg, this[i], i, this);
                        }
                    };
                }

                activeComponents.forEach(element => {
                    element.classList.remove('designerFocusedElement');
                    element.classList.remove('colorBorder');
                });
            }

            if (!this.htmlElement.classList.contains('colorBorder') && options.isLast) {
                if (this.componentObj.type === 'DropdownItem') {
                    let dropdown = this.component.closest('.fc.dropdown').parentElement;
                    dropdown.classList.add('colorBorder');
                    dropdown.classList.add('designerFocusedElement');
                } else {
                    this.htmlElement.classList.add('colorBorder');
                }

                this.animateScroll(options);
            }

            if (!this.htmlElement.classList.contains('designerFocusedElement') || !this.htmlElement.classList.contains('colorBorder')) {
                this.htmlElement.classList.add('designerFocusedElement');
                this.htmlElement.classList.add('colorBorder');
            }

            this.highlightDesignerElementTree();
        } else {
            if (this.focusableComponent != null && this.focusableComponent.focus) {
                this.focusableComponent.focus();
            } else {
                if (options.isLast) {
                    this.animateScroll(options);
                }
            }
        }
        deferred.resolve(options);
        return deferred.promise();
    }

    setRequiredField(isRequired) {
        if (isRequired) {
            if (this.requiredElement !== null) {
                return;
            }

            if (this.componentObj.type === 'RadioOption' || this.componentObj.type === 'RadioOptionsGroup' || this.componentObj.type === 'CheckBox') {
                let divRequired = document.createElement('div');
                divRequired.classList.add('requiredFieldWrapper');
                let spanRequired = document.createElement('span');
                spanRequired.classList.add('requiredField');

                let iconRequired = document.createElement('i');
                iconRequired.classList.add('fas');
                iconRequired.classList.add('fa-star-of-life');

                spanRequired.appendChild(iconRequired);
                divRequired.appendChild(spanRequired);

                this.requiredElement = divRequired;

                let label = this.htmlElement.firstChild;
                let controlLabelWithText = label.innerText.length;

                if (controlLabelWithText) {
                    label.appendChild(this.requiredElement);
                } else {
                    this.htmlElement.appendChild(this.requiredElement);
                }
            } else {
                let iconRequired = document.createElement('i');
                iconRequired.classList.add('fas');
                iconRequired.classList.add('fa-star-of-life');
                iconRequired.style.fontSize = '0.5em';

                let spanRequired = document.createElement('span');
                spanRequired.classList.add('input-group-text');
                spanRequired.classList.add('input-required');
                spanRequired.appendChild(iconRequired);

                let divRequired = document.createElement('div');
                divRequired.classList.add('input-group-append');
                divRequired.appendChild(spanRequired);

                this.requiredElement = divRequired;

                if (this.inputGroupElement != null) {
                    this.inputGroupElement.appendChild(this.requiredElement);
                } else if (this.component.classList.contains('field-required')) {
                    this.component.appendChild(this.requiredElement);
                } else {
                    this.htmlElement.appendChild(this.requiredElement);
                }
            }

        } else {
            if (this.requiredElement === null) {
                return;
            }

            if (this.component.classList.contains('field-required')) {
                if (this.component.contains(this.requiredElement)) {
                    this.component.removeChild(this.requiredElement);
                }
                if (this.inputGroupElement.contains(this.requiredElement)) {
                    this.inputGroupElement.removeChild(this.requiredElement);
                }
            } else if (this.htmlElement.requiredElement) {
                this.htmlElement.removeChild(this.requiredElement);
            }

            this.requiredElement = null;
        }
    }

    extractChangedAttributes() {
        if (this.changesQueue) {
            return this.changesQueue.extractChangedAttributes();
        }
    }


    __(string, node = undefined, args = undefined) {
        // in case when node is arg is ommited
        if ($.isArray(node)) {
            args = node;
            node = null;
        }

        if (!node) {
            node = document.createElement('span');
            node.classList.add('translation');
        }
        $(node).text(this.i18n.__(string, args, this.language));

        this.translationItems.push({
            element: node,
            string: string,
            args: args
        });

        return node;
    }

    changeLanguage(code) {
        for (let i = 0; i < this.translationItems.length; i++) {
            let item = this.translationItems[i];

            $(item.element).text(this.i18n.__(item.string, item.args, code));
        }
    }

    public getDefaultWidth():string {
        return 'md-12';
    }

    getAdditionalButtons(): AdditionalButton[] {
        return [];
    }

    animateScroll(options) {
        options.scrollableElement = options.scrollableElement || 'html, body';

        if (this.component.localName === 'th') {
            let parentTable = this.component.closest('table').id;
            $(options.scrollableElement).animate({
                scrollTop: $('#' + parentTable).offset().top - 160
            });
        } else if (this.type === 'IMapLite') {
            let row = this.component.closest('.row');
            $(options.scrollableElement).animate({
                scrollTop: $(row).offset().top - 160
            });
        } else if (this.componentObj.type === 'DropdownItem') {
            let dropdown = this.component.closest('.fc.dropdown');
            $(options.scrollableElement).animate({
                scrollTop: $(dropdown).offset().top - 160
            });
        } else {
            if ($('#' + this.id).length > 0) {
                $(options.scrollableElement).animate({
                    scrollTop: $('#' + this.id).offset().top - 160
                });
            }
        }
    }

    highlightDesignerElementTree() {

        // check if elementTree already contains highlighted elements
        // if yes, clear highlights -> we only want one at a time

        let designerElementTree = document.getElementById('designerElementTree');
        let highlightedElements = designerElementTree.querySelectorAll('.toolboxElementHighlight');

        if (highlightedElements.length) {
            highlightedElements.forEach(element => {
                element.classList.remove('toolboxElementHighlight')
            })
        }

        // verify event source and set elementTreeEquivalent accordingly

        let focusEventData = this.formsManager.firedEventData;
        let sourceElement = focusEventData.eventSourceId;
        let elementTreeEquivalent;

        if (focusEventData.containerId === 'formDesignerToolbox') {
            elementTreeEquivalent = document.getElementById(sourceElement);
        } else {
            elementTreeEquivalent = designerElementTree.querySelector('li[data-designer_element_equivalent=' + sourceElement + ']');
        }

        if (elementTreeEquivalent === null) {
            return;
        }

        if (elementTreeEquivalent) {
            let treeNode = elementTreeEquivalent.querySelector('.treeNodeBody');
            if (treeNode !== null) {
                treeNode.classList.add('toolboxElementHighlight');
                this.updateDesignerElementTree(focusEventData, elementTreeEquivalent);
            }
        }
    }

    updateDesignerElementTree(focusEventData, elementTreeEquivalent) {
        let subNodes = elementTreeEquivalent.querySelector('ul');
        let elementTreeCaret = elementTreeEquivalent.querySelector('.treeNodeBody').firstChild;

        if (subNodes.children.length) {
            if (focusEventData.containerId === 'designedFormContainer') {
                if (elementTreeCaret.classList.contains('fa-caret-down')) {
                    return;
                }
                elementTreeCaret.click();
            }
        } else {
            let ul = elementTreeEquivalent.parentElement;
            if (ul.classList.contains('d-none')) {

                // update caret icon:
                let icon = ul.previousElementSibling.querySelector('.fa-caret-right');
                icon.classList.remove('fa-caret-right');
                icon.classList.add('fa-caret-down');

                // show hidden list
                ul.classList.remove('d-none');
            }
        }
    }

    /**
     * Function that handle adding margin and paddings to component styles.
     * @return string
     */
    public handlemarginAndPAddingStyles(): void {

        if (this.componentObj.marginLeft) {
            this.htmlElement.style.marginLeft = this.componentObj.marginLeft;
        }
        if (this.componentObj.marginRight) {
            this.htmlElement.style.marginRight = this.componentObj.marginRight
        }
        if (this.componentObj.marginTop) {
            this.htmlElement.style.marginTop = this.componentObj.marginTop
        }
        if (this.componentObj.marginBottom) {
            this.htmlElement.style.marginBottom = this.componentObj.marginBottom
        }

        if (this.componentObj.paddingLeft) {
            this.htmlElement.style.paddingLeft = this.componentObj.paddingLeft;
        }
        if (this.componentObj.paddingRight) {
            this.htmlElement.style.paddingRight = this.componentObj.paddingRight;
        }
        if (this.componentObj.paddingTop) {
            this.htmlElement.style.paddingTop = this.componentObj.paddingTop
        }
        if (this.componentObj.paddingBottom) {
            this.htmlElement.style.paddingBottom = this.componentObj.paddingBottom
        }
    }

    /**
     * Function process width string from backend serwer and creates proper bootstrap classes string array so they can be added to component.
     * @param width
     */
    private handleWidth(width:string = this.componentObj.width){
        if(!width){
          width = this.getDefaultWidth()
        }

        if(width) {
            // Delete unwanted spaces
            width = width.trim();
            //Replace un wanted chars
            width = width.replace(HTMLFormComponent.bootstrapColSeparateCahrsRegexp, " ");
            //Replace multi spaces with one
            width = width.replace(/\s\s+/g, ' ');

            this.width = width.split(" ");
        }
    }

    /**
     * Logic moved to function so it can be overrided by children classes.
     */
    protected buildDesingerToolbox(){
        (<any>FhContainer.get('Designer')).buildToolbox(this.getAdditionalButtons(), this);
    }

}

export {HTMLFormComponent};
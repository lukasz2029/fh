package pl.fhframework.model.forms;

import com.fasterxml.jackson.annotation.JsonIgnore;

import pl.fhframework.BindingResult;
import pl.fhframework.annotations.*;
import pl.fhframework.binding.*;
import pl.fhframework.model.dto.ElementChanges;
import pl.fhframework.model.dto.ValueChange;
import pl.fhframework.model.forms.designer.IDesignerEventListener;
import pl.fhframework.model.dto.InMessageEventData;

import lombok.Getter;
import lombok.Setter;

import java.util.Objects;
import java.util.Optional;

/**
 * Class represents container for tabs and extends <code>GroupingComponent</code> class. It does not
 * contains attributes in xml. Additionally it contains information about currently active tab
 * index. This field can be used inside Group, Column, Tab, Form.
 * <p>
 * Example: <TabContainer></TabContainer>
 */
@Control(parents = {PanelGroup.class, Column.class, Tab.class, Row.class, Form.class, Repeater.class, Group.class}, invalidParents = {Table.class}, canBeDesigned = true)
@DocumentedComponent(value = "TabContainer component which represents a containrt containing a single tabs", icon = "fa fa-window-maximize")
public class TabContainer extends GroupingComponent<Tab> implements IChangeableByClient, Boundable, CompactLayout, IDesignerEventListener {

    public static final String TYPE_NAME = "TabContainer";
    public static final String ATTR_ACTIVE_TAB_INDEX = "activeTabIndex";
    public static final String ATTR_ACTIVE_TAB_ID = "activeTabId";
    public static final String ON_TAB_CHANGE = "onTabChange";

    @Getter
    private int activeTabIndex = -1;

    @Getter
    @XMLProperty
    @DesignerXMLProperty(functionalArea = DesignerXMLProperty.PropertyFunctionalArea.BEHAVIOR)
    @DocumentedComponentAttribute(value = "If there is some value, representing method in use case, then on clicking on tab, " +
            "that method will be executed. This method fires, when component loses focus. Warning!!if possible for component, use onInput!!")
    private ActionBinding onTabChange;

    @Getter
    @Setter
    @JsonIgnore
    @XMLProperty(value = ATTR_ACTIVE_TAB_INDEX)
    @DesignerXMLProperty(allowedTypes = Integer.class)
    @DocumentedComponentAttribute(defaultValue = "0", boundable = true, value = "Represents the index of the active tab")
    private ModelBinding modelBinding;

    @Getter
    @Setter
    @JsonIgnore
    @XMLProperty(value = ATTR_ACTIVE_TAB_ID)
    @DesignerXMLProperty(allowedTypes = String.class)
    @DocumentedComponentAttribute(boundable = true, value = "Represents the identification of the active tab")
    private ModelBinding tabIdBinding;

    public TabContainer(Form form) {
        super(form);
    }

    @Override
    public void init() {
        super.init();

        if (tabIdBinding != null) {
            BindingResult bindingResult = tabIdBinding.getBindingResult();
            if (bindingResult != null) {
                Object activeTabIdValue = bindingResult.getValue();
                String convertedActiveTabValue = this.convertValue(activeTabIdValue, String.class);
                if (convertedActiveTabValue != null) {
                    activeTabIndex = calcTabIndexById(convertedActiveTabValue);
                }
            } else {
                String convertedActiveTabValue = this.convertValue(tabIdBinding.getBindingExpression(), String.class);
                if (convertedActiveTabValue != null) {
                    activeTabIndex = calcTabIndexById(convertedActiveTabValue);
                }
            }
        }
        else if (modelBinding != null) {
            BindingResult bindingResult = modelBinding.getBindingResult();
            if (bindingResult != null) {
                Object activeTabIndexValue = bindingResult.getValue();
                Integer convertedActiveTabValue = this.convertValue(activeTabIndexValue, Integer.class);
                if (convertedActiveTabValue != null) {
                    activeTabIndex = convertedActiveTabValue.intValue();
                }
            } else {
                Integer convertedActiveTabValue = this.convertValue(modelBinding.getBindingExpression(), Integer.class);
                if (convertedActiveTabValue != null) {
                    activeTabIndex = convertedActiveTabValue.intValue();
                }
            }
        }
        if (activeTabIndex == -1) {
            activeTabIndex = 0;
            if (!getForm().isDesignMode()) {
                updateActiveTab();
            }
        }
    }

    private int calcTabIndexById(String convertedActiveTabValue) {
        for (int i = 0; i < getSubcomponents().size(); i++) {
            if (Objects.equals(getSubcomponents().get(i).getId(), convertedActiveTabValue)) {
                return i;
            }
        }
        return -1;
    }

    private void updateActiveTab() {
        if (modelBinding != null) {
            this.updateBindingForValue(activeTabIndex, modelBinding, activeTabIndex);
        }
        if (tabIdBinding != null) {
            String tabIdValue = getSubcomponents().get(activeTabIndex).getId();
            this.updateBindingForValue(tabIdValue, tabIdBinding, tabIdBinding.getBindingExpression());
        }
    }

    @Override
    public String getType() {
        return TYPE_NAME;
    }

    @Override
    public Optional<ActionBinding> getEventHandler(InMessageEventData eventData) {
        if (ON_TAB_CHANGE.equals(eventData.getEventType())) {
            return Optional.ofNullable(onTabChange);
        } else {
            return super.getEventHandler(eventData);
        }
    }

    @Override
    public void updateModel(ValueChange valueChange) {
        String newValue = valueChange.getMainValue();
        int newActiveTabIndex = Integer.parseInt(newValue);
        if (newActiveTabIndex != activeTabIndex) {
            this.activeTabIndex = newActiveTabIndex;
        }
        updateActiveTab();
    }

    @Override
    protected ElementChanges updateView() {
        ElementChanges elementChanges = super.updateView();

        int newActiveTabIndex = activeTabIndex;

        if (tabIdBinding != null) {
            BindingResult bindingResult = tabIdBinding.getBindingResult();
            if (bindingResult != null) {
                Object value = bindingResult.getValue();
                if (value != null) {
                    newActiveTabIndex = calcTabIndexById(this.convertValue(value, String.class));
                }
            }
        }
        else {
            BindingResult bindingResult = modelBinding != null ? modelBinding.getBindingResult() : null;
            if (bindingResult != null) {
                Object value = bindingResult.getValue();
                if (value != null) {
                    newActiveTabIndex = this.convertValue(value, Integer.class);
                }
            }
        }
        if (newActiveTabIndex != activeTabIndex) {
            refreshView();
            if (newActiveTabIndex == -1) {
                newActiveTabIndex = 0;
                updateActiveTab();
            }
            this.activeTabIndex = newActiveTabIndex;
            elementChanges.addChange(ATTR_ACTIVE_TAB_INDEX, this.activeTabIndex);
        }

        return elementChanges;
    }

    @Override
    public void onDesignerAddDefaultSubcomponent(SpacerService spacerService) {
        addSubcomponent(createExampleTab(getSubcomponents().size() + 1, spacerService));
    }

    @Override
    public void onDesignerBeforeAdding(IGroupingComponent<?> parent, SpacerService spacerService) {
        addSubcomponent(createExampleTab(1, spacerService));
        addSubcomponent(createExampleTab(2, spacerService));
    }

    private Tab createExampleTab(int nameSuffix, SpacerService spacerService) {
        Tab tab = new Tab(getForm());
        tab.setLabelModelBinding(new StaticBinding<>("Tab " + nameSuffix));
        tab.setGroupingParentComponent(this);
        tab.init();
        return tab;
    }

    public void setOnTabChange(ActionBinding onTabChange) {
        this.onTabChange = onTabChange;
    }

    public IActionCallbackContext setOnTabChange(IActionCallback onTabChange) {
        return CallbackActionBinding.createAndSet(onTabChange, this::setOnTabChange);
    }

    @Override
    public boolean isModificationEvent(String eventType) {
        if (ON_TAB_CHANGE.equals(eventType)) {
            return false;
        }
        return super.isModificationEvent(eventType);
    }
}
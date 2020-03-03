"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var inversify_1 = require("inversify");
var inversify_inject_decorators_1 = require("inversify-inject-decorators");
var FormsManager_1 = require("../Socket/FormsManager");
var FhContainer_1 = require("../FhContainer");
var BaseEvent_1 = require("./BaseEvent");
var lazyInject = inversify_inject_decorators_1.default(FhContainer_1.FhContainer).lazyInject;
var ChatEvent = /** @class */ (function (_super) {
    __extends(ChatEvent, _super);
    function ChatEvent() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ChatEvent.prototype.fire = function (data) {
        this.fireUpdate("ChatForm");
        this.fireUpdate("ChatSystemForm");
    };
    ChatEvent.prototype.fireUpdate = function (formId) {
        var form = this.formsManager.findForm(formId);
        if (form != null && form.state == 'ACTIVE') {
            var component = form.findComponent('refreshBtn', false, false, true);
            if (component != null) {
                component.fireEvent('onClick', 'onChatRefresh');
            }
        }
    };
    __decorate([
        lazyInject('FormsManager'),
        __metadata("design:type", FormsManager_1.FormsManager)
    ], ChatEvent.prototype, "formsManager", void 0);
    ChatEvent = __decorate([
        inversify_1.injectable()
    ], ChatEvent);
    return ChatEvent;
}(BaseEvent_1.BaseEvent));
exports.ChatEvent = ChatEvent;
//# sourceMappingURL=ChatEvent.js.map
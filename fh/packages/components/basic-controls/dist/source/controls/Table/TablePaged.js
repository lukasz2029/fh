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
Object.defineProperty(exports, "__esModule", { value: true });
var TablePaged_pl_1 = require("./i18n/TablePaged.pl");
var TablePaged_en_1 = require("./i18n/TablePaged.en");
var Table_1 = require("./Table");
var TablePaged = /** @class */ (function (_super) {
    __extends(TablePaged, _super);
    function TablePaged(componentObj, parent) {
        var _this = _super.call(this, componentObj, parent) || this;
        _this.toInt = function (stringOrInt) {
            if (typeof stringOrInt == 'string') {
                return parseInt(stringOrInt);
            }
            else {
                return stringOrInt;
            }
        };
        _this.keyEventLoopDownTurnOff();
        _this.i18n.registerStrings('en', TablePaged_en_1.TablePagedEN);
        _this.i18n.registerStrings('pl', TablePaged_pl_1.TablePagedPL);
        _this.paginator = null;
        _this.pageInfo = null;
        _this.totalPages = _this.componentObj.totalPages;
        _this.totalRows = _this.componentObj.totalRows;
        _this.currentPage = _this.componentObj.pageable.pageNumber || 0;
        _this.paginatorOffset = 2;
        _this.onPageChange = _this.componentObj.onPageChange;
        _this.pageChangeListeners = [];
        _this.sortedBy = null;
        _this.sortDirection = null;
        _this.pageSize = _this.componentObj.pageable.pageSize || 10;
        _this.pageSizeSelect = null;
        return _this;
    }
    TablePaged.prototype.create = function () {
        _super.prototype.create.call(this);
        var toolsRow = document.createElement('div');
        toolsRow.classList.add('row');
        toolsRow.classList.add('toolsRow');
        var box = document.createElement('div');
        box.classList.add('rowsCountSelector');
        box.classList.add('form-inline');
        box.classList.add('col-md-6');
        this.pageSizeSelect = document.createElement('select');
        this.pageSizeSelect.classList.add('form-control');
        [5, 10, 15, 25].forEach(function (number) {
            var option = document.createElement('option');
            option.value = number;
            option.appendChild(document.createTextNode(number));
            this.pageSizeSelect.appendChild(option);
        }.bind(this));
        this.pageSizeSelect.value = this.pageSize;
        this.pageSizeSelect.addEventListener('change', this.pageSizeSelectEvent.bind(this));
        this.pageSizeSelect.disabled = (this.accessibility != 'EDIT');
        var pageInfo = this.buildPageInfo();
        box.appendChild(this.pageSizeSelect);
        var cecordsText = this.__('rows per page');
        cecordsText.classList.add('pl-3');
        box.appendChild(cecordsText);
        toolsRow.appendChild(box);
        var pagination = document.createElement('div');
        pagination.classList.add('table-pagination');
        pagination.classList.add('col-md-6');
        pagination.classList.add('text-right');
        var paginator = this.buildPaginator();
        pagination.appendChild(pageInfo);
        pagination.appendChild(paginator);
        toolsRow.appendChild(pagination);
        this.htmlElement.appendChild(toolsRow);
        this.paginator = paginator;
        this.pageInfo = pageInfo;
    };
    ;
    TablePaged.prototype.pageSizeSelectEvent = function (event) {
        this.pageSize = event.target.value;
        this.changesQueue.queueAttributeChange('pageSize', this.toInt(this.pageSize));
        this.fireEventWithLock('onPageSizeChange', null);
    };
    TablePaged.prototype.update = function (change) {
        _super.prototype.update.call(this, change);
        if (change.changedAttributes) {
            $.each(change.changedAttributes, function (name, newValue) {
                switch (name) {
                    case 'pageNumber':
                        this.currentPage = newValue;
                        var paginator = this.buildPaginator();
                        this.htmlElement.querySelector('.table-pagination').replaceChild(paginator, this.paginator);
                        this.paginator = paginator;
                        var pageInfo = this.buildPageInfo();
                        this.htmlElement.querySelector('.table-pagination').replaceChild(pageInfo, this.pageInfo);
                        this.pageInfo = pageInfo;
                        this.scrollTopInside();
                        $(window).trigger('pageChanged.table');
                        break;
                    case 'totalPages':
                        this.totalPages = newValue;
                        var paginator2 = this.buildPaginator();
                        this.htmlElement.querySelector('.table-pagination').replaceChild(paginator2, this.paginator);
                        this.paginator = paginator2;
                        this.scrollTopInside();
                        break;
                    case 'totalRows':
                        this.totalRows = newValue;
                        var pageInfo2 = this.buildPageInfo();
                        this.htmlElement.querySelector('.table-pagination').replaceChild(pageInfo2, this.pageInfo);
                        this.pageInfo = pageInfo2;
                        this.scrollTopInside();
                        break;
                }
            }.bind(this));
        }
    };
    ;
    TablePaged.prototype.onPaginatorClick = function (event) {
        event.preventDefault();
        event.stopPropagation();
        if (this.accessibility != 'EDIT')
            return;
        this.currentPage = event.target.parentNode.dataset.pageNumber;
        this.changesQueue.queueAttributeChange('currentPage', this.toInt(this.currentPage));
        this.fireEventWithLock('onPageChange', this.onPageChange);
    };
    TablePaged.prototype.cleanUpSortableComponents = function () {
        this.components.forEach(function (component) {
            if (component.isSortable && component.id != this.sortedBy) {
                var icon = component.sorter.firstChild;
                icon.classList.remove('fa-sort-amount-down');
                icon.classList.remove('fa-sort-amount-up');
                icon.classList.add('fa-sort');
                if (component.subColumnsExists && component.subColumnsExists == true) {
                }
            }
            else if (component.isSortable == false && component.subColumnsExists
                && component.subColumnsExists == true) {
                var sortedBy_1 = this.sortedBy;
                $('.parent-' + component.id).each(function () {
                    var element = $(this);
                    if (element.attr('sorter') != sortedBy_1) {
                        var icon = element.children();
                        icon.removeClass('fa-sort-amount-down');
                        icon.removeClass('sort-amount-down');
                        icon.addClass('fa-sort');
                    }
                });
            }
        }.bind(this));
    };
    ;
    TablePaged.prototype.buildPageInfo = function () {
        this.pageSize = this.toInt(this.pageSize);
        var recordsFrom = (this.pageSize * this.currentPage);
        if (this.totalRows > 0) {
            recordsFrom += 1;
        }
        var recordsTo = (this.pageSize * this.currentPage) + this.pageSize;
        if (this.totalRows < recordsTo) {
            recordsTo = this.totalRows;
        }
        var pageInfo = document.createElement('span');
        pageInfo.classList.add('table-page-info');
        var recordsLabel = this.__('records');
        var counterLeft = document.createElement('span');
        counterLeft.innerText = recordsFrom + ' - ' + recordsTo;
        var recordsFromLabel = this.__('records_from');
        var counterRight = document.createElement('span');
        counterRight.innerText = this.totalRows.toString();
        pageInfo.appendChild(recordsLabel);
        pageInfo.appendChild(counterLeft);
        pageInfo.appendChild(recordsFromLabel);
        pageInfo.appendChild(counterRight);
        return pageInfo;
    };
    TablePaged.prototype.buildPaginator = function () {
        this.pageChangeListeners.forEach(function (listener) {
            listener.removeEventListener('click', this.onPaginatorClick.bind(this));
        }.bind(this));
        this.pageChangeListeners = [];
        var paginator = document.createElement('nav');
        var list = document.createElement('ul');
        list.classList.add('pagination');
        var first = document.createElement('li');
        first.classList.add('page-item');
        var firstLink = document.createElement('a');
        firstLink.href = '#';
        firstLink.classList.add('page-link');
        firstLink.title = this.i18n.__('first page');
        firstLink.innerHTML = '&lt;&lt;';
        if (this.currentPage == 0) {
            first.classList.add('disabled');
        }
        else if (this.onPageChange) {
            first.dataset.pageNumber = '0';
            firstLink.addEventListener('click', this.onPaginatorClick.bind(this));
            this.pageChangeListeners.push(firstLink);
        }
        first.appendChild(firstLink);
        list.appendChild(first);
        var previous = document.createElement('li');
        previous.classList.add('page-item');
        var previousLink = document.createElement('a');
        previousLink.href = '#';
        previousLink.classList.add('page-link');
        previousLink.title = this.i18n.__('previous page');
        previousLink.innerHTML = '&lt;';
        if (this.currentPage == 0) {
            previous.classList.add('disabled');
        }
        else if (this.onPageChange) {
            previous.dataset.pageNumber = (this.currentPage - 1).toString();
            previousLink.addEventListener('click', this.onPaginatorClick.bind(this));
            this.pageChangeListeners.push(previousLink);
        }
        previous.appendChild(previousLink);
        list.appendChild(previous);
        for (var start = Math.max(0, this.currentPage - this.paginatorOffset), end = Math.min(this.totalPages, this.currentPage + this.paginatorOffset + 1); start < end; start++) {
            var item = document.createElement('li');
            item.classList.add('page-item');
            item.dataset.pageNumber = start.toString();
            var itemLink = document.createElement('a');
            itemLink.title = this.i18n.__('X page') + (start + 1);
            itemLink.classList.add('page-link');
            itemLink.href = '#';
            itemLink.innerHTML = (start + 1).toString();
            if (start == this.currentPage) {
                item.classList.add('active');
            }
            if (this.onPageChange) {
                itemLink.addEventListener('click', this.onPaginatorClick.bind(this));
                this.pageChangeListeners.push(itemLink);
            }
            item.appendChild(itemLink);
            list.appendChild(item);
        }
        var next = document.createElement('li');
        next.classList.add('page-item');
        var nextLink = document.createElement('a');
        nextLink.classList.add('page-link');
        nextLink.href = '#';
        nextLink.title = this.i18n.__('next page');
        nextLink.innerHTML = '&gt;';
        if (this.currentPage >= this.totalPages - 1) {
            next.classList.add('disabled');
        }
        else if (this.onPageChange) {
            next.dataset.pageNumber = this.currentPage + 1;
            nextLink.addEventListener('click', this.onPaginatorClick.bind(this));
            this.pageChangeListeners.push(nextLink);
        }
        next.appendChild(nextLink);
        list.appendChild(next);
        var last = document.createElement('li');
        last.classList.add('page-item');
        var lastLink = document.createElement('a');
        lastLink.classList.add('page-link');
        lastLink.href = '#';
        lastLink.title = this.i18n.__('last page');
        lastLink.innerHTML = '&gt;&gt;';
        if (this.currentPage >= this.totalPages - 1) {
            last.classList.add('disabled');
        }
        else if (this.onPageChange) {
            last.dataset.pageNumber = (this.totalPages - 1).toString();
            lastLink.addEventListener('click', this.onPaginatorClick.bind(this));
            this.pageChangeListeners.push(lastLink);
        }
        last.appendChild(lastLink);
        list.appendChild(last);
        paginator.appendChild(list);
        return paginator;
    };
    ;
    TablePaged.prototype.changeSort = function (newSortedBy, newSortDirection) {
        this.sortedBy = newSortedBy;
        this.changesQueue.queueAttributeChange('sortBy', newSortedBy);
        if (newSortDirection !== undefined) { // undefined -> not changed
            this.sortDirection = newSortDirection;
        }
        // always send sortDirection with sortedBy change
        this.changesQueue.queueAttributeChange('direction', this.sortDirection);
        this.cleanUpSortableComponents();
        this.fireEventWithLock('onSortChange', null);
    };
    ;
    TablePaged.prototype.extractChangedAttributes = function () {
        return this.changesQueue.extractChangedAttributes();
    };
    ;
    TablePaged.prototype.setAccessibility = function (accessibility) {
        _super.prototype.setAccessibility.call(this, accessibility);
        if (this.pageSizeSelect) {
            this.pageSizeSelect.disabled = (this.accessibility != 'EDIT');
        }
        this.accessibility = accessibility;
    };
    ;
    TablePaged.prototype.destroy = function (removeFromParent) {
        this.pageSizeSelect.removeEventListener('change', this.pageSizeSelectEvent.bind(this));
        (this.pageChangeListeners || []).forEach(function (listener) {
            listener.removeEventListener('click', this.onPaginatorClick.bind(this));
        }.bind(this));
        _super.prototype.destroy.call(this, removeFromParent);
    };
    return TablePaged;
}(Table_1.Table));
exports.TablePaged = TablePaged;
//# sourceMappingURL=TablePaged.js.map
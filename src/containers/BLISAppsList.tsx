import * as React from 'react';
import { returntypeof } from 'react-redux-typescript';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import BLISAppCreator from './BLISAppCreator'
import { DetailsList, Link, CheckboxVisibility, IColumn } from 'office-ui-fabric-react';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import { State } from '../types';
import { BlisAppBase } from 'blis-models'

interface ISortableRenderableColumn extends IColumn {
    render: (app: BlisAppBase, component: BLISAppsList) => JSX.Element
    getSortValue: (app: BlisAppBase, component: BLISAppsList) => number | string
}

let columns: ISortableRenderableColumn[] = [
    {
        key: 'appName',
        name: 'App Name',
        fieldName: 'appName',
        minWidth: 100,
        maxWidth: 200,
        isResizable: true,
        getSortValue: app => app.appName,
        render: (app, component) => <span className='ms-font-m-plus'><Link onClick={() => component.onClickApp(app)}>{app.appName}</Link></span>
    },
    {
        key: 'luisKey',
        name: 'LUIS Key',
        fieldName: 'luisKey',
        minWidth: 100,
        maxWidth: 300,
        isResizable: true,
        getSortValue: app => app.luisKey,
        render: app => <span className='ms-font-m-plus'>{app.luisKey}</span>
    },
    {
        key: 'locale',
        name: 'Locale',
        fieldName: 'locale',
        minWidth: 100,
        maxWidth: 100,
        isResizable: false,
        getSortValue: app => app.locale,
        render: app => <span className='ms-font-m-plus'>{app.locale}</span>
    },
    {
        key: 'bots',
        name: 'Linked Bots',
        fieldName: 'metadata',
        minWidth: 100,
        maxWidth: 100,
        isResizable: false,
        getSortValue: app => app.metadata.botFrameworkApps.length,
        render: app => <span className='ms-font-m-plus'>{app.metadata.botFrameworkApps.length}</span>
    },
    {
        key: 'actions',
        name: 'Actions',
        fieldName: 'appId',
        minWidth: 100,
        maxWidth: 100,
        isResizable: false,
        getSortValue: app => 0,
        render: (app, component) => <a onClick={() => component.onClickDeleteApp(app)}><span className="ms-Icon ms-Icon--Delete"></span>&nbsp;&nbsp;</a>
    },
];

interface ComponentState {
    isConfirmDeleteAppModalOpen: boolean,
    appToDelete: BlisAppBase
    columns: ISortableRenderableColumn[]
    sortColumn: ISortableRenderableColumn
}

const ifStringReturnLowerCase = (s: string | number) => {
    return (typeof s === "string") ? s.toLowerCase() : s
}

class BLISAppsList extends React.Component<Props, ComponentState> {
    state: ComponentState = {
        isConfirmDeleteAppModalOpen: false,
        appToDelete: null,
        columns: columns,
        sortColumn: null
    }

    onConfirmDeleteModal() {
        this.props.onClickDeleteApp(this.state.appToDelete)
        this.setState({
            isConfirmDeleteAppModalOpen: false,
            appToDelete: null,
        })

    }
    onCancelDeleteModal() {
        this.setState({
            isConfirmDeleteAppModalOpen: false,
            appToDelete: null
        })
    }
    onClickDeleteApp(app: BlisAppBase) {
        this.setState({
            isConfirmDeleteAppModalOpen: true,
            appToDelete: app
        })
    }
    onClickApp(selectedApp: BlisAppBase) {
        this.props.onSelectedAppChanged(selectedApp)
    }
    
    onColumnClick(event: any, column: ISortableRenderableColumn) {
        let { columns } = this.state;
        let isSortedDescending = column.isSortedDescending;

        // If we've sorted this column, flip it.
        if (column.isSorted) {
            isSortedDescending = !isSortedDescending;
        }

        // Reset the items and columns to match the state.
        this.setState({
            columns: columns.map(col => {
                col.isSorted = (col.key === column.key);

                if (col.isSorted) {
                    col.isSortedDescending = isSortedDescending;
                }

                return col;
            }),
            sortColumn: column
        });
    }

    getSortedApplications(): BlisAppBase[] {
        let sortedApps = this.props.blisApps.all || [];

        if (this.state.sortColumn) {
            // Sort the items.
            sortedApps = sortedApps.concat([]).sort((a, b) => {
                let firstValue = ifStringReturnLowerCase(this.state.sortColumn.getSortValue(a, this))
                let secondValue = ifStringReturnLowerCase(this.state.sortColumn.getSortValue(b, this))

                if (this.state.sortColumn.isSortedDescending) {
                    return firstValue > secondValue ? -1 : 1;
                }
                else {
                    return firstValue > secondValue ? 1 : -1;
                }
            });
        }

        return sortedApps;
    }

    render() {
        let apps = this.getSortedApplications();
        return (
            <div className='content'>
                <span className="ms-font-su myAppsHeaderContentBlock">My Apps</span>
                <span className="ms-font-m-plus myAppsHeaderContentBlock">Create and Manage your BLIS applications...</span>
                <DetailsList
                    className="ms-font-m-plus"
                    items={apps}
                    columns={this.state.columns}
                    checkboxVisibility={CheckboxVisibility.hidden}
                    onRenderItemColumn={(app, i, column: ISortableRenderableColumn) => column.render(app, this)}
                    onColumnHeaderClick={this.onColumnClick.bind(this)}
                />
                <BLISAppCreator />
                <ConfirmDeleteModal
                    open={this.state.isConfirmDeleteAppModalOpen}
                    onCancel={() => this.onCancelDeleteModal()}
                    onConfirm={() => this.onConfirmDeleteModal()}
                    title={`Are you sure you want to delete this application?`}
                />
            </div>
        );
    }
}
const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
    }, dispatch);
}
const mapStateToProps = (state: State) => {
    return {
        user: state.user,
        blisApps: state.apps
    }
}

export interface ReceivedProps {
    onSelectedAppChanged: (app: BlisAppBase) => void
    onClickDeleteApp: (app: BlisAppBase) => void
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps;

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(BLISAppsList);
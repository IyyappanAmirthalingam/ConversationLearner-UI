import * as React from 'react';
import { returntypeof } from 'react-redux-typescript';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { State } from '../types';
import { setTipType } from '../actions/displayActions'
import { TipType } from '../components/ToolTips';
import { Icon } from 'office-ui-fabric-react/lib/Icon';

class HelpIcon extends React.Component<Props, {}> {
    render() {
        return (
            <a onClick={() => { this.props.setTipType(this.props.tipType) }}>
                <Icon iconName="Info" className="blis-icon" />
            </a>
        )
    }
}
const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        setTipType
    }, dispatch);
}
const mapStateToProps = (state: State, ownProps: any) => {
    return {
    }
}

export interface ReceivedProps {
    tipType: TipType
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps;

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(HelpIcon);
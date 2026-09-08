import get from 'lodash/get';
import { connect } from 'react-redux';

import { SenderStatus } from 'app/lib/definitions/sender_feeder';
import ProgressArea from './ProgressArea';

interface ProgressOverlayProps {
    isConnected: boolean;
    fileLoaded: boolean;
    senderStatus: SenderStatus;
    workflowState: string;
}

const ProgressOverlay: React.FC<ProgressOverlayProps> = ({
    isConnected,
    fileLoaded,
    senderStatus,
    workflowState,
}) => {
    if (!isConnected || !fileLoaded || !senderStatus?.sent) {
        return null;
    }

    return (
        <div className="z-10 absolute bottom-2 right-2 max-xl:bottom-1 max-xl:right-1 pointer-events-none">
            <div className="pointer-events-auto">
                <ProgressArea
                    senderStatus={senderStatus}
                    workflowState={workflowState}
                />
            </div>
        </div>
    );
};

export default connect((store) => {
    const isConnected = get(store, 'connection.isConnected');
    const fileLoaded = get(store, 'file.fileLoaded', false);
    const senderStatus = get(store, 'controller.sender.status');
    const workflowState = get(store, 'controller.workflow.state');

    return {
        isConnected,
        fileLoaded,
        senderStatus,
        workflowState,
    };
})(ProgressOverlay);

import { useLocation } from 'react-router';
import cx from 'classnames';
import { useMediaQuery } from 'react-responsive';

import Visualizer from 'app/features/Visualizer';
import FileControl from 'app/features/FileControl';
import JobControl from 'app/features/JobControl';
import ProgressOverlay from 'app/features/JobControl/ProgressOverlay';
import { SDCardProgress } from 'app/features/JobControl/SDCardProgress';
import Tools from 'app/features/Tools';

import { Column } from '../Column';
import { ToolArea } from '../ToolArea';
import { ToolTimelineWrapper } from 'app/features/ATC/components/ToolTimeline';
import { PortraitMacroBar } from '../PortraitMacroBar';

const MIDDLE_THIRD_TABS = ['Macros', 'Coolant', 'Rotary'];
const RIGHT_THIRD_TABS = ['Spindle/Laser', 'ATC', 'Console', 'Probe'];

export const Carve = () => {
    const { pathname } = useLocation();
    const isPortrait = useMediaQuery({ query: '(orientation: portrait)' });

    const shouldHide = pathname !== '/';

    if (isPortrait) {
        return (
            <div className={cx({ hidden: shouldHide }, 'relative h-full')}>
                <div className="flex h-[45%] max-h-[45%] pb-0 block portrait:h-[45%] portrait:max-h-[45%] portrait:pb-0 portrait:block">
                    <div className="relative h-full w-full">
                        <Visualizer timeline={<ToolTimelineWrapper />} />
                        <ProgressOverlay />
                        <SDCardProgress />
                    </div>
                </div>

                <div className="flex flex-col h-[55%] min-h-0 max-h-[55%]">
                    <div className="flex flex-1 min-h-0">
                        <div className="w-2/3">
                            <ToolArea />
                        </div>

                        <div className="w-1/3 min-w-[400px]">
                            <Column />
                        </div>
                    </div>
                    <PortraitMacroBar />
                </div>
            </div>
        );
    }

    return (
        <div className={cx({ hidden: shouldHide }, 'relative h-full')}>
            <div className="flex h-full pb-10 max-xl:pb-6">
                {/* Left third: file loading, program status controls, then the preview viewer */}
                <div className="flex flex-col w-[36.67%] min-w-0 h-full">
                    <div className="flex-shrink-0 flex flex-col">
                        <div className="p-1 max-xl:p-0.5 box-border">
                            <FileControl />
                        </div>
                        <div className="relative p-1 max-xl:p-0.5 box-border">
                            <JobControl />
                        </div>
                    </div>
                    <div className="relative flex-1 min-h-0">
                        <Visualizer timeline={<ToolTimelineWrapper />} />
                        <ProgressOverlay />
                        <SDCardProgress />
                    </div>
                </div>

                {/* Middle third: xyz positions, jog controller, probe, macros */}
                <div className="flex flex-col w-[36.67%] min-w-0 h-full">
                    <div className="flex-shrink-0 overflow-hidden">
                        <Column />
                    </div>
                    <div className="flex-1 min-h-0 mt-10 max-xl:mt-9 p-1 max-xl:p-0.5 box-border">
                        <Tools tabNames={MIDDLE_THIRD_TABS} />
                    </div>
                </div>

                {/* Right third: remaining tool tabs, shrunk to 80% of the equal-thirds width */}
                <div className="flex flex-col w-[26.67%] min-w-0 h-full">
                    <div className="flex-1 min-h-0 mt-10 max-xl:mt-9 p-1 max-xl:p-0.5 box-border">
                        <Tools tabNames={RIGHT_THIRD_TABS} />
                    </div>
                </div>
            </div>
        </div>
    );
};

import RangeSlider from 'app/components/RangeSlider';
import Button from 'app/components/Button';
import Tooltip from 'app/components/Tooltip';
import { FaMinus, FaPlus } from 'react-icons/fa';
import { OVERRIDE_VALUE_RANGES, SPINDLE_MODE } from '../../constants';
import controller from 'app/lib/controller';
import debounce from 'lodash/debounce';
import { useEffect, useState } from 'react';
import store from 'app/store';
import posthog from 'posthog-js';

interface OverridesProps {
    ovF: number;
    ovS: number;
    ovTimestamp: number;
    feedrate: string;
    spindle: string;
    isConnected: boolean;
}

const debouncedSpindleHandler = debounce((value) => {
    controller.command('spindleOverride', Number(value));
}, 1000);
const debouncedFeedHandler = debounce((value) => {
    controller.command('feedOverride', Number(value));
}, 750);

let globalOvTimestamp = 0;
let globalLocalOvFTimestamp = 0;
let globalLocalOvSTimestamp = 0;

const debouncedOvFUpdateHandler = debounce((ovF, setLocalOvF) => {
    if (globalOvTimestamp > globalLocalOvFTimestamp) {
        setLocalOvF(ovF);
    }
    posthog?.capture('feed_override_updated', { value: ovF });
}, 1000);

const debouncedOvSUpdateHandler = debounce((ovS, setLocalOvS) => {
    if (globalOvTimestamp > globalLocalOvSTimestamp) {
        setLocalOvS(ovS);
    }
    posthog?.capture('spindle_override_updated', { value: ovS });
}, 1000);

const Overrides: React.FC<OverridesProps> = ({
    ovF,
    ovS,
    ovTimestamp,
    spindle,
    isConnected,
}) => {
    globalOvTimestamp = ovTimestamp;

    const [showSpindleOverride, setShowSpindleOverride] = useState(
        store.get('workspace.spindleFunctions'),
    );
    const [spindleOverrideLabel, setSpindleOverrideLabel] = useState(
        store.get('widgets.spindle.mode') === SPINDLE_MODE
            ? 'Spindle'
            : 'Laser',
    );
    const [localOvF, setLocalOvF] = useState(ovF);
    const [localOvS, setLocalOvS] = useState(ovS);

    const handleStoreChange = () => {
        setShowSpindleOverride(store.get('workspace.spindleFunctions'));
        setSpindleOverrideLabel(
            store.get('widgets.spindle.mode', SPINDLE_MODE) === SPINDLE_MODE
                ? 'Spindle'
                : 'Laser',
        );
    };

    useEffect(() => {
        store.on('change', handleStoreChange);

        return () => {
            store.removeListener('change', handleStoreChange);
        };
    }, []);

    useEffect(() => {
        debouncedOvFUpdateHandler(ovF, setLocalOvF);
    }, [ovF]);

    useEffect(() => {
        debouncedOvSUpdateHandler(ovS, setLocalOvS);
    }, [ovS]);

    const setFeedOverride = (newValue: number) => {
        setLocalOvF(newValue);
        globalLocalOvFTimestamp = Date.now();
        debouncedFeedHandler(newValue);
    };

    return (
        <div className="flex flex-col gap-2 max-xl:gap-1 w-full items-end">
            <div className="flex flex-row items-center gap-1.5 max-xl:gap-1">
                <span className="text-sm max-xl:text-xs font-medium text-gray-700 dark:text-gray-300">
                    Feed
                </span>
                <Tooltip content="Decrease Feed override by 10%">
                    <Button
                        type="button"
                        onClick={() => {
                            if (localOvF - 10 < OVERRIDE_VALUE_RANGES.MIN) {
                                return;
                            }
                            setFeedOverride(localOvF - 10);
                        }}
                        disabled={!isConnected}
                        size="sm"
                        icon={<FaMinus />}
                        aria-label="Decrease Feed override"
                    />
                </Tooltip>
                <span className="min-w-11 text-center text-blue-500 dark:text-blue-400 font-medium tabular-nums">
                    {isConnected ? `${localOvF}%` : '--'}
                </span>
                <Tooltip content="Increase Feed override by 10%">
                    <Button
                        type="button"
                        onClick={() => {
                            if (localOvF + 10 > OVERRIDE_VALUE_RANGES.MAX) {
                                return;
                            }
                            setFeedOverride(localOvF + 10);
                        }}
                        disabled={!isConnected}
                        size="sm"
                        icon={<FaPlus />}
                        aria-label="Increase Feed override"
                    />
                </Tooltip>
            </div>
            {showSpindleOverride && (
                <RangeSlider
                    step={10}
                    min={OVERRIDE_VALUE_RANGES.MIN}
                    max={OVERRIDE_VALUE_RANGES.MAX}
                    value={spindle}
                    percentage={[localOvS]}
                    defaultPercentage={[100]}
                    showText={true}
                    title={spindleOverrideLabel}
                    unitString={
                        spindleOverrideLabel === 'Laser' ? 'Power' : 'RPM'
                    }
                    colour={
                        isConnected
                            ? spindleOverrideLabel === 'Laser'
                                ? 'bg-purple-400'
                                : 'bg-red-400'
                            : 'bg-gray-500'
                    }
                    disabled={!isConnected}
                    onChange={(values) => {
                        setLocalOvS(values[0]);
                        globalLocalOvSTimestamp = Date.now();
                    }}
                    onButtonPress={(values) => {
                        setLocalOvS(values[0]);
                        globalLocalOvSTimestamp = Date.now();
                        debouncedSpindleHandler(values[0]);
                    }}
                    onPointerUp={(_e) => {
                        debouncedSpindleHandler(localOvS);
                    }}
                    id="spindle-override"
                />
            )}
        </div>
    );
};

export default Overrides;

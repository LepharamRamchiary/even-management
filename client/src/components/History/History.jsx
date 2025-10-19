import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import './History.css';
import { fetchEventHistory } from '../../store/slices/eventSlice';

const History = ({ eventData, onClose }) => {
    const dispatch = useDispatch();
    const { eventHistory, loading } = useSelector((state) => state.events);

    const userId = eventData?.createdBy?._id || eventData?.participants?.[0]?._id;

    useEffect(() => {
        if (eventData?._id && userId) {
            dispatch(fetchEventHistory({ eventId: eventData._id, userId }));
        }
    }, [dispatch, eventData?._id, userId]);

    const getModifiedFieldsSummary = (changes) => {
        if (!changes || changes.length === 0) return 'No changes';
        const actualChanges = changes.filter(
            change => change.oldValue !== change.newValue &&
                change.oldValue !== 'N/A' &&
                change.changeType === 'Modified'
        );

        if (actualChanges.length === 0) return 'No changes';

        const fieldNames = actualChanges.map(change => change.field);
        return fieldNames.join(' / ');
    };

    const getActualChanges = (changes) => {
        if (!changes || changes.length === 0) return [];

        return changes.filter(
            change => change.oldValue !== change.newValue &&
                change.oldValue !== 'N/A'
        );
    };

    return (
        <div className="overlay">
            <div className="history-modal">
                <div className="modal-header">
                    <h3>Event Update History</h3>
                    <button onClick={onClose} className="close-btn">
                        &times;
                    </button>
                </div>

                <div className="updates-list">
                    {loading ? (
                        <p className="no-history">Loading history...</p>
                    ) : eventHistory.length === 0 ? (
                        <p className="no-history">No update history available.</p>
                    ) : (
                        eventHistory.map((record, index) => {
                            const actualChanges = getActualChanges(record.changes);
                            if (actualChanges.length === 0) return null;

                            return (
                                <div key={index} className="update-item">
                                    <div className="update-header">
                                        <div>
                                            <span className="update-time">🕒 {record.updatedAt}</span>
                                            <div className="modified-fields">
                                                <strong>Updated: </strong>
                                                <span className="fields-summary">
                                                    {getModifiedFieldsSummary(record.changes)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default History;
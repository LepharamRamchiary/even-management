import React, { useEffect, useState } from 'react';
import './History.css';

const History = ({ eventData, onClose }) => {
    const [history, setHistory] = useState([]);

    const userId = eventData?.createdBy?._id || eventData?.participants?.[0]?._id;

    useEffect(() => {
        const updateHistory = async () => {
            try {
                const res = await fetch(
                    `http://localhost:8000/api/events/${eventData?._id}/history/${userId}`
                );
                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.message || 'Failed to fetch history');
                }

                const historyArray = Array.isArray(data.data)
                    ? data.data
                    : data.data?.history || [];

                setHistory(historyArray);
            } catch (error) {
                console.error('Error fetching history:', error);
            }
        };

        updateHistory();
    }, [eventData?._id, userId]);

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
                    {history.length === 0 ? (
                        <p className="no-history">No update history available.</p>
                    ) : (
                        history.map((record, index) => {
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
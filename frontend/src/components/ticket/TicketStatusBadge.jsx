import React from 'react';

const TicketStatusBadge = ({ status }) => {
    const colors = {
        OPEN: 'bg-blue-500 text-white',
        IN_PROGRESS: 'bg-yellow-500 text-black',
        RESOLVED: 'bg-green-500 text-white',
        CLOSED: 'bg-gray-500 text-white',
        REJECTED: 'bg-red-500 text-white'
    };
    return (
        <span className={`px-2 py-1 rounded text-xs font-bold ${colors[status] || 'bg-gray-300'}`}>
            {status}
        </span>
    );
};

export default TicketStatusBadge;

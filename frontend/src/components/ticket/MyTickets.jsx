import React, { useEffect, useState } from 'react';
import TicketStatusBadge from './TicketStatusBadge';

const MyTickets = ({ userId }) => {
    const [tickets, setTickets] = useState([]);

    useEffect(() => {
        fetch(`/api/tickets/my?userId=${userId}`)
            .then(res => res.json())
            .then(data => setTickets(data));
    }, [userId]);

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-4">My Tickets</h2>
            <div className="grid gap-4">
                {tickets.map(ticket => (
                    <div key={ticket.id} className="p-4 border rounded shadow bg-white flex justify-between">
                        <div>
                            <h3 className="font-bold text-lg">{ticket.title}</h3>
                            <p className="text-gray-600">{ticket.description}</p>
                            <p className="text-sm mt-2 text-gray-500">Priority: {ticket.priority}</p>
                        </div>
                        <div>
                            <TicketStatusBadge status={ticket.status} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MyTickets;

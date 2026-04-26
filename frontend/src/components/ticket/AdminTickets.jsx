import React, { useEffect, useState } from 'react';
import TicketStatusBadge from './TicketStatusBadge';

const AdminTickets = () => {
    const [tickets, setTickets] = useState([]);

    useEffect(() => {
        fetch('/api/tickets')
            .then(res => res.json())
            .then(data => setTickets(data));
    }, []);

    const updateStatus = (id, newStatus) => {
        fetch(`/api/tickets/${id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        })
        .then(res => res.json())
        .then(updatedTicket => {
            setTickets(tickets.map(t => t.id === id ? updatedTicket : t));
        });
    };

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-4">All Maintenance Tickets</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="py-2 px-4 border-b text-left">Title</th>
                            <th className="py-2 px-4 border-b text-left">Category</th>
                            <th className="py-2 px-4 border-b text-left">Priority</th>
                            <th className="py-2 px-4 border-b text-left">Status</th>
                            <th className="py-2 px-4 border-b text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tickets.map(ticket => (
                            <tr key={ticket.id} className="hover:bg-gray-50">
                                <td className="py-2 px-4 border-b">{ticket.title}</td>
                                <td className="py-2 px-4 border-b">{ticket.category}</td>
                                <td className="py-2 px-4 border-b font-semibold">{ticket.priority}</td>
                                <td className="py-2 px-4 border-b"><TicketStatusBadge status={ticket.status} /></td>
                                <td className="py-2 px-4 border-b space-x-2">
                                    <button onClick={() => updateStatus(ticket.id, 'IN_PROGRESS')} className="text-sm bg-yellow-500 text-white px-2 py-1 rounded">Start</button>
                                    <button onClick={() => updateStatus(ticket.id, 'RESOLVED')} className="text-sm bg-green-500 text-white px-2 py-1 rounded">Resolve</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminTickets;

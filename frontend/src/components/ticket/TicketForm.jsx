import React, { useState } from 'react';

const TicketForm = ({ onSubmit }) => {
    const [ticket, setTicket] = useState({ title: '', category: '', description: '', priority: 'LOW' });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(ticket);
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md p-4 bg-white shadow rounded">
            <h2 className="text-xl font-bold">Create Maintenance Ticket</h2>
            <input placeholder="Title" value={ticket.title} onChange={e => setTicket({...ticket, title: e.target.value})} className="border p-2 rounded" required />
            <select value={ticket.category} onChange={e => setTicket({...ticket, category: e.target.value})} className="border p-2 rounded" required>
                <option value="">Select Category</option>
                <option value="PLUMBING">Plumbing</option>
                <option value="ELECTRICAL">Electrical</option>
                <option value="IT">IT Support</option>
                <option value="CLEANING">Cleaning</option>
            </select>
            <textarea placeholder="Description" value={ticket.description} onChange={e => setTicket({...ticket, description: e.target.value})} className="border p-2 rounded" required />
            <select value={ticket.priority} onChange={e => setTicket({...ticket, priority: e.target.value})} className="border p-2 rounded">
                <option value="LOW">Low Priority</option>
                <option value="MEDIUM">Medium Priority</option>
                <option value="HIGH">High Priority</option>
            </select>
            <button type="submit" className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Submit Ticket</button>
        </form>
    );
};

export default TicketForm;

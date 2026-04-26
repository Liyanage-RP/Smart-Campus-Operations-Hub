package com.smartcampus.ticket.service;

import com.smartcampus.ticket.entity.Ticket;
import com.smartcampus.ticket.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepository ticketRepository;

    public Ticket createTicket(Ticket ticket) {
        ticket.setCreatedAt(LocalDateTime.now());
        ticket.setUpdatedAt(LocalDateTime.now());
        ticket.setStatus("OPEN");
        return ticketRepository.save(ticket);
    }

    public List<Ticket> getMyTickets(String userId) {
        return ticketRepository.findByReportedByUserIdOrderByCreatedAtDesc(userId);
    }

    public Ticket getTicketById(String id) {
        return ticketRepository.findById(id).orElseThrow(() -> new RuntimeException("Ticket not found"));
    }

    public List<Ticket> getAllTickets() {
        return ticketRepository.findAll();
    }

    public Ticket updateTicketStatus(String id, String status) {
        Ticket ticket = getTicketById(id);
        ticket.setStatus(status);
        ticket.setUpdatedAt(LocalDateTime.now());
        return ticketRepository.save(ticket);
    }

    public Ticket assignTicket(String id, String technicianId) {
        Ticket ticket = getTicketById(id);
        ticket.setAssignedTechnicianId(technicianId);
        ticket.setStatus("IN_PROGRESS");
        ticket.setUpdatedAt(LocalDateTime.now());
        return ticketRepository.save(ticket);
    }

    public void deleteTicket(String id) {
        ticketRepository.deleteById(id);
    }
}

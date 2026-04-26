package com.smartcampus.ticket.controller;

import com.smartcampus.ticket.entity.Ticket;
import com.smartcampus.ticket.service.TicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;

    @PostMapping
    public Ticket createTicket(@RequestBody Ticket ticket) {
        return ticketService.createTicket(ticket);
    }

    @GetMapping("/my")
    public List<Ticket> getMyTickets(@RequestParam String userId) { 
        return ticketService.getMyTickets(userId);
    }

    @GetMapping("/{id}")
    public Ticket getTicketById(@PathVariable String id) {
        return ticketService.getTicketById(id);
    }

    @GetMapping
    public List<Ticket> getAllTickets() {
        return ticketService.getAllTickets();
    }

    @PutMapping("/{id}/status")
    public Ticket updateTicketStatus(@PathVariable String id, @RequestBody Map<String, String> payload) {
        return ticketService.updateTicketStatus(id, payload.get("status"));
    }

    @PutMapping("/{id}/assign")
    public Ticket assignTicket(@PathVariable String id, @RequestBody Map<String, String> payload) {
        return ticketService.assignTicket(id, payload.get("technicianId"));
    }

    @DeleteMapping("/{id}")
    public void deleteTicket(@PathVariable String id) {
        ticketService.deleteTicket(id);
    }

    @GetMapping("/scan/{resourceId}")
    public Map<String, String> scanResource(@PathVariable String resourceId) {
        // Return resource details to pre-fill the ticket form
        return Map.of(
            "resourceId", resourceId,
            "facilityName", "Scanned Facility " + resourceId
        );
    }
}

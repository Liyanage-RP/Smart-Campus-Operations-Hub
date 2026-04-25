package com.smartcampus.ticket.repository;

import com.smartcampus.ticket.model.Ticket;
import com.smartcampus.ticket.model.TicketPriority;
import com.smartcampus.ticket.model.TicketStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepository extends MongoRepository<Ticket, String> {

    List<Ticket> findByReporterIdOrderByCreatedAtDesc(String reporterId);

    List<Ticket> findByAssignedToIdOrderByCreatedAtDesc(String assignedToId);

    List<Ticket> findByStatus(TicketStatus status);

    List<Ticket> findByPriority(TicketPriority priority);

    List<Ticket> findAllByOrderByCreatedAtDesc();

    List<Ticket> findByFacilityId(String facilityId);
}

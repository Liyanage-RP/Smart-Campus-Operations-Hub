package com.smartcampus.ticket.repository;

import com.smartcampus.ticket.entity.Ticket;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepository extends MongoRepository<Ticket, String> {
    List<Ticket> findByReportedByUserIdOrderByCreatedAtDesc(String reportedByUserId);
}

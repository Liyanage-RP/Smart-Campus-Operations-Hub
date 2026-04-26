package com.smartcampus.booking.repository;

import com.smartcampus.booking.model.Booking;
import com.smartcampus.booking.model.BookingStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface BookingRepository extends MongoRepository<Booking, String> {

    List<Booking> findByUserId(String userId);

    List<Booking> findByUserIdOrderByCreatedAtDesc(String userId);

    List<Booking> findByFacilityId(String facilityId);

    List<Booking> findByStatus(BookingStatus status);

    List<Booking> findAllByOrderByCreatedAtDesc();

    long countByStatus(BookingStatus status);

    List<Booking> findByUserIdAndBookingDateGreaterThanEqualOrderByBookingDateAsc(String userId, LocalDate date);

    /**
     * Conflict detection: find bookings for the same facility on the same date
     * with overlapping time ranges that are PENDING or APPROVED.
     */
    @Query("{ 'facilityId': ?0, 'bookingDate': ?1, 'status': { $in: ['PENDING', 'APPROVED'] }, " +
            "'startTime': { $lt: ?3 }, 'endTime': { $gt: ?2 } }")
    List<Booking> findConflictingBookings(String facilityId, LocalDate bookingDate,
                                          LocalTime startTime, LocalTime endTime);
}

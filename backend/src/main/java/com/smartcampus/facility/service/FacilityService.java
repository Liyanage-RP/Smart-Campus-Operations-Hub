package com.smartcampus.facility.service;

import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.facility.dto.FacilityDTO;
import com.smartcampus.facility.model.Facility;
import com.smartcampus.facility.model.ResourceStatus;
import com.smartcampus.facility.model.ResourceType;
import com.smartcampus.facility.repository.FacilityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FacilityService {

    private final FacilityRepository facilityRepository;
    private final MongoTemplate mongoTemplate;

    /**
     * Get all facilities with dynamic filtering.
     * Efficiently queries MongoDB using Criteria API.
     */
    public List<Facility> getAllFacilities(String search, ResourceType type, ResourceStatus status,
                                           Integer minCapacity, String location) {
        Query query = new Query();

        // Keyword Search (Name, Location, or Description)
        if (search != null && !search.isBlank()) {
            query.addCriteria(new Criteria().orOperator(
                    Criteria.where("name").regex(search, "i"),
                    Criteria.where("location").regex(search, "i"),
                    Criteria.where("description").regex(search, "i")
            ));
        }

        // Exact Type Filter
        if (type != null) {
            query.addCriteria(Criteria.where("type").is(type));
        }

        // Status Filter
        if (status != null) {
            query.addCriteria(Criteria.where("status").is(status));
        }

        // Capacity Filter (Greater than or equal)
        if (minCapacity != null) {
            query.addCriteria(Criteria.where("capacity").gte(minCapacity));
        }

        // Location Partial Match
        if (location != null && !location.isBlank()) {
            query.addCriteria(Criteria.where("location").regex(location, "i"));
        }

        return mongoTemplate.find(query, Facility.class);
    }

    public Facility getFacilityById(String id) {
        return facilityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Facility", "id", id));
    }

    public Facility createFacility(FacilityDTO dto) {
        Facility facility = Facility.builder()
                .name(dto.getName())
                .type(dto.getType())
                .capacity(dto.getCapacity())
                .location(dto.getLocation())
                .description(dto.getDescription())
                .imageUrl(dto.getImageUrl())
                .status(dto.getStatus() != null ? dto.getStatus() : ResourceStatus.ACTIVE)
                .availabilityStartTime(dto.getAvailabilityStartTime())
                .availabilityEndTime(dto.getAvailabilityEndTime())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        return facilityRepository.save(facility);
    }

    public Facility updateFacility(String id, FacilityDTO dto) {
        Facility facility = getFacilityById(id);
        facility.setName(dto.getName());
        facility.setType(dto.getType());
        facility.setCapacity(dto.getCapacity());
        facility.setLocation(dto.getLocation());
        facility.setDescription(dto.getDescription());
        facility.setImageUrl(dto.getImageUrl());
        if (dto.getStatus() != null) facility.setStatus(dto.getStatus());
        facility.setAvailabilityStartTime(dto.getAvailabilityStartTime());
        facility.setAvailabilityEndTime(dto.getAvailabilityEndTime());
        facility.setUpdatedAt(LocalDateTime.now());

        return facilityRepository.save(facility);
    }

    public void deleteFacility(String id) {
        Facility facility = getFacilityById(id);
        facilityRepository.delete(facility);
    }

    public Facility incrementUsageCount(String id) {
        Facility facility = getFacilityById(id);
        facility.setUsageCount(facility.getUsageCount() + 1);
        return facilityRepository.save(facility);
    }

    public Facility updateFacilityStatus(String id, ResourceStatus status) {
        Facility facility = getFacilityById(id);
        facility.setStatus(status);
        facility.setUpdatedAt(LocalDateTime.now());
        return facilityRepository.save(facility);
    }
}

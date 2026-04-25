package com.smartcampus.facility.service;

import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.facility.dto.FacilityDTO;
import com.smartcampus.facility.model.Facility;
import com.smartcampus.facility.model.FacilityStatus;
import com.smartcampus.facility.model.FacilityType;
import com.smartcampus.facility.repository.FacilityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FacilityService {

    private final FacilityRepository facilityRepository;

    public List<Facility> getAllFacilities(String search, FacilityType type, FacilityStatus status,
                                           Integer minCapacity, String location) {
        List<Facility> facilities;

        if (search != null && !search.isBlank()) {
            facilities = facilityRepository.searchByKeyword(search);
        } else {
            facilities = facilityRepository.findAll();
        }

        // Apply filters
        if (type != null) {
            facilities = facilities.stream()
                    .filter(f -> f.getType() == type)
                    .collect(Collectors.toList());
        }
        if (status != null) {
            facilities = facilities.stream()
                    .filter(f -> f.getStatus() == status)
                    .collect(Collectors.toList());
        }
        if (minCapacity != null) {
            facilities = facilities.stream()
                    .filter(f -> f.getCapacity() >= minCapacity)
                    .collect(Collectors.toList());
        }
        if (location != null && !location.isBlank()) {
            String loc = location.toLowerCase();
            facilities = facilities.stream()
                    .filter(f -> f.getLocation().toLowerCase().contains(loc))
                    .collect(Collectors.toList());
        }

        return facilities;
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
                .status(dto.getStatus() != null ? dto.getStatus() : FacilityStatus.ACTIVE)
                .availableFrom(dto.getAvailableFrom())
                .availableTo(dto.getAvailableTo())
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
        facility.setAvailableFrom(dto.getAvailableFrom());
        facility.setAvailableTo(dto.getAvailableTo());
        facility.setUpdatedAt(LocalDateTime.now());

        return facilityRepository.save(facility);
    }

    public void deleteFacility(String id) {
        Facility facility = getFacilityById(id);
        facilityRepository.delete(facility);
    }

    public Facility updateFacilityStatus(String id, FacilityStatus status) {
        Facility facility = getFacilityById(id);
        facility.setStatus(status);
        facility.setUpdatedAt(LocalDateTime.now());
        return facilityRepository.save(facility);
    }
}

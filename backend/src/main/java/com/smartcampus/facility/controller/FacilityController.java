package com.smartcampus.facility.controller;

import com.smartcampus.facility.dto.FacilityDTO;
import com.smartcampus.facility.model.Facility;
import com.smartcampus.facility.model.FacilityStatus;
import com.smartcampus.facility.model.FacilityType;
import com.smartcampus.facility.service.FacilityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/facilities")
@RequiredArgsConstructor
public class FacilityController {

    private final FacilityService facilityService;

    @GetMapping
    public ResponseEntity<List<Facility>> getAllFacilities(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) FacilityType type,
            @RequestParam(required = false) FacilityStatus status,
            @RequestParam(required = false) Integer minCapacity,
            @RequestParam(required = false) String location) {
        return ResponseEntity.ok(facilityService.getAllFacilities(search, type, status, minCapacity, location));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Facility> getFacilityById(@PathVariable String id) {
        return ResponseEntity.ok(facilityService.getFacilityById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Facility> createFacility(@Valid @RequestBody FacilityDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(facilityService.createFacility(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Facility> updateFacility(@PathVariable String id,
                                                    @Valid @RequestBody FacilityDTO dto) {
        return ResponseEntity.ok(facilityService.updateFacility(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteFacility(@PathVariable String id) {
        facilityService.deleteFacility(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Facility> updateStatus(@PathVariable String id,
                                                  @RequestBody Map<String, String> body) {
        FacilityStatus status = FacilityStatus.valueOf(body.get("status"));
        return ResponseEntity.ok(facilityService.updateFacilityStatus(id, status));
    }
}

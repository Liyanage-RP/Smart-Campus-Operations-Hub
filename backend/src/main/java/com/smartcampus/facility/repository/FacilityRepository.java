package com.smartcampus.facility.repository;

import com.smartcampus.facility.model.Facility;
import com.smartcampus.facility.model.ResourceStatus;
import com.smartcampus.facility.model.ResourceType;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FacilityRepository extends MongoRepository<Facility, String> {

    List<Facility> findByType(ResourceType type);

    List<Facility> findByStatus(ResourceStatus status);

    List<Facility> findByTypeAndStatus(ResourceType type, ResourceStatus status);

    List<Facility> findByCapacityGreaterThanEqual(int minCapacity);

    List<Facility> findByLocationContainingIgnoreCase(String location);
}

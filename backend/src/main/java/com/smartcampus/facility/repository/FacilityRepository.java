package com.smartcampus.facility.repository;

import com.smartcampus.facility.model.Facility;
import com.smartcampus.facility.model.FacilityStatus;
import com.smartcampus.facility.model.FacilityType;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FacilityRepository extends MongoRepository<Facility, String> {

    List<Facility> findByType(FacilityType type);

    List<Facility> findByStatus(FacilityStatus status);

    List<Facility> findByTypeAndStatus(FacilityType type, FacilityStatus status);

    @Query("{ $or: [ " +
            "{ 'name': { $regex: ?0, $options: 'i' } }, " +
            "{ 'location': { $regex: ?0, $options: 'i' } }, " +
            "{ 'description': { $regex: ?0, $options: 'i' } } " +
            "] }")
    List<Facility> searchByKeyword(String keyword);

    List<Facility> findByCapacityGreaterThanEqual(int minCapacity);

    @Query("{ 'location': { $regex: ?0, $options: 'i' } }")
    List<Facility> findByLocationContaining(String location);
}

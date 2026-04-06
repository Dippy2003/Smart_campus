package backend.repository;

import backend.model.resourcesModel;
import backend.model.ResourceType;
import backend.model.ResourceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ResourceRepository extends JpaRepository<resourcesModel, Long> {

    List<resourcesModel> findByType(ResourceType type);

    List<resourcesModel> findByStatus(ResourceStatus status);

    List<resourcesModel> findByLocation(String location);
    List<resourcesModel> findByNameContainingIgnoreCase(String name);
    List<resourcesModel> findByLocationContainingIgnoreCase(String location);

    @Query("""
            SELECT r.type, COUNT(r) FROM resourcesModel r
            GROUP BY r.type
            """)
    List<Object[]> countByType();

    @Query("""
            SELECT r FROM resourcesModel r
            WHERE (:type IS NULL OR r.type = :type)
              AND (:status IS NULL OR r.status = :status)
              AND (:location IS NULL OR LOWER(r.location) LIKE LOWER(CONCAT('%', :location, '%')))
              AND (:minCapacity IS NULL OR r.capacity >= :minCapacity)
              AND (:maxCapacity IS NULL OR r.capacity <= :maxCapacity)
              AND (
                    :keyword IS NULL
                 OR LOWER(r.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
                 OR LOWER(r.location) LIKE LOWER(CONCAT('%', :keyword, '%'))
              )
            """)
    List<resourcesModel> filterResources(
            @Param("type") ResourceType type,
            @Param("status") ResourceStatus status,
            @Param("location") String location,
            @Param("minCapacity") Integer minCapacity,
            @Param("maxCapacity") Integer maxCapacity,
            @Param("keyword") String keyword
    );
}
package backend.repository;

import backend.model.resourcesModel;
import backend.model.ResourceType;
import backend.model.ResourceStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ResourceRepository extends JpaRepository<resourcesModel, Long> {

    List<resourcesModel> findByType(ResourceType type);

    List<resourcesModel> findByStatus(ResourceStatus status);

    List<resourcesModel> findByLocation(String location);
    List<resourcesModel> findByNameContainingIgnoreCase(String name);
    List<resourcesModel> findByLocationContainingIgnoreCase(String location);
}
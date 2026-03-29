package backend.service;

import backend.model.resourcesModel;
import backend.repository.ResourceRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ResourceService {

    private final ResourceRepository resourceRepository;

    public ResourceService(ResourceRepository resourceRepository) {
        this.resourceRepository = resourceRepository;
    }

    public resourcesModel createResource(resourcesModel resource) {
        return resourceRepository.save(resource);
    }

    public List<resourcesModel> getAllResources() {
        return resourceRepository.findAll();
    }
}
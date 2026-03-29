package backend.controller;

import backend.model.ResourceStatus;
import org.springframework.web.bind.annotation.RequestParam;
import backend.model.ResourceType;
import backend.model.resourcesModel;
import backend.repository.ResourceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@CrossOrigin("http://localhost:3000")
public class ResourceController {

    @Autowired
    private ResourceRepository resourceRepository;

    // CREATE
    @PostMapping("/resource")
    public resourcesModel newResource(@RequestBody resourcesModel newResource){
        return resourceRepository.save(newResource);
    }

    // GET ALL
    @GetMapping("/resources")
    public List<resourcesModel> getAllResources(){
        return resourceRepository.findAll();
    }

    // GET BY ID
    @GetMapping("/resource/{id}")
    public resourcesModel getResourceById(@PathVariable Long id){
        return resourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resource not found"));
    }

    // UPDATE
    @PutMapping("/resource/{id}")
    public resourcesModel updateResource(@RequestBody resourcesModel newResource, @PathVariable Long id){
        return resourceRepository.findById(id)
                .map(resource -> {
                    resource.setName(newResource.getName());
                    resource.setType(newResource.getType());
                    resource.setCapacity(newResource.getCapacity());
                    resource.setLocation(newResource.getLocation());
                    resource.setAvailabilityStart(newResource.getAvailabilityStart());
                    resource.setAvailabilityEnd(newResource.getAvailabilityEnd());
                    resource.setStatus(newResource.getStatus());
                    return resourceRepository.save(resource);
                }).orElseThrow(() -> new RuntimeException("Resource not found"));
    }

    // DELETE
    @DeleteMapping("/resource/{id}")
    public void deleteResource(@PathVariable Long id){
        resourceRepository.deleteById(id);
    }

    // FILTER BY TYPE
    @GetMapping("/resource/type/{type}")
    public List<resourcesModel> getByType(@PathVariable ResourceType type){
        return resourceRepository.findByType(type);
    }

    // FILTER BY STATUS
    @GetMapping("/resource/status/{status}")
    public List<resourcesModel> getByStatus(@PathVariable ResourceStatus status){
        return resourceRepository.findByStatus(status);
    }

    // FILTER BY LOCATION
    @GetMapping("/resource/location/{location}")
    public List<resourcesModel> getByLocation(@PathVariable String location){
        return resourceRepository.findByLocation(location);
    }
    @GetMapping("/resource/search")
    public List<resourcesModel> searchResources(@RequestParam String keyword) {

        // simple approach: search by name OR location
        List<resourcesModel> byName = resourceRepository.findByNameContainingIgnoreCase(keyword);
        List<resourcesModel> byLocation = resourceRepository.findByLocationContainingIgnoreCase(keyword);

        // merge results without duplicates
        byName.addAll(byLocation.stream()
                .filter(r -> !byName.contains(r))
                .toList());

        return byName;
    }
}

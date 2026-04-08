package backend.controller;

import backend.model.ResourceStatus;
import backend.model.ResourceType;
import backend.model.resourcesModel;
import backend.repository.ResourceRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/resources")
@CrossOrigin("http://localhost:3000")
public class ResourceController {

    private final ResourceRepository resourceRepository;

    public ResourceController(ResourceRepository resourceRepository) {
        this.resourceRepository = resourceRepository;
    }

    @PostMapping
    public ResponseEntity<resourcesModel> createResource(@Valid @RequestBody resourcesModel newResource) {
        newResource.setId(null);
        resourcesModel saved = resourceRepository.save(newResource);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(saved.getId())
                .toUri();
        return ResponseEntity.created(location).body(saved);
    }

    @GetMapping
    public ResponseEntity<List<resourcesModel>> getAllResources() {
        return ResponseEntity.ok(resourceRepository.findAll());
    }

    @GetMapping("/{id:\\d+}")
    public ResponseEntity<resourcesModel> getResourceById(@PathVariable Long id) {
        return resourceRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Resource not found"));
    }

    @PutMapping("/{id:\\d+}")
    public ResponseEntity<resourcesModel> updateResource(
            @Valid @RequestBody resourcesModel newResource,
            @PathVariable Long id) {
        return resourceRepository.findById(id)
                .map(resource -> {
                    resource.setName(newResource.getName());
                    resource.setType(newResource.getType());
                    resource.setCapacity(newResource.getCapacity());
                    resource.setLocation(newResource.getLocation());
                    resource.setAvailabilityStart(newResource.getAvailabilityStart());
                    resource.setAvailabilityEnd(newResource.getAvailabilityEnd());
                    resource.setStatus(newResource.getStatus());
                    return ResponseEntity.ok(resourceRepository.save(resource));
                })
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Resource not found"));
    }

    @DeleteMapping("/{id:\\d+}")
    public ResponseEntity<Void> deleteResource(@PathVariable Long id) {
        if (!resourceRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Resource not found");
        }
        resourceRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<List<resourcesModel>> getByType(@PathVariable ResourceType type) {
        return ResponseEntity.ok(resourceRepository.findByType(type));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<resourcesModel>> getByStatus(@PathVariable ResourceStatus status) {
        return ResponseEntity.ok(resourceRepository.findByStatus(status));
    }

    @GetMapping("/location/{location}")
    public ResponseEntity<List<resourcesModel>> getByLocation(@PathVariable String location) {
        return ResponseEntity.ok(resourceRepository.findByLocation(location));
    }

    @GetMapping("/search")
    public ResponseEntity<List<resourcesModel>> searchResources(@RequestParam String keyword) {
        List<resourcesModel> byName = resourceRepository.findByNameContainingIgnoreCase(keyword);
        List<resourcesModel> byLocation = resourceRepository.findByLocationContainingIgnoreCase(keyword);
        byName.addAll(byLocation.stream()
                .filter(r -> !byName.contains(r))
                .toList());
        return ResponseEntity.ok(byName);
    }

    @GetMapping("/filter")
    public ResponseEntity<List<resourcesModel>> filterResources(
            @RequestParam(required = false) ResourceType type,
            @RequestParam(required = false) ResourceStatus status,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) Integer minCapacity,
            @RequestParam(required = false) Integer maxCapacity,
            @RequestParam(required = false) String keyword
    ) {
        return ResponseEntity.ok(
                resourceRepository.filterResources(type, status, location, minCapacity, maxCapacity, keyword));
    }
}

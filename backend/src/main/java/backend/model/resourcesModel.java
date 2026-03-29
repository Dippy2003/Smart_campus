package backend.model;


import jakarta.persistence.*;

import java.time.LocalTime;

@Entity
@Table(name = "resources")
public class resourcesModel {
    @Id
    @GeneratedValue
    private Long id;

    private String name;

    @Enumerated(EnumType.STRING)
    private ResourceType type;

    private Integer capacity;
    private String location;
    private LocalTime availabilityStart;
    private LocalTime availabilityEnd;

    @Enumerated(EnumType.STRING)
    private ResourceStatus status;

    public resourcesModel (){


    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public ResourceType getType() {
        return type;
    }

    public void setType(ResourceType type) {
        this.type = type;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public LocalTime getAvailabilityStart() {
        return availabilityStart;
    }

    public void setAvailabilityStart(LocalTime availabilityStart) {
        this.availabilityStart = availabilityStart;
    }

    public LocalTime getAvailabilityEnd() {
        return availabilityEnd;
    }

    public void setAvailabilityEnd(LocalTime availabilityEnd) {
        this.availabilityEnd = availabilityEnd;
    }

    public ResourceStatus getStatus() {
        return status;
    }

    public void setStatus(ResourceStatus status) {
        this.status = status;
    }

    public resourcesModel(Long id, String name, ResourceType type, Integer capacity, String location, LocalTime availabilityStart, LocalTime availabilityEnd, ResourceStatus status) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.capacity = capacity;
        this.location = location;
        this.availabilityStart = availabilityStart;
        this.availabilityEnd = availabilityEnd;
        this.status = status;
    }
}

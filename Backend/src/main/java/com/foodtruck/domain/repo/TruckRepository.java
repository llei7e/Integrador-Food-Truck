package com.foodtruck.domain.repo;

import com.foodtruck.domain.model.Truck;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TruckRepository extends JpaRepository<Truck, Long> {
    List<Truck> findByAtivoTrue();
}
